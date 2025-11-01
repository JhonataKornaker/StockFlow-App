import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Screen } from '@/components/ScreenProps';
import { ColaboradorDto } from '@/dtos/colaboradorDto';
import { buscarColaboradores } from '@/service/colaborador.service';
import { theme } from '@/styles/theme';
import { Colaborador } from '@/types/Colaborador';
import { MainStackParamList } from '@/types/MainStackNavigator';
import { agruparPorLetra } from '@/util/agrupadores';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';
import { Contact, PersonStanding, Search } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
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

  useEffect(() => {
    async function carregarColaboradores() {
      try {
        const dados = await buscarColaboradores();
        console.log('📦 Colaboradores recebidos:', dados);
        setListaColaboradores(dados);
      } catch (error) {
        console.error('Erro ao buscar colaboradores: ', error);
        if (axios.isAxiosError(error)) {
          console.log('Detalhes do erro:', error.response?.data);
        } else {
          console.log('Erro desconhecido:', error);
        }
      } finally {
        setCarregando(false);
      }
    }
    carregarColaboradores();
  }, []);

  useFocusEffect(
    useCallback(() => {
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
      carregarColaboradores();
    }, []),
  );

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

  const botaoCadastrar = (
    <Button
      style={{ marginTop: 'auto', alignSelf: 'center', marginBottom: 16 }}
      title={`Cadastrar Nova Colaborador`}
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
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('DetalhesColaborador', { colaborador: item })
            }
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
              <Text style={{}}>Função: {item.funcao}</Text>
              <Text style={{ marginHorizontal: 6 }}>|</Text>
              <Text>Empresa: {item.empresa}</Text>
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
});
