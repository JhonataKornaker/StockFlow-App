import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Platform, Text, Easing } from 'react-native';

const NAVY = '#162B4D';
const ACCENT = '#B0C4DC';

function LoadingDot({ delay }: { delay: number }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: 380,
          easing: Easing.out(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 380,
          easing: Easing.in(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.delay(300),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
          transform: [
            { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.2] }) },
          ],
        },
      ]}
    />
  );
}

export default function SplashScreen() {
  const imageOpacity = useRef(new Animated.Value(0)).current;
  const imageScale = useRef(new Animated.Value(0.82)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const glowScale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Entrada da imagem
    Animated.parallel([
      Animated.timing(imageOpacity, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(imageScale, {
        toValue: 1,
        tension: 55,
        friction: 8,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start(() => {
      // 2. Texto aparece depois da imagem
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: Platform.OS !== 'web',
      }).start();

      // 3. Glow pulsante em loop
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(glowScale, {
              toValue: 1.25,
              duration: 1200,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: Platform.OS !== 'web',
            }),
            Animated.timing(glowOpacity, {
              toValue: 0.12,
              duration: 1200,
              useNativeDriver: Platform.OS !== 'web',
            }),
          ]),
          Animated.parallel([
            Animated.timing(glowScale, {
              toValue: 1,
              duration: 1200,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: Platform.OS !== 'web',
            }),
            Animated.timing(glowOpacity, {
              toValue: 0.04,
              duration: 1200,
              useNativeDriver: Platform.OS !== 'web',
            }),
          ]),
        ]),
      ).start();
    });
  }, []);

  return (
    <View style={styles.container}>
      {/* Glow ring */}
      <Animated.View
        style={[
          styles.glow,
          { opacity: glowOpacity, transform: [{ scale: glowScale }] },
        ]}
      />

      {/* Logo */}
      <Animated.Image
        source={require('../../assets/img_login.png')}
        style={[styles.image, { opacity: imageOpacity, transform: [{ scale: imageScale }] }]}
        resizeMode="contain"
      />

      {/* Tagline */}
      <Animated.View style={{ opacity: textOpacity, alignItems: 'center', marginTop: 12 }}>
        <Text style={styles.tagline}>Controle de estoque inteligente</Text>
      </Animated.View>

      {/* Loading dots */}
      <View style={styles.dotsRow}>
        <LoadingDot delay={0} />
        <LoadingDot delay={180} />
        <LoadingDot delay={360} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NAVY,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  glow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: ACCENT,
  },
  image: {
    width: '92%',
    maxWidth: 420,
    height: 260,
  },
  tagline: {
    color: ACCENT,
    fontSize: 13,
    opacity: 0.75,
    letterSpacing: 0.3,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 40,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ACCENT,
  },
});
