import {
  Image,
  Text,
  TextInput,
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Screen } from '../components/ScreenProps';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Button } from '@/components/Button';
import { login } from '@/service/authService';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '@/types/MainStackNavigator';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { useAuth } from '@/context/AuthContext';

//type LoginScreenProps = StackNavigationProp<MainStackParamList, 'Login'>;

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const navigation = useNavigation<any>();
  const { signIn } = useAuth();

  async function checkLogin(email: string, senha: string) {
    console.log('➡️ Iniciando login...');
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
      const token = await login(email, senha); // chama a API
      console.log('✅ Token recebido:', token);
      await signIn(token);
      console.log('Login Sucesso');
      //navigation.navigate('Home', { screen: 'Inicio' });
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
          keyboardType="email-address" // mostra teclado com @
          autoCapitalize="none" // impede maiúscula automática
          autoCorrect={false}
        />
      </View>
      <View style={[styles.inputContainer, styles.inputMarginTop]}>
        <Lock size={20} style={styles.icon} color="#080873" />

        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Senha"
          placeholderTextColor="rgba(0, 0, 0, 0.25)"
          secureTextEntry={!mostrarSenha} // alterna visibilidade
          value={senha}
          onChangeText={setSenha}
        />

        <TouchableOpacity
          style={{ marginRight: 5 }}
          onPress={() => setMostrarSenha(!mostrarSenha)}
        >
          {mostrarSenha ? (
            <EyeOff size={20} color="#080873" />
          ) : (
            <Eye size={20} color="#080873" />
          )}
        </TouchableOpacity>
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
    width: 300,
    height: 46,
    borderRadius: 5,
    backgroundColor: '#f0e1e1ff',
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
    backgroundColor: '#f0e1e1ff',
    width: 120,
    height: 40,
    borderRadius: 5,
  },
  footer: {
    marginTop: 60,
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(0, 0, 0, 0.25)',
  },
});
