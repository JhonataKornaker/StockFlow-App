import React, { useDebugValue, useState } from 'react';
import { Screen } from './ScreenProps';
import { View } from 'react-native';
import { Input } from './Input';
import { LucideIcon } from 'lucide-react-native';
import { Button } from './Button';

interface ScreenCadastroProps<T> {
  placeholders?: string[];
  icons?: (LucideIcon | undefined)[];
  iconColors?: string[];
  placeholderColors?: string[];
  children?: React.ReactNode;
  style?: React.CSSProperties;
  defaultValues?: Partial<T>;
  fieldKeys?: (keyof T)[];
  values: Partial<T>;
  onChange: (field: keyof T, value: string) => void;
  onSalvar?: () => void;
  salvarVisivel?: boolean;
}

export default function ScreenCadastro<T>(props: ScreenCadastroProps<T>) {
  const {
    placeholders = [],
    icons = [],
    iconColors = [],
    placeholderColors = [],
    children,
    style,
    defaultValues,
    fieldKeys = [],
  } = props;

  return (
    <Screen>
      <View
        style={{
          flexDirection: 'column',
          gap: 14,
          marginTop: 16,
        }}
      >
        {placeholders.map((placeholder, index) => {
          const key = fieldKeys[index];
          const value = key ? props.defaultValues?.[key] : '';
          const defaultValue = value !== undefined ? String(value) : '';

          return (
            <Input
              key={index}
              placeholder={placeholder || 'Digite aqui...'}
              placeholderTextColor={placeholderColors[index] || undefined}
              icon={icons[index] || undefined}
              iconColors={iconColors[index] || undefined}
              defaultValue={defaultValue}
              value={String(value)}
              onChangeText={text => {
                if (key) props.onChange(key, text);
              }}
            />
          );
        })}
      </View>

      <View>{children}</View>

      <Button
        onPress={props.onSalvar}
        style={{ marginTop: 'auto', marginBottom: 12, alignSelf: 'center' }}
        title="Salvar"
      />
    </Screen>
  );
}
