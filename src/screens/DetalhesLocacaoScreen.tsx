import { Screen } from '@/components/ScreenProps';
import { PatrimonioDto } from '@/dtos/patrimonioDto';
import { theme } from '@/styles/theme';
import { MainStackParamList } from '@/types/MainStackNavigator';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  Building2,
  Calendar,
  CalendarCheck,
  Clock,
  ExternalLink,
  FileText,
  Hash,
  Package,
  Tag,
} from 'lucide-react-native';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type NavigationProps = StackNavigationProp<MainStackParamList, 'DetalhesLocacao'>;
type RouteProps = RouteProp<MainStackParamList, 'DetalhesLocacao'>;

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}

function getStatusDevolucao(dataDevolucao?: string) {
  if (!dataDevolucao) return null;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const devolucao = new Date(dataDevolucao);
  const dias = Math.ceil((devolucao.getTime() - hoje.getTime()) / 86400000);
  if (dias < 0) return { label: `Vencido há ${Math.abs(dias)} dia(s)`, color: '#ef4444', bg: '#fee2e2' };
  if (dias === 0) return { label: 'Vence hoje!', color: '#f97316', bg: '#ffedd5' };
  if (dias <= 3) return { label: `Vence em ${dias} dia(s)`, color: '#f97316', bg: '#ffedd5' };
  return { label: `${dias} dias restantes`, color: '#16a34a', bg: '#dcfce7' };
}

function InfoRow({ icon: Icon, label, value, valueColor }: {
  icon: any;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Icon size={18} color={theme.colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={[styles.infoValue, valueColor ? { color: valueColor } : {}]}>{value}</Text>
      </View>
    </View>
  );
}

export default function DetalhesLocacaoScreen() {
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute<RouteProps>();
  const { patrimonio } = route.params;

  const status = getStatusDevolucao(patrimonio.dataDevolucao);

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Header do equipamento */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Package size={32} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>{patrimonio.descricao}</Text>
          <View style={[styles.locadoBadge]}>
            <Text style={styles.locadoBadgeText}>ALUGADO</Text>
          </View>
        </View>

        {/* Status do prazo */}
        {status && (
          <View style={[styles.statusCard, { backgroundColor: status.bg, borderColor: status.color }]}>
            <Clock size={18} color={status.color} />
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        )}

        {/* Dados do equipamento */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Equipamento</Text>
          <InfoRow icon={Hash} label="Número de Série" value={patrimonio.numeroSerie} />
          <InfoRow icon={Tag} label="Marca" value={patrimonio.marca} />
          <InfoRow icon={Package} label="Modelo" value={patrimonio.modelo} />
        </View>

        {/* Dados da locação */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Locação</Text>
          <InfoRow
            icon={Building2}
            label="Locadora"
            value={patrimonio.nomeLocadora || 'Não informado'}
          />
          <InfoRow
            icon={Calendar}
            label="Data de Locação"
            value={patrimonio.dataLocacao ? formatarData(patrimonio.dataLocacao) : 'Não informado'}
          />
          {patrimonio.dataDevolucao && (
            <InfoRow
              icon={CalendarCheck}
              label="Prazo de Devolução"
              value={formatarData(patrimonio.dataDevolucao)}
              valueColor={status?.color}
            />
          )}
        </View>

        {/* Comprovante */}
        {patrimonio.comprovanteUrl && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Comprovante</Text>
            <TouchableOpacity
              style={styles.comprovanteBtn}
              onPress={() => Linking.openURL(patrimonio.comprovanteUrl!)}
              activeOpacity={0.8}
            >
              <FileText size={20} color={theme.colors.primary} />
              <Text style={styles.comprovanteBtnText}>Visualizar comprovante</Text>
              <ExternalLink size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Botão editar */}
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditarPatrimonio', { patrimonio })}
        >
          <Text style={styles.editButtonText}>Editar Informações de Locação</Text>
        </TouchableOpacity>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  headerIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.primary,
    textAlign: 'center',
  },
  locadoBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  locadoBadgeText: {
    color: '#1d4ed8',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: theme.colors.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  editButton: {
    marginTop: 8,
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  comprovanteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.primary + '12',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
  },
  comprovanteBtnText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
});
