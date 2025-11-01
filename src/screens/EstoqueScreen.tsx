import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Screen } from '@/components/ScreenProps';
import { EstoqueDto } from '@/dtos/estoqueDto';
import { listarEstoques } from '@/service/controleEstoque.service';
import { theme } from '@/styles/theme';
import { MainStackParamList } from '@/types/MainStackNavigator';
import { agruparPorLetra } from '@/util/agrupadores';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AlertTriangle, Package, Search } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { SectionList, Text, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

type NavigationProps = StackNavigationProp<MainStackParamList, 'Estoques'>;

export default function Estoques() {
  const [busca, setBusca] = useState('');
  const navigation = useNavigation<NavigationProps>();
  const [estoques, setEstoques] = useState<EstoqueDto[]>([]);
  const [carregando, setCarregando] = useState(true);

  useFocusEffect(
    useCallback(() => {
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
      carregarEstoques();
    }, []),
  );

  const itensFiltrados = useMemo(() => {
    const texto = busca.toLowerCase();
    return estoques.filter(item =>
      item.insumo.descricao.toLowerCase().includes(texto),
    );
  }, [busca, estoques]);

  // Adaptar para agrupar por letra usando a descrição do insumo
  const sections = useMemo(() => {
    const itensParaAgrupar = itensFiltrados.map(e => ({
      ...e.insumo,
      estoqueId: e.id,
      quantidadeAtual: e.quantidadeAtual,
      quantidadeMinima: e.quantidadeMinima,
      localizacao: e.localizacao,
      estoqueBaixo: e.estoqueBaixo,
    }));
    return agruparPorLetra(itensParaAgrupar);
  }, [itensFiltrados]);

  const handleCadastrar = () => {
    navigation.navigate('CadastroInsumo');
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
        keyExtractor={(item, index) => `${item.estoqueId}-${index}`}
        renderItem={({ item }) => (
          <TouchableOpacity
          // onPress={() => navigation.navigate('DetalhesEstoque', { estoqueId: item.estoqueId })}
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

              {/* Alerta de Estoque Baixo */}
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
    </Screen>
  );
}
