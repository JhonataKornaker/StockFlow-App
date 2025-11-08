import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Screen } from '@/components/ScreenProps';
import { ColaboradorDto } from '@/dtos/colaboradorDto';
import {
  buscarColaboradores,
  deletarColaborador,
} from '@/service/colaborador.service';
import { theme } from '@/styles/theme';
import { MainStackParamList } from '@/types/MainStackNavigator';
import { agruparPorLetra } from '@/util/agrupadores';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Contact, Search, Edit, Trash2, Eye } from 'lucide-react-native';
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

type NavigationProps = StackNavigationProp<MainStackParamList, 'Colaboradores'>;

export default function Colaboradores() {
  const [busca, setBusca] = useState('');
  const navigation = useNavigation<NavigationProps>();
  const [listaColaboradores, setListaColaboradores] = useState<
    ColaboradorDto[]
  >([]);
  const [carregando, setCarregando] = useState(true);
  // Removido: menuVisible
  // Adicionado: Estados para o modal
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ColaboradorDto | null>(null);

  useFocusEffect(
    useCallback(() => {
      carregarColaboradores();
    }, []),
  );

  async function carregarColaboradores() {
    try {
      const dados = await buscarColaboradores();
      setListaColaboradores(dados);
    } catch (error) {
      console.error('Erro ao buscar colaboradores: ', error);
    } finally {
      setCarregando(false);
    }
  }

  const itensFiltrados = useMemo(() => {
    const texto = busca.toLowerCase();
    return listaColaboradores.filter(item =>
      item.nome.toLowerCase().includes(texto),
    );
  }, [busca, listaColaboradores]);

  const sections = useMemo(
    () => agruparPorLetra(itensFiltrados),
    [itensFiltrados],
  );

  const handleCadastrar = () => {
    navigation.navigate('CadastroColaborador');
  };

  // Modificado: Agora abre o modal em vez de mostrar menu inline
  const handleLongPress = (item: ColaboradorDto) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const handleVerHistorico = (item: ColaboradorDto) => {
    setModalVisible(false); // Fecha o modal se estiver aberto
    navigation.navigate('DetalhesColaborador', { colaborador: item });
  };

  const handleEditar = (item: ColaboradorDto) => {
    setModalVisible(false);
    navigation.navigate('EditarColaborador', { colaborador: item });
  };

  const handleExcluir = (item: ColaboradorDto) => {
    setModalVisible(false);
    Alert.alert(
      'Excluir Colaborador',
      `Tem certeza que deseja excluir "${item.nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletarColaborador(item.id);
              Alert.alert('Sucesso', 'Colaborador excluído com sucesso!');
              carregarColaboradores();
            } catch (error: any) {
              console.error('Erro ao excluir:', error);

              // Captura a mensagem real do backend (NestJS)
              const message =
                error.response?.data?.message ||
                'Não foi possível excluir o colaborador.';

              // Exibe a mensagem do backend (ex: "Colaborador tem cautela em aberto")
              Alert.alert('Erro', message);
            }
          },
        },
      ],
    );
  };

  const botaoCadastrar = (
    <Button
      style={{ marginTop: 'auto', alignSelf: 'center', marginBottom: 16 }}
      title="Cadastrar Novo Colaborador"
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

  if (listaColaboradores.length === 0) {
    return (
      <Screen>
        <View style={styles.emptyContainer}>
          <Contact size={64} color="#9ca3af" />
          <Text style={styles.emptyTitle}>Nenhum colaborador cadastrado</Text>
          <Text style={styles.emptySubtitle}>
            Comece cadastrando o primeiro colaborador para gerenciar cautelas e
            retiradas.
          </Text>
          <Button
            title="Cadastrar Colaborador"
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
        keyExtractor={(item, index) => item.nome + index}
        renderItem={({ item }) => (
          <View>
            <TouchableOpacity
              onPress={() => handleVerHistorico(item)}
              onLongPress={() => handleLongPress(item)}
              delayLongPress={500}
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
                {item.nome}
              </Text>
              <View
                style={{
                  marginBottom: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <Text>Função: {item.funcao}</Text>
                <Text style={{ marginHorizontal: 6 }}>|</Text>
                <Text>Empresa: {item.empresa}</Text>
              </View>
            </TouchableOpacity>

            {/* Removido: Menu inline (menuVisible) */}
          </View>
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

      {/* Adicionado: Modal elegante */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              Opções para {selectedItem?.nome}
            </Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => selectedItem && handleVerHistorico(selectedItem)}
            >
              <Eye size={20} color="#3b82f6" />
              <Text style={[styles.modalButtonText, { color: '#3b82f6' }]}>
                Ver Histórico
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => selectedItem && handleEditar(selectedItem)}
            >
              <Edit size={20} color="#10b981" />
              <Text style={[styles.modalButtonText, { color: '#10b981' }]}>
                Editar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => selectedItem && handleExcluir(selectedItem)}
            >
              <Trash2 size={20} color="#ef4444" />
              <Text style={[styles.modalButtonText, { color: '#ef4444' }]}>
                Excluir
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.cancelModalButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelModalText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {botaoCadastrar}
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
  // Removido: menuContainer, menuButton, menuText, cancelButton, cancelText (não são mais necessários)

  // Adicionado: Estilos para o modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fundo com opacidade
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12, // Bordas arredondadas
    padding: 20,
    width: '80%',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10, // Sombra para Android
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    gap: 12,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelModalButton: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginTop: 8,
    justifyContent: 'center',
  },
  cancelModalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
  },
});
