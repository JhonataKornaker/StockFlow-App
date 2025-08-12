import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import ScreenListar from '@/components/ScreenListar';
import { Screen } from '@/components/ScreenProps';
import { PatrimonioDto } from '@/dtos/patrimonioDto';
import { listarPatrimonio } from '@/service/patrimonioService';
import { theme } from '@/styles/theme';
import { Patrimonio } from '@/types/ListaDeItens';
import { MainStackParamList } from '@/types/MainStackNavigator';
import { agruparPorLetra } from '@/util/agrupadores';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';
import { Calendar, Contact, Search } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { SectionList, Text, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

type NavigationProps = StackNavigationProp<MainStackParamList, 'Patrimonios'>;

/*const listaPatrimonios: Patrimonio[] = [
  {
    descricao: 'Rompedor 10Kg',
    numeroSerie: 'SN123456',
    marca: 'Makita',
    modelo: 'HR2470',
    locado: false,
    dataLocacao: undefined,
  },
  {
    descricao: 'Furadeira 13mm',
    numeroSerie: 'SN654321',
    marca: 'Bosch',
    modelo: 'GSB 13 RE',
    locado: true,
    dataLocacao: '2023-10-01',
  },
  {
    descricao: 'Serra Circular 7-1/4"',
    numeroSerie: 'SN789012',
    marca: 'DeWalt',
    modelo: 'DWE575SB',
    locado: false,
    dataLocacao: undefined,
  },
  {
    descricao: 'Parafusadeira 18V',
    numeroSerie: 'SN345678',
    marca: 'Black & Decker',
    modelo: 'BDCDE120C',
    locado: true,
    dataLocacao: '2023-10-05',
  },
  {
    descricao: 'Esmerilhadeira Angular 4-1/2"',
    numeroSerie: 'SN901234',
    marca: 'Makita',
    modelo: 'GA4530R',
    locado: false,
    dataLocacao: undefined,
  },
];*/

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
        <Input
          style={{ marginTop: 36 }}
          placeholder="Digite para pesquisar..."
          icon={Search}
          value={busca}
          onChangeText={setBusca}
        />
        <Text style={{ textAlign: 'center', marginTop: 20 }}>
          Nenhum item encontrado.
        </Text>
        {botaoCadastrar}
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
