import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';

type SkeletonGenericProps = {
  variant?: 'list' | 'form' | 'auth' | 'dashboard';
};

export function SkeletonGeneric({ variant = 'list' }: SkeletonGenericProps) {
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

  if (variant === 'form') {
    return (
      <View style={styles.container}>
        <Animated.View style={[styles.block, { height: 20, width: '50%', opacity }]} />
        <Animated.View style={[styles.block, { height: 44, width: '100%', opacity }]} />
        <Animated.View style={[styles.block, { height: 20, width: '45%', opacity }]} />
        <Animated.View style={[styles.block, { height: 44, width: '100%', opacity }]} />
        <Animated.View style={[styles.block, { height: 40, width: '40%', marginTop: 8, opacity }]} />
      </View>
    );
  }

  if (variant === 'auth') {
    return (
      <View style={[styles.container, { alignItems: 'center' }]}> 
        <Animated.View style={[styles.block, { height: 200, width: '90%', opacity }]} />
        <Animated.View style={[styles.block, { height: 46, width: '80%', opacity }]} />
        <Animated.View style={[styles.block, { height: 46, width: '80%', opacity }]} />
        <Animated.View style={[styles.block, { height: 40, width: '40%', marginTop: 8, opacity }]} />
      </View>
    );
  }

  if (variant === 'dashboard') {
    return (
      <View style={styles.container}>
        {/* Card 1: Resumo Rápido */}
        <Animated.View style={[styles.block, { height: 24, width: '40%', opacity }]} />
        <Animated.View style={[styles.block, { height: 160, width: '100%', marginBottom: 12, opacity }]} />

        {/* Card 2: Cautelas Abertas */}
        <Animated.View style={[styles.block, { height: 24, width: '45%', opacity }]} />
        <Animated.View style={[styles.block, { height: 200, width: '100%', marginBottom: 12, opacity }]} />

        {/* Card 3: Movimentação do Estoque */}
        <Animated.View style={[styles.block, { height: 24, width: '50%', opacity }]} />
        <Animated.View style={[styles.block, { height: 200, width: '100%', opacity }]} />
      </View>
    );
  }

  // default: list
  return (
    <View style={styles.container}>
      {[...Array(6)].map((_, i) => (
        <Animated.View
          key={i}
          style={[
            styles.block,
            { height: 60, width: '100%', marginBottom: i === 5 ? 0 : 12, opacity },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  block: {
    backgroundColor: '#B0C4DC40',
    borderRadius: 8,
  },
});