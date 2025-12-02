import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, Platform } from 'react-native';

type SkeletonCadastroFormProps = {
  fields?: number; // quantidade de campos do formulário
};

export function SkeletonCadastroForm({ fields = 4 }: SkeletonCadastroFormProps) {
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
      <View style={{ gap: 16, marginTop: 20 }}>
        {Array.from({ length: fields }).map((_, idx) => (
          <Animated.View
            key={idx}
            style={[styles.inputSkeleton, { opacity }]}
          />
        ))}
      </View>

      <Animated.View style={[styles.buttonSkeleton, { opacity }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  inputSkeleton: {
    height: 56,
    backgroundColor: '#e0e0e0',
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

export default SkeletonCadastroForm;