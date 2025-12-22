import { useTheme } from '@/context/ThemeContext';
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

interface Category {
  _id: string;
  name: string;
  type: 'expense' | 'income';
  color: string | null;
  isVisible: boolean;
}

interface Wallet {
  _id: string;
  name: string;
  type: 'bank' | 'e-wallet' | 'cash' | 'other';
  balance: number;
  color: string | null;
  isActive: boolean;
}

export default function EditTransactionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colors = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingWallets, setIsLoadingWallets] = useState(true);

  // State Form
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [wallet, setWallet] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');

  // State untuk kategori dari API
  const [categories, setCategories] = useState<Category[]>([]);
  
  // State untuk wallet dari API
  const [wallets, setWallets] = useState<Wallet[]>([]);

  // Fetch kategori dan wallet dari API
  useEffect(() => {
    fetchCategories();
    fetchWallets();
  }, []);

  // Re-fetch kategori saat type berubah (hanya setelah data pertama kali di-load)
  useEffect(() => {
    if (!isLoadingData) {
      fetchCategories(category); // Pass current category ID untuk validasi
    }
  }, [type]);

  const fetchCategories = async (currentCategoryId?: string) => {
    try {
      const response = await api.get('/categories');
      const allCategories: Category[] = response.data.data || [];
      
      // Filter kategori berdasarkan type dan isVisible
      const filteredCategories = allCategories.filter(
        (cat) => cat.type === type && cat.isVisible === true
      );
      
      setCategories(filteredCategories);
      
      // Cek apakah category yang dipilih masih valid untuk type baru
      if (currentCategoryId && !filteredCategories.some(cat => cat._id === currentCategoryId)) {
        setCategory(''); // Reset kalau kategori tidak valid untuk type baru
      }
    } catch (error) {
      console.error('Gagal fetch kategori:', error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const fetchWallets = async () => {
    try {
      const response = await api.get('/wallet');
      const allWallets: Wallet[] = response.data.data || [];
      
      // Filter wallet yang aktif saja
      const activeWallets = allWallets.filter(
        (w) => w.isActive === true
      );
      
      setWallets(activeWallets);
    } catch (error) {
      console.error('Gagal fetch wallet:', error);
      // Jangan tampilkan alert untuk wallet karena optional
    } finally {
      setIsLoadingWallets(false);
    }
  };

  // Helper function untuk get warna kategori (dengan fallback)
  const getCategoryColor = (categoryColor: string | null): string => {
    if (categoryColor) return categoryColor;
    // Fallback warna berdasarkan type
    return type === 'expense' ? '#ef4444' : '#10b981';
  };

  // Helper function untuk get warna wallet (dengan fallback)
  const getWalletColor = (walletColor: string | null, walletType: Wallet['type']): string => {
    if (walletColor) return walletColor;
    // Fallback warna berdasarkan type
    const typeColors: Record<Wallet['type'], string> = {
      'bank': '#0066CC',
      'e-wallet': '#00A86B',
      'cash': '#28A745',
      'other': '#6C757D'
    };
    return typeColors[walletType] || colors.primary;
  };

  // Helper untuk get icon wallet
  const getWalletIcon = (walletType: Wallet['type']): string => {
    const icons: Record<Wallet['type'], string> = {
      'bank': 'card-outline',
      'e-wallet': 'wallet-outline',
      'cash': 'cash-outline',
      'other': 'ellipse-outline'
    };
    return icons[walletType] || 'ellipse-outline';
  };

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
      
      // Handle category - bisa berupa object atau ID string
      const categoryValue = transactionData.category;
      if (typeof categoryValue === 'object' && categoryValue !== null && categoryValue._id) {
        setCategory(categoryValue._id);
      } else if (typeof categoryValue === 'string') {
        setCategory(categoryValue);
      } else {
        setCategory("");
      }
      
      setDescription(transactionData.description || "");
      setType(transactionData.type || "expense");
      
      // Handle wallet - bisa berupa object atau ID string
      const walletValue = transactionData.wallet;
      if (typeof walletValue === 'object' && walletValue !== null && walletValue._id) {
        setWallet(walletValue._id);
      } else if (typeof walletValue === 'string') {
        setWallet(walletValue);
      } else {
        setWallet("");
      }
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
      const payload: any = {
        amount: parseInt(amount),
        category,
        type,
        description: description || undefined, // Opsional
      };

      // Tambahkan wallet jika dipilih (optional)
      if (wallet) {
        payload.wallet = wallet;
      } else {
        // Jika wallet dikosongkan, kirim null atau undefined
        payload.wallet = undefined;
      }

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
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Transaksi</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { backgroundColor: colors.background }]}>
        
        {/* 1. Toggle Income/Expense */}
        <View style={[styles.typeContainer, { backgroundColor: colors.chipBackground }]}>
          <TouchableOpacity 
            style={[styles.typeButton, type === 'expense' && { backgroundColor: colors.expense }]} 
            onPress={() => setType('expense')}
          >
            <Ionicons name="arrow-down-circle" size={20} color={type === 'expense' ? '#fff' : colors.expense} />
            <Text style={[styles.typeText, { color: colors.textSecondary }, type === 'expense' && styles.activeText]}>Pengeluaran</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.typeButton, type === 'income' && { backgroundColor: colors.income }]} 
            onPress={() => setType('income')}
          >
            <Ionicons name="arrow-up-circle" size={20} color={type === 'income' ? '#fff' : colors.income} />
            <Text style={[styles.typeText, { color: colors.textSecondary }, type === 'income' && styles.activeText]}>Pemasukan</Text>
          </TouchableOpacity>
        </View>

        {/* 2. Input Nominal */}
        <Text style={[styles.label, { color: colors.text }]}>Nominal (Rp)</Text>
        <TextInput
          style={[styles.amountInput, { backgroundColor: colors.inputBackground, color: colors.text, borderBottomColor: colors.border }]}
          placeholder="0"
          placeholderTextColor={colors.textTertiary}
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
        {amount ? <Text style={[styles.helperText, { color: colors.textSecondary }]}>{formatRupiah(parseInt(amount))}</Text> : null}

        {/* 3. Pilih Kategori */}
        <Text style={[styles.label, { color: colors.text }]}>Kategori</Text>
        {isLoadingCategories ? (
          <View style={styles.loadingCategories}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Memuat kategori...</Text>
          </View>
        ) : categories.length === 0 ? (
          <View style={styles.emptyCategories}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Belum ada kategori untuk {type === 'expense' ? 'pengeluaran' : 'pemasukan'}</Text>
            <TouchableOpacity 
              style={[styles.createCategoryButton, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}
              onPress={() => router.push('/(categories)/create')}
            >
              <Ionicons name="add-circle-outline" size={16} color={colors.primary} />
              <Text style={[styles.createCategoryText, { color: colors.primary }]}>Buat Kategori</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.categoryContainer}>
            {categories.map((cat) => {
              const isSelected = category === cat._id;
              const categoryColor = getCategoryColor(cat.color);
              
              return (
                <TouchableOpacity
                  key={cat._id}
                  style={[
                    styles.chip,
                    { backgroundColor: colors.chipBackground },
                    isSelected && { backgroundColor: categoryColor }
                  ]}
                  onPress={() => setCategory(cat._id)}
                >
                  <Text style={[
                    styles.chipText,
                    { color: colors.textSecondary },
                    isSelected && styles.activeChipText
                  ]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
            {/* Chip Tambah Kategori */}
            <TouchableOpacity
              style={[styles.addCategoryChip, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}
              onPress={() => router.push('/(categories)/create')}
            >
              <Ionicons name="add-circle-outline" size={16} color={colors.primary} />
              <Text style={[styles.addCategoryText, { color: colors.primary }]}>Tambah Kategori</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 4. Pilih Wallet (Opsional) */}
        <Text style={[styles.label, { color: colors.text }]}>Wallet (Opsional)</Text>
        {isLoadingWallets ? (
          <View style={styles.loadingCategories}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Memuat wallet...</Text>
          </View>
        ) : wallets.length === 0 ? (
          <View style={styles.emptyCategories}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Belum ada wallet aktif</Text>
            <TouchableOpacity 
              style={[styles.createCategoryButton, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}
              onPress={() => router.push('/(wallet)/add')}
            >
              <Ionicons name="add-circle-outline" size={16} color={colors.primary} />
              <Text style={[styles.createCategoryText, { color: colors.primary }]}>Buat Wallet</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.categoryContainer}>
            {/* Option untuk tidak memilih wallet */}
            <TouchableOpacity
              style={[
                styles.chip,
                { backgroundColor: colors.chipBackground },
                !wallet && { backgroundColor: colors.textTertiary }
              ]}
              onPress={() => setWallet('')}
            >
              <Text style={[
                styles.chipText,
                { color: colors.textSecondary },
                !wallet && styles.activeChipText
              ]}>
                Tidak Dipilih
              </Text>
            </TouchableOpacity>
            
            {wallets.map((w) => {
              const isSelected = wallet === w._id;
              const walletColor = getWalletColor(w.color, w.type);
              
              return (
                <TouchableOpacity
                  key={w._id}
                  style={[
                    styles.chip,
                    { backgroundColor: colors.chipBackground },
                    isSelected && { backgroundColor: walletColor }
                  ]}
                  onPress={() => setWallet(w._id)}
                >
                  <Ionicons 
                    name={getWalletIcon(w.type) as any} 
                    size={14} 
                    color={isSelected ? '#fff' : walletColor} 
                  />
                  <Text style={[
                    styles.chipText,
                    { color: colors.textSecondary },
                    isSelected && styles.activeChipText
                  ]}>
                    {w.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
            {/* Chip Tambah Wallet */}
            <TouchableOpacity
              style={[styles.addCategoryChip, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}
              onPress={() => router.push('/(wallet)/add')}
            >
              <Ionicons name="add-circle-outline" size={16} color={colors.primary} />
              <Text style={[styles.addCategoryText, { color: colors.primary }]}>Tambah Wallet</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 5. Deskripsi (Opsional) */}
        <Text style={[styles.label, { color: colors.text }]}>Catatan (Opsional)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }]}
          placeholder="Contoh: Nasi Padang Lauk Rendang"
          placeholderTextColor={colors.textTertiary}
          value={description}
          onChangeText={setDescription}
        />

      </ScrollView>

      {/* Footer Button */}
      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={handleSave} disabled={isLoading}>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  typeContainer: {
    flexDirection: 'row',
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
  },
  activeText: {
    color: '#fff',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 15,
  },
  amountInput: {
    fontSize: 32,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  helperText: {
    fontSize: 14,
    marginTop: 5,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  activeChip: {
    backgroundColor: '#2563eb',
  },
  chipText: {
    fontSize: 14,
  },
  activeChipText: {
    color: '#fff',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
  },
  saveButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingCategories: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
  },
  emptyCategories: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  createCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  createCategoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  addCategoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderStyle: 'dashed',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addCategoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

