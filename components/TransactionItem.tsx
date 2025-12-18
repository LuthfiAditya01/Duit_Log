import { useTheme } from '@/context/ThemeContext';
import { formatRupiah } from '@/utils/formatCurrency';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

interface TransactionItemProps {
  category: string; // ID kategori
  amount: number;
  type: 'income' | 'expense';
  date: string;
  description?: string;
}

export default function TransactionItem({ category, amount, type, date, description }: TransactionItemProps) {
  const isExpense = type === 'expense';
  const colors = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.shadowColor }]}>
      {/* Icon Kiri */}
      <View style={[styles.iconContainer, { backgroundColor: isExpense ? colors.expenseLight : colors.incomeLight }]}>
        <Ionicons 
          name={isExpense ? 'arrow-down' : 'arrow-up'} 
          size={24} 
          color={isExpense ? colors.expense : colors.income} 
        />
      </View>

      {/* Detail Tengah */}
      <View style={styles.details}>
        <Text style={[styles.category, { color: colors.text }]}>{category}</Text>
        <Text style={[styles.date, { color: colors.textSecondary }]}>{new Date(date).toLocaleDateString('id-ID')}</Text>
        {description && <Text style={[styles.desc, { color: colors.textTertiary }]} numberOfLines={1}>{description}</Text>}
      </View>

      {/* Nominal Kanan */}
      <Text style={[styles.amount, { color: isExpense ? colors.expense : colors.income }]}>
        {isExpense ? '-' : '+'} {formatRupiah(amount)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 16,
    marginBottom: 10,
    // Shadow tipis biar elegan
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  details: {
    flex: 1,
  },
  category: {
    fontSize: 16,
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    marginTop: 2,
  },
  desc: {
    fontSize: 12,
    marginTop: 2,
    fontStyle: 'italic',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});