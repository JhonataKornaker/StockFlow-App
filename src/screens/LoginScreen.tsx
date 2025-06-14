import { Image, Text, TextInput, View, StyleSheet } from 'react-native';
import { Screen } from '../components/ScreenProps';
import { Lock, Mail } from 'lucide-react-native';
import { useState } from 'react';
import { Button } from '@/components/Button';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  return (
    <Screen style={styles.screen}>
      <Image
        source={require('../../assets/img_login.png')}
        style={styles.image}
      />
      <View style={styles.inputContainer}>
        <Mail size={20} style={styles.icon} color="#080873" />
        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor="rgba(0, 0, 0, 0.25)"
          value={email}
          onChangeText={setEmail}
        />
      </View>
      <View style={[styles.inputContainer, styles.inputMarginTop]}>
        <Lock size={20} style={styles.icon} color="#080873" />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="rgba(0, 0, 0, 0.25)"
          secureTextEntry={true}
          value={senha}
          onChangeText={setSenha}
        />
      </View>
      <Button style={styles.button} title="Entrar" />
      <View style={styles.footer}>
        <Text style={styles.footerText}>Esqueceu sua senha?</Text>
        <Text style={styles.footerText}>
          Solicite ao administrador para altera-lá
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 390,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 293,
    height: 35,
    borderRadius: 30,
    backgroundColor: '#DCDCDC',
  },
  icon: {
    marginLeft: 15,
  },
  input: {
    flex: 1,
    marginLeft: 5,
    marginRight: 15,
  },
  inputMarginTop: {
    marginTop: 60,
  },
  button: {
    marginTop: 60,
    backgroundColor: '#DCDCDC',
    width: 170,
    height: 30,
    borderRadius: 30,
  },
  footer: {
    marginTop: 60,
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(0, 0, 0, 0.25)',
  },
});
