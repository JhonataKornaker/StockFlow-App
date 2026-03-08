import React, { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';

function SkeletonBox({
  width = '100%',
  height = 16,
  borderRadius = 8,
  opacity,
  style,
}: {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  opacity: Animated.AnimatedInterpolation<number>;
  style?: object;
}) {
  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: '#B0C4DC40',
          opacity,
        },
        style,
      ]}
    />
  );
}

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
    return () => loop.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.container}>
      {/* KPI row */}
      <View style={styles.kpiRow}>
        {[0, 1, 2].map(i => (
          <View key={i} style={styles.kpiCard}>
            <SkeletonBox width={36} height={36} borderRadius={18} opacity={opacity} />
            <SkeletonBox width={40} height={24} borderRadius={6} opacity={opacity} />
            <SkeletonBox width={52} height={11} borderRadius={4} opacity={opacity} />
          </View>
        ))}
      </View>

      {/* Alertas */}
      <SkeletonBox height={80} borderRadius={14} opacity={opacity} />

      {/* Atalhos */}
      <SkeletonBox height={110} borderRadius={14} opacity={opacity} />

      {/* Cautelas */}
      <SkeletonBox height={180} borderRadius={14} opacity={opacity} />

      {/* Movimentação */}
      <SkeletonBox height={160} borderRadius={14} opacity={opacity} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    gap: 12,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#ffffff15',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 6,
    minHeight: 90,
    justifyContent: 'center',
  },
});
