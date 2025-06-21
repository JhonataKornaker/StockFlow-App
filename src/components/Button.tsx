import {
  TouchableOpacity,
  Text,
  TouchableOpacityProps,
  StyleSheet,
} from 'react-native';

interface Props extends TouchableOpacityProps {
  title: string;
  style?: object;
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
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: '80%',
    height: 40,
  },
  text: {
    color: '#162B4D',
    fontSize: 18,
    fontWeight: '600',
  },
});
