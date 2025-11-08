import {
  Image,
  Text,
  TextInput,
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Screen } from '../components/ScreenProps';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import { useState } from 'react';
import { Button } from '@/components/Button';
import { login } from '@/service/auth.service';
import { useNavigation } from '@react-navigation/native';
import { showErrorToast, showInfoToast } from '@/util/toast';
import { useAuth } from '@/context/AuthContext';
import { SkeletonGeneric } from '@/components/Skeleton/SkeletonGeneric';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false); // Estado para controlar o loading
  const navigation = useNavigation<any>();
  const { signIn } = useAuth();

  async function checkLogin(email: string, senha: string) {
    try {
      if (!email || !senha) {
        showInfoToast('Por favor, preencha todos os campos.', 'Campos obrigatórios');
        return;
      }
      setLoading(true); // Inicia o loading
      const token = await login(email, senha);
      await signIn(token);
    } catch (error: any) {
      console.error('Erro ao fazer login:', error);
      // Melhor tratamento de erros baseado no tipo
      if (
        error.message &&
        (error.message.includes('401') ||
          error.message.includes('credenciais') ||
          error.message.includes('invalid'))
      ) {
        showErrorToast('Verifique seu e-mail e senha.', 'Credenciais inválidas');
      } else {
        showErrorToast('Servidor indisponível. Tente novamente.', 'Erro');
      }
    } finally {
      setLoading(false); // Finaliza o loading sempre
    }
  }

  return (
    <Screen style={styles.screen}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Image
              source={require('../../assets/img_login.png')}
              style={styles.image}
              resizeMode="contain"
            />

            <View style={styles.inputContainer}>
              <Mail size={20} style={styles.icon} color="#080873" />
              <TextInput
                style={styles.input}
                placeholder="E-mail"
                placeholderTextColor="rgba(0, 0, 0, 0.25)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading} // Desabilita inputs durante loading
              />
            </View>

            <View style={[styles.inputContainer, styles.inputMarginTop]}>
              <Lock size={20} style={styles.icon} color="#080873" />

              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Senha"
                placeholderTextColor="rgba(0, 0, 0, 0.25)"
                secureTextEntry={!mostrarSenha}
                value={senha}
                onChangeText={setSenha}
                editable={!loading} // Desabilita inputs durante loading
              />

              <TouchableOpacity
                style={{ marginRight: 5 }}
                onPress={() => setMostrarSenha(!mostrarSenha)}
                disabled={loading} // Desabilita toggle durante loading
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
              disabled={loading} // Desabilita botão durante loading
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Esqueceu sua senha?</Text>
              <Text style={styles.footerText}>
                Solicite ao administrador para alterá-la
              </Text>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Overlay de loading com skeleton */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <SkeletonGeneric variant="auth" />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#C5D4EB',
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 20,
  },
  image: {
    width: '100%',
    height: 320,
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 300,
    height: 46,
    borderRadius: 5,
    backgroundColor: '#f0e1e1ff',
    paddingHorizontal: 10,
  },
  icon: {
    marginLeft: 5,
  },
  input: {
    flex: 1,
    marginLeft: 5,
    marginRight: 10,
  },
  inputMarginTop: {
    marginTop: 30,
  },
  button: {
    marginTop: 50,
    backgroundColor: '#f0e1e1ff',
    width: 120,
    height: 40,
    borderRadius: 5,
  },
  footer: {
    marginTop: 50,
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(0, 0, 0, 0.25)',
    textAlign: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Cor opaca
    justifyContent: 'center',
    alignItems: 'center',
  },
});
