import { Screen } from '@/components/ScreenProps';
import { PatrimonioDto } from '@/dtos/patrimonioDto';
import { listarLocacoes } from '@/service/patrimonio.service';
import { theme } from '@/styles/theme';
import { MainStackParamList } from '@/types/MainStackNavigator';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Building2, Calendar, CalendarCheck, Package } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SkeletonGeneric } from '@/components/Skeleton/SkeletonGeneric';

type NavigationProps = StackNavigationProp<MainStackParamList, 'Locacoes'>;

function diasRestantes(dataDevolucao: string): number {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const devolucao = new Date(dataDevolucao);
  devolucao.setHours(0, 0, 0, 0);
  return Math.ceil((devolucao.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
}

function getStatusDevolucao(dataDevolucao?: string): {
  label: string;
  color: string;
} {
  if (!dataDevolucao) return { label: 'Sem prazo', color: '#9ca3af' };
  const dias = diasRestantes(dataDevolucao);
  if (dias < 0) return { label: `Vencido há ${Math.abs(dias)} dia(s)`, color: '#ef4444' };
  if (dias === 0) return { label: 'Vence hoje!', color: '#f97316' };
  if (dias <= 3) return { label: `Vence em ${dias} dia(s)`, color: '#f97316' };
  return { label: `${dias} dias restantes`, color: '#22c55e' };
}

function CardLocacao({ item, onPress }: { item: PatrimonioDto; onPress: () => void }) {
  const status = getStatusDevolucao(item.dataDevolucao);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <View style={styles.iconWrapper}>
          <Package size={20} color={theme.colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.descricao}>{item.descricao}</Text>
          <Text style={styles.subInfo}>
            {item.marca} · {item.modelo}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: status.color + '22' }]}>
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Building2 size={14} color="#6b7280" />
          <Text style={styles.infoText}>
            {item.nomeLocadora || 'Locadora não informada'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Calendar size={14} color="#6b7280" />
          <Text style={styles.infoText}>
            Locado em:{' '}
            {item.dataLocacao
              ? new Date(item.dataLocacao).toLocaleDateString('pt-BR')
              : '—'}
          </Text>
        </View>
        {item.dataDevolucao && (
          <View style={styles.infoRow}>
            <CalendarCheck size={14} color={status.color} />
            <Text style={[styles.infoText, { color: status.color }]}>
              Devolver em:{' '}
              {new Date(item.dataDevolucao).toLocaleDateString('pt-BR')}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function LocacoesScreen() {
  const navigation = useNavigation<NavigationProps>();
  const [locacoes, setLocacoes] = useState<PatrimonioDto[]>([]);
  const [carregando, setCarregando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      carregarLocacoes();
    }, []),
  );

  async function carregarLocacoes() {
    const startedAt = Date.now();
    try {
      setCarregando(true);
      const dados = await listarLocacoes();
      setLocacoes(dados);
    } catch (error) {
      console.error('Erro ao buscar locações:', error);
    } finally {
      const elapsed = Date.now() - startedAt;
      const wait = Math.max(0, 600 - elapsed);
      if (wait > 0) {
        await new Promise(res => setTimeout(res, wait));
      }
      setCarregando(false);
    }
  }

  if (carregando) {
    return (
      <Screen>
        <SkeletonGeneric variant="list" />
      </Screen>
    );
  }

  if (locacoes.length === 0) {
    return (
      <Screen>
        <View style={styles.emptyContainer}>
          <Package size={64} color="#9ca3af" />
          <Text style={styles.emptyTitle}>Nenhum equipamento alugado</Text>
          <Text style={styles.emptySubtitle}>
            Cadastre um patrimônio marcando-o como alugado para acompanhar os
            prazos de devolução.
          </Text>
        </View>
      </Screen>
    );
  }

  const vencidos = locacoes.filter(
    l => l.dataDevolucao && diasRestantes(l.dataDevolucao) < 0,
  );
  const aSobraAlerta = locacoes.filter(
    l => l.dataDevolucao && diasRestantes(l.dataDevolucao) >= 0 && diasRestantes(l.dataDevolucao) <= 3,
  );

  return (
    <Screen>
      {(vencidos.length > 0 || aSobraAlerta.length > 0) && (
        <View style={styles.alertBanner}>
          <Text style={styles.alertText}>
            {vencidos.length > 0
              ? `${vencidos.length} equipamento(s) com prazo vencido`
              : `${aSobraAlerta.length} equipamento(s) vencem em breve`}
          </Text>
        </View>
      )}

      <FlatList
        data={locacoes}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <CardLocacao
            item={item}
            onPress={() => navigation.navigate('EditarPatrimonio', { patrimonio: item })}
          />
        )}
        contentContainerStyle={{ paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  descricao: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  subInfo: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 10,
  },
  cardBody: {
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#6b7280',
  },
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
  alertBanner: {
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  alertText: {
    color: '#dc2626',
    fontWeight: '600',
    fontSize: 13,
  },
});
