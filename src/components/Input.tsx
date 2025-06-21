import React from 'react';
import { TextInput, TextInputProps, View, StyleSheet } from 'react-native';
import { Search, Mail, AlertCircle, LucideIcon } from 'lucide-react-native';

interface InputProps extends TextInputProps {
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  iconColors?: string;
  required?: boolean;
  value?: string;
  onChangeText?: (text: string) => void;
}

export function Input({
  icon: Icon,
  iconPosition = 'right',
  iconColors = '#9CA3AF',
  required,
  placeholder,
  style,
  value,
  onChangeText,
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
        value={value}
        onChangeText={onChangeText}
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
    borderRadius: 8,
    borderColor: '#D1D5DB',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
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
