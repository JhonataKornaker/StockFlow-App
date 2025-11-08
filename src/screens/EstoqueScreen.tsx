import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Screen } from '@/components/ScreenProps';
import { EstoqueDto } from '@/dtos/estoqueDto';
import {
  deletarInsumo,
  listarEstoques,
} from '@/service/controleEstoque.service';
import { theme } from '@/styles/theme';
import { MainStackParamList } from '@/types/MainStackNavigator';
import { agruparPorLetra } from '@/util/agrupadores';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AlertTriangle, Package, Search, Trash2 } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import {
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Modal,
} from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

type NavigationProps = StackNavigationProp<MainStackParamList, 'Estoques'>;

export default function Estoques() {
  const [busca, setBusca] = useState('');
  const navigation = useNavigation<NavigationProps>();
  const [estoques, setEstoques] = useState<EstoqueDto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [itemParaExcluir, setItemParaExcluir] = useState<any | null>(null);

  useFocusEffect(
    useCallback(() => {
      carregarEstoques();
    }, []),
  );

  async function carregarEstoques() {
    try {
      const dados = await listarEstoques();
      setEstoques(dados);
    } catch (error) {
      console.error('Erro ao carregar estoques:', error);
    } finally {
      setCarregando(false);
    }
  }

  const handleExcluir = async () => {
    if (!itemParaExcluir) return;

    try {
      await deletarInsumo(itemParaExcluir.insumoId);
      Alert.alert('Sucesso', 'Insumo excluído com sucesso!');
      setItemParaExcluir(null);
      carregarEstoques();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      Alert.alert('Erro', 'Não foi possível excluir o insumo');
    }
  };

  const itensFiltrados = useMemo(() => {
    const texto = busca.toLowerCase();
    return estoques.filter(item =>
      item.insumo.descricao.toLowerCase().includes(texto),
    );
  }, [busca, estoques]);

  const sections = useMemo(() => {
    const itensParaAgrupar = itensFiltrados.map(e => ({
      ...e.insumo,
      estoqueId: e.id,
      insumoId: e.insumo.id,
      quantidadeAtual: e.quantidadeAtual,
      quantidadeMinima: e.quantidadeMinima,
      quantidadeMaxima: e.quantidadeMaxima,
      localizacao: e.localizacao,
      estoqueBaixo: e.estoqueBaixo,
    }));
    return agruparPorLetra(itensParaAgrupar);
  }, [itensFiltrados]);

  const handleCadastrar = () => {
    navigation.navigate('CadastroInsumo');
  };

  const handleEditar = (item: any) => {
    // Encontrar o estoque completo
    const estoqueCompleto = estoques.find(e => e.id === item.estoqueId);
    if (estoqueCompleto) {
      navigation.navigate('EditarInsumo', { insumo: estoqueCompleto });
    }
  };

  const botaoCadastrar = (
    <Button
      style={{ marginTop: 'auto', alignSelf: 'center', marginBottom: 16 }}
      title="Cadastrar Novo Insumo"
      onPress={handleCadastrar}
    />
  );

  if (carregando) {
    return (
      <Screen
        style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </Screen>
    );
  }

  if (estoques.length === 0) {
    return (
      <Screen>
        <View style={styles.emptyContainer}>
          <Package size={64} color="#9ca3af" />
          <Text style={styles.emptyTitle}>Nenhum insumo cadastrado</Text>
          <Text style={styles.emptySubtitle}>
            Cadastre insumos para controlar entrada e saída de materiais de
            consumo.
          </Text>
          <Button
            title="Cadastrar Insumo"
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
        keyExtractor={(item, index) => `${item.estoqueId}-${index}`}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleEditar(item)}
            onLongPress={() => setItemParaExcluir(item)}
            delayLongPress={500}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingLeft: 8,
                paddingVertical: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: item.estoqueBaixo ? '#ef4444' : theme.colors.primary,
                  fontWeight: 'bold',
                  flex: 1,
                }}
              >
                {item.descricao}
              </Text>

              {item.estoqueBaixo && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginLeft: 8,
                  }}
                >
                  <AlertTriangle size={18} color="#ef4444" />
                  <Text
                    style={{
                      marginLeft: 4,
                      fontSize: 12,
                      color: '#ef4444',
                      fontWeight: '600',
                    }}
                  >
                    Baixo
                  </Text>
                </View>
              )}
            </View>

            <View
              style={{
                marginBottom: 6,
                flexDirection: 'row',
                alignItems: 'center',
                flexWrap: 'wrap',
                paddingLeft: 8,
              }}
            >
              <Text>
                Quantidade: {item.quantidadeAtual} / Mínimo:{' '}
                {item.quantidadeMinima}
              </Text>
              {item.codigo && (
                <>
                  <Text style={{ marginHorizontal: 6 }}>|</Text>
                  <Text>Código: {item.codigo}</Text>
                </>
              )}
              {item.marca && (
                <>
                  <Text style={{ marginHorizontal: 6 }}>|</Text>
                  <Text>Marca: {item.marca}</Text>
                </>
              )}
              {item.localizacao && (
                <>
                  <Text style={{ marginHorizontal: 6 }}>|</Text>
                  <Text>Local: {item.localizacao}</Text>
                </>
              )}
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
            <Package size={18} style={{ marginLeft: 8 }} color="#19325E" />
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

            <Text style={styles.modalTitle}>Excluir Insumo</Text>

            <Text style={styles.modalMessage}>
              Tem certeza que deseja excluir?
            </Text>

            <Text style={styles.modalItemName}>
              {itemParaExcluir?.descricao}
            </Text>

            <Text style={styles.warningText}>
              ⚠️ Isso também excluirá o estoque e histórico de movimentações
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
    marginBottom: 12,
  },
  warningText: {
    fontSize: 13,
    color: '#f59e0b',
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
