import ExpenseChart from "@/components/ExpenseChart";
import TransactionItem from "@/components/TransactionItem";
import api from "@/services/api";
import { formatRupiah } from "@/utils/formatCurrency";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // State Saldo (Simple calculation)
  const [saldo, setSaldo] = useState(0);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);

  // Fungsi Fetch Data
  const fetchTransactions = async () => {
    try {
      const response = await api.get("/transactions");
      const data = response.data.data; // Structure: { data: [...] }
      setTransactions(data);
      calculateSummary(data);
    } catch (error) {
      console.error("Gagal ambil data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Hitung duit masuk/keluar lokal aja biar cepet
  const calculateSummary = (data: any[]) => {
    let totalIncome = 0;
    let totalExpense = 0;

    data.forEach((item) => {
      if (item.type === "income") totalIncome += item.amount;
      else totalExpense += item.amount;
    });

    setIncome(totalIncome);
    setExpense(totalExpense);
    setSaldo(totalIncome - totalExpense);
  };

  // Pake useFocusEffect biar auto-refresh pas balik ke screen ini
  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
    }, [])
  );

  // Pull to Refresh logic
  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        {/* HEADER: Saldo Card */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Dompet Lo Sekarang 💸</Text>
          <Text style={styles.saldo}>{formatRupiah(saldo)}</Text>

          <View style={styles.summaryContainer}>
            <View style={styles.summaryItem}>
              <View style={[styles.arrowIcon, { backgroundColor: "#dcfce7" }]}>
                <Ionicons
                  name="arrow-up"
                  size={16}
                  color="#10b981"
                />
              </View>
              <View>
                <Text style={styles.summaryLabel}>Masuk</Text>
                <Text style={styles.incomeText}>{formatRupiah(income)}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryItem}>
              <View style={[styles.arrowIcon, { backgroundColor: "#fee2e2" }]}>
                <Ionicons
                  name="arrow-down"
                  size={16}
                  color="#ef4444"
                />
              </View>
              <View>
                <Text style={styles.summaryLabel}>Keluar</Text>
                <Text style={styles.expenseText}>{formatRupiah(expense)}</Text>
              </View>
            </View>
          </View>

          <View style={{ paddingHorizontal: 20 }}>{!loading && <ExpenseChart transactions={transactions} />}</View>
        </View>

        {/* LIST TRANSAKSI */}
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Riwayat Transaksi</Text>

          {loading ? (
            <ActivityIndicator
              size="large"
              color="#2563eb"
              style={{ marginTop: 20 }}
            />
          ) : (
            <FlatList
              data={transactions}
              keyExtractor={(item: any) => item._id}
              renderItem={({ item }) => (
                <TransactionItem
                  category={item.category}
                  amount={item.amount}
                  type={item.type}
                  date={item.date}
                  description={item.description}
                />
              )}
              contentContainerStyle={{ paddingBottom: 100 }} // Biar item bawah gak ketutupan FAB
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                />
              }
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>Belum ada transaksi nih.</Text>
                  <Text style={styles.emptySubText}>Yuk catet duit jajan lo!</Text>
                </View>
              }
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        {/* FAB (Floating Action Button) buat Nambah Transaksi */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push("/(transactions)/add")} // Kita akan bikin route ini nanti
        >
          <Ionicons
            name="add"
            size={30}
            color="#fff"
          />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    backgroundColor: "#fff",
    padding: 20,
    paddingTop: 60, // Space buat status bar
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  greeting: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 5,
  },
  saldo: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 20,
  },
  summaryContainer: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderRadius: 16,
    padding: 15,
    justifyContent: "space-around",
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  divider: {
    width: 1,
    backgroundColor: "#cbd5e1",
    height: "80%",
  },
  arrowIcon: {
    padding: 6,
    borderRadius: 50,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#64748b",
  },
  incomeText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#10b981",
  },
  expenseText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ef4444",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 15,
  },
  emptyState: {
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#94a3b8",
  },
  emptySubText: {
    fontSize: 14,
    color: "#cbd5e1",
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: "#2563eb",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
});
