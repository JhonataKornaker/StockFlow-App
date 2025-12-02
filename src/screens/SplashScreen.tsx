import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Platform, ActivityIndicator } from 'react-native';

export default function SplashScreen() {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.06,
          duration: 700,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(scale, {
          toValue: 1.0,
          duration: 600,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
    ]);
    animation.start();
    return () => {
      animation.stop();
    };
  }, [opacity, scale]);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('../../assets/img_login.png')}
        style={[styles.image, { opacity, transform: [{ scale }] }]}
        resizeMode="contain"
      />
      <ActivityIndicator size="large" color="#C5D4EB" style={{ marginTop: 16 }} />
      <View style={styles.loaderBar}>
        <Animated.View
          style={{
            height: 4,
            width: '40%',
            backgroundColor: '#C5D4EB',
            borderRadius: 4,
            opacity,
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#C5D4EB',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  image: {
    width: '80%',
    maxWidth: 380,
    height: 220,
    marginBottom: 24,
  },
  loaderBar: {
    width: '80%',
    maxWidth: 320,
    height: 8,
    backgroundColor: '#C5D4EB22',
    borderRadius: 6,
    overflow: 'hidden',
    alignItems: 'flex-start',
  },
});
