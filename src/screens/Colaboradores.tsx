import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Screen } from '@/components/ScreenProps';
import { theme } from '@/styles/theme';
import { Colaborador } from '@/types/Colaborador';
import { MainStackParamList } from '@/types/MainStackNavigator';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Contact, PersonStanding, Search } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { SectionList, Text, TouchableOpacity, View } from 'react-native';

function agruparPorLetra(colaboradores: Colaborador[]) {
  const agrupado: Record<string, Colaborador[]> = {};

  for (const colaborador of colaboradores) {
    const letra = colaborador.nome[0]?.toUpperCase() ?? '';
    if (!agrupado[letra]) {
      agrupado[letra] = [];
    }
    agrupado[letra].push(colaborador);
  }

  return Object.keys(agrupado)
    .sort()
    .map(letra => ({
      title: letra,
      data: agrupado[letra].sort((a, b) => a.nome.localeCompare(b.nome)),
    }));
}

type NavigationProps = StackNavigationProp<MainStackParamList, 'Colaboradores'>;

export default function Colaboradores() {
  const [busca, setBusca] = useState('');
  const navigation = useNavigation<NavigationProps>();

  const colaboradores: Colaborador[] = [
    {
      nome: 'Thiago Silva',
      funcao: 'Encarregado',
      empresa: 'V.V Verona',
    },
    {
      nome: 'Ana Paula',
      funcao: 'Gerente',
      empresa: 'V.V Verona',
    },
    {
      nome: 'Carlos Souza',
      funcao: 'Operador',
      empresa: 'V.V Verona',
    },
    {
      nome: 'Amanda Costa',
      funcao: 'Assistente',
      empresa: 'V.V Verona',
    },
  ];

  const itensFiltrados = useMemo(() => {
    const texto = busca.toLowerCase();
    return colaboradores.filter(item =>
      item.nome.toLowerCase().includes(texto),
    );
  }, [busca, colaboradores]);

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

  if (colaboradores.length === 0) {
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
