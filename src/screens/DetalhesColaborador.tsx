import { Screen } from '@/components/ScreenProps';
import { MainStackParamList } from '@/types/MainStackNavigator';
import { RouteProp, useRoute } from '@react-navigation/native';
import { User, UserCircle, UserCircle2 } from 'lucide-react-native';
import { Text, View } from 'react-native';

type DetalhesColaboradorProps = RouteProp<
  MainStackParamList,
  'DetalhesColaborador'
>;

export default function DetalhesColaborador() {
  const route = useRoute<DetalhesColaboradorProps>();
  const { colaborador } = route.params;

  return (
    <Screen>
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
              fontWeight: 500,
              color: '#19325E',
            }}
          >
            {colaborador.funcao}
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: '#19325E',
            }}
          >
            {colaborador.empresa}
          </Text>
        </View>
      </View>

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
        <View>
          <Text>
            Arrumar alogica para reenderizar lista de cautelas abertas.
          </Text>
        </View>
      </View>

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
          Historico De Cautelas
        </Text>
        <View>
          <Text>Arrumar alogica para reenderizar historico de cautelas.</Text>
        </View>
      </View>
    </Screen>
  );
}
