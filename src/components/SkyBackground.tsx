import * as React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient, Stop, Path, G, LinearGradient as SvgLinearGradient, Mask, Rect, Circle } from 'react-native-svg';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

type CloudProps = {
  height: number;
  opacity: number;
  speedMs: number;
  verticalOffset: number;
  tint: string;
  seed: number;
  flipX?: boolean;
};

function CloudLayer({ height, opacity, speedMs, verticalOffset, tint, seed, flipX = false }: CloudProps) {
  const { width } = useWindowDimensions();
  const translateX = useSharedValue(0);

  React.useEffect(() => {
    // stronger infinite drift left-right
    const amplitude = width * 0.15; // more movement across the screen
    translateX.value = withRepeat(
      withTiming(-amplitude, {
        duration: Math.max(3000, Math.floor(speedMs * 0.75)),
        easing: Easing.inOut(Easing.quad),
      }),
      -1,
      true
    );
  }, [speedMs, width, translateX]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const svgWidth = width * 1.6;
  const svgHeight = height * 1.3;

  // Simple seeded PRNG for stable variability per cloud
  const rand = (min: number, max: number) => {
    const x = Math.sin(seed++) * 10000;
    const frac = x - Math.floor(x);
    return min + (max - min) * frac;
  };

  const wobble = rand(-0.07, 0.07); // shape variation
  const hump1 = 0.55 + wobble;
  const hump2 = 0.35 - wobble * 0.8;
  const hump3 = 0.45 + wobble * 0.6;

  const cloudPath = `M0 ${svgHeight * 0.82}
    C ${svgWidth * (0.08 + rand(-0.02, 0.02))} ${svgHeight * (0.62 + rand(-0.05, 0.03))}, ${svgWidth * (0.2 + rand(-0.03, 0.03))} ${svgHeight * (0.52 + rand(-0.03, 0.02))}, ${svgWidth * 0.35} ${svgHeight * hump1}
    C ${svgWidth * (0.32 + rand(-0.03, 0.03))} ${svgHeight * (0.42 + rand(-0.03, 0.03))}, ${svgWidth * 0.5} ${svgHeight * hump2}, ${svgWidth * 0.6} ${svgHeight * (0.5 + rand(-0.03, 0.03))}
    C ${svgWidth * (0.72 + rand(-0.03, 0.03))} ${svgHeight * hump2}, ${svgWidth * (0.92 + rand(-0.02, 0.02))} ${svgHeight * hump3}, ${svgWidth} ${svgHeight * (0.64 + rand(-0.03, 0.02))}
    L ${svgWidth} ${svgHeight}
    L 0 ${svgHeight}
    Z`;

  return (
    <Animated.View pointerEvents="none" style={[styles.cloudRow, animStyle, { height, top: verticalOffset, opacity }]}> 
      <Svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={flipX ? { transform: [{ scaleX: -1 }] } : undefined}>
        <Defs>
          <RadialGradient id="cloudGrad" cx="50%" cy="45%" rx="60%" ry="70%">
            <Stop offset="0%" stopColor={tint} stopOpacity={0.95} />
            <Stop offset="70%" stopColor={tint} stopOpacity={0.8} />
            <Stop offset="100%" stopColor={tint} stopOpacity={0.55} />
          </RadialGradient>
          <SvgLinearGradient id="fadeGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#fff" stopOpacity={1} />
            <Stop offset="85%" stopColor="#fff" stopOpacity={0.15} />
            <Stop offset="100%" stopColor="#fff" stopOpacity={0} />
          </SvgLinearGradient>
          <Mask id="cloudMask" maskUnits="userSpaceOnUse">
            <Rect x={0} y={0} width={svgWidth} height={svgHeight} fill="url(#fadeGrad)" />
          </Mask>
        </Defs>
        <G mask="url(#cloudMask)">
          <Path d={cloudPath} fill="url(#cloudGrad)" />
        </G>
      </Svg>
    </Animated.View>
  );
}

type SkyBackgroundProps = {
  fullScreen?: boolean;
};

export default function SkyBackground({ fullScreen = false }: SkyBackgroundProps) {
  const { height: windowHeight } = useWindowDimensions();
  const headerHeight = fullScreen ? windowHeight : 220;
  const scale = headerHeight / 220;

  // Determine time of day
  const hour = new Date().getHours();
  const timeOfDay: 'dawn' | 'day' | 'dusk' | 'night' = React.useMemo(() => {
    if (hour >= 5 && hour < 8) return 'dawn';
    if (hour >= 8 && hour < 18) return 'day';
    if (hour >= 18 && hour < 21) return 'dusk';
    return 'night';
  }, [hour]);

  // Color helpers
  function hexToRgb(hex: string): { r: number; g: number; b: number } {
    const h = hex.replace('#', '');
    const bigint = parseInt(h, 16);
    if (h.length === 6) {
      return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
    }
    // fallback to white
    return { r: 255, g: 255, b: 255 };
  }
  function rgbToHex(r: number, g: number, b: number): string {
    const toHex = (v: number) => {
      const s = Math.max(0, Math.min(255, Math.round(v))).toString(16);
      return s.length === 1 ? '0' + s : s;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
  function blendHexColors(a: string, b: string, t: number): string {
    const ca = hexToRgb(a);
    const cb = hexToRgb(b);
    return rgbToHex(ca.r * (1 - t) + cb.r * t, ca.g * (1 - t) + cb.g * t, ca.b * (1 - t) + cb.b * t);
  }
  function randomCloudTint(tod: 'dawn' | 'day' | 'dusk' | 'night'): string {
    // Base is white, add a tiny hint of palette color
    const WHITE = '#FFFFFF';
    let accentPool: string[];
    switch (tod) {
      case 'dawn':
        accentPool = ['#FFB199', '#FFD6A5', '#FFF1CF'];
        break;
      case 'dusk':
        accentPool = ['#FF8C8C', '#C58CFF', '#7AA7FF'];
        break;
      case 'night':
        accentPool = ['#EAF4FF', '#F4F8FF', '#ECF6FF'];
        break;
      default:
        accentPool = ['#E7F5FF', '#EAF4FF', '#F7FBFF'];
    }
    const accent = accentPool[Math.floor(Math.random() * accentPool.length)];
    const amount = 0.05 + Math.random() * 0.12; // subtle tint
    return blendHexColors(WHITE, accent, amount);
  }

  // Generate a randomized but stable set of clouds for this header height
  const clouds = React.useMemo(() => {
    const count = fullScreen ? 7 : 3;
    const items: Array<CloudProps> = [] as any;
    for (let i = 0; i < count; i++) {
      const seed = Math.floor(Math.random() * 100000) + i * 97;
      const row = i / count;
      const heightBase = 56 * scale;
      const h = heightBase * (0.9 + Math.random() * 1.0);
      const opacity = 0.65 + Math.random() * 0.25; // still white, slightly less opaque for natural look
      const speed = 6000 + Math.floor(Math.random() * 5000);
      const verticalOffset = headerHeight * (0.05 + row * 0.85) + (Math.random() - 0.5) * 18 * scale;
      const flipX = Math.random() < 0.5;
      const tint = randomCloudTint(timeOfDay);
      items.push({ height: h, opacity, speedMs: speed, verticalOffset, tint, seed, flipX });
    }
    // sort by verticalOffset for nicer layering
    items.sort((a, b) => a.verticalOffset - b.verticalOffset);
    return items;
  }, [headerHeight, fullScreen, scale, timeOfDay]);

  return (
    <View style={[styles.container, { height: headerHeight }]}>
      <LinearGradient
        pointerEvents="none"
        colors={skyPalettes[timeOfDay]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      {timeOfDay === 'night' && (
        <NightStars height={headerHeight} />
      )}
      {/* distant wispy clouds (lighter, higher) */}
      {clouds.map((c: CloudProps, idx: number) => (
        <CloudLayer
          key={`cloud-${idx}`}
          height={c.height}
          opacity={timeOfDay === 'night' ? Math.min(0.6, c.opacity) : c.opacity}
          speedMs={c.speedMs}
          verticalOffset={c.verticalOffset}
          tint={timeOfDay === 'night' ? '#F9FAFF' : c.tint}
          seed={c.seed}
          flipX={c.flipX}
        />
      ))}
    </View>
  );
}

const colors = {
  skyTop: '#3AA0FF',
  skyMid: '#7AC6FF',
  skyBottom: '#D8EEFF',
  cloudLight: '#FFFFFF',
  cloudMid: '#F7FBFF',
  cloudDense: '#F2F7FC',
  cloudBlueSoft: '#FAFDFF',
  cloudBluePale: '#EFFFFF',
  cloudWarm: '#FFF9F2',
};

const skyPalettes: Record<'dawn' | 'day' | 'dusk' | 'night', [string, string, string]> = {
  dawn: ['#FFB199', '#FFD6A5', '#FFF1CF'],
  day: [colors.skyTop, colors.skyMid, colors.skyBottom],
  dusk: ['#FF8C8C', '#C58CFF', '#7AA7FF'],
  night: ['#0D1B3D', '#0B2559', '#093B7B'],
};

function NightStars({ height }: { height: number }) {
  const { width } = useWindowDimensions();
  const count = Math.max(40, Math.floor((width * height) / 12000));
  const stars = React.useMemo(() => {
    const list: { x: number; y: number; r: number; o: number }[] = [];
    for (let i = 0; i < count; i++) {
      list.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.4 + 0.4,
        o: 0.6 + Math.random() * 0.4,
      });
    }
    return list;
  }, [count, width, height]);
  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFillObject}>
      <Defs />
      <G>
        {stars.map((s, idx) => (
          <Circle key={`star-${idx}`} cx={s.x} cy={s.y} r={s.r} fill="#FFFFFF" opacity={s.o} />
        ))}
      </G>
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  cloudRow: {
    position: 'absolute',
    left: -40,
    right: -40,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cloudBlobRow: {},
  blob: {},
});


