import api from "@/services/api";
import { formatRupiah } from "@/utils/formatCurrency";
import { syncBillReminders } from "@/utils/syncReminders"; // Kita panggil logic sakti kita
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true, // <-- TAMBAHIN INI
    shouldShowList: true, // <-- TAMBAHIN INI JUGA
  }),
});

export default function AddBillScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // State Form
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState<"MONTHLY" | "YEARLY">("MONTHLY");

  // State Tanggal (Kita bikin manual selector angka biar simpel, gak perlu DatePicker ribet)
  const [dueDay, setDueDay] = useState("");
  const [dueMonth, setDueMonth] = useState(""); // 1-12 (Nanti kita kurangin 1 pas kirim ke backend)
  const handleMonthText = (text: string) => {
    switch (text) {
      case "1":
        return "Januari";
      case "2":
        return "Februari";
      case "3":
        return "Maret";
      case "4":
        return "April";
      case "5":
        return "Mei";
      case "6":
        return "Juni";
      case "7":
        return "Juli";
      case "8":
        return "Agustus";
      case "9":
        return "September";
      case "10":
        return "Oktober";
      case "11":
        return "November";
      case "12":
        return "Desember";
      default:
        return null;
    }
  };

  useEffect(() => {
    
  });

  const handleSave = async () => {
    // 1. Validasi
    if (!name || !amount || !dueDay) {
      Alert.alert("Data Kurang", "Nama, Nominal, dan Tanggal wajib diisi.");
      return;
    }

    // Validasi Tanggal (1-31)
    const dayInt = parseInt(dueDay);
    if (dayInt < 1 || dayInt > 31) {
      Alert.alert("Tanggal Ngaco", "Tanggal jatuh tempo harus 1 - 31.");
      return;
    }

    // Validasi Bulan (Kalau Tahunan)
    let monthInt = null;
    if (frequency === "YEARLY") {
      if (!dueMonth) {
        Alert.alert("Bulan Kosong", "Kalau tahunan, bulannya harus diisi dong.");
        return;
      }
      const m = parseInt(dueMonth);
      if (m < 1 || m > 12) {
        Alert.alert("Bulan Ngaco", "Bulan harus angka 1 (Januari) - 12 (Desember).");
        return;
      }
      monthInt = m - 1; // Backend nerima 0-11
    }

    // Cek & request notifikasi permission
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      const { status: newStatus } = await Notifications.requestPermissionsAsync();

      if (newStatus !== "granted") {
        Alert.alert("Izin Notifikasi Ditolak", "Untuk memasang pengingat tagihan, mohon izinkan notifikasi di pengaturan aplikasi.", [
          {
            text: "Coba Lagi",
            onPress: async () => {
              const { status: retryStatus } = await Notifications.requestPermissionsAsync();
              if (retryStatus === "granted") {
                // Jika permission berhasil, lanjutkan save
                await proceedSave(dayInt, monthInt);
              }
            },
          },
          { text: "Batal", style: "cancel", onPress: () => router.back() },
        ]);
        return;
      }
    }

    // Jika permission sudah granted, proceed langsung
    await proceedSave(dayInt, monthInt);
  };

  const proceedSave = async (dayInt: number, monthInt: number | null) => {
    setIsLoading(true);

    try {
      // 2. Kirim ke Backend
      const payload = {
        name,
        amount: parseInt(amount),
        frequency,
        dueDay: dayInt,
        dueMonth: monthInt, // Null kalo monthly
      };

      const response = await api.post("/bills", payload);

      // 3. PENTING: Refresh Alarm di HP User! ⏰
      await syncBillReminders();

      // Tampilkan notifikasi di notification bar
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "[CONTOH] ⏰ Tagihan " + name + " Sudah mau jatuh tempo nihh!!",
          body: "Siapin uang " + formatRupiah(parseInt(amount)) + " Segini yahh",
        },
        trigger: null,
      });

      Alert.alert("Contoh Notifikasi", `Nanti kamu akan dapat notif seperti ini:\n\n"⏰ ${name}"\n"Sudah jatuh tempo: Rp${formatRupiah(parseInt(amount))}"`, [{ text: "Paham", onPress: () => router.back() }]);
    } catch (error: any) {
      const msg = error.response?.data?.message || "Gagal nyimpen data.";
      Alert.alert("Error", msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}>
          <Ionicons
            name="arrow-back"
            size={24}
            color="#1e293b"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tambah Pengingat</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* 1. Nama Tagihan */}
        <Text style={styles.label}>Nama Tagihan</Text>
        <TextInput
          style={styles.input}
          placeholder="Contoh: Wifi, Netflix, Pajak Motor"
          value={name}
          onChangeText={setName}
        />

        {/* 2. Nominal */}
        <Text style={styles.label}>Nominal (Rp)</Text>
        <TextInput
          style={styles.amountInput}
          placeholder="0"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
        {amount ? <Text style={styles.helperText}>{formatRupiah(parseInt(amount))}</Text> : null}

        {/* 3. Frekuensi */}
        <Text style={styles.label}>Frekuensi Bayar</Text>
        <View style={styles.freqContainer}>
          <TouchableOpacity
            style={[styles.freqButton, frequency === "MONTHLY" && styles.activeFreq]}
            onPress={() => setFrequency("MONTHLY")}>
            <Text style={[styles.freqText, frequency === "MONTHLY" && styles.activeFreqText]}>Bulanan</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.freqButton, frequency === "YEARLY" && styles.activeFreq]}
            onPress={() => setFrequency("YEARLY")}>
            <Text style={[styles.freqText, frequency === "YEARLY" && styles.activeFreqText]}>Tahunan</Text>
          </TouchableOpacity>
        </View>

        {/* 4. Tanggal Jatuh Tempo */}
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.label}>Setiap Tanggal</Text>
            <TextInput
              style={styles.input}
              placeholder="1-31"
              keyboardType="numeric"
              value={dueDay}
              onChangeText={setDueDay}
              maxLength={2}
            />
          </View>

          {/* Input Bulan (Cuma muncul kalo Tahunan) */}
          {frequency === "YEARLY" && (
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Di Bulan</Text>
              <TextInput
                style={styles.input}
                placeholder="1-12"
                keyboardType="numeric"
                value={dueMonth}
                onChangeText={setDueMonth}
                maxLength={2}
              />
            </View>
          )}
        </View>

        <View style={styles.infoBox}>
          <Ionicons
            name="information-circle"
            size={20}
            color="#2563eb"
          />
          <Text style={styles.infoText}>{frequency === "MONTHLY" ? `Aplikasi bakal ngingetin tiap tanggal ${dueDay || "..."} setiap bulannya.` : `Aplikasi bakal ngingetin tiap tanggal ${dueDay || "..."} bulan ${handleMonthText(dueMonth) || "..."} setiap tahun.`}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Pasang Alarm ⏰</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  backButton: { marginRight: 15 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#1e293b" },
  content: { padding: 20 },
  label: { fontSize: 14, fontWeight: "600", color: "#334155", marginBottom: 8, marginTop: 15 },
  input: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: "#1e293b",
  },
  amountInput: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1e293b",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingVertical: 10,
  },
  helperText: { fontSize: 14, color: "#64748b", marginTop: 5 },
  freqContainer: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    padding: 4,
  },
  freqButton: {
    flex: 1,
    padding: 12,
    alignItems: "center",
    borderRadius: 10,
  },
  activeFreq: { backgroundColor: "#fff", shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  freqText: { fontWeight: "600", color: "#64748b" },
  activeFreqText: { color: "#2563eb" },
  row: { flexDirection: "row" },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#eff6ff",
    padding: 15,
    borderRadius: 12,
    marginTop: 25,
    alignItems: "center",
    gap: 10,
  },
  infoText: { flex: 1, fontSize: 13, color: "#1e40af", lineHeight: 20 },
  footer: { padding: 20, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#f1f5f9" },
  saveButton: { backgroundColor: "#2563eb", padding: 16, borderRadius: 12, alignItems: "center" },
  saveText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
