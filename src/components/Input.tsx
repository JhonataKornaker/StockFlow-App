// src/components/Input.tsx
import React from 'react';
import { TextInput, TextInputProps, View } from 'react-native';
import {
  Search,
  Mail,
  AlertCircle,
  LucideIcon,
} from 'lucide-react-native';

interface InputProps extends TextInputProps {
  icon?: LucideIcon; // O componente de ícone (ex: Search)
  iconPosition?: 'left' | 'right';
  required?: boolean;
  className?: string;
}

export function Input({
  icon: Icon,
  iconPosition = 'right',
  required,
  placeholder,
  className,
  ...props
}: InputProps) {
  return (
    <View
      className={`flex-row items-center bg-white rounded-input border border-secondary px-4 py-2 ${className ?? ''}`}
    >
      {Icon && iconPosition === 'left' && (
        <Icon size={20} style={{ marginRight: 8 }} color="#9CA3AF" />
      )}

      <TextInput
        className="flex-1 text-base text-gray-800"
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        {...props}
      />

      {Icon && iconPosition === 'right' && (
        <Icon size={20} style={{ marginLeft: 8 }} color="#9CA3AF" />
      )}

      {!Icon && required && (
        <AlertCircle size={20} style={{ marginLeft: 8 }} color="#EF4444" />
      )}
    </View>
  );
}
