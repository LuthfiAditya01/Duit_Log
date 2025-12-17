import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
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

  // 2. Grouping Data (Logic Group by Category)
  // Hasilnya: { "Makan": 50000, "Transport": 20000 }
  const groupedData = expenses.reduce((acc, curr) => {
    if (!acc[curr.category]) {
      acc[curr.category] = 0;
    }
    acc[curr.category] += curr.amount;
    return acc;
  }, {});

  // 3. Format Data buat Chart Kit
  const chartData = Object.keys(groupedData).map((category, index) => {
    // Warna-warni random (hardcoded palette biar cantik)
    const colors = ['#f87171', '#fb923c', '#facc15', '#4ade80', '#60a5fa', '#a78bfa', '#f472b6'];
    
    return {
      name: category,
      population: groupedData[category],
      color: colors[index % colors.length], // Loop warna kalau kategori banyak
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