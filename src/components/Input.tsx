import React from 'react';
import { TextInput, TextInputProps, View, Text, StyleSheet } from 'react-native';
import { Search, Mail, AlertCircle, LucideIcon } from 'lucide-react-native';

interface InputProps extends TextInputProps {
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  iconColors?: string;
  required?: boolean;
  value?: string;
  onChangeText?: (text: string) => void;
  errorMessage?: string;
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
  errorMessage,
  ...props
}: InputProps) {
  const hasError = !!errorMessage;

  return (
    <View style={style}>
      <View style={[styles.container, hasError && styles.containerError]}>
        {Icon && iconPosition === 'left' && (
          <Icon
            size={20}
            style={styles.iconLeft}
            color={hasError ? '#DC2626' : (iconColors || '#9CA3AF')}
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
            color={hasError ? '#DC2626' : (iconColors || '#9CA3AF')}
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
      {hasError && (
        <Text style={styles.errorText}>{errorMessage}</Text>
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
  containerError: {
    borderColor: '#DC2626',
    borderWidth: 1.5,
    backgroundColor: '#FFF8F8',
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
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});
