import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, TouchableOpacity, Text, useWindowDimensions, Alert } from 'react-native';
import { useMemo, useState } from 'react';
import SkyBackground from '../components/SkyBackground';
import Card from '../components/Card';
import CardView from '../components/CardView';
import FormCard from '../components/FormCard';
import CloudBurst from '../components/CloudBurst';
import { CardImagine } from '@models/CardImagine';
import { ImagineImageService } from '@services/ImagineImageService';

interface ImagineScreenProps {
  onBackToSession?: () => void;
}

export default function ImagineScreen({ onBackToSession }: ImagineScreenProps) {
  const [isCardViewVisible, setIsCardViewVisible] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [userText, setUserText] = useState<string | null>(null);
  const [showCard, setShowCard] = useState(false);
  const [playBurst, setPlayBurst] = useState(false);
  const [cardImagine, setCardImagine] = useState<CardImagine | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { width, height } = useWindowDimensions();

  const resolveLocalAssetOrUri = (path?: string) => {
    if (!path) {
      return require('../assets/dixitcarte.jpg');
    }
    // If it's a data URI, remote URL, or local file URI, return as { uri }
    if (
      path.startsWith('data:') ||
      path.startsWith('http://') ||
      path.startsWith('https://') ||
      path.startsWith('file://')
    ) {
      return { uri: path } as const;
    }
    // Otherwise, treat as known local asset
    switch (path) {
      case '../assets/dixitcarte.jpg':
        return require('../assets/dixitcarte.jpg');
      default:
        return require('../assets/dixitcarte.jpg');
    }
  };

  const imageSource = useMemo(() => {
    const path = cardImagine?.getImage().path;
    return resolveLocalAssetOrUri(path);
  }, [cardImagine]);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SkyBackground fullScreen />
      {onBackToSession && (
        <TouchableOpacity style={styles.backButton} onPress={onBackToSession}>
          <Text style={styles.backButtonText}>← Session</Text>
        </TouchableOpacity>
      )}
      <View style={styles.overlayContent}>
        {showCard && cardImagine && (
          <TouchableOpacity style={styles.cardContainer} activeOpacity={0.8} onPress={() => setIsCardViewVisible(true)}>
            <Card 
              imageSource={imageSource}
              size="medium"
            />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.goldenButton} onPress={() => setIsFormVisible(true)}>
          <Text style={styles.plusSymbol}>+</Text>
        </TouchableOpacity>
      </View>
      {playBurst && (
        <CloudBurst width={width} height={height} visible={playBurst} onFinished={() => setPlayBurst(false)} />
      )}
      <CardView
        visible={isCardViewVisible}
        onClose={() => setIsCardViewVisible(false)}
        imageSource={imageSource}
        width="90%"
        height="75%"
      />
      <FormCard
        visible={isFormVisible}
        onClose={() => setIsFormVisible(false)}
        onSubmit={async (txt) => {
          if (isGenerating) return; // Guard against duplicate triggers
          setIsGenerating(true);
          try {
            setIsFormVisible(false);
            setUserText(txt);
            const newCard = new CardImagine(txt ?? undefined);
            setCardImagine(newCard);
            setShowCard(true);
            // Launch animation shortly after card appears
            setTimeout(() => {
              setPlayBurst(true);
            }, 200);

            // Generate image from prompt asynchronously
            if (txt && txt.trim().length > 0) {
              const service = new ImagineImageService();
              try {
                const img = await service.generateFromPrompt(txt.trim());
                // Update the existing card's image path without recreating the card
                const updated = new CardImagine(txt.trim());
                // Reuse object: directly mutate internal image path if accessible
                // Since ImagineImage.path is public, we can set it
                updated.getImage().path = img.path;
                setCardImagine(updated);
              } catch (e: any) {
                console.error('Failed to generate image', e);
                Alert.alert('Génération échouée',
                  e?.message ? String(e.message) : "Impossible de générer l'image pour le moment.");
              }
            }
          } finally {
            setIsGenerating(false);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlayContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: '30%',
  },
  cardContainer: {
    position: 'absolute',
    bottom: '45%', // 30% (bouton) + 15% (espace) = 45% du bas
    alignSelf: 'center',
  },
  goldenButton: {
    width: '12%',
    aspectRatio: 1,
    borderRadius: 50,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#FFA500',
  },
  plusSymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#B8860B',
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFD700',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});
