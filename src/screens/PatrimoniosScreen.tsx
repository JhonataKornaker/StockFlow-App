import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Screen } from '@/components/ScreenProps';
import { SkeletonGeneric } from '@/components/Skeleton/SkeletonGeneric';
import { PatrimonioDto } from '@/dtos/patrimonioDto';
import { deletarPatrimonio, listarPatrimonio } from '@/service/patrimonio.service';
import { theme } from '@/styles/theme';
import { MainStackParamList } from '@/types/MainStackNavigator';
import { agruparPorLetra } from '@/util/agrupadores';
import { showErrorToast, showSuccessToast } from '@/util/toast';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CalendarClock, Contact, Edit2, Search, Shield, Trash2 } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type NavigationProps = StackNavigationProp<MainStackParamList, 'Patrimonios'>;

function PatrimonioCard({
  item,
  onEditar,
  onExcluir,
  onLocacao,
}: {
  item: PatrimonioDto;
  onEditar: () => void;
  onExcluir: () => void;
  onLocacao: () => void;
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onEditar} activeOpacity={0.85}>
      {/* Ícone + info */}
      <View style={styles.cardMain}>
        <View style={styles.iconWrap}>
          <Shield size={22} color={item.locado ? '#1d4ed8' : theme.colors.primary} />
        </View>
        <View style={styles.cardInfo}>
          <View style={styles.cardNomeRow}>
            <Text style={styles.cardNome} numberOfLines={1}>{item.descricao}</Text>
            {item.locado && (
              <TouchableOpacity
                style={styles.locadoBadge}
                onPress={onLocacao}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.locadoBadgeText}>LOCADO</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.cardSub} numberOfLines={1}>
            Nº {item.numeroSerie}
          </Text>
          <Text style={styles.cardSub} numberOfLines={1}>
            {item.marca} · {item.modelo}
          </Text>
        </View>
      </View>

      {/* Ações */}
      <View style={styles.cardActions}>
        {item.locado && (
          <>
            <TouchableOpacity style={styles.actionBtn} onPress={onLocacao} activeOpacity={0.7}>
              <CalendarClock size={16} color="#1d4ed8" />
              <Text style={[styles.actionLabel, { color: '#1d4ed8' }]}>Locação</Text>
            </TouchableOpacity>
            <View style={styles.actionDivider} />
          </>
        )}
        <TouchableOpacity style={styles.actionBtn} onPress={onEditar} activeOpacity={0.7}>
          <Edit2 size={16} color="#6b7280" />
          <Text style={styles.actionLabel}>Editar</Text>
        </TouchableOpacity>
        <View style={styles.actionDivider} />
        <TouchableOpacity style={styles.actionBtn} onPress={onExcluir} activeOpacity={0.7}>
          <Trash2 size={16} color="#ef4444" />
          <Text style={[styles.actionLabel, { color: '#ef4444' }]}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function Patrimonios() {
  const [busca, setBusca] = useState('');
  const navigation = useNavigation<NavigationProps>();
  const [listaPatrimonios, setListaPatrimonios] = useState<PatrimonioDto[]>([]);
  const [carregando, setCarregando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      carregarPatrimonios();
    }, []),
  );

  async function carregarPatrimonios() {
    const startedAt = Date.now();
    try {
      setCarregando(true);
      const dados = await listarPatrimonio();
      setListaPatrimonios(dados);
    } catch (error) {
      console.error('Erro ao buscar patrimônios:', error);
    } finally {
      const elapsed = Date.now() - startedAt;
      const wait = Math.max(0, 600 - elapsed);
      if (wait > 0) await new Promise(res => setTimeout(res, wait));
      setCarregando(false);
    }
  }

  function handleExcluir(item: PatrimonioDto) {
    Alert.alert(
      'Excluir Patrimônio',
      `Tem certeza que deseja excluir "${item.descricao}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletarPatrimonio(item.id);
              showSuccessToast('Patrimônio excluído com sucesso!');
              carregarPatrimonios();
            } catch (error: any) {
              const message =
                error.response?.data?.message ?? 'Não foi possível excluir o patrimônio';
              showErrorToast(message, 'Erro ao excluir');
            }
          },
        },
      ],
    );
  }

  const itensFiltrados = useMemo(() => {
    const texto = busca.toLowerCase();
    return listaPatrimonios.filter(
      item =>
        item.descricao.toLowerCase().includes(texto) ||
        item.numeroSerie.toLowerCase().includes(texto) ||
        item.marca.toLowerCase().includes(texto) ||
        item.modelo.toLowerCase().includes(texto),
    );
  }, [busca, listaPatrimonios]);

  const sections = useMemo(() => agruparPorLetra(itensFiltrados), [itensFiltrados]);

  if (carregando) {
    return (
      <Screen>
        <SkeletonGeneric variant="list" />
      </Screen>
    );
  }

  if (listaPatrimonios.length === 0) {
    return (
      <Screen>
        <View style={styles.emptyContainer}>
          <Contact size={64} color="#9ca3af" />
          <Text style={styles.emptyTitle}>Nenhum patrimônio cadastrado</Text>
          <Text style={styles.emptySubtitle}>
            Cadastre seus equipamentos e patrimônios para controlar empréstimos e locações.
          </Text>
          <Button
            title="Cadastrar Patrimônio"
            onPress={() => navigation.navigate('CadastroPatrimonio')}
            style={{ marginTop: 20 }}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Input
        style={{ marginTop: 8, marginBottom: 4 }}
        placeholder="Buscar por nome, nº série, marca..."
        icon={Search}
        value={busca}
        onChangeText={setBusca}
      />

      <SectionList
        sections={sections}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <PatrimonioCard
            item={item}
            onEditar={() => navigation.navigate('EditarPatrimonio', { patrimonio: item })}
            onExcluir={() => handleExcluir(item)}
            onLocacao={() => navigation.navigate('DetalhesLocacao', { patrimonio: item })}
          />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLetter}>{title}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
      />

      <Button
        style={{ alignSelf: 'center', marginBottom: 16 }}
        title="Cadastrar Novo Patrimônio"
        onPress={() => navigation.navigate('CadastroPatrimonio')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  sectionHeader: {
    paddingTop: 16,
    paddingBottom: 6,
    paddingHorizontal: 4,
  },
  sectionLetter: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardInfo: {
    flex: 1,
    gap: 3,
  },
  cardNomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  cardNome: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.primary,
    flexShrink: 1,
  },
  locadoBadge: {
    backgroundColor: '#dbeafe',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  locadoBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1d4ed8',
    letterSpacing: 0.5,
  },
  cardSub: {
    fontSize: 12,
    color: '#6b7280',
  },
  cardActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  actionDivider: {
    width: 1,
    backgroundColor: '#f3f4f6',
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
});
