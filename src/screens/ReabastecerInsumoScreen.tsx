import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Screen } from '@/components/ScreenProps';
import { registrarEntradaInsumo } from '@/service/controleEstoque.service';
import { MainStackParamList } from '@/types/MainStackNavigator';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CircleAlert, Package } from 'lucide-react-native';
import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { showErrorToast, showSuccessToast } from '@/util/toast';

type NavigationProps = StackNavigationProp<MainStackParamList, 'ReabastecerInsumo'>;
type RouteProps = RouteProp<MainStackParamList, 'ReabastecerInsumo'>;

export default function ReabastecerInsumo() {
  const navigation = useNavigation<NavigationProps>();
  const { params } = useRoute<RouteProps>();
  const { estoque } = params;

  const [quantidade, setQuantidade] = useState('');
  const [fornecedor, setFornecedor] = useState('');
  const [valorUnitario, setValorUnitario] = useState('');
  const [observacao, setObservacao] = useState('');
  const [erroQtd, setErroQtd] = useState('');
  const [salvando, setSalvando] = useState(false);

  const handleSalvar = async () => {
    if (!quantidade || Number(quantidade) <= 0) {
      setErroQtd('Informe uma quantidade maior que zero');
      return;
    }

    setSalvando(true);
    try {
      await registrarEntradaInsumo({
        estoqueId: estoque.id,
        quantidade: Number(quantidade),
        fornecedor: fornecedor.trim() || undefined,
        valorUnitario: valorUnitario ? Number(valorUnitario) : undefined,
        observacao: observacao.trim() || undefined,
      });
      showSuccessToast('Entrada registrada com sucesso!');
      navigation.goBack();
    } catch (error: any) {
      showErrorToast(
        error?.response?.data?.message || 'Erro ao registrar entrada',
        'Erro',
      );
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Card do insumo */}
          <View style={styles.insumoCard}>
            <View style={styles.insumoIcone}>
              <Package size={24} color="#162B4D" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.insumoNome}>{estoque.insumo.descricao}</Text>
              {(estoque.insumo.marca || estoque.insumo.categoria) && (
                <Text style={styles.insumoSub}>
                  {[estoque.insumo.marca, estoque.insumo.categoria]
                    .filter(Boolean)
                    .join(' · ')}
                </Text>
              )}
              <Text style={styles.insumoSaldo}>
                Saldo atual: {estoque.quantidadeAtual} {estoque.insumo.unidade}
              </Text>
            </View>
          </View>

          {/* Campos desabilitados — info do insumo */}
          <View style={{ marginTop: 20, gap: 14 }}>
            <Input
              placeholder="Descrição"
              value={estoque.insumo.descricao}
              editable={false}
              style={styles.inputDisabled}
            />

            <Input
              placeholder="Unidade"
              value={estoque.insumo.unidade}
              editable={false}
              style={styles.inputDisabled}
            />

            {estoque.insumo.marca ? (
              <Input
                placeholder="Marca"
                value={estoque.insumo.marca}
                editable={false}
                style={styles.inputDisabled}
              />
            ) : null}

            {estoque.insumo.categoria ? (
              <Input
                placeholder="Categoria"
                value={estoque.insumo.categoria}
                editable={false}
                style={styles.inputDisabled}
              />
            ) : null}

            <Input
              placeholder="Quantidade *"
              icon={CircleAlert}
              iconColors="#FF001F80"
              keyboardType="numeric"
              value={quantidade}
              onChangeText={t => { setQuantidade(t); setErroQtd(''); }}
              errorMessage={erroQtd}
            />

            <Input
              placeholder="Fornecedor (opcional)"
              autoCapitalize="words"
              value={fornecedor}
              onChangeText={setFornecedor}
            />

            <Input
              placeholder="Valor unitário (opcional)"
              keyboardType="decimal-pad"
              value={valorUnitario}
              onChangeText={setValorUnitario}
            />

            <Input
              placeholder="Observação (opcional)"
              autoCapitalize="sentences"
              value={observacao}
              onChangeText={setObservacao}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={{ marginTop: 24, alignItems: 'center' }}>
            {salvando ? (
              <ActivityIndicator color="#162B4D" />
            ) : (
              <Button title="Registrar entrada" onPress={handleSalvar} />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  insumoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  insumoIcone: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#C7D2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  insumoNome: {
    fontSize: 15,
    fontWeight: '700',
    color: '#162B4D',
  },
  insumoSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  insumoSaldo: {
    fontSize: 12,
    color: '#162B4D',
    marginTop: 4,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#19325E',
  },
  inputDisabled: {
    opacity: 0.6,
  },
});
