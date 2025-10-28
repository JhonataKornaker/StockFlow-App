import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

export const SkeletonCautelaForm = () => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.mainContainer}>
      {/* Formulário */}
      <View style={styles.formContainer}>
        <Animated.View style={[styles.inputSkeleton, { opacity }]} />
        <Animated.View style={[styles.inputSkeleton, { opacity }]} />
        <Animated.View style={[styles.inputSkeleton, { opacity }]} />

        <View style={styles.dateRow}>
          <Animated.View style={[styles.dateLabel, { opacity }]} />
          <Animated.View style={[styles.dateValue, { opacity }]} />
        </View>
      </View>

      {/* Área da lista */}
      <View style={styles.listArea}>
        <Animated.View style={[styles.createButton, { opacity }]} />
        <View style={styles.whiteBg}>
          <Animated.View style={[styles.cardSkeleton, { opacity }]} />
          <Animated.View style={[styles.cardSkeleton, { opacity }]} />
        </View>
      </View>

      {/* Botão salvar */}
      <Animated.View style={[styles.buttonSkeleton, { opacity }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: 'space-between', // ← Distribui conteúdo
  },
  formContainer: {
    marginTop: 44,
    gap: 16,
  },
  inputSkeleton: {
    height: 56,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  dateRow: {
    flexDirection: 'row',
    marginTop: 30,
    marginBottom: 28,
    alignItems: 'center',
    gap: 16,
  },
  dateLabel: {
    width: 150,
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  dateValue: {
    width: 100,
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  listArea: {
    flex: 1, // ← Ocupa espaço disponível
    marginTop: 14,
  },
  createButton: {
    width: 120,
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    alignSelf: 'flex-end',
    marginBottom: 14,
  },
  whiteBg: {
    backgroundColor: 'white',
    borderRadius: 8,
    width: '100%',
    height: '80%',
    padding: 16,
    gap: 12,
  },
  cardSkeleton: {
    height: 70,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  buttonSkeleton: {
    height: 48,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 12,
    marginTop: 12,
    width: '60%',
    alignSelf: 'center',
  },
});
