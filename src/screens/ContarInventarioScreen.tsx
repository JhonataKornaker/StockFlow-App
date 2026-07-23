import { Screen } from '@/components/ScreenProps';
import { SkeletonGeneric } from '@/components/Skeleton/SkeletonGeneric';
import { EstoqueDto } from '@/dtos/estoqueDto';
import { listarEstoques } from '@/service/controleEstoque.service';
import {
  atualizarFotoInventario,
  criarInventario,
  finalizarInventario,
  salvarItemInventario,
} from '@/service/inventario.service';
import { buscarUsuarioLogado } from '@/service/usuario.service';
import { theme } from '@/styles/theme';
import { MainStackParamList } from '@/types/MainStackNavigator';
import { parseApiError, showErrorToast, showInfoToast, showSuccessToast } from '@/util/toast';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import {
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Image as ImageIcon,
  User,
} from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type NavigationProps = StackNavigationProp<MainStackParamList, 'ContarInventario'>;
type RouteProps = RouteProp<MainStackParamList, 'ContarInventario'>;

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dvdgc9rz2/image/upload';
const CLOUDINARY_PRESET = 'stockflow_unsigned';

type Etapa = 'form' | 'contagem';

export default function ContarInventarioScreen() {
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute<RouteProps>();
  const inventarioIdInicial = route.params?.inventarioId;

  // Estado da etapa
  const [etapa, setEtapa] = useState<Etapa>(inventarioIdInicial ? 'contagem' : 'form');
  const [inventarioId, setInventarioId] = useState<number | null>(inventarioIdInicial ?? null);

  // Form
  const [solicitanteTipo, setSolicitanteTipo] = useState<'eu' | 'outro'>('eu');
  const [solicitanteNome, setSolicitanteNome] = useState('');
  const [observacao, setObservacao] = useState('');
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [criando, setCriando] = useState(false);

  // Contagem
  const [estoques, setEstoques] = useState<EstoqueDto[]>([]);
  const [quantidades, setQuantidades] = useState<Record<number, string>>({});
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [uploadandoFoto, setUploadandoFoto] = useState(false);
  const [formColapsado, setFormColapsado] = useState(false);

  useEffect(() => {
    buscarUsuarioLogado().then(u => setNomeUsuario(u.nome)).catch(() => {});
    if (inventarioIdInicial) {
      carregarEstoques();
    }
  }, []);

  async function carregarEstoques() {
    setCarregando(true);
    try {
      const dados = await listarEstoques();
      setEstoques(dados);
    } catch (error) {
      showErrorToast(parseApiError(error, 'Erro ao carregar insumos.'), 'Erro ao carregar');
    } finally {
      setCarregando(false);
    }
  }

  async function handleIniciar() {
    const nome = solicitanteTipo === 'eu' ? nomeUsuario : solicitanteNome.trim();
    if (!nome) {
      showErrorToast('Informe o nome do solicitante', 'Campo obrigatório');
      return;
    }

    setCriando(true);
    try {
      const inv = await criarInventario({ solicitante: nome, observacao: observacao.trim() || undefined });
      setInventarioId(inv.id);
      await carregarEstoques();
      setEtapa('contagem');
    } catch (error) {
      showErrorToast(parseApiError(error, 'Erro ao criar inventário.'), 'Erro');
    } finally {
      setCriando(false);
    }
  }

  function handleQuantidade(estoqueId: number, valor: string) {
    setQuantidades(prev => ({ ...prev, [estoqueId]: valor }));
  }

  async function handleSalvarItem(estoqueId: number) {
    const val = quantidades[estoqueId];
    if (!val || isNaN(Number(val))) return;
    if (!inventarioId) return;
    try {
      await salvarItemInventario(inventarioId, estoqueId, Number(val));
    } catch (error) {
      showErrorToast(parseApiError(error, 'Erro ao salvar item.'), 'Erro');
    }
  }

  async function handleFoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showErrorToast('Permissão de câmera negada', 'Erro');
      return;
    }

    Alert.alert('Foto do inventário', 'Como deseja adicionar a foto?', [
      {
        text: 'Tirar foto',
        onPress: async () => {
          const result = await ImagePicker.launchCameraAsync({ quality: 0.7, base64: false });
          if (!result.canceled) uploadFoto(result.assets[0].uri);
        },
      },
      {
        text: 'Escolher da galeria',
        onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7, base64: false });
          if (!result.canceled) uploadFoto(result.assets[0].uri);
        },
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  async function uploadFoto(uri: string) {
    if (!inventarioId) return;
    setUploadandoFoto(true);
    try {
      const formData = new FormData();
      formData.append('file', { uri, type: 'image/jpeg', name: 'inventario.jpg' } as any);
      formData.append('upload_preset', CLOUDINARY_PRESET);

      const res = await fetch(CLOUDINARY_URL, { method: 'POST', body: formData });
      const json = await res.json();
      if (!json.secure_url) throw new Error('Upload falhou');

      setFotoUri(uri);
      await atualizarFotoInventario(inventarioId, json.secure_url);
      showSuccessToast('Foto salva com sucesso!');
    } catch (error) {
      showErrorToast(parseApiError(error, 'Erro ao enviar foto.'), 'Erro');
    } finally {
      setUploadandoFoto(false);
    }
  }

  async function handleFinalizar() {
    if (!inventarioId) return;

    const contados = estoques.filter(e => quantidades[e.id] !== undefined);
    if (contados.length === 0) {
      showErrorToast('Conte ao menos um item antes de finalizar', 'Atenção');
      return;
    }

    Alert.alert(
      'Finalizar Inventário',
      `${contados.length} de ${estoques.length} itens foram contados. Deseja finalizar?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Finalizar',
          onPress: async () => {
            setSalvando(true);
            try {
              // Salva todos os itens pendentes
              for (const e of contados) {
                await salvarItemInventario(inventarioId, e.id, Number(quantidades[e.id]));
              }
              await finalizarInventario(inventarioId);
              showSuccessToast('Inventário finalizado com sucesso!');
              navigation.replace('DetalhesInventario', { inventarioId });
            } catch (error) {
              showErrorToast(parseApiError(error, 'Erro ao finalizar inventário.'), 'Erro');
            } finally {
              setSalvando(false);
            }
          },
        },
      ],
    );
  }

  // ─── Etapa: Form ─────────────────────────────────────────────────────────────

  if (etapa === 'form') {
    return (
      <Screen>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.formContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.formCard}>
              <Text style={styles.formTitulo}>Solicitante</Text>
              <Text style={styles.formSub}>Quem está solicitando este inventário?</Text>

              <View style={styles.toggle}>
                <TouchableOpacity
                  style={[styles.toggleBtn, solicitanteTipo === 'eu' && styles.toggleBtnAtivo]}
                  onPress={() => setSolicitanteTipo('eu')}
                >
                  <User size={14} color={solicitanteTipo === 'eu' ? '#fff' : theme.colors.primary} />
                  <Text style={[styles.toggleText, solicitanteTipo === 'eu' && styles.toggleTextAtivo]}>
                    Sou eu
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleBtn, solicitanteTipo === 'outro' && styles.toggleBtnAtivo]}
                  onPress={() => setSolicitanteTipo('outro')}
                >
                  <Text style={[styles.toggleText, solicitanteTipo === 'outro' && styles.toggleTextAtivo]}>
                    Outro
                  </Text>
                </TouchableOpacity>
              </View>

              {solicitanteTipo === 'eu' && nomeUsuario ? (
                <View style={styles.nomeDisplay}>
                  <Text style={styles.nomeDisplayText}>{nomeUsuario}</Text>
                </View>
              ) : null}

              {solicitanteTipo === 'outro' && (
                <TextInput
                  style={styles.input}
                  placeholder="Nome do solicitante"
                  placeholderTextColor="#9ca3af"
                  value={solicitanteNome}
                  onChangeText={setSolicitanteNome}
                  autoCapitalize="words"
                />
              )}
            </View>

            <View style={styles.formCard}>
              <Text style={styles.formTitulo}>Observação (opcional)</Text>
              <TextInput
                style={[styles.input, styles.inputMulti]}
                placeholder="Ex: Inventário mensal de abril"
                placeholderTextColor="#9ca3af"
                value={observacao}
                onChangeText={setObservacao}
                multiline
                numberOfLines={3}
                autoCapitalize="sentences"
              />
            </View>

            <TouchableOpacity
              style={styles.iniciarBtn}
              onPress={handleIniciar}
              disabled={criando}
              activeOpacity={0.85}
            >
              {criando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <ClipboardList size={18} color="#fff" />
                  <Text style={styles.iniciarBtnText}>Iniciar Contagem</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Screen>
    );
  }

  // ─── Etapa: Contagem ─────────────────────────────────────────────────────────

  if (carregando) {
    return (
      <Screen>
        <SkeletonGeneric variant="list" />
      </Screen>
    );
  }

  const contados = estoques.filter(e => quantidades[e.id] !== undefined).length;

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contagemContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Progresso */}
          <View style={styles.progressCard}>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Itens contados</Text>
              <Text style={styles.progressValor}>{contados} / {estoques.length}</Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: estoques.length > 0 ? `${(contados / estoques.length) * 100}%` : '0%' },
                ]}
              />
            </View>
          </View>

          {/* Lista de insumos */}
          {estoques.map(estoque => {
            const val = quantidades[estoque.id] ?? '';
            const qtdNum = val !== '' ? Number(val) : null;
            const diff = qtdNum !== null ? qtdNum - estoque.quantidadeAtual : null;
            const diffColor = diff === null ? '#9ca3af' : diff > 0 ? '#22c55e' : diff < 0 ? '#ef4444' : '#6b7280';
            const contado = val !== '';

            return (
              <View key={estoque.id} style={[styles.itemCard, contado && styles.itemCardContado]}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemNome} numberOfLines={1}>{estoque.insumo.descricao}</Text>
                  <Text style={styles.itemSistema}>
                    Sistema: {estoque.quantidadeAtual} {estoque.insumo.unidade}
                  </Text>
                </View>

                <View style={styles.itemRight}>
                  {diff !== null && (
                    <Text style={[styles.diffText, { color: diffColor }]}>
                      {diff > 0 ? '+' : ''}{diff}
                    </Text>
                  )}
                  <TextInput
                    style={[styles.qtdInput, contado && styles.qtdInputContado]}
                    placeholder="—"
                    placeholderTextColor="#d1d5db"
                    value={val}
                    onChangeText={v => handleQuantidade(estoque.id, v.replace(/[^0-9]/g, ''))}
                    onBlur={() => handleSalvarItem(estoque.id)}
                    keyboardType="numeric"
                  />
                </View>

                {contado && <CheckCircle2 size={16} color="#22c55e" style={{ marginLeft: 4 }} />}
              </View>
            );
          })}

          {/* Foto */}
          <View style={styles.fotoSection}>
            <Text style={styles.fotoLabel}>Foto geral (opcional)</Text>
            {fotoUri ? (
              <TouchableOpacity onPress={handleFoto} activeOpacity={0.85}>
                <Image source={{ uri: fotoUri }} style={styles.fotoPreview} />
                <Text style={styles.fotoTrocar}>Trocar foto</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.fotoBtn} onPress={handleFoto} disabled={uploadandoFoto}>
                {uploadandoFoto ? (
                  <ActivityIndicator color={theme.colors.primary} />
                ) : (
                  <>
                    <Camera size={20} color={theme.colors.primary} />
                    <Text style={styles.fotoBtnText}>Adicionar foto</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Finalizar */}
          <TouchableOpacity
            style={[styles.finalizarBtn, salvando && { opacity: 0.7 }]}
            onPress={handleFinalizar}
            disabled={salvando}
            activeOpacity={0.85}
          >
            {salvando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <CheckCircle2 size={18} color="#fff" />
                <Text style={styles.finalizarBtnText}>Finalizar Inventário</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Form
  formContent: { padding: 16, gap: 14 },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    gap: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  formTitulo: { fontSize: 15, fontWeight: '700', color: theme.colors.primary },
  formSub: { fontSize: 13, color: '#6b7280', marginTop: -8 },
  toggle: { flexDirection: 'row', gap: 8 },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
  },
  toggleBtnAtivo: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  toggleText: { fontSize: 14, color: theme.colors.primary, fontWeight: '600' },
  toggleTextAtivo: { color: '#fff' },
  nomeDisplay: {
    backgroundColor: '#f0f4ff',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  nomeDisplayText: { fontSize: 15, fontWeight: '600', color: theme.colors.primary },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  inputMulti: { height: 80, textAlignVertical: 'top' },
  iniciarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 4,
  },
  iniciarBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Contagem
  contagemContent: { padding: 12, gap: 8, paddingBottom: 24 },
  progressCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    marginBottom: 4,
  },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressLabel: { fontSize: 13, color: '#6b7280', fontWeight: '500' },
  progressValor: { fontSize: 13, fontWeight: '700', color: theme.colors.primary },
  progressBar: { height: 6, backgroundColor: '#f3f4f6', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: theme.colors.primary, borderRadius: 3 },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    borderLeftWidth: 3,
    borderLeftColor: '#e5e7eb',
  },
  itemCardContado: { borderLeftColor: '#22c55e' },
  itemInfo: { flex: 1 },
  itemNome: { fontSize: 14, fontWeight: '600', color: theme.colors.primary },
  itemSistema: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  itemRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  diffText: { fontSize: 13, fontWeight: '700', minWidth: 30, textAlign: 'right' },
  qtdInput: {
    width: 64,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
    textAlign: 'center',
  },
  qtdInputContado: { borderColor: '#22c55e', backgroundColor: '#f0fdf4' },
  fotoSection: { backgroundColor: '#fff', borderRadius: 12, padding: 16, gap: 10, marginTop: 8 },
  fotoLabel: { fontSize: 13, fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 },
  fotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 20,
  },
  fotoBtnText: { fontSize: 14, color: theme.colors.primary, fontWeight: '600' },
  fotoPreview: { width: '100%', height: 180, borderRadius: 10, resizeMode: 'cover' },
  fotoTrocar: { fontSize: 12, color: '#6b7280', textAlign: 'center', marginTop: 6 },
  finalizarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 15,
    marginTop: 12,
  },
  finalizarBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
