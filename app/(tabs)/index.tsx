import ExpenseChart from "@/components/ExpenseChart";
import TransactionItem from "@/components/TransactionItem";
import { useTheme } from "@/context/ThemeContext";
import api from "@/services/api";
import { formatRupiah } from "@/utils/formatCurrency";
import { Ionicons } from "@expo/vector-icons";
import * as Print from 'expo-print';
import { useFocusEffect, useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import * as Sharing from 'expo-sharing';
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Modal, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
  const [showStatement, setShowStatement] = useState(false);

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

  // Fungsi untuk generate PDF rekening koran
  const generatePDF = async () => {
    try {
      // Hitung saldo awal
      const saldoAwal = saldo - income + expense;
      
      // Format tanggal untuk periode
      const firstDay = new Date(selectedYear, selectedMonth - 1, 1);
      const lastDay = new Date(selectedYear, selectedMonth, 0);
      const formattedPeriod = `${firstDay.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })} - ${lastDay.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}`;
      
      // Format tanggal cetak
      const printDate = new Date().toLocaleDateString('id-ID', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      });
      
      // Generate HTML content untuk PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            @page {
              margin: 20mm;
            }
            body {
              font-family: Arial, sans-serif;
              padding: 0;
              margin: 0;
              color: #000;
              font-size: 11px;
            }
            .header-container {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 25px;
              padding-bottom: 15px;
              border-bottom: 2px solid #0066CC;
            }
            .header-left {
              flex: 1;
            }
            .header-left h1 {
              margin: 0;
              color: #0066CC;
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .header-right {
              text-align: right;
              flex: 1;
            }
            .header-right .logo-text {
              font-size: 18px;
              font-weight: bold;
              color: #0066CC;
              margin-bottom: 5px;
            }
            .header-right .address {
              font-size: 9px;
              color: #666;
              line-height: 1.4;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 12px;
              margin-bottom: 20px;
              font-size: 11px;
            }
            .info-item {
              display: flex;
              justify-content: space-between;
            }
            .info-label {
              font-weight: bold;
              color: #333;
            }
            .info-value {
              color: #000;
            }
            .summary-box {
              border: 2px solid #0066CC;
              padding: 15px;
              margin-bottom: 20px;
              background-color: #f8f9fa;
            }
            .summary-title {
              font-weight: bold;
              font-size: 13px;
              color: #0066CC;
              margin-bottom: 12px;
              padding-bottom: 8px;
              border-bottom: 1px solid #0066CC;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              font-size: 11px;
            }
            .summary-label {
              font-weight: 600;
              color: #333;
            }
            .summary-value {
              font-weight: bold;
              color: #000;
            }
            .summary-value.positive {
              color: #038C00;
            }
            .summary-value.negative {
              color: #ef4444;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
              font-size: 10px;
            }
            th {
              background-color: #0066CC;
              color: white;
              padding: 8px 6px;
              text-align: left;
              font-weight: bold;
              font-size: 10px;
              border: 1px solid #0052a3;
            }
            th.text-right {
              text-align: right;
            }
            th.text-center {
              text-align: center;
            }
            td {
              padding: 6px;
              border: 1px solid #ddd;
              font-size: 10px;
            }
            tr:nth-child(even) {
              background-color: #f8f9fa;
            }
            .text-right {
              text-align: right;
            }
            .text-center {
              text-align: center;
            }
            .footer {
              margin-top: 30px;
              padding-top: 15px;
              border-top: 1px solid #ddd;
              font-size: 9px;
              color: #666;
              line-height: 1.6;
            }
            .footer-title {
              font-weight: bold;
              margin-bottom: 8px;
              color: #333;
            }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div class="header-left">
              <h1>e-Statement</h1>
            </div>
            <div class="header-right">
              <div class="logo-text">Duit Log</div>
              <div class="address">
                Aplikasi Catatan Keuangan
              </div>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Nama/Name:</span>
              <span class="info-value">${name.toUpperCase()}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Periode/Period:</span>
              <span class="info-value">${formattedPeriod}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Dicetak pada/Issued on:</span>
              <span class="info-value">${printDate}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Mata Uang/Currency:</span>
              <span class="info-value">IDR</span>
            </div>
          </div>

          <div class="summary-box">
            <div class="summary-title">Ringkasan Rekening / Account Summary</div>
            <div class="summary-row">
              <span class="summary-label">Saldo Awal/Initial Balance:</span>
              <span class="summary-value">${formatRupiah(saldoAwal)} IDR</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Dana Masuk/Incoming Transactions:</span>
              <span class="summary-value positive">+${formatRupiah(income)} IDR</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Dana Keluar/Outgoing Transactions:</span>
              <span class="summary-value negative">-${formatRupiah(expense)} IDR</span>
            </div>
            <div class="summary-row" style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #0066CC;">
              <span class="summary-label" style="font-size: 12px;">Saldo Akhir/Closing Balance:</span>
              <span class="summary-value" style="font-size: 12px; color: #0066CC;">${formatRupiah(saldo)} IDR</span>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th class="text-center" style="width: 40px;">No</th>
                <th style="width: 140px;">Tanggal (Date)</th>
                <th>Keterangan (Remarks)</th>
                <th class="text-right" style="width: 120px;">Nominal (IDR)<br>(Amount (IDR))</th>
                <th class="text-right" style="width: 120px;">Saldo (IDR)<br>(Balance (IDR))</th>
              </tr>
            </thead>
            <tbody>
              ${(() => {
                let runningBalance = saldoAwal;
                return transactions.map((item: any, index: number) => {
                  const date = new Date(item.date);
                  const day = date.getDate().toString().padStart(2, '0');
                  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
                  const month = monthNames[date.getMonth()];
                  const year = date.getFullYear();
                  const hours = date.getHours().toString().padStart(2, '0');
                  const minutes = date.getMinutes().toString().padStart(2, '0');
                  const seconds = date.getSeconds().toString().padStart(2, '0');
                  const formattedDate = `${day} ${month} ${year} ${hours}:${minutes}:${seconds} WIB`;
                  
                  const isIncome = item.type === 'income';
                  const amount = item.amount;
                  const amountFormatted = isIncome ? `+${formatRupiah(amount)}` : `-${formatRupiah(amount)}`;
                  
                  runningBalance += (isIncome ? amount : -amount);
                  
                  const categoryName = item.category?.name || item.category || 'Lainnya';
                  const description = item.description || categoryName;
                  
                  return `
                    <tr>
                      <td class="text-center">${index + 1}</td>
                      <td>${formattedDate}</td>
                      <td>${description}</td>
                      <td class="text-right" style="${isIncome ? 'color: #038C00;' : 'color: #ef4444;'}">${amountFormatted}</td>
                      <td class="text-right" style="font-weight: 600;">${formatRupiah(runningBalance)}</td>
                    </tr>
                  `;
                }).join('');
              })()}
            </tbody>
          </table>

          <div class="footer">
            <div class="footer-title">Informasi Penting:</div>
            <p>Dokumen ini dibuat secara otomatis oleh aplikasi Duit Log. Dokumen ini merupakan rekening koran digital yang dapat digunakan sebagai bukti transaksi keuangan.</p>
            <p style="margin-top: 10px;">Tanggal cetak: ${new Date().toLocaleDateString('id-ID', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>
        </body>
        </html>
      `;

      // Generate PDF
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      
      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Bagikan Rekening Koran',
        });
      } else {
        Alert.alert(
          'PDF Berhasil Dibuat',
          `File PDF telah dibuat di: ${uri}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Gagal membuat PDF. Coba lagi nanti.');
    }
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

          <View style={{}}>{!loading && <ExpenseChart transactions={transactions} />}</View>
        </View>

        {/* LIST TRANSAKSI */}
        <View style={[styles.content, { backgroundColor: colors.background }]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Riwayat Transaksi</Text>
              <TouchableOpacity
                style={[styles.statementButton, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}
                onPress={() => setShowStatement(true)}
              >
                <Ionicons name="document-text-outline" size={18} color={colors.primary} />
                <Text style={[styles.statementButtonText, { color: colors.primary }]}>e-Statement</Text>
              </TouchableOpacity>
            </View>
            
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
      </ScrollView>

      {/* FAB (Floating Action Button) buat Nambah Transaksi */}
      <TouchableOpacity
        style={[
          styles.fab,
          {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 28,
            position: 'absolute',
            right: 24,
            bottom: 32,
            backgroundColor: colors.primary,
            elevation: 5,
            shadowColor: colors.shadowColor,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            minWidth: 180,
          },
        ]}
        activeOpacity={0.85}
        onPress={() => router.push("/(transactions)/add")}
      >
        <Ionicons name="add" size={28} color="#fff" style={{ marginRight: 8 }} />
        <Text
          style={{
            color: "#fff",
            fontWeight: "600",
            fontSize: 16,
            flexShrink: 1,
            flexWrap: 'wrap',
          }}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          Tambah Transaksi
        </Text>
      </TouchableOpacity>

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

      {/* Modal Rekening Koran */}
      <Modal
        visible={showStatement}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowStatement(false)}
      >
        <View style={[styles.statementModalOverlay, { backgroundColor: colors.modalOverlay }]}>
          <View style={[styles.statementModalContent, { backgroundColor: colors.modalBackground }]}>
            {/* Header */}
            <View style={[styles.statementHeader, { borderBottomColor: colors.border }]}>
              <View>
                <Text style={[styles.statementTitle, { color: colors.text }]}>Rekening Koran</Text>
                <Text style={[styles.statementSubtitle, { color: colors.textSecondary }]}>
                  Periode: {getMonthName(selectedMonth)} {selectedYear}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowStatement(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Info User */}
            <View style={[styles.statementInfo, { backgroundColor: colors.chipBackground }]}>
              <Text style={[styles.statementInfoLabel, { color: colors.textSecondary }]}>Nama:</Text>
              <Text style={[styles.statementInfoValue, { color: colors.text }]}>{name}</Text>
            </View>

            {/* Saldo Awal */}
            <View style={[styles.statementBalance, { backgroundColor: colors.surface }]}>
              <Text style={[styles.statementBalanceLabel, { color: colors.textSecondary }]}>Saldo Awal:</Text>
              <Text style={[styles.statementBalanceValue, { color: colors.text }]}>
                {formatRupiah(saldo - income + expense)}
              </Text>
            </View>

            {/* Tabel Transaksi */}
            <ScrollView style={styles.statementTable}>
              <View style={[styles.statementTableHeader, { backgroundColor: colors.chipBackground }]}>
                <Text style={[styles.statementTableHeaderText, { color: colors.textSecondary, flex: 1.5 }]}>Tanggal</Text>
                <Text style={[styles.statementTableHeaderText, { color: colors.textSecondary, flex: 2 }]}>Keterangan</Text>
                <Text style={[styles.statementTableHeaderText, { color: colors.textSecondary, flex: 1.2 }]}>Debit</Text>
                <Text style={[styles.statementTableHeaderText, { color: colors.textSecondary, flex: 1.2 }]}>Kredit</Text>
                <Text style={[styles.statementTableHeaderText, { color: colors.textSecondary, flex: 1.2 }]}>Saldo</Text>
              </View>

              {(() => {
                let runningBalance = saldo - income + expense; // Saldo awal
                return transactions.map((item: any, index: number) => {
                  const date = new Date(item.date);
                  const formattedDate = date.toLocaleDateString('id-ID', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric' 
                  });
                  
                  const isIncome = item.type === 'income';
                  const debit = isIncome ? 0 : item.amount;
                  const kredit = isIncome ? item.amount : 0;
                  
                  runningBalance += (kredit - debit);
                  
                  const categoryName = item.category?.name || item.category || 'Lainnya';
                  const description = item.description || categoryName;
                  
                  return (
                    <View 
                      key={item._id || index} 
                      style={[
                        styles.statementTableRow, 
                        { backgroundColor: index % 2 === 0 ? colors.background : colors.surface }
                      ]}
                    >
                      <Text style={[styles.statementTableCell, { color: colors.text, flex: 1.5 }]}>
                        {formattedDate}
                      </Text>
                      <Text 
                        style={[styles.statementTableCell, { color: colors.text, flex: 2 }]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {description}
                      </Text>
                      <Text style={[styles.statementTableCell, { color: colors.text, flex: 1.2, textAlign: 'right' }]}>
                        {debit > 0 ? formatRupiah(debit) : '-'}
                      </Text>
                      <Text style={[styles.statementTableCell, { color: colors.text, flex: 1.2, textAlign: 'right' }]}>
                        {kredit > 0 ? formatRupiah(kredit) : '-'}
                      </Text>
                      <Text style={[styles.statementTableCell, { color: colors.text, flex: 1.2, textAlign: 'right', fontWeight: '600' }]}>
                        {formatRupiah(runningBalance)}
                      </Text>
                    </View>
                  );
                });
              })()}
            </ScrollView>

            {/* Saldo Akhir */}
            <View style={[styles.statementFooter, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.statementFooterLabel, { color: colors.primary }]}>Saldo Akhir:</Text>
              <Text style={[styles.statementFooterValue, { color: colors.primary }]}>
                {formatRupiah(saldo)}
              </Text>
            </View>

            {/* Summary */}
            <View style={styles.statementSummary}>
              <View style={styles.statementSummaryRow}>
                <Text style={[styles.statementSummaryLabel, { color: colors.textSecondary }]}>Total Pemasukan:</Text>
                <Text style={[styles.statementSummaryValue, { color: colors.income }]}>
                  {formatRupiah(income)}
                </Text>
              </View>
              <View style={styles.statementSummaryRow}>
                <Text style={[styles.statementSummaryLabel, { color: colors.textSecondary }]}>Total Pengeluaran:</Text>
                <Text style={[styles.statementSummaryValue, { color: colors.expense }]}>
                  {formatRupiah(expense)}
                </Text>
              </View>
            </View>

            {/* Tombol Cetak PDF */}
            <TouchableOpacity
              style={[styles.printButton, { backgroundColor: colors.primary }]}
              onPress={generatePDF}
            >
              <Ionicons name="print-outline" size={20} color="#fff" />
              <Text style={styles.printButtonText}>Cetak PDF</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 12,
  },
  statementButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  statementButtonText: {
    fontSize: 13,
    fontWeight: "600",
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
    zIndex: 1000,
  },
  statementModalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  statementModalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    padding: 20,
  },
  statementHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
  },
  statementTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statementSubtitle: {
    fontSize: 14,
  },
  statementInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  statementInfoLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  statementInfoValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  statementBalance: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  statementBalanceLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  statementBalanceValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statementTable: {
    maxHeight: 400,
    marginBottom: 15,
  },
  statementTableHeader: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  statementTableHeaderText: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "left",
  },
  statementTableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 4,
  },
  statementTableCell: {
    fontSize: 12,
    textAlign: "left",
  },
  statementFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  statementFooterLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  statementFooterValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statementSummary: {
    gap: 8,
  },
  statementSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statementSummaryLabel: {
    fontSize: 14,
  },
  statementSummaryValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  printButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  printButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
