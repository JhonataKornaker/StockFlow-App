import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Screen } from '@/components/ScreenProps';
import { PatrimonioDto } from '@/dtos/patrimonioDto';
import { listarPatrimonio } from '@/service/patrimonio.service';
import { theme } from '@/styles/theme';
import { MainStackParamList } from '@/types/MainStackNavigator';
import { agruparPorLetra } from '@/util/agrupadores';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Calendar, Contact, Package, Search } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import {
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

type NavigationProps = StackNavigationProp<MainStackParamList, 'Patrimonios'>;

export default function Patrimonios() {
  const [busca, setBusca] = useState('');
  const navigation = useNavigation<NavigationProps>();
  const [listarPatrimonios, setListarPatrimonios] = useState<PatrimonioDto[]>(
    [],
  );
  const [carregando, setCarregando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      async function carregarPatrimonios() {
        try {
          const dados = await listarPatrimonio();
          setListarPatrimonios(dados);
        } catch (error) {
          console.error(error);
        } finally {
          setCarregando(false);
        }
      }
      carregarPatrimonios();
    }, []),
  );

  const itensFiltrados = useMemo(() => {
    const texto = busca.toLowerCase();
    return listarPatrimonios.filter(item =>
      item.descricao.toLowerCase().includes(texto),
    );
  }, [busca, listarPatrimonios]);

  const sections = useMemo(
    () => agruparPorLetra(itensFiltrados),
    [itensFiltrados],
  );

  const handleCadastrar = () => {
    navigation.navigate('CadastroPatrimonio');
  };

  const botaoCadastrar = (
    <Button
      style={{ marginTop: 'auto', alignSelf: 'center', marginBottom: 16 }}
      title={`Cadastrar Novo Patrimonio`}
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

  if (listarPatrimonios.length === 0) {
    return (
      <Screen>
        <View style={styles.emptyContainer}>
          <Package size={64} color="#9ca3af" />
          <Text style={styles.emptyTitle}>Nenhum patrimônio cadastrado</Text>
          <Text style={styles.emptySubtitle}>
            Cadastre seus equipamentos e patrimônios para controlar empréstimos
            e locações.
          </Text>
          <Button
            title="Cadastrar Patrimônio"
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
          // Ex: navegação para detalhes se necessário
          // onPress={() => navigation.navigate('DetalhesPatrimonio', { patrimonio: item })}
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
              {item.locado && item.dataLocacao && (
                <View
                  style={{
                    flexDirection: 'row',
                    paddingLeft: 8,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Calendar size={16} color="red" />
                    <Text
                      style={{
                        marginLeft: 4,
                        fontSize: 14,
                        color: 'red',
                      }}
                    >
                      {new Date(item.dataLocacao).toLocaleDateString('pt-BR')}
                    </Text>
                  </View>
                </View>
              )}
            </Text>

            <View
              style={{
                marginBottom: 6,
                flexDirection: 'row',
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <Text>Numero Serie: {item.numeroSerie}</Text>
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
