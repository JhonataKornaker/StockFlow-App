import { Screen } from '@/components/ScreenProps';
import { SkeletonGeneric } from '@/components/Skeleton/SkeletonGeneric';
import { InventarioResumoDto, StatusInventario } from '@/dtos/inventarioDto';
import { cancelarInventario, listarInventarios } from '@/service/inventario.service';
import { theme } from '@/styles/theme';
import { MainStackParamList } from '@/types/MainStackNavigator';
import { showErrorToast, showSuccessToast } from '@/util/toast';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  XCircle,
} from 'lucide-react-native';
import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from '@/components/Button';

type NavigationProps = StackNavigationProp<MainStackParamList, 'Inventarios'>;

function statusConfig(status: StatusInventario) {
  switch (status) {
    case 'EM_ANDAMENTO':
      return { label: 'Em andamento', color: '#f59e0b', Icon: Clock };
    case 'FINALIZADO':
      return { label: 'Finalizado', color: '#22c55e', Icon: CheckCircle2 };
    case 'CANCELADO':
      return { label: 'Cancelado', color: '#9ca3af', Icon: XCircle };
  }
}

function InventarioCard({
  item,
  onPress,
  onCancelar,
}: {
  item: InventarioResumoDto;
  onPress: () => void;
  onCancelar: () => void;
}) {
  const { label, color, Icon } = statusConfig(item.status);
  const data = new Date(item.criadoEm).toLocaleDateString('pt-BR');

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.cardLeft}>
        <View style={[styles.statusDot, { backgroundColor: color }]} />
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardRow}>
          <Text style={styles.cardSolicitante} numberOfLines={1}>
            {item.solicitante}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: color + '20' }]}>
            <Icon size={11} color={color} />
            <Text style={[styles.statusText, { color }]}>{label}</Text>
          </View>
        </View>

        <Text style={styles.cardData}>{data}</Text>

        <View style={styles.cardMeta}>
          <ClipboardList size={12} color="#9ca3af" />
          <Text style={styles.cardMetaText}>
            {item.totalItens} {item.totalItens === 1 ? 'item contado' : 'itens contados'}
          </Text>
          {item.observacao ? (
            <Text style={styles.cardObs} numberOfLines={1}>· {item.observacao}</Text>
          ) : null}
        </View>

        {item.status === 'EM_ANDAMENTO' && (
          <TouchableOpacity onPress={onCancelar} style={styles.cancelarBtn}>
            <XCircle size={12} color="#ef4444" />
            <Text style={styles.cancelarText}>Cancelar</Text>
          </TouchableOpacity>
        )}
      </View>

      <ChevronRight size={18} color="#d1d5db" />
    </TouchableOpacity>
  );
}

export default function InventariosScreen() {
  const navigation = useNavigation<NavigationProps>();
  const [inventarios, setInventarios] = useState<InventarioResumoDto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [recarregando, setRecarregando] = useState(false);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, []),
  );

  async function carregar(isReload = false) {
    try {
      if (isReload) setRecarregando(true);
      else setCarregando(true);
      const dados = await listarInventarios();
      setInventarios(dados);
    } catch {
      showErrorToast('Não foi possível carregar os inventários', 'Erro');
    } finally {
      setCarregando(false);
      setRecarregando(false);
    }
  }

  function handleCancelar(item: InventarioResumoDto) {
    Alert.alert(
      'Cancelar Inventário',
      `Deseja cancelar o inventário de ${item.solicitante}? Esta ação não pode ser desfeita.`,
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Cancelar inventário',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelarInventario(item.id);
              showSuccessToast('Inventário cancelado');
              carregar();
            } catch {
              showErrorToast('Erro ao cancelar inventário', 'Erro');
            }
          },
        },
      ],
    );
  }

  function handlePress(item: InventarioResumoDto) {
    if (item.status === 'EM_ANDAMENTO') {
      navigation.navigate('ContarInventario', { inventarioId: item.id });
    } else {
      navigation.navigate('DetalhesInventario', { inventarioId: item.id });
    }
  }

  if (carregando) {
    return (
      <Screen>
        <SkeletonGeneric variant="list" />
      </Screen>
    );
  }

  return (
    <Screen>
      <FlatList
        data={inventarios}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <InventarioCard
            item={item}
            onPress={() => handlePress(item)}
            onCancelar={() => handleCancelar(item)}
          />
        )}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={recarregando}
            onRefresh={() => carregar(true)}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <ClipboardList size={64} color="#9ca3af" />
            <Text style={styles.emptyTitle}>Nenhum inventário realizado</Text>
            <Text style={styles.emptySubtitle}>
              Inicie um inventário para registrar a contagem física do seu estoque.
            </Text>
          </View>
        }
        ListFooterComponent={
          <View style={styles.footer}>
            <Button
              title="Novo Inventário"
              onPress={() => navigation.navigate('ContarInventario', {})}
            />
          </View>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  lista: { padding: 4, paddingBottom: 16, gap: 10 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardLeft: { alignItems: 'center' },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  cardBody: { flex: 1, gap: 4 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  cardSolicitante: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.primary,
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  cardData: { fontSize: 12, color: '#9ca3af' },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardMetaText: { fontSize: 12, color: '#9ca3af' },
  cardObs: { fontSize: 12, color: '#9ca3af', flex: 1 },
  cancelarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  cancelarText: { fontSize: 12, color: '#ef4444', fontWeight: '600' },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    textAlign: 'center',
    marginTop: 8,
  },
  emptySubtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 20 },
  footer: { alignItems: 'center', paddingTop: 12, paddingBottom: 8 },
});
