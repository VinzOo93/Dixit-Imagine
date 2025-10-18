import React from 'react';
import {Modal, View, StyleSheet, Image, Pressable, DimensionValue} from 'react-native';

interface CardViewProps {
  visible: boolean;
  imageSource: any;
  onClose: () => void;
  width?: DimensionValue; // e.g., 90% or px
  height?: DimensionValue; // e.g., 70% or px
}

export default function CardView({
  visible,
  imageSource,
  onClose,
  width = '90%',
  height = '70%',
}: CardViewProps) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={[styles.content, { width, height }]}> 
          <Image source={imageSource} style={styles.image} resizeMode="cover" />
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: '#000',
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
