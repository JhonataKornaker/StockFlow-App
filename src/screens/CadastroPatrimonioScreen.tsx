import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import RadionComponent from '@/components/RadionComponent';
import { Screen } from '@/components/ScreenProps';
import { CriarPatrimonioDto, PatrimonioDto } from '@/dtos/patrimonioDto';
import { createPatrimonio } from '@/service/patrimonio.service';
import { uploadComprovante } from '@/service/upload.service';
import { theme } from '@/styles/theme';
import { MainStackParamList } from '@/types/MainStackNavigator';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import {
  CircleAlert,
  FileText,
  Image as ImageIcon,
  Trash2,
  Upload,
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Checkbox } from 'react-native-paper';
import { showErrorToast, showInfoToast, showSuccessToast } from '@/util/toast';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SkeletonCadastroForm } from '@/components/Skeleton/SkeletonCadastroForm';

type NavigationProps = StackNavigationProp<MainStackParamList, 'CadastroPatrimonio'>;
type RouteProps = RouteProp<MainStackParamList, 'CadastroPatrimonio'>;

type ComprovanteFile = {
  uri: string;
  name: string;
  mimeType: string;
  type: 'image' | 'pdf';
};

function formatDate(date: Date) {
  return date.toLocaleDateString('pt-BR');
}

export default function CadastroPatrimonio() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProps>();
  const patrimonio = route.params?.patrimonio as PatrimonioDto | undefined;
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDevolucaoPicker, setShowDevolucaoPicker] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [comprovante, setComprovante] = useState<ComprovanteFile | null>(null);

  const isEdicao = !!patrimonio;
  const [opcao, setOpcao] = useState(patrimonio?.locado ? 'sim' : 'nao');
  const [semNumeroSerie, setSemNumeroSerie] = useState(patrimonio?.numeroSerie === 'S/N');

  const [formData, setFormData] = useState({
    descricao: patrimonio?.descricao || '',
    numeroSerie: patrimonio?.numeroSerie || '',
    marca: patrimonio?.marca || '',
    modelo: patrimonio?.modelo || '',
    nomeLocadora: patrimonio?.nomeLocadora || '',
    dataLocacao: patrimonio?.dataLocacao
      ? new Date(patrimonio.dataLocacao).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
      : formatDate(new Date()),
    dataDevolucao: patrimonio?.dataDevolucao
      ? new Date(patrimonio.dataDevolucao).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
      : '',
  });

  useEffect(() => {
    const t = setTimeout(() => setCarregando(false), 300);
    return () => clearTimeout(t);
  }, []);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleToggleSemNumeroSerie = () => {
    const novo = !semNumeroSerie;
    setSemNumeroSerie(novo);
    handleChange('numeroSerie', novo ? 'S/N' : '');
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showInfoToast('Permissão necessária para acessar fotos.', 'Permissão negada');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const name = asset.fileName || `foto_${Date.now()}.jpg`;
      setComprovante({
        uri: asset.uri,
        name,
        mimeType: asset.mimeType || 'image/jpeg',
        type: 'image',
      });
    }
  };

  const handlePickPdf = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setComprovante({
        uri: asset.uri,
        name: asset.name,
        mimeType: 'application/pdf',
        type: 'pdf',
      });
    }
  };

  const handleSalvar = async () => {
    const { descricao, numeroSerie, marca, modelo, nomeLocadora, dataLocacao } = formData;

    if (!descricao || (!numeroSerie && !semNumeroSerie) || !marca || !modelo) {
      showInfoToast('Preencha todos os campos.', 'Campos obrigatórios');
      return;
    }

    setSalvando(true);
    try {
      let comprovanteUrl: string | undefined;

      if (comprovante) {
        setUploadProgress(0);
        comprovanteUrl = await uploadComprovante(
          comprovante.uri,
          comprovante.name,
          comprovante.mimeType,
          percent => setUploadProgress(percent),
        );
        setUploadProgress(null);
      }

      const patrimonioDto: CriarPatrimonioDto = {
        descricao,
        numeroSerie,
        marca,
        modelo,
        nomeLocadora: opcao === 'sim' ? nomeLocadora : undefined,
        dataLocacao: opcao === 'sim' && dataLocacao ? parseDateFromBrFormat(dataLocacao) : undefined,
        dataDevolucao: opcao === 'sim' && formData.dataDevolucao
          ? parseDateFromBrFormat(formData.dataDevolucao)
          : undefined,
        comprovanteUrl,
      };

      await createPatrimonio(patrimonioDto);

      showSuccessToast('Patrimônio cadastrado com sucesso!');
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao salvar patrimônio:', error);
      showErrorToast('Erro ao salvar patrimônio.', 'Erro');
    } finally {
      setSalvando(false);
      setUploadProgress(null);
    }
  };

  function parseDateFromBrFormat(dateString: string): Date {
    const [day, month, year] = dateString.split('/');
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  function onChangeDate(event: any, selectedDate?: Date) {
    setShowDatePicker(false);
    if (selectedDate) handleChange('dataLocacao', formatDate(selectedDate));
  }

  function onChangeDevolucaoDate(event: any, selectedDate?: Date) {
    setShowDevolucaoPicker(false);
    if (selectedDate) handleChange('dataDevolucao', formatDate(selectedDate));
  }

  if (carregando) {
    return (
      <Screen>
        <SkeletonCadastroForm fields={4} />
      </Screen>
    );
  }

  return (
    <Screen scrollable>
      <View style={{ marginTop: 20, gap: 14 }}>
        <Input
          placeholder="Descricao"
          icon={CircleAlert}
          iconColors="#FF001F80"
          value={formData.descricao}
          onChangeText={text => handleChange('descricao', text)}
        />
        <Input
          placeholder="Numero De Serie"
          value={formData.numeroSerie}
          onChangeText={text => handleChange('numeroSerie', text)}
          editable={!semNumeroSerie}
        />
        <TouchableOpacity
          onPress={handleToggleSemNumeroSerie}
          style={{ flexDirection: 'row', alignItems: 'center', marginTop: -6 }}
        >
          <Checkbox
            status={semNumeroSerie ? 'checked' : 'unchecked'}
            onPress={handleToggleSemNumeroSerie}
            color={theme.colors.primary}
          />
          <Text style={{ color: theme.colors.primary, fontSize: 14 }}>
            Não possui número de série
          </Text>
        </TouchableOpacity>
        <Input
          placeholder="Marca"
          value={formData.marca}
          onChangeText={text => handleChange('marca', text)}
        />
        <Input
          placeholder="Modelo"
          value={formData.modelo}
          onChangeText={text => handleChange('modelo', text)}
        />
      </View>

      {/* Toggle alugado */}
      <View
        style={{
          marginTop: 20,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 10,
        }}
      >
        <Text style={{ color: theme.colors.primary, fontWeight: 'bold', fontSize: 18 }}>
          Equipamento Alugado?
        </Text>
        <RadionComponent value={opcao} onChange={setOpcao} disabled={isEdicao} />
      </View>

      {opcao === 'sim' && (
        <View style={{ marginTop: 20, gap: 16 }}>
          <Input
            placeholder="Fornecedor (Locadora)"
            icon={CircleAlert}
            iconColors="#FF001F80"
            iconPosition="right"
            value={formData.nomeLocadora}
            onChangeText={text => handleChange('nomeLocadora', text)}
          />

          {/* Data da Locação */}
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <Input
              placeholder="Data da Locação"
              icon={CircleAlert}
              iconColors="#FF001F80"
              iconPosition="right"
              value={formData.dataLocacao}
              editable={false}
              pointerEvents="none"
            />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
              onChange={onChangeDate}
              locale="pt-BR"
            />
          )}

          {/* Prazo de Devolução */}
          <TouchableOpacity onPress={() => setShowDevolucaoPicker(true)}>
            <Input
              placeholder="Prazo de Devolução (opcional)"
              icon={CircleAlert}
              iconColors="#FF001F80"
              iconPosition="right"
              value={formData.dataDevolucao || ''}
              editable={false}
              pointerEvents="none"
            />
          </TouchableOpacity>
          {showDevolucaoPicker && (
            <DateTimePicker
              value={new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
              onChange={onChangeDevolucaoDate}
              locale="pt-BR"
            />
          )}

          {/* Upload Comprovante */}
          <View style={styles.uploadSection}>
            <Text style={styles.uploadLabel}>Comprovante de Locação</Text>

            {comprovante ? (
              <View style={styles.comprovantePreview}>
                <View style={styles.comprovanteInfo}>
                  {comprovante.type === 'pdf' ? (
                    <FileText size={24} color={theme.colors.primary} />
                  ) : (
                    <ImageIcon size={24} color={theme.colors.primary} />
                  )}
                  <Text style={styles.comprovanteNome} numberOfLines={1}>
                    {comprovante.name}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setComprovante(null)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Trash2 size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.uploadButtons}>
                <TouchableOpacity style={styles.uploadBtn} onPress={handlePickImage}>
                  <ImageIcon size={20} color={theme.colors.primary} />
                  <Text style={styles.uploadBtnText}>Foto</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.uploadBtn} onPress={handlePickPdf}>
                  <FileText size={20} color={theme.colors.primary} />
                  <Text style={styles.uploadBtnText}>PDF</Text>
                </TouchableOpacity>
              </View>
            )}

            {uploadProgress !== null && (
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: `${uploadProgress}%` }]} />
                <Text style={styles.progressText}>
                  <Upload size={12} color="#fff" /> Enviando... {uploadProgress}%
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      <Button
        onPress={handleSalvar}
        title={salvando ? 'Salvando...' : 'Salvar'}
        style={{ marginTop: 24, marginBottom: 12, alignSelf: 'center' }}
        disabled={salvando}
      />

      {salvando && (
        <ActivityIndicator
          color={theme.colors.primary}
          style={{ marginBottom: 8 }}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  uploadSection: {
    gap: 10,
  },
  uploadLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  uploadButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  uploadBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
  },
  uploadBtnText: {
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  comprovantePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0f4ff',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.primary + '40',
  },
  comprovanteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  comprovanteNome: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  progressContainer: {
    height: 28,
    backgroundColor: '#e5e7eb',
    borderRadius: 14,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
    borderRadius: 14,
  },
  progressText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '700',
    zIndex: 1,
  },
});
