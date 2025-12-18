import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

interface ExpenseChartProps {
  transactions: any[];
}

export default function ExpenseChart({ transactions }: ExpenseChartProps) {
  // 1. Filter cuma Pengeluaran
  const expenses = transactions.filter((t) => t.type === 'expense');

  if (expenses.length === 0) {
    return null; // Gak usah nampilin chart kalau gak ada pengeluaran
  }

  // 2. Helper function untuk extract nama kategori
  const getCategoryName = (category: any): string => {
    if (!category) return 'Lainnya';
    // Kalau category adalah object (populated dari backend)
    if (typeof category === 'object' && category !== null) {
      return category.name || category._id || 'Lainnya';
    }
    // Kalau category adalah string (ID)
    return category;
  };

  // 3. Helper function untuk extract warna kategori
  const getCategoryColor = (category: any, fallbackColor: string): string => {
    if (!category) return fallbackColor;
    // Kalau category adalah object dan punya color
    if (typeof category === 'object' && category !== null && category.color) {
      return category.color;
    }
    return fallbackColor;
  };

  // 4. Grouping Data (Logic Group by Category)
  // Hasilnya: { "Makan": 50000, "Transport": 20000 }
  const groupedData = expenses.reduce((acc, curr) => {
    const categoryName = getCategoryName(curr.category);
    if (!acc[categoryName]) {
      acc[categoryName] = {
        amount: 0,
        category: curr.category // Simpan category object untuk ambil warna nanti
      };
    }
    acc[categoryName].amount += curr.amount;
    return acc;
  }, {} as Record<string, { amount: number; category: any }>);

  // 5. Format Data buat Chart Kit
  const chartData = Object.keys(groupedData).map((categoryName, index) => {
    // Warna-warni fallback (hardcoded palette biar cantik)
    const fallbackColors = ['#f87171', '#fb923c', '#facc15', '#4ade80', '#60a5fa', '#a78bfa', '#f472b6'];
    const fallbackColor = fallbackColors[index % fallbackColors.length];
    
    // Coba ambil warna dari category object, kalau gak ada pakai fallback
    const categoryColor = getCategoryColor(groupedData[categoryName].category, fallbackColor);
    
    return {
      name: categoryName,
      population: groupedData[categoryName].amount,
      color: categoryColor,
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    };
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Analisis Pengeluaran 📉</Text>
      <PieChart
        data={chartData}
        width={screenWidth - 40} // Lebar layar dikurangin padding
        height={220}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor={'population'}
        backgroundColor={'transparent'}
        paddingLeft={'15'}
        center={[10, 0]}
        absolute // Biar angkanya muncul di chart
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
    marginTop: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
});