import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { theme } from '@/styles/theme';
import { View, Text } from 'react-native';
import { ArrowUp, ArrowDown } from 'lucide-react-native';

import InicioScreen from '@/screens/InicioScreen';
import CautelaScreen from '@/screens/CriarCautelaScreen';
import CadastroFerramentas from '@/screens/CadastroFerramentasScreen';
import CadastroColaborador from '@/screens/CadastroColaboradorScreen';
import CadastroPatrimonio from '@/screens/CadastroPatrimonioScreen';
import Ferramentas from '@/screens/FerramentasScreen';
import Patrimonios from '@/screens/PatrimoniosScreen';
import Colaboradores from '@/screens/ColaboradoresScreen';
import DetalhesColaborador from '@/screens/DetalhesColaboradorScreen';
import Estoques from '@/screens/EstoqueScreen';
import CadastroInsumo from '@/screens/CadastroEstoqueScreen';
import SaidaInsumo from '@/screens/SaidaInsumoScreen';
import CautelasAbertasScreen from '@/screens/CautelasAbertaScreen';
import MovimentacoesScreen from '@/screens/MovimentacaoInsumosScreen';
import EditarColaborador from '@/screens/EditarColaboradorScreen';
import EditarFerramenta from '@/screens/EditarFerramentaScreen';
import EditarPatrimonio from '@/screens/EditarPatrimonioScreen';
import EditarInsumo from '@/screens/EditarInsumoScreen';

const Stack = createStackNavigator();

// Componente de título customizado para Movimentações
function MovimentacoesTitle({ route }: any) {
  const { totalEntradas = 0, totalSaidas = 0 } = route.params || {};

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Text
        style={{
          color: theme.colors.secondary,
          fontWeight: 'bold',
          fontSize: 22,
        }}
      >
        Movimentação Insumos
      </Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#22c55e',
            borderRadius: 12,
            paddingHorizontal: 8,
            paddingVertical: 4,
            gap: 4,
          }}
        >
          <ArrowUp size={14} color="#fff" />
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>
            {totalEntradas}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#ef4444',
            borderRadius: 12,
            paddingHorizontal: 8,
            paddingVertical: 4,
            gap: 4,
          }}
        >
          <ArrowDown size={14} color="#fff" />
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>
            {totalSaidas}
          </Text>
        </View>
      </View>
    </View>
  );
}

// Componente de título customizado para Cautelas Abertas
function CautelasAbertasTitle({ route }: any) {
  const { quantidadeCautelas = 0 } = route.params || {};

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Text
        style={{
          color: theme.colors.secondary,
          fontWeight: 'bold',
          fontSize: 22,
        }}
      >
        Cautelas Abertas
      </Text>
      {quantidadeCautelas > 0 && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#ef4444',
            borderRadius: 12,
            paddingHorizontal: 8,
            paddingVertical: 4,
            gap: 4,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>
            {quantidadeCautelas}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function StackRoutes() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#19325E',
        },
        headerTintColor: theme.colors.secondary,
        headerTitleStyle: {
          color: theme.colors.secondary,
          fontWeight: 'bold',
          fontSize: 22,
        },
      }}
    >
      <Stack.Screen
        name="Inicio"
        component={InicioScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Cautela"
        component={CautelaScreen}
        options={{ title: 'Cautela' }}
      />
      <Stack.Screen
        name="CadastroFerramentas"
        component={CadastroFerramentas}
        options={{ title: 'Cadastro de Ferramenta' }}
      />
      <Stack.Screen
        name="CadastroColaborador"
        component={CadastroColaborador}
        options={{ title: 'Cadastro de Colaborador' }}
      />
      <Stack.Screen
        name="CadastroPatrimonio"
        component={CadastroPatrimonio}
        options={{ title: 'Cadastro de Patrimônio' }}
      />
      <Stack.Screen
        name="Ferramentas"
        component={Ferramentas}
        options={{ title: 'Ferramentas' }}
      />
      <Stack.Screen
        name="Patrimonios"
        component={Patrimonios}
        options={{ title: 'Patrimônios' }}
      />
      <Stack.Screen
        name="Colaboradores"
        component={Colaboradores}
        options={{ title: 'Colaboradores' }}
      />
      <Stack.Screen
        name="DetalhesColaborador"
        component={DetalhesColaborador}
        options={{ title: 'Historico' }}
      />
      <Stack.Screen
        name="Estoques"
        component={Estoques}
        options={{ title: 'Estoque' }}
      />
      <Stack.Screen
        name="CadastroInsumo"
        component={CadastroInsumo}
        options={{ title: 'Cadastro de Isumos' }}
      />
      <Stack.Screen
        name="SaidaInsumo"
        component={SaidaInsumo}
        options={{ title: 'Saida de Isumos' }}
      />
      <Stack.Screen
        name="CautelasAbertas"
        component={CautelasAbertasScreen}
        options={({ route }) => ({
          headerTitle: props => (
            <CautelasAbertasTitle route={route} {...props} />
          ),
        })}
      />
      <Stack.Screen
        name="MovimentacaoInsumo"
        component={MovimentacoesScreen}
        options={({ route }) => ({
          headerTitle: props => <MovimentacoesTitle route={route} {...props} />,
        })}
      />
      <Stack.Screen
        name="EditarColaborador"
        component={EditarColaborador}
        options={{ title: 'Editar Colaborador' }}
      />
      <Stack.Screen
        name="EditarFerramenta"
        component={EditarFerramenta}
        options={{ title: 'Editar Ferramenta' }}
      />
      <Stack.Screen
        name="EditarPatrimonio"
        component={EditarPatrimonio}
        options={{ title: 'Editar Patrimonio' }}
      />
      <Stack.Screen
        name="EditarInsumo"
        component={EditarInsumo}
        options={{ title: 'Editar Insumo' }}
      />
    </Stack.Navigator>
  );
}
