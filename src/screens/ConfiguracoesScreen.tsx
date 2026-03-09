import { Input } from '@/components/Input';
import { Screen } from '@/components/ScreenProps';
import { useAuth } from '@/context/AuthContext';
import { atualizarPerfil, alterarSenha, buscarUsuarioLogado } from '@/service/usuario.service';
import { theme } from '@/styles/theme';
import { showErrorToast, showSuccessToast } from '@/util/toast';
import { useFocusEffect } from '@react-navigation/native';
import {
  ChevronRight,
  Info,
  KeyRound,
  LogOut,
  Mail,
  Save,
  Shield,
  User,
} from 'lucide-react-native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// ─── Sub-componentes ────────────────────────────────────────────────────────

function SectionTitle({ label }: { label: string }) {
  return <Text style={styles.sectionTitle}>{label}</Text>;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

// ─── Tela ───────────────────────────────────────────────────────────────────

export default function ConfiguracoesScreen() {
  const { signOut } = useAuth();

  // Perfil
  const [nome, setNome] = useState('');
  const [funcao, setFuncao] = useState('');
  const [email, setEmail] = useState('');
  const [salvandoPerfil, setSalvandoPerfil] = useState(false);

  // Senha
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  // UI
  const [senhaAberta, setSenhaAberta] = useState(false);
  const [carregando, setCarregando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      carregarUsuario();
    }, []),
  );

  async function carregarUsuario() {
    try {
      setCarregando(true);
      const usuario = await buscarUsuarioLogado();
      setNome(usuario.nome);
      setFuncao(usuario.funcao);
      setEmail(usuario.email);
    } catch {
      showErrorToast('Não foi possível carregar os dados do perfil');
    } finally {
      setCarregando(false);
    }
  }

  async function handleSalvarPerfil() {
    if (!nome.trim() || !funcao.trim()) {
      showErrorToast('Nome e função são obrigatórios');
      return;
    }
    try {
      setSalvandoPerfil(true);
      await atualizarPerfil({ nome: nome.trim(), funcao: funcao.trim() });
      showSuccessToast('Perfil atualizado com sucesso!');
    } catch {
      showErrorToast('Não foi possível atualizar o perfil');
    } finally {
      setSalvandoPerfil(false);
    }
  }

  async function handleAlterarSenha() {
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      showErrorToast('Preencha todos os campos de senha');
      return;
    }
    if (novaSenha !== confirmarSenha) {
      showErrorToast('A nova senha e a confirmação não conferem');
      return;
    }
    if (novaSenha.length < 6) {
      showErrorToast('A nova senha deve ter no mínimo 6 caracteres');
      return;
    }
    try {
      setSalvandoSenha(true);
      await alterarSenha(senhaAtual, novaSenha);
      showSuccessToast('Senha alterada com sucesso!');
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
      setSenhaAberta(false);
    } catch (err: any) {
      const msg =
        err?.response?.status === 401
          ? 'Senha atual incorreta'
          : 'Não foi possível alterar a senha';
      showErrorToast(msg);
    } finally {
      setSalvandoSenha(false);
    }
  }

  function handleSair() {
    Alert.alert('Sair', 'Deseja realmente sair da conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: signOut },
    ]);
  }

  if (carregando) {
    return (
      <Screen>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </Screen>
    );
  }

  // Iniciais para o avatar
  const initials = nome
    .trim()
    .split(' ')
    .filter(Boolean)
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.avatarNome}>{nome}</Text>
          <Text style={styles.avatarFuncao}>{funcao}</Text>
        </View>

        {/* ─── Perfil ─── */}
        <SectionTitle label="Meu Perfil" />
        <View style={styles.card}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Nome</Text>
            <Input
              icon={User}
              iconPosition="left"
              placeholder="Seu nome completo"
              value={nome}
              onChangeText={setNome}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Função</Text>
            <Input
              icon={Shield}
              iconPosition="left"
              placeholder="Sua função"
              value={funcao}
              onChangeText={setFuncao}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>E-mail</Text>
            <Input
              icon={Mail}
              iconPosition="left"
              placeholder="seu@email.com"
              value={email}
              editable={false}
              style={styles.inputDisabled}
            />
            <Text style={styles.fieldHint}>O e-mail não pode ser alterado</Text>
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, salvandoPerfil && styles.btnDisabled]}
            onPress={handleSalvarPerfil}
            disabled={salvandoPerfil}
            activeOpacity={0.8}
          >
            {salvandoPerfil ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Save size={16} color="#fff" />
                <Text style={styles.saveBtnText}>Salvar alterações</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* ─── Segurança ─── */}
        <SectionTitle label="Segurança" />
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => setSenhaAberta(v => !v)}
            activeOpacity={0.7}
          >
            <View style={styles.accordionLeft}>
              <KeyRound size={18} color={theme.colors.primary} />
              <Text style={styles.accordionLabel}>Alterar senha</Text>
            </View>
            <ChevronRight
              size={18}
              color="#9ca3af"
              style={{ transform: [{ rotate: senhaAberta ? '90deg' : '0deg' }] }}
            />
          </TouchableOpacity>

          {senhaAberta && (
            <View style={styles.senhaForm}>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Senha atual</Text>
                <Input
                  placeholder="Digite sua senha atual"
                  value={senhaAtual}
                  onChangeText={setSenhaAtual}
                  secureTextEntry
                />
              </View>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Nova senha</Text>
                <Input
                  placeholder="Mínimo 6 caracteres"
                  value={novaSenha}
                  onChangeText={setNovaSenha}
                  secureTextEntry
                />
              </View>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Confirmar nova senha</Text>
                <Input
                  placeholder="Repita a nova senha"
                  value={confirmarSenha}
                  onChangeText={setConfirmarSenha}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                style={[styles.saveBtn, salvandoSenha && styles.btnDisabled]}
                onPress={handleAlterarSenha}
                disabled={salvandoSenha}
                activeOpacity={0.8}
              >
                {salvandoSenha ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <KeyRound size={16} color="#fff" />
                    <Text style={styles.saveBtnText}>Alterar senha</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ─── Sobre ─── */}
        <SectionTitle label="Sobre o App" />
        <View style={styles.card}>
          <View style={styles.sobreHeader}>
            <Info size={20} color={theme.colors.primary} />
            <Text style={styles.sobreNome}>StockFlow</Text>
          </View>
          <InfoRow label="Versão" value="1.0.0" />
          <InfoRow label="Descrição" value="Controle de ferramentas, patrimônios e estoque em campo" />
        </View>

        {/* ─── Sair ─── */}
        <TouchableOpacity style={styles.sairBtn} onPress={handleSair} activeOpacity={0.8}>
          <LogOut size={18} color="#ef4444" />
          <Text style={styles.sairText}>Sair da conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </Screen>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
    gap: 8,
  },

  // Avatar
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 6,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  avatarText: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
  },
  avatarNome: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  avatarFuncao: {
    fontSize: 13,
    color: '#6b7280',
  },

  // Section title
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 2,
  },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },

  // Fields
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  fieldHint: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  inputDisabled: {
    opacity: 0.6,
    backgroundColor: '#f3f4f6',
  },

  // Save button
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 4,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },

  // Accordion senha
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accordionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  accordionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  senhaForm: {
    gap: 12,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
  },

  // Sobre
  sobreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sobreNome: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  infoLabel: {
    fontSize: 13,
    color: '#6b7280',
    flexShrink: 0,
  },
  infoValue: {
    fontSize: 13,
    color: theme.colors.primary,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },

  // Sair
  sairBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sairText: {
    color: '#ef4444',
    fontSize: 15,
    fontWeight: '700',
  },
});
