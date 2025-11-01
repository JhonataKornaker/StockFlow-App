import React from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, ViewProps } from 'react-native';

interface ScreenProps extends ViewProps {
  children: React.ReactNode;
  style?: object;
  scrollable?: boolean; // opcional: pra controlar se deve scrollar ou não
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  style,
  scrollable = false,
  ...props
}) => {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.container, style]} {...props}>
        {scrollable ? (
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            {children}
          </ScrollView>
        ) : (
          children
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#C5D4EB',
    padding: 8,
  },
});
