import { useTheme } from "@/context/ThemeContext";
import api from "@/services/api";
import { formatRupiah } from "@/utils/formatCurrency";
import { syncBillReminders } from "@/utils/syncReminders";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function BillsScreen() {
  const router = useRouter();
  const colors = useTheme();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const handleMonthText = (text: any) => {
    // Convert ke number dulu, terus +1 karena backend simpen 0-11
    const monthNumber = typeof text === "number" ? text + 1 : Number(text) + 1;
    const month = monthNumber.toString();

    switch (month) {
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

  const fetchBills = async () => {
    try {
      const response = await api.get("/bills");
      setBills(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  useFocusEffect(
    useCallback(() => {
      fetchBills();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchBills();
    // Sekalian sync reminder juga pas user tarik layar (biar aman)
    syncBillReminders();
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert("Hapus Tagihan?", `Yakin mau hapus pengingat untuk ${name}?`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/bills/${id}`);
            await syncBillReminders(); // Refresh notif di HP
            fetchBills(); // Refresh list di layar
          } catch (error) {
            Alert.alert("Gagal menghapus");
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: any }) => {
    return (
      <View style={styles.cardWrapper}>
        {/* Card Data Utama */}
        <TouchableOpacity 
          style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.shadowColor }]}
          onPress={() => router.push({
            pathname: '/(bills)/edit' as any,
            params: { id: item._id }
          })}
          activeOpacity={0.7}
        >
          <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
            <Ionicons
              name="calendar"
              size={24}
              color={colors.primary}
            />
          </View>

          <View style={styles.details}>
            <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.freq, { color: colors.textSecondary }]}>
              {item.frequency === "MONTHLY" 
                ? `Tiap tanggal ${item.dueDay}` 
                : item.frequency === "YEARLY" 
                ? `Tiap tanggal ${item.dueDay} Bulan ${handleMonthText(item.dueMonth)}` 
                : "Klik untuk info lebih lanjut"}
            </Text>
          </View>

          <View style={styles.rightSide}>
            <Text style={[styles.amount, { color: colors.text }]}>{formatRupiah(item.amount)}</Text>
          </View>
        </TouchableOpacity>

        {/* Card Delete - Terpisah di kanan */}
        <TouchableOpacity 
          onPress={() => handleDelete(item._id, item.name)} 
          style={[styles.cardDelete, { backgroundColor: colors.error }]}
        >
          <Ionicons
            name="trash-outline"
            size={24}
            color="#ffffff"
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, shadowColor: colors.shadowColor }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: colors.text }]}>Daftar Tagihan 📅</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Jangan sampe telat bayar ya!</Text>
          </View>
          <TouchableOpacity
            onPress={() => syncBillReminders()}
            style={[styles.refreshButton, { backgroundColor: colors.primaryLight }]}>
            <Ionicons
              name="refresh"
              size={20}
              color={colors.primary}
            />
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
          data={bills}
          keyExtractor={(item: any) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingLeft: 20, paddingRight: 20, paddingTop: 20, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Gak ada tagihan.</Text>
              <Text style={[styles.emptySubText, { color: colors.textTertiary }]}>Hidup tenang tanpa tagihanark? Atau karena belum dicatet aja?</Text>
            </View>
          }
        />
      )}

      {/* FAB buat Nambah Bill */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary, shadowColor: colors.shadowColor }]}
        onPress={() => router.push("/(bills)/add")}>
        <Ionicons
          name="add"
          size={30}
          color="#fff"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerText: {
    flex: 1,
  },
  title: { fontSize: 24, fontWeight: "bold" },
  subtitle: { marginTop: 5 },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    // marginRight: 30,
    gap: 10,
  },
  card: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardDelete: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  details: { flex: 1 },
  name: { fontSize: 16, fontWeight: "600" },
  freq: { fontSize: 12, marginTop: 2 },
  rightSide: { alignItems: "flex-end" },
  amount: { fontSize: 16, fontWeight: "bold" },
  emptyState: { alignItems: "center", marginTop: 50 },
  emptyText: { fontSize: 16, fontWeight: "bold" },
  emptySubText: { fontSize: 14 },
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
