import React, { useMemo, useState } from 'react';
import { SectionList, Text, View } from 'react-native';
import { Ferramenta, Patrimonio } from '@/types/ListaDeItens';
import { Input } from './Input';
import { Screen } from './ScreenProps';
import { Archive, Calendar, PenTool, Search } from 'lucide-react-native';
import { Button } from './Button';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/navigation/types';
import { theme } from '@/styles/theme';
import { red100 } from 'react-native-paper/lib/typescript/styles/themes/v2/colors';

type Props =
  | { patrimonios: Patrimonio[]; ferramentas?: undefined }
  | { ferramentas: Ferramenta[]; patrimonios?: undefined };

type ItemComDescricao = {
  key: string;
  descricao: string;
  marca: string;
  modelo: string;
  locado?: boolean;
  dataLocacao?: string;
  quantidade?: number;
};

function agruparPorLetra(itens: ItemComDescricao[]) {
  const agrupado: Record<string, ItemComDescricao[]> = {};

  for (const item of itens) {
    const letra = item.descricao[0]?.toUpperCase() ?? '';
    if (!agrupado[letra]) {
      agrupado[letra] = [];
    }
    agrupado[letra].push(item);
  }

  return Object.keys(agrupado)
    .sort()
    .map(letra => ({
      title: letra,
      data: agrupado[letra].sort((a, b) =>
        a.descricao.localeCompare(b.descricao),
      ),
    }));
}

type NavigationProps = StackNavigationProp<RootStackParamList>;

export default function ScreenListar(props: Props) {
  const [busca, setBusca] = useState('');
  const navigation = useNavigation<NavigationProps>();

  let itensNormalizados: ItemComDescricao[] = [];
  let tipo: 'Ferramenta' | 'Patrimônio' = 'Ferramenta';

  if (props.patrimonios) {
    tipo = 'Patrimônio';
    itensNormalizados = props.patrimonios.map(p => ({
      key: p.numeroSerie,
      descricao: p.descricao,
      marca: p.marca,
      modelo: p.modelo,
      locado: p.locado,
      dataLocacao: p.dataLocacao,
    }));
  } else if (props.ferramentas) {
    tipo = 'Ferramenta';
    itensNormalizados = props.ferramentas.map((f, index) => ({
      key: `${f.descricao}-${index}`,
      descricao: f.descricao,
      marca: f.marca,
      modelo: f.modelo,
      quantidade: f.quantidade,
    }));
  }

  const itensFiltrados = useMemo(() => {
    const texto = busca.toLowerCase();
    return itensNormalizados.filter(item =>
      item.descricao.toLowerCase().includes(texto),
    );
  }, [busca, itensNormalizados]);

  const sections = useMemo(
    () => agruparPorLetra(itensFiltrados),
    [itensFiltrados],
  );

  const rota =
    tipo === 'Ferramenta' ? 'CadastroFerramentas' : 'CadastroPatrimonios';

  const handleCadastrar = () => {
    navigation.navigate(rota);
  };

  const botaoCadastrar = (
    <Button
      style={{ marginTop: 'auto', alignSelf: 'center', marginBottom: 16 }}
      title={`Cadastrar Nova ${tipo}`}
      onPress={handleCadastrar}
    />
  );

  if (itensFiltrados.length === 0) {
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
    <Screen style={{ flex: 1, padding: 16 }}>
      <Input
        style={{ marginTop: 8 }}
        placeholder="Digite para pesquisar..."
        icon={Search}
        value={busca}
        onChangeText={setBusca}
      />
      <SectionList
        sections={sections}
        keyExtractor={item => item.key}
        renderItem={({ item }) => (
          <View>
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

              {item.locado && (
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
                      {item.dataLocacao}
                    </Text>
                  </View>
                </View>
              )}
            </Text>
            {tipo === 'Ferramenta' ? (
              <View
                style={{
                  marginTop: 6,
                  marginBottom: 14,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <Text>Estoque: {item.quantidade} und</Text>
                <Text style={{ marginHorizontal: 6 }}>|</Text>
                <Text>Marca: {item.marca}</Text>
                <Text style={{ marginHorizontal: 6 }}>|</Text>
                <Text>Modelo: {item.modelo}</Text>
              </View>
            ) : (
              <View
                style={{
                  marginTop: 6,
                  marginBottom: 14,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <Text>{item.key}</Text>
                <Text style={{ marginHorizontal: 6 }}>|</Text>
                <Text>{item.marca}</Text>
                <Text style={{ marginHorizontal: 6 }}>|</Text>
                <Text>{item.modelo}</Text>
              </View>
            )}
          </View>
        )}
        renderSectionHeader={({ section }) => (
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
              {section.title}
            </Text>
            {tipo === 'Ferramenta' ? (
              <PenTool size={18} style={{ marginLeft: 8 }} color="#19325E" />
            ) : (
              <Archive size={18} style={{ marginLeft: 8 }} color="#19325E" />
            )}
          </View>
        )}
      />
      {botaoCadastrar}
    </Screen>
  );
}
