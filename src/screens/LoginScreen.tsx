import { Image, Text, TextInput, View, StyleSheet } from 'react-native';
import { Screen } from '../components/ScreenProps';
import { Lock, Mail } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Button } from '@/components/Button';
import { login } from '@/service/authService';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '@/types/MainStackNavigator';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

//type LoginScreenProps = StackNavigationProp<MainStackParamList, 'Login'>;

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigation = useNavigation<any>();

  async function checkLogin(email: string, senha: string) {
    try {
      if (!email || !senha) {
        Toast.show({
          type: 'error',
          text1: 'Campos obrigatórios',
          text2: 'Por favor, preencha todos os campos.',
        });
        console.warn('Por favor, preencha todos os campos.');
        return;
      }
      await login(email, senha);
      navigation.navigate('Home', { screen: 'Inicio' });
    } catch (error) {
      console.error('Erro ao fazer login:', error);
    }
  }

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
      <Button
        onPress={() => checkLogin(email, senha)}
        style={styles.button}
        title="Entrar"
      />
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
