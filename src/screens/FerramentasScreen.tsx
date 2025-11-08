import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import ScreenListar from '@/components/ScreenListar';
import { Screen } from '@/components/ScreenProps';
import { FerramentasDto } from '@/dtos/ferramentasDto';
import { listarFerramentas, deletarFerramenta } from '@/service/ferramenta.service';
import { theme } from '@/styles/theme';
import { MainStackParamList } from '@/types/MainStackNavigator';
import { agruparPorLetra } from '@/util/agrupadores';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';
import { Contact, Package, Search, Trash2 } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Modal,
} from 'react-native';
import { SkeletonGeneric } from '@/components/Skeleton/SkeletonGeneric';
import { showErrorToast, showSuccessToast } from '@/util/toast';

type NavigationProps = StackNavigationProp<MainStackParamList, 'Ferramentas'>;

export default function Ferramentas() {
  const [busca, setBusca] = useState('');
  const navigation = useNavigation<NavigationProps>();
  const [listaFerramentas, setListaFerramentas] = useState<FerramentasDto[]>(
    [],
  );
  const [carregando, setCarregando] = useState(true);
  const [itemParaExcluir, setItemParaExcluir] = useState<FerramentasDto | null>(
    null,
  );

  async function carregarFerramentas() {
    try {
      const dados = await listarFerramentas();
      setListaFerramentas(dados);
    } catch (error) {
      console.error('Erro ao buscar ferramestas: ', error);
    } finally {
      setCarregando(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      carregarFerramentas();
    }, []),
  );

  const itensFiltrados = useMemo(() => {
    const texto = busca.toLowerCase();
    return listaFerramentas.filter(item =>
      item.descricao.toLowerCase().includes(texto),
    );
  }, [busca, listaFerramentas]);

  const sections = useMemo(
    () => agruparPorLetra(itensFiltrados),
    [itensFiltrados],
  );

  const handleCadastrar = () => {
    navigation.navigate('CadastroFerramentas');
  };

  const handleEditar = (item: FerramentasDto) => {
    navigation.navigate('EditarFerramenta', { ferramenta: item });
  };

  const handleExcluir = async () => {
    if (!itemParaExcluir) return;

    try {
      await deletarFerramenta(itemParaExcluir.id);
      showSuccessToast('Ferramenta excluída com sucesso!');
      setItemParaExcluir(null);
      carregarFerramentas();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      const message = error instanceof Error ? error.message : 'Não foi possível excluir a ferramenta';
      showErrorToast(String(message), 'Erro ao excluir ferramenta');
    }
  };

  const botaoCadastrar = (
    <Button
      style={{ marginTop: 'auto', alignSelf: 'center', marginBottom: 16 }}
      title={`Cadastrar Nova Colaborador`}
      onPress={handleCadastrar}
    />
  );

  if (carregando) {
    return (
      <Screen>
        <SkeletonGeneric variant="list" />
      </Screen>
    );
  }

  if (listaFerramentas.length === 0) {
    return (
      <Screen>
        <View style={styles.emptyContainer}>
          <Package size={64} color="#9ca3af" />
          <Text style={styles.emptyTitle}>Nenhuma ferramenta cadastrada</Text>
          <Text style={styles.emptySubtitle}>
            Cadastre suas ferramentas para controlar empréstimos e
            disponibilidade.
          </Text>
          <Button
            title="Cadastrar Ferramenta"
            onPress={handleCadastrar}
            style={{ marginTop: 20 }}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Input
        style={{ marginTop: 8 }}
        placeholder="Digite para pesquisar..."
        icon={Search}
        value={busca}
        onChangeText={setBusca}
      />
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => item.descricao + index}
        renderItem={({ item }) => (
          <TouchableOpacity
            onLongPress={() => setItemParaExcluir(item)}
            onPress={() => handleEditar(item)}
            delayLongPress={300}
          >
            <Text
              style={{
                paddingLeft: 8,
                paddingVertical: 4,
                fontSize: 16,
                color: theme.colors.primary,
                fontWeight: 'bold',
              }}
            >
              {item.descricao}
            </Text>
            <View
              style={{
                marginBottom: 14,
                flexDirection: 'row',
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <Text style={{}}>Estoque: {item.quantidade}</Text>
              <Text style={{ marginHorizontal: 6 }}>|</Text>
              <Text>Marca: {item.marca}</Text>
              <Text style={{ marginHorizontal: 6 }}>|</Text>
              <Text>Modelo: {item.modelo}</Text>
            </View>
          </TouchableOpacity>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 12,
            }}
          >
            <Text
              style={{
                fontWeight: 'bold',
                fontSize: 20,
                color: theme.colors.primary,
              }}
            >
              {title}
            </Text>
            <Contact size={18} style={{ marginLeft: 8 }} color="#19325E" />
          </View>
        )}
      />
      {botaoCadastrar}

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        visible={itemParaExcluir !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setItemParaExcluir(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setItemParaExcluir(null)}
        >
          <View style={styles.modalContent}>
            <View style={styles.iconContainer}>
              <Trash2 size={48} color="#ef4444" />
            </View>

            <Text style={styles.modalTitle}>Excluir Ferramenta</Text>

            <Text style={styles.modalMessage}>
              Tem certeza que deseja excluir?
            </Text>

            <Text style={styles.modalItemName}>
              {itemParaExcluir?.descricao}
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setItemParaExcluir(null)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={handleExcluir}
              >
                <Text style={styles.deleteButtonText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#19325E',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#19325E',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
