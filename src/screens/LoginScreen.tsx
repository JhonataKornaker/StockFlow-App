import {
  Image,
  Text,
  TextInput,
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Screen } from '../components/ScreenProps';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { login } from '@/service/auth.service';
import { useNavigation } from '@react-navigation/native';
import { showErrorToast, showInfoToast } from '@/util/toast';
import { useAuth } from '@/context/AuthContext';

const PRIMARY = '#162B4D';
const SECONDARY = '#B0C4DC';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [senhaFocused, setSenhaFocused] = useState(false);

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-20)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(30)).current;

  const navigation = useNavigation<any>();
  const { signIn } = useAuth();

  useEffect(() => {
    Animated.stagger(150, [
      Animated.parallel([
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(headerTranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
      Animated.parallel([
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(cardTranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
    ]).start();
  }, []);

  async function checkLogin(email: string, senha: string) {
    try {
      if (!email || !senha) {
        showInfoToast('Por favor, preencha todos os campos.', 'Campos obrigatórios');
        return;
      }
      setLoading(true);
      const token = await login(email, senha);
      await signIn(token);
    } catch (error: any) {
      console.error('Erro ao fazer login:', error);
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
      setLoading(false);
    }
  }

  return (
    <Screen style={styles.screen}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            {/* Topo — fundo navy com logo e título */}
            <Animated.View
              style={[
                styles.header,
                { opacity: headerOpacity, transform: [{ translateY: headerTranslateY }] },
              ]}
            >
              <Image
                source={require('../../assets/img_login.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
              <Text style={styles.appName}>StockFlow</Text>
              <Text style={styles.appTagline}>Controle de estoque inteligente</Text>
            </Animated.View>

            {/* Card branco sobrepondo o topo */}
            <Animated.View
              style={[
                styles.card,
                { opacity: cardOpacity, transform: [{ translateY: cardTranslateY }] },
              ]}
            >
              <Text style={styles.cardTitle}>Bem-vindo de volta</Text>
              <Text style={styles.cardSubtitle}>Entre com suas credenciais para continuar</Text>

              {/* Input e-mail */}
              <View
                style={[
                  styles.inputContainer,
                  emailFocused && styles.inputContainerFocused,
                ]}
              >
                <Mail size={18} color={emailFocused ? PRIMARY : '#9AAFC4'} />
                <TextInput
                  style={styles.input}
                  placeholder="E-mail"
                  placeholderTextColor="#9AAFC4"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                />
              </View>

              {/* Input senha */}
              <View
                style={[
                  styles.inputContainer,
                  styles.inputMarginTop,
                  senhaFocused && styles.inputContainerFocused,
                ]}
              >
                <Lock size={18} color={senhaFocused ? PRIMARY : '#9AAFC4'} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Senha"
                  placeholderTextColor="#9AAFC4"
                  secureTextEntry={!mostrarSenha}
                  value={senha}
                  onChangeText={setSenha}
                  editable={!loading}
                  onFocus={() => setSenhaFocused(true)}
                  onBlur={() => setSenhaFocused(false)}
                />
                <TouchableOpacity
                  onPress={() => setMostrarSenha(!mostrarSenha)}
                  disabled={loading}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  {mostrarSenha ? (
                    <EyeOff size={18} color="#9AAFC4" />
                  ) : (
                    <Eye size={18} color="#9AAFC4" />
                  )}
                </TouchableOpacity>
              </View>

              {/* Botão */}
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={() => checkLogin(email, senha)}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Entrar</Text>
                )}
              </TouchableOpacity>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>Esqueceu sua senha?</Text>
                <Text style={styles.footerSubText}>
                  Solicite ao administrador para alterá-la
                </Text>
              </View>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 0,
    backgroundColor: PRIMARY,
  },
  header: {
    flex: 0.42,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  logoImage: {
    width: '85%',
    height: 200,
    marginBottom: 10,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  appTagline: {
    fontSize: 13,
    color: SECONDARY,
    marginTop: 4,
    opacity: 0.8,
  },
  card: {
    flex: 0.58,
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: PRIMARY,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#8A9BB0',
    marginBottom: 28,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: 12,
    backgroundColor: '#F4F7FB',
    borderWidth: 1.5,
    borderColor: '#E4ECF4',
    paddingHorizontal: 14,
    gap: 10,
  },
  inputContainerFocused: {
    borderColor: PRIMARY,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: PRIMARY,
  },
  inputMarginTop: {
    marginTop: 14,
  },
  button: {
    marginTop: 28,
    backgroundColor: PRIMARY,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  footer: {
    marginTop: 28,
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    color: PRIMARY,
    fontSize: 13,
    fontWeight: '600',
  },
  footerSubText: {
    color: '#8A9BB0',
    fontSize: 12,
    textAlign: 'center',
  },
});
