import CardCautelas from '@/components/CardCautelas';
import { Screen } from '@/components/ScreenProps';
import { theme } from '@/styles/theme';
import { useNavigation } from '@react-navigation/native';
import { CopyPlus, Menu } from 'lucide-react-native';
import {
  FlatList,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { DrawerActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '@/types/MainStackNavigator';
import { useEffect, useState } from 'react';
import { buscarCautelas } from '@/service/cautelaService';
import { CautelaDTO } from '@/dtos/cautelaDto';

export default function InicioScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  /*const listaDeCautelas = [
    {
      descricao: 'Entrega de Equipamentos de Segurança',
      quantidade: 5,
      funcaoColaborador: 'Eletricista', 
      nomeColaborador: 'Carlos Henrique',
      empresaColaborador: 'Construtora Beta Ltda',
      dataCautela: '10/05/2025',
      ferramentas: [
        { id: 1, descricao: 'Multímetro Digital', quantidade: 2 },
        { id: 2, descricao: 'Alicate de Pressão', quantidade: 4 },
        { id: 3, descricao: 'Chave de Fenda Isolada', quantidade: 5 },
      ],
      patrimonios: [
        {
          id: 1,
          descricao: 'Esmerilhadeira Angular 4"',
          numeroSerie: 'ESM0025',
        },
        { id: 2, descricao: 'Furadeira Impacto', numeroSerie: 'FUR0025' },
      ],
    },
    {
      descricao: 'Entrega de EPI',
      quantidade: 3,
      funcaoColaborador: 'Soldador',
      nomeColaborador: 'Joana Almeida',
      empresaColaborador: 'Metalúrgica Alfa',
      dataCautela: '12/05/2025',
      ferramentas: [
        { id: 4, descricao: 'Máscara de Solda', quantidade: 1 },
        { id: 5, descricao: 'Luvas de Couro', quantidade: 2 },
      ],
      patrimonios: [
        { id: 3, descricao: 'Máquina de Solda MIG', numeroSerie: 'MSOLD030' },
      ],
    },
    {
      descricao: 'Distribuição de Ferramentas de Carpintaria',
      quantidade: 2,
      funcaoColaborador: 'Carpinteiro',
      nomeColaborador: 'José Pereira',
      empresaColaborador: 'Engenharia Delta',
      dataCautela: '14/05/2025',
      ferramentas: [
        { id: 6, descricao: 'Serrote Profissional', quantidade: 2 },
        { id: 7, descricao: 'Martelo', quantidade: 2 },
      ],
      patrimonios: [],
    },
    {
      descricao: 'Distribuição de Ferramentas de Carpintaria',
      quantidade: 4,
      funcaoColaborador: 'Almoxarife',
      nomeColaborador: 'Rolieber',
      empresaColaborador: 'Engenharia Delta',
      dataCautela: '14/05/2025',
      ferramentas: [
        { id: 6, descricao: 'Serrote Profissional', quantidade: 2 },
        { id: 7, descricao: 'Martelo', quantidade: 2 },
      ],
      patrimonios: [],
    },
  ];*/

  const [listaDeCautelas, setListaDeCautelas] = useState<CautelaDTO[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarCautelas() {
      try {
        const dados = await buscarCautelas();
        setListaDeCautelas(dados);
      } catch (error) {
        console.error('Erro ao buscar cautelas:', error);
      } finally {
        setCarregando(false);
      }
    }
    carregarCautelas();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
        backgroundColor: '#162B4D',
      }}
    >
      {/* Header customizado */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        >
          <Menu color="#C5D4EB" size={24} />
        </TouchableOpacity>

        <Text style={styles.titleHeader}>StockFlow</Text>

        <TouchableOpacity onPress={() => navigation.navigate('Cautela')}>
          <CopyPlus size={24} color="#C5D4EB" />
        </TouchableOpacity>
      </View>

      {/* Conteúdo da tela */}
      <Screen style={styles.screen}>
        {carregando ? (
          <Text style={{ color: 'white', textAlign: 'center', marginTop: 20 }}>
            Carregando cautelas...
          </Text>
        ) : listaDeCautelas.length === 0 ? (
          <View style={styles.noCautelaContainer}>
            <Text style={styles.title}>Cautelas Abertas</Text>
            <Text style={styles.noCautelaText}>
              Nenhuma cautela aberta no momento.
            </Text>
          </View>
        ) : (
          <FlatList
            data={listaDeCautelas}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.cardContainer}>
                <CardCautelas cautelas={item} />
              </View>
            )}
            ListHeaderComponent={() => (
              <Text style={styles.title}>Cautelas Abertas</Text>
            )}
            contentContainerStyle={styles.flatListContent}
          />
        )}
        <Text style={styles.movimentacaoText}>Movimentação do Estoque</Text>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    padding: 8,
  },
  noCautelaContainer: {
    height: 200,
  },
  title: {
    fontSize: 25,
    color: theme.colors.primary,
    marginBottom: 6,
    fontWeight: 'bold',
  },
  noCautelaText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
  cardContainer: {
    marginBottom: 16,
  },
  flatListContent: {
    paddingBottom: 24,
  },
  movimentacaoText: {
    fontSize: 25,
    color: theme.colors.primary,
    fontWeight: 'bold',
    marginTop: 6,
    marginBottom: 6,
  },
  header: {
    backgroundColor: '#19325E',
    height: 60,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleHeader: {
    color: '#C5D4EB',
    fontWeight: 'bold',
    fontSize: 22,
  },
});
