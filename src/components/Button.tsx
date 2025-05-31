import { TouchableOpacity, Text, TouchableOpacityProps } from 'react-native';
import { styled } from 'nativewind';

const StyledButton = styled(TouchableOpacity);

interface Props extends TouchableOpacityProps {
  title: string;
  className?: string;
}

export function Button({ title, className = '', ...rest }: Props) {
  return (
    <StyledButton
      className={`bg-white px-4 rounded-xl items-center justify-center w-[236px] h-[30px] ${className}`}
      {...rest}
    >
      <Text className="text-primary font-semibold text-base">{title}</Text>
    </StyledButton>
  );
}

