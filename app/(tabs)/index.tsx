import ExpenseChart from "@/components/ExpenseChart";
import TransactionItem from "@/components/TransactionItem";
import api from "@/services/api";
import { formatRupiah } from "@/utils/formatCurrency";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import React, { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Modal, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // State untuk filter bulan dan tahun
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  // State Saldo (Ambil dari user)
  const [saldo, setSaldo] = useState(0);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [name, setName] = useState("")

  // Helper untuk convert bulan ke text
  const getMonthName = (month: number) => {
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    return months[month - 1] || "";
  };

  // Generate list tahun (5 tahun ke belakang sampai 5 tahun ke depan)
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
      years.push(i);
    }
    return years;
  };

  // Fungsi Fetch Data User (untuk ambil saldo)
  const fetchUserData = async () => {
    try {
      const response = await api.get("/auth/me");
      const userData = response.data.data;
      const token = await SecureStore.getItemAsync('user_token');
      console.log(`Token User : ${token}`);
      // Ambil saldo dari user (asumsi field balance atau saldo)
      setSaldo(userData.balance || userData.saldo || 0);
      setName(userData.name);
    } catch (error) {
      console.error("Gagal ambil data user:", error);
    }
  };

  // Fungsi Fetch Data Transactions dengan filter
  const fetchTransactions = async () => {
    try {
      const response = await api.get(`/transactions?month=${selectedMonth}&year=${selectedYear}`);
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

  // Hitung duit masuk/keluar dari transaksi yang difilter
  const calculateSummary = (data: any[]) => {
    let totalIncome = 0;
    let totalExpense = 0;

    data.forEach((item) => {
      if (item.type === "income") totalIncome += item.amount;
      else totalExpense += item.amount;
    });

    setIncome(totalIncome);
    setExpense(totalExpense);
    // Saldo tetap ambil dari user, bukan dihitung dari transaksi
  };

  // Pake useFocusEffect biar auto-refresh pas balik ke screen ini
  useFocusEffect(
    useCallback(() => {
      fetchUserData(); // Ambil saldo dari user
      fetchTransactions(); // Ambil transaksi dengan filter
    }, [selectedMonth, selectedYear])
  );

  // Pull to Refresh logic
  const onRefresh = () => {
    setRefreshing(true);
    fetchUserData();
    fetchTransactions();
  };

  return (
    <View style={styles.pageContainer}>
      <ScrollView>
        <View style={styles.container}>
        {/* HEADER: Saldo Card */}
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>Hallo! {name}</Text>
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
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Riwayat Transaksi</Text>
            
            {/* Filter Bulan & Tahun */}
            <View style={styles.filterContainer}>
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setShowMonthPicker(true)}
              >
                <Ionicons name="calendar-outline" size={18} color="#2563eb" />
                <Text style={styles.filterText}>{getMonthName(selectedMonth)}</Text>
                <Ionicons name="chevron-down" size={16} color="#64748b" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setShowYearPicker(true)}
              >
                <Text style={styles.filterText}>{selectedYear}</Text>
                <Ionicons name="chevron-down" size={16} color="#64748b" />
              </TouchableOpacity>
            </View>
          </View>

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
                <TouchableOpacity
                  onPress={() => router.push({
                    pathname: '/(transactions)/edit' as any,
                    params: { id: item._id }
                  })}
                  activeOpacity={0.7}
                >
                  <TransactionItem
                    category={item.category.name}
                    amount={item.amount}
                    type={item.type}
                    date={item.date}
                    description={item.description}
                  />
                </TouchableOpacity>
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
      </View>

      {/* FAB (Floating Action Button) buat Nambah Transaksi */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/(transactions)/add")}
      >
        <Ionicons
          name="add"
          size={30}
          color="#fff"
        />
      </TouchableOpacity>
      </ScrollView>

      {/* Modal Picker Bulan */}
      <Modal
        visible={showMonthPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMonthPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMonthPicker(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pilih Bulan</Text>
            <ScrollView>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => (
                <TouchableOpacity
                  key={month}
                  style={[
                    styles.pickerItem,
                    selectedMonth === month && styles.pickerItemSelected
                  ]}
                  onPress={() => {
                    setSelectedMonth(month);
                    setShowMonthPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      selectedMonth === month && styles.pickerItemTextSelected
                    ]}
                  >
                    {getMonthName(month)}
                  </Text>
                  {selectedMonth === month && (
                    <Ionicons name="checkmark" size={20} color="#2563eb" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal Picker Tahun */}
      <Modal
        visible={showYearPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowYearPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowYearPicker(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pilih Tahun</Text>
            <ScrollView>
              {generateYears().map((year) => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.pickerItem,
                    selectedYear === year && styles.pickerItemSelected
                  ]}
                  onPress={() => {
                    setSelectedYear(year);
                    setShowYearPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      selectedYear === year && styles.pickerItemTextSelected
                    ]}
                  >
                    {year}
                  </Text>
                  {selectedYear === year && (
                    <Ionicons name="checkmark" size={20} color="#2563eb" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
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
  filterContainer: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#eff6ff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#dbeafe",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563eb",
  },
  sectionHeader: {
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  filterInfo: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    width: "80%",
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 15,
    textAlign: "center",
  },
  pickerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    marginBottom: 8,
  },
  pickerItemSelected: {
    backgroundColor: "#eff6ff",
  },
  pickerItemText: {
    fontSize: 16,
    color: "#1e293b",
  },
  pickerItemTextSelected: {
    color: "#2563eb",
    fontWeight: "600",
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
