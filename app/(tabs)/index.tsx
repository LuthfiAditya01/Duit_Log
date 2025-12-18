import ExpenseChart from "@/components/ExpenseChart";
import TransactionItem from "@/components/TransactionItem";
import { useTheme } from "@/context/ThemeContext";
import api from "@/services/api";
import { formatRupiah } from "@/utils/formatCurrency";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import React, { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Modal, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const colors = useTheme();
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
      // console.log(`Token User : ${token}`);
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
    <View style={[styles.pageContainer, { backgroundColor: colors.background }]}>
      <ScrollView>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* HEADER: Saldo Card */}
        <View style={[styles.header, { backgroundColor: colors.surface, shadowColor: colors.shadowColor }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Hallo! {name}</Text>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>Dompet Lo Sekarang 💸</Text>
          <Text style={[styles.saldo, { color: colors.text }]}>{formatRupiah(saldo)}</Text>

          <View style={[styles.summaryContainer, { backgroundColor: colors.chipBackground }]}>
            <View style={styles.summaryItem}>
              <View style={[styles.arrowIcon, { backgroundColor: colors.incomeLight }]}>
                <Ionicons
                  name="arrow-up"
                  size={16}
                  color={colors.income}
                />
              </View>
              <View>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Masuk</Text>
                <Text style={[styles.incomeText, { color: colors.income }]}>{formatRupiah(income)}</Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.divider }]} />

            <View style={styles.summaryItem}>
              <View style={[styles.arrowIcon, { backgroundColor: colors.expenseLight }]}>
                <Ionicons
                  name="arrow-down"
                  size={16}
                  color={colors.expense}
                />
              </View>
              <View>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Keluar</Text>
                <Text style={[styles.expenseText, { color: colors.expense }]}>{formatRupiah(expense)}</Text>
              </View>
            </View>
          </View>

          <View style={{ paddingHorizontal: 20 }}>{!loading && <ExpenseChart transactions={transactions} />}</View>
        </View>

        {/* LIST TRANSAKSI */}
        <View style={[styles.content, { backgroundColor: colors.background }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Riwayat Transaksi</Text>
            
            {/* Filter Bulan & Tahun */}
            <View style={styles.filterContainer}>
              <TouchableOpacity
                style={[styles.filterButton, { backgroundColor: colors.primaryLight, borderColor: colors.border }]}
                onPress={() => setShowMonthPicker(true)}
              >
                <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                <Text style={[styles.filterText, { color: colors.primary }]}>{getMonthName(selectedMonth)}</Text>
                <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.filterButton, { backgroundColor: colors.primaryLight, borderColor: colors.border }]}
                onPress={() => setShowYearPicker(true)}
              >
                <Text style={[styles.filterText, { color: colors.primary }]}>{selectedYear}</Text>
                <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {loading ? (
            <ActivityIndicator
              size="large"
              color={colors.primary}
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
                  colors={[colors.primary]}
                />
              }
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Belum ada transaksi nih.</Text>
                  <Text style={[styles.emptySubText, { color: colors.textTertiary }]}>Yuk catet duit jajan lo!</Text>
                </View>
              }
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>

      {/* FAB (Floating Action Button) buat Nambah Transaksi */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary, shadowColor: colors.shadowColor }]}
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
          style={[styles.modalOverlay, { backgroundColor: colors.modalOverlay }]}
          activeOpacity={1}
          onPress={() => setShowMonthPicker(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.modalBackground }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Pilih Bulan</Text>
            <ScrollView>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => (
                <TouchableOpacity
                  key={month}
                  style={[
                    styles.pickerItem,
                    selectedMonth === month && { backgroundColor: colors.primaryLight }
                  ]}
                  onPress={() => {
                    setSelectedMonth(month);
                    setShowMonthPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      { color: colors.text },
                      selectedMonth === month && { color: colors.primary }
                    ]}
                  >
                    {getMonthName(month)}
                  </Text>
                  {selectedMonth === month && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
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
          style={[styles.modalOverlay, { backgroundColor: colors.modalOverlay }]}
          activeOpacity={1}
          onPress={() => setShowYearPicker(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.modalBackground }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Pilih Tahun</Text>
            <ScrollView>
              {generateYears().map((year) => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.pickerItem,
                    selectedYear === year && { backgroundColor: colors.primaryLight }
                  ]}
                  onPress={() => {
                    setSelectedYear(year);
                    setShowYearPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      { color: colors.text },
                      selectedYear === year && { color: colors.primary }
                    ]}
                  >
                    {year}
                  </Text>
                  {selectedYear === year && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
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
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60, // Space buat status bar
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  greeting: {
    fontSize: 14,
    marginBottom: 5,
  },
  saldo: {
    fontSize: 32,
    fontWeight: "bold",
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
  },
  sectionHeader: {
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  filterInfo: {
    fontSize: 14,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    borderRadius: 20,
    padding: 20,
    width: "80%",
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
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
  },
  pickerItemTextSelected: {
    fontWeight: "600",
  },
  summaryContainer: {
    flexDirection: "row",
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
    height: "80%",
  },
  arrowIcon: {
    padding: 6,
    borderRadius: 50,
  },
  summaryLabel: {
    fontSize: 12,
  },
  incomeText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  expenseText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  emptyState: {
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  emptySubText: {
    fontSize: 14,
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
});
