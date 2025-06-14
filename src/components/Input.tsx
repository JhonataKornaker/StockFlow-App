import React from 'react';
import { TextInput, TextInputProps, View, StyleSheet } from 'react-native';
import { Search, Mail, AlertCircle, LucideIcon } from 'lucide-react-native';

interface InputProps extends TextInputProps {
  icon?: LucideIcon; // O componente de ícone (ex: Search)
  iconPosition?: 'left' | 'right';
  iconColors?: string;
  required?: boolean;
}

export function Input({
  icon: Icon,
  iconPosition = 'right',
  iconColors = '#9CA3AF', // Cor padrão do ícone
  required,
  placeholder,
  style, // Removemos className e agora usamos style
  ...props
}: InputProps) {
  return (
    <View style={[styles.container, style]}>
      {Icon && iconPosition === 'left' && (
        <Icon
          size={20}
          style={styles.iconLeft}
          color={iconColors || '#9CA3AF'}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        {...props}
      />

      {Icon && iconPosition === 'right' && (
        <Icon
          size={20}
          style={styles.iconRight}
          color={iconColors || '#9CA3AF'}
        />
      )}

      {!Icon && required && (
        <AlertCircle
          size={20}
          style={styles.alertIcon}
          color={iconColors || '#FF001F80'}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8, // Você pode ajustar o valor conforme necessário
    borderColor: '#D1D5DB', // Cor da borda, ajuste conforme necessário
    borderWidth: 1,
    paddingHorizontal: 16, // px-4
    paddingVertical: 8, // py-2
  },
  input: {
    flex: 1,
    fontSize: 16, // text-base
    color: '#1F2937', // text-gray-800
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  alertIcon: {
    marginLeft: 8,
  },
});
