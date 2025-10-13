import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Animated as RNAnimated } from 'react-native';

interface CloudBurstProps {
  width: number;
  height: number;
  visible: boolean;
  onFinished?: () => void;
}

export default function CloudBurst({ width, height, visible, onFinished }: CloudBurstProps) {
  // Animations principales
  const opacity = React.useRef(new RNAnimated.Value(0)).current;
  const scale = React.useRef(new RNAnimated.Value(0)).current;
  
  // Animations des particules individuelles
  const particle1 = React.useRef({
    opacity: new RNAnimated.Value(0),
    scale: new RNAnimated.Value(0),
    translateX: new RNAnimated.Value(0),
    translateY: new RNAnimated.Value(0),
  }).current;
  
  const particle2 = React.useRef({
    opacity: new RNAnimated.Value(0),
    scale: new RNAnimated.Value(0),
    translateX: new RNAnimated.Value(0),
    translateY: new RNAnimated.Value(0),
  }).current;
  
  const particle3 = React.useRef({
    opacity: new RNAnimated.Value(0),
    scale: new RNAnimated.Value(0),
    translateX: new RNAnimated.Value(0),
    translateY: new RNAnimated.Value(0),
  }).current;
  
  const particle4 = React.useRef({
    opacity: new RNAnimated.Value(0),
    scale: new RNAnimated.Value(0),
    translateX: new RNAnimated.Value(0),
    translateY: new RNAnimated.Value(0),
  }).current;
  
  const particle5 = React.useRef({
    opacity: new RNAnimated.Value(0),
    scale: new RNAnimated.Value(0),
    translateX: new RNAnimated.Value(0),
    translateY: new RNAnimated.Value(0),
  }).current;
  
  const magicGlow = React.useRef({
    opacity: new RNAnimated.Value(0),
    scale: new RNAnimated.Value(0),
  }).current;

  useEffect(() => {
    if (visible) {
      // Reset all values
      opacity.setValue(0);
      scale.setValue(0);
      
      // Reset particles
      [particle1, particle2, particle3, particle4, particle5].forEach(particle => {
        particle.opacity.setValue(0);
        particle.scale.setValue(0);
        particle.translateX.setValue(0);
        particle.translateY.setValue(0);
      });
      
      // Reset magic glow
      magicGlow.opacity.setValue(0);
      magicGlow.scale.setValue(0);

      // Animation principale - explosion initiale
      RNAnimated.parallel([
        RNAnimated.timing(opacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        RNAnimated.timing(scale, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();

      // Animation des particules avec des délais différents
      const animateParticle = (particle: any, delay: number, translateX: number, translateY: number) => {
        setTimeout(() => {
          RNAnimated.parallel([
            RNAnimated.timing(particle.opacity, {
              toValue: 0.8,
              duration: 200,
              useNativeDriver: true,
            }),
            RNAnimated.timing(particle.scale, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
            RNAnimated.timing(particle.translateX, {
              toValue: translateX,
              duration: 600,
              useNativeDriver: true,
            }),
            RNAnimated.timing(particle.translateY, {
              toValue: translateY,
              duration: 600,
              useNativeDriver: true,
            }),
          ]).start();
        }, delay);
      };

      // Animation de la lueur magique
      setTimeout(() => {
        RNAnimated.parallel([
          RNAnimated.timing(magicGlow.opacity, {
            toValue: 0.6,
            duration: 300,
            useNativeDriver: true,
          }),
          RNAnimated.sequence([
            RNAnimated.timing(magicGlow.scale, {
              toValue: 1.2,
              duration: 200,
              useNativeDriver: true,
            }),
            RNAnimated.timing(magicGlow.scale, {
              toValue: 1.5,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      }, 100);

      // Animer les particules dans différentes directions
      animateParticle(particle1, 50, -60, -40);
      animateParticle(particle2, 100, 70, -30);
      animateParticle(particle3, 150, -50, 50);
      animateParticle(particle4, 200, 60, 45);
      animateParticle(particle5, 250, 0, -70);

      // Fade out général après 1.2 secondes
      setTimeout(() => {
        RNAnimated.parallel([
          RNAnimated.timing(opacity, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
          RNAnimated.timing(particle1.opacity, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
          RNAnimated.timing(particle2.opacity, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
          RNAnimated.timing(particle3.opacity, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
          RNAnimated.timing(particle4.opacity, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
          RNAnimated.timing(particle5.opacity, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
          RNAnimated.timing(magicGlow.opacity, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onFinished && onFinished();
        });
      }, 1200);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={[styles.container, { width, height }]}>
      <RNAnimated.View
        style={[
          styles.burst,
          {
            opacity,
            transform: [{ scale }],
          },
        ]}
      >
        {/* Particules de fumée animées */}
        <RNAnimated.View
          style={[
            styles.particle,
            styles.smoke1,
            {
              opacity: particle1.opacity,
              transform: [
                { scale: particle1.scale },
                { translateX: particle1.translateX },
                { translateY: particle1.translateY },
              ],
            },
          ]}
        />
        <RNAnimated.View
          style={[
            styles.particle,
            styles.smoke2,
            {
              opacity: particle2.opacity,
              transform: [
                { scale: particle2.scale },
                { translateX: particle2.translateX },
                { translateY: particle2.translateY },
              ],
            },
          ]}
        />
        <RNAnimated.View
          style={[
            styles.particle,
            styles.smoke3,
            {
              opacity: particle3.opacity,
              transform: [
                { scale: particle3.scale },
                { translateX: particle3.translateX },
                { translateY: particle3.translateY },
              ],
            },
          ]}
        />
        <RNAnimated.View
          style={[
            styles.particle,
            styles.smoke4,
            {
              opacity: particle4.opacity,
              transform: [
                { scale: particle4.scale },
                { translateX: particle4.translateX },
                { translateY: particle4.translateY },
              ],
            },
          ]}
        />
        <RNAnimated.View
          style={[
            styles.particle,
            styles.smoke5,
            {
              opacity: particle5.opacity,
              transform: [
                { scale: particle5.scale },
                { translateX: particle5.translateX },
                { translateY: particle5.translateY },
              ],
            },
          ]}
        />
        
        {/* Lueur magique dorée */}
        <RNAnimated.View
          style={[
            styles.magicGlow,
            {
              opacity: magicGlow.opacity,
              transform: [{ scale: magicGlow.scale }],
            },
          ]}
        />
      </RNAnimated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  burst: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  particle: {
    position: 'absolute',
  },
  smoke1: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 8,
  },
  smoke2: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: 'rgba(240, 248, 255, 0.7)',
    shadowColor: '#F0F8FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  smoke3: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(230, 243, 255, 0.6)',
    shadowColor: '#E6F3FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  smoke4: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(209, 231, 255, 0.5)',
    shadowColor: '#D1E7FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  smoke5: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 18,
    elevation: 9,
  },
  magicGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 215, 0, 0.4)',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 25,
    elevation: 15,
    // Effet de lueur multiple
    borderWidth: 2,
    borderColor: 'rgba(255, 165, 0, 0.3)',
  },
});
