import React, { useState } from 'react';
import { Modal, View, StyleSheet, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';

interface FormCardProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (text: string) => void;
}

export default function FormCard({ visible, onClose, onSubmit }: FormCardProps) {
  const [text, setText] = useState('');

  const handleValidate = () => {
    onSubmit(text.trim());
    setText('');
  };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.select({ ios: 'padding', android: undefined })}>
        <View style={styles.container}>
          <Text style={styles.title}>Nouvelle carte</Text>
          <Text style={styles.subtitle}>Écris un texte pour accompagner la carte</Text>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Votre texte..."
            placeholderTextColor="#8C6A00"
            multiline
            style={styles.input}
          />
          <View style={styles.actions}>
            <Pressable style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Annuler</Text>
            </Pressable>
            <Pressable style={styles.validateBtn} onPress={handleValidate}>
              <Text style={styles.validateText}>Valider</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const GOLD = '#FFD700';
const GOLD_DARK = '#B8860B';
const GOLD_ORANGE = '#FFA500';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(9, 59, 123, 0.35)', // doux bleu nuit du fond
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    width: '92%',
    backgroundColor: '#FFF8E1',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: GOLD_ORANGE,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: GOLD_DARK,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#6B5A00',
  },
  input: {
    marginTop: 12,
    minHeight: 100,
    maxHeight: 200,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: GOLD_ORANGE,
    padding: 12,
    color: '#3A2E00',
    backgroundColor: '#FFFDF3',
    textAlignVertical: 'top',
  },
  actions: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12 as any,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(184,134,11,0.15)',
  },
  cancelText: {
    color: GOLD_DARK,
    fontWeight: '600',
  },
  validateBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: GOLD,
    borderWidth: 1,
    borderColor: GOLD_ORANGE,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  validateText: {
    color: '#694100',
    fontWeight: '800',
  },
});
