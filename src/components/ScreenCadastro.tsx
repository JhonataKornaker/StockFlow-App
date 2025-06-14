import React, { useDebugValue } from 'react';
import { Screen } from './ScreenProps';
import { View } from 'react-native';
import { Input } from './Input';
import { LucideIcon } from 'lucide-react-native';
import { Button } from './Button';
import { theme } from '@/styles/theme';

interface ScreenCadastroProps {
  placeholders?: string[];
  icons?: (LucideIcon | undefined)[];
  iconColors?: string[];
  placeholderColors?: string[];
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export default function ScreenCadastro(props: ScreenCadastroProps) {
  const {
    placeholders = [],
    icons = [],
    iconColors = [],
    placeholderColors = [],
    children,
    style,
  } = props;
  return (
    <Screen>
      <View
        style={{
          flexDirection: 'column',
          gap: 14,
          marginTop: 44,
        }}
      >
        {placeholders.map((placeholder, index) => (
          <Input
            key={index}
            placeholder={placeholder || 'Digite aqui...'}
            placeholderTextColor={placeholderColors[index] || undefined}
            icon={icons[index] || undefined}
            iconColors={iconColors[index] || undefined}
          />
        ))}
      </View>
      <View>{props.children}</View>
      <Button
        style={{ marginTop: 'auto', marginBottom: 12, alignSelf: 'center' }}
        title="Salvar"
      />
    </Screen>
  );
}
