import { Screen } from '@/components/ScreenProps';
import { theme } from '@/styles/theme';
import { MainStackParamList } from '@/types/MainStackNavigator';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BarChart2, CalendarClock, ChevronRight, ClipboardList, FileText } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type NavigationProps = StackNavigationProp<MainStackParamList, 'Relatorios'>;

const relatorios = [
  {
    key: 'RelatorioInsumos' as const,
    titulo: 'Relatório de Insumos',
    descricao: 'Histórico de entradas e saídas de insumos do estoque',
    icon: BarChart2,
    cor: '#2563EB',
    bg: '#EFF6FF',
  },
  {
    key: 'RelatorioLocacoes' as const,
    titulo: 'Relatório de Locações',
    descricao: 'Histórico de locações de equipamentos e patrimônios',
    icon: CalendarClock,
    cor: '#0891B2',
    bg: '#ECFEFF',
  },
  {
    key: 'HistoricoCautelas' as const,
    titulo: 'Histórico de Cautelas',
    descricao: 'Todas as cautelas por data com status e colaboradores',
    icon: ClipboardList,
    cor: '#7C3AED',
    bg: '#F5F3FF',
  },
];

export default function RelatoriosScreen() {
  const navigation = useNavigation<NavigationProps>();

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <FileText color={theme.colors.primary} size={22} />
          <Text style={styles.headerText}>Selecione um relatório para visualizar</Text>
        </View>

        {relatorios.map(item => {
          const Icon = item.icon;
          return (
            <TouchableOpacity
              key={item.key}
              style={styles.card}
              onPress={() => navigation.navigate(item.key)}
              activeOpacity={0.85}
            >
              <View style={[styles.iconWrap, { backgroundColor: item.bg }]}>
                <Icon color={item.cor} size={26} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{item.titulo}</Text>
                <Text style={styles.cardDesc}>{item.descricao}</Text>
              </View>
              <ChevronRight color="#94a3b8" size={20} />
            </TouchableOpacity>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  headerText: {
    color: '#64748b',
    fontSize: 14,
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  cardDesc: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
});
