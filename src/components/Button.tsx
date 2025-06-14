import {
  TouchableOpacity,
  Text,
  TouchableOpacityProps,
  StyleSheet,
} from 'react-native';

interface Props extends TouchableOpacityProps {
  title: string;
  style?: object; // Alterado para 'style' ao invés de 'className'
}

export function Button({ title, style, ...rest }: Props) {
  return (
    <TouchableOpacity style={[styles.button, style]} {...rest}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'white',
    paddingHorizontal: 16, // px-4
    borderRadius: 10, // rounded-xl
    justifyContent: 'center',
    alignItems: 'center',
    width: 236,
    height: 30,
  },
  text: {
    color: '#162B4D', // text-primary (ajuste a cor conforme necessário)
    fontSize: 16, // text-base
    fontWeight: '600', // font-semibold
  },
});
