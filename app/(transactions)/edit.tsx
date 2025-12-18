import api from '@/services/api';
import { formatRupiah } from '@/utils/formatCurrency';
import { syncBillReminders } from '@/utils/syncReminders';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function EditTransactionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // State Form
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');

  // Daftar Kategori Umum
  const categories = [
    'Makan', 'Transport', 'Belanja', 'Tagihan', 
    'Hiburan', 'Kesehatan', 'Gaji', 'Bonus', 'Lainnya'
  ];

  // Fetch data transaction pas pertama kali buka
  useEffect(() => {
    fetchTransactionData();
  }, []);

  const fetchTransactionData = async () => {
    try {
      const transactionId = params.id as string;
      if (!transactionId) {
        Alert.alert("Error", "ID transaksi tidak ditemukan");
        router.back();
        return;
      }

      const response = await api.get(`/transactions/${transactionId}`);
      const transactionData = response.data.data;

      // Pre-fill form dengan data yang ada
      setAmount(transactionData.amount?.toString() || "");
      setCategory(transactionData.category || "");
      setDescription(transactionData.description || "");
      setType(transactionData.type || "expense");
    } catch (error: any) {
      console.error("Gagal ambil data transaksi:", error);
      
      // Error handling khusus
      if (error.response?.status === 404) {
        Alert.alert("Transaksi Tidak Ditemukan", "Transaksi yang lo cari tidak ada atau sudah dihapus.");
      } else if (error.response?.status === 401) {
        Alert.alert("Akses Ditolak", "Lo tidak punya izin untuk mengakses transaksi ini.");
      } else if (error.response?.status === 500) {
        Alert.alert("Server Error", "Terjadi kesalahan di server. Coba lagi nanti ya.");
      } else {
        Alert.alert("Error", "Gagal memuat data transaksi");
      }
      
      router.back();
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSave = async () => {
    // 1. Validasi
    if (!amount || !category) {
      Alert.alert('Data Kurang', 'Isi dulu nominal sama kategorinya bos.');
      return;
    }

    setIsLoading(true);

    try {
      const transactionId = params.id as string;
      
      // 2. Kirim ke Backend (PUT untuk update)
      const payload = {
        amount: parseInt(amount),
        category,
        type,
        description: description || undefined, // Opsional
      };

      await api.put(`/transactions/${transactionId}`, payload);

      // 3. Sync Reminder (Opsional)
      await syncBillReminders();

      Alert.alert(
        'Berhasil! 🎉',
        'Transaksi berhasil diupdate.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );

    } catch (error: any) {
      // Error handling khusus untuk berbagai status code
      if (error.response?.status === 404) {
        Alert.alert(
          "Transaksi Tidak Ditemukan",
          "Transaksi yang lo coba edit tidak ada atau sudah dihapus."
        );
      } else if (error.response?.status === 401) {
        Alert.alert(
          "Akses Ditolak",
          "Lo tidak punya izin untuk mengedit transaksi ini. Pastikan lo sudah login dengan benar."
        );
      } else if (error.response?.status === 500) {
        Alert.alert(
          "Server Error",
          "Terjadi kesalahan di server. Silakan coba lagi nanti atau hubungi support jika masalah berlanjut."
        );
      } else {
        const msg = error.response?.data?.message || 'Gagal update transaksi.';
        Alert.alert('Error', msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Transaksi</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* 1. Toggle Income/Expense */}
        <View style={styles.typeContainer}>
          <TouchableOpacity 
            style={[styles.typeButton, type === 'expense' && styles.activeExpense]} 
            onPress={() => setType('expense')}
          >
            <Ionicons name="arrow-down-circle" size={20} color={type === 'expense' ? '#fff' : '#ef4444'} />
            <Text style={[styles.typeText, type === 'expense' && styles.activeText]}>Pengeluaran</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.typeButton, type === 'income' && styles.activeIncome]} 
            onPress={() => setType('income')}
          >
            <Ionicons name="arrow-up-circle" size={20} color={type === 'income' ? '#fff' : '#10b981'} />
            <Text style={[styles.typeText, type === 'income' && styles.activeText]}>Pemasukan</Text>
          </TouchableOpacity>
        </View>

        {/* 2. Input Nominal */}
        <Text style={styles.label}>Nominal (Rp)</Text>
        <TextInput
          style={styles.amountInput}
          placeholder="0"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
        {amount ? <Text style={styles.helperText}>{formatRupiah(parseInt(amount))}</Text> : null}

        {/* 3. Pilih Kategori */}
        <Text style={styles.label}>Kategori</Text>
        <View style={styles.categoryContainer}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, category === cat && styles.activeChip]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.chipText, category === cat && styles.activeChipText]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 4. Deskripsi (Opsional) */}
        <Text style={styles.label}>Catatan (Opsional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Contoh: Nasi Padang Lauk Rendang"
          value={description}
          onChangeText={setDescription}
        />

      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Simpan Perubahan</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  content: {
    padding: 20,
  },
  typeContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  activeExpense: {
    backgroundColor: '#ef4444',
  },
  activeIncome: {
    backgroundColor: '#10b981',
  },
  typeText: {
    fontWeight: '600',
    color: '#64748b',
  },
  activeText: {
    color: '#fff',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
    marginTop: 15,
  },
  amountInput: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 10,
  },
  helperText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 5,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  activeChip: {
    backgroundColor: '#2563eb',
  },
  chipText: {
    color: '#64748b',
    fontSize: 14,
  },
  activeChipText: {
    color: '#fff',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#1e293b',
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  saveButton: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

