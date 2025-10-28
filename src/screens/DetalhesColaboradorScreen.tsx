import { Screen } from '@/components/ScreenProps';
import { HistoricoCautelaColaborador } from '@/dtos/historicoDto';
import { buscarHistoricoCautelaColaborador } from '@/service/historico.service';
import { MainStackParamList } from '@/types/MainStackNavigator';
import { RouteProp, useRoute } from '@react-navigation/native';
import { User, UserCircle, UserCircle2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

type DetalhesColaboradorProps = RouteProp<
  MainStackParamList,
  'DetalhesColaborador'
>;

export default function DetalhesColaborador() {
  const route = useRoute<DetalhesColaboradorProps>();
  const { colaborador } = route.params;
  const [historico, setHistorico] = useState<HistoricoCautelaColaborador[]>([]);

  useEffect(() => {
    const carregarHistorico = async () => {
      try {
        const dados = await buscarHistoricoCautelaColaborador(colaborador.id);
        setHistorico(dados);
      } catch (error) {
        console.error('Erro ao buscar histórico:', error);
      }
    };

    carregarHistorico();
  }, []);

  return (
    <Screen>
      {/* Header do Colaborador */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 16,
          marginTop: 22,
          marginLeft: 7,
        }}
      >
        <UserCircle2 size={60} strokeWidth={1} color="#19325E" />
        <View>
          <Text
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: '#19325E',
            }}
          >
            {colaborador.nome}
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '500',
              color: '#19325E',
            }}
          >
            {colaborador.funcao}
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '500',
              color: '#19325E',
            }}
          >
            {colaborador.empresa}
          </Text>
        </View>
      </View>

      {/* Conteúdo de Cautelas */}
      {historico.length === 0 ? (
        <View style={{ marginLeft: 7, marginTop: 40, paddingRight: 7 }}>
          <Text
            style={{
              fontSize: 16,
              color: '#666',
              textAlign: 'center',
            }}
          >
            Nenhuma ferramenta ou patrimônio foi retirado ainda.
          </Text>
        </View>
      ) : (
        <>
          {/* Cautelas Abertas */}
          {historico.filter(item => item.cautelaFechada === false).length >
            0 && (
            <View
              style={{
                marginLeft: 7,
                marginTop: 40,
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: '#19325E',
                }}
              >
                Cautelas Abertas
              </Text>
              <View style={{ marginTop: 8 }}>
                {historico
                  .filter(item => item.cautelaFechada === false)
                  .map((item, index) => (
                    <Text key={index} style={{ marginVertical: 4 }}>
                      {item.descricao} - {item.quantidade ?? item.numeroSerie} -{' '}
                      {item.data}
                    </Text>
                  ))}
              </View>
            </View>
          )}

          {/* Histórico de Cautelas */}
          {historico.filter(item => item.cautelaFechada === true).length >
            0 && (
            <View
              style={{
                marginLeft: 7,
                marginTop: 40,
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: '#19325E',
                }}
              >
                Histórico de Cautelas
              </Text>
              <View style={{ marginTop: 8 }}>
                {historico
                  .filter(item => item.cautelaFechada === true)
                  .map((item, index) => (
                    <Text key={index} style={{ marginVertical: 4 }}>
                      {item.descricao} - {item.quantidade ?? item.numeroSerie} -{' '}
                      {item.data}
                    </Text>
                  ))}
              </View>
            </View>
          )}
        </>
      )}
    </Screen>
  );
}
