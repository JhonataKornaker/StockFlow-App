import React from 'react';
import { View, StyleSheet } from 'react-native';

type SkeletonGenericProps = {
  variant?: 'list' | 'form' | 'auth' | 'dashboard';
};

export function SkeletonGeneric({ variant = 'list' }: SkeletonGenericProps) {
  if (variant === 'form') {
    return (
      <View style={styles.container}>
        <View style={[styles.block, { height: 20, width: '50%' }]} />
        <View style={[styles.block, { height: 44, width: '100%' }]} />
        <View style={[styles.block, { height: 20, width: '45%' }]} />
        <View style={[styles.block, { height: 44, width: '100%' }]} />
        <View style={[styles.block, { height: 40, width: '40%', marginTop: 8 }]} />
      </View>
    );
  }

  if (variant === 'auth') {
    return (
      <View style={[styles.container, { alignItems: 'center' }]}>
        <View style={[styles.block, { height: 200, width: '90%' }]} />
        <View style={[styles.block, { height: 46, width: '80%' }]} />
        <View style={[styles.block, { height: 46, width: '80%' }]} />
        <View style={[styles.block, { height: 40, width: '40%', marginTop: 8 }]} />
      </View>
    );
  }

  if (variant === 'dashboard') {
    return (
      <View style={styles.container}>
        <View style={[styles.block, { height: 24, width: '40%' }]} />
        <View style={[styles.block, { height: 100, width: '100%' }]} />
        <View style={[styles.block, { height: 24, width: '35%' }]} />
        <View style={[styles.block, { height: 160, width: '100%' }]} />
      </View>
    );
  }

  // default: list
  return (
    <View style={styles.container}>
      {[...Array(6)].map((_, i) => (
        <View
          key={i}
          style={[
            styles.block,
            { height: 60, width: '100%', marginBottom: i === 5 ? 0 : 12 },
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
    backgroundColor: '#C5D4EB40',
    borderRadius: 8,
  },
});