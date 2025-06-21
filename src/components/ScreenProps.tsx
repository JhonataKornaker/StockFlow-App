import React from 'react';
import { ViewProps, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

interface ScreenProps extends ViewProps {
  children: React.ReactNode;
  style?: object;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  style,
  ...props
}) => {
  return (
    <SafeAreaProvider style={[styles.container, style]} {...props}>
      {children}
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
