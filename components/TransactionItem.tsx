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
  console.log(`categoryyy ${category}`)
  console.log(`categorystringggg ${JSON.stringify(category)}`)
  // const [categoryName, setCategoryName] = useState<string>(category); // Fallback ke ID kalau belum loaded

  // Fetch nama kategori dari API
  // useEffect(() => {
  //   const fetchCategoryName = async () => {
  //     if (!category) return;
      
  //     try {
  //       const response = await api.get(`/categories/${category}`);
  //       const categoryData = response.data.data || response.data;
  //       if (categoryData?.name) {
  //         setCategoryName(categoryData.name);
  //       }
  //     } catch (error) {
  //       // Kalau error, tetap pakai ID sebagai fallback
  //       console.error('Gagal fetch nama kategori:', error);
  //     }
  //   };

  //   fetchCategoryName();
  // }, [category]);

  return (
    <View style={styles.card}>
      {/* Icon Kiri */}
      <View style={[styles.iconContainer, { backgroundColor: isExpense ? '#fee2e2' : '#dcfce7' }]}>
        <Ionicons 
          name={isExpense ? 'arrow-down' : 'arrow-up'} 
          size={24} 
          color={isExpense ? '#ef4444' : '#10b981'} 
        />
      </View>

      {/* Detail Tengah */}
      <View style={styles.details}>
        <Text style={styles.category}>{category}</Text>
        <Text style={styles.date}>{new Date(date).toLocaleDateString('id-ID')}</Text>
        {description && <Text style={styles.desc} numberOfLines={1}>{description}</Text>}
      </View>

      {/* Nominal Kanan */}
      <Text style={[styles.amount, { color: isExpense ? '#ef4444' : '#10b981' }]}>
        {isExpense ? '-' : '+'} {formatRupiah(amount)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 16,
    marginBottom: 10,
    // Shadow tipis biar elegan
    shadowColor: '#000',
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
    color: '#1e293b',
  },
  date: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  desc: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    fontStyle: 'italic',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});