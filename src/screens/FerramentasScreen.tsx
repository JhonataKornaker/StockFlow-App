import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import ScreenListar from '@/components/ScreenListar';
import { Screen } from '@/components/ScreenProps';
import { FerramentasDto } from '@/dtos/ferramentasDto';
import { listarFerramentas } from '@/service/ferramenta.service';
import { theme } from '@/styles/theme';
import { MainStackParamList } from '@/types/MainStackNavigator';
import { agruparPorLetra } from '@/util/agrupadores';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';
import { Contact, Package, Search } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

type NavigationProps = StackNavigationProp<MainStackParamList, 'Ferramentas'>;

export default function Ferramentas() {
  const [busca, setBusca] = useState('');
  const navigation = useNavigation<NavigationProps>();
  const [listaFerramentas, setListaFerramentas] = useState<FerramentasDto[]>(
    [],
  );
  const [carregando, setCarregando] = useState(true);

  useFocusEffect(
    useCallback(() => {
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
          /* onPress={() =>
              navigation.navigate('DetalhesFe', { colaborador: item })
            }*/
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
