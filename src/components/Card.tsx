import React from 'react';
import {Dimensions, Image, StyleSheet, View} from 'react-native';

interface CardProps {
  imageSource: any;
  size?: 'small' | 'medium' | 'large' | 'custom';
  customWidth?: number;
  customHeight?: number;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Proportions d'une carte de jeu standard (ratio 2:3)
const CARD_RATIO = 2 / 3;

// Tailles prédéfinies basées sur la largeur de l'écran
const CARD_SIZES = {
  small: screenWidth * 0.25,    // 25% de la largeur d'écran
  medium: screenWidth * 0.35,   // 35% de la largeur d'écran
  large: screenWidth * 0.45,    // 45% de la largeur d'écran
};

export default function Card({ 
  imageSource, 
  size = 'medium', 
  customWidth, 
  customHeight 
}: CardProps) {
  // Calculer les dimensions de la carte
  const getCardDimensions = () => {
    if (size === 'custom' && customWidth && customHeight) {
      return { width: customWidth, height: customHeight };
    }

  const width = size === 'custom' ? customWidth || CARD_SIZES.medium : CARD_SIZES[size];
    const height = width / CARD_RATIO;
    
    return { width, height };
  };

  const { width, height } = getCardDimensions();

  return (
    <View style={[styles.cardContainer, { width, height }]}>
      <Image
        source={imageSource}
        style={styles.cardImage}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    backgroundColor: '#fff',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
});
