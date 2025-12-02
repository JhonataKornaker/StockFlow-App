import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';

export function SkeletonInicioDashboard() {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 800,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 800,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
    );
    loop.start();
    return () => {
      loop.stop();
    };
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.container}>
      {/* Card 1: Resumo Rápido */}
      <Animated.View style={[styles.title, { opacity }]} />
      <Animated.View style={[styles.block, { height: 160, marginBottom: 12, opacity }]} />
      <Animated.View style={[styles.subBlock, { height: 52, marginBottom: 8, opacity }]} />
      <Animated.View style={[styles.subBlock, { height: 52, marginBottom: 16, opacity }]} />

      {/* Card 2: Cautelas Abertas */}
      <Animated.View style={[styles.title, { width: '55%', opacity }]} />
      <Animated.View style={[styles.block, { height: 200, marginBottom: 16, opacity }]} />

      {/* Card 3: Movimentação do Estoque */}
      <Animated.View style={[styles.title, { width: '60%', opacity }]} />
      <Animated.View style={[styles.block, { height: 200, opacity }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    height: 24,
    width: '40%',
    backgroundColor: '#C5D4EB40',
    borderRadius: 8,
    marginBottom: 8,
  },
  block: {
    backgroundColor: '#C5D4EB40',
    borderRadius: 12,
  },
  subBlock: {
    backgroundColor: '#C5D4EB30',
    borderRadius: 10,
  },
});