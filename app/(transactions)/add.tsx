import { useTheme } from '@/context/ThemeContext';
import api from '@/services/api';
import { formatRupiah } from '@/utils/formatCurrency';
import { syncBillReminders } from '@/utils/syncReminders'; // Opsional, best practice aja
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
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

export default function AddTransactionScreen() {
  const router = useRouter();
  const colors = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingWallets, setIsLoadingWallets] = useState(true);

  // State Form
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [wallet, setWallet] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [date, setDate] = useState(new Date());
  
  // State buat DatePicker
  const [showDatePicker, setShowDatePicker] = useState(false);

  // State untuk kategori dari API
  const [categories, setCategories] = useState<Category[]>([]);
  
  // State untuk wallet dari API
  const [wallets, setWallets] = useState<Wallet[]>([]);

  // Fetch kategori dan wallet dari API (initial load)
  useEffect(() => {
    fetchCategories();
    fetchWallets();
  }, []);

  // Re-fetch kategori saat type berubah
  useEffect(() => {
    fetchCategories();
    setCategory(''); // Reset category selection saat type berubah
  }, [type]);

  // Refresh data saat kembali ke screen ini
  useFocusEffect(
    useCallback(() => {
      fetchWallets(); // Refresh wallets saat kembali ke screen
      fetchCategories();
    }, [])
  );

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      const allCategories: Category[] = response.data.data || [];
      
      // Filter kategori berdasarkan type dan isVisible
      const filteredCategories = allCategories.filter(
        (cat) => cat.type === type && cat.isVisible === true
      );
      
      setCategories(filteredCategories);
    } catch (error) {
      console.error('Gagal fetch kategori:', error);
      Alert.alert('Error', 'Gagal memuat kategori. Coba lagi nanti.');
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

  const handleSave = async () => {
    // 1. Validasi
    if (!amount || !category || !wallet) {
      Alert.alert('Data Kurang', 'Coba dicek dulu nominal, kategori, sama walletnya');
      return;
    }

    setIsLoading(true);

    try {
      // 2. Kirim ke Backend
      // Convert amount string "15000" jadi number 15000
      const payload: any = {
        amount: parseInt(amount),
        category,
        description,
        type,
        date: date.toISOString(), // Backend nerima format ISO string
      };

      // Tambahkan wallet jika dipilih (optional)
      if (wallet) {
        payload.wallet = wallet;
      }

      await api.post('/transactions', payload);

    //   3. Sync Reminder (Opsional, siapa tau logic backend berubah)
      await syncBillReminders(); 

      // 4. Sukses & Balik
      Alert.alert('Berhasil', 'Catatan duit berhasil disimpen!', [
        { text: 'OK', onPress: () => router.back() } // Balik ke Home
      ]);

    } catch (error: any) {
      const msg = error.response?.data?.message || 'Gagal nyimpen data.';
      Alert.alert('Error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Logic ganti tanggal
  const onChangeDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios'); // Di iOS biarin tetep muncul
    setDate(currentDate);
    
    // Di Android harus di-hide manual setelah milih
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Tambah Transaksi</Text>
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
          style={[styles.amountInput, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }]}
          placeholder="0"
          placeholderTextColor={colors.textTertiary}
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
        {/* Helper text buat liat format rupiah pas ngetik */}
        {amount ? <Text style={[styles.helperText, { color: colors.textSecondary }]}>{formatRupiah(parseInt(amount))}</Text> : null}

        {/* 3. Input Tanggal */}
        <Text style={[styles.label, { color: colors.text }]}>Tanggal</Text>
        <TouchableOpacity style={[styles.dateButton, { backgroundColor: colors.inputBackground, borderColor: colors.border }]} onPress={() => setShowDatePicker(true)}>
          <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
          <Text style={[styles.dateText, { color: colors.text }]}>{date.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onChangeDate}
            maximumDate={new Date()} // Gak boleh catet masa depan (opsional)
          />
        )}

        {/* 4. Pilih Kategori */}
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

        {/* 5. Pilih Wallet*/}
        <Text style={[styles.label, { color: colors.text }]}>Wallet</Text>
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
            {/* <TouchableOpacity
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
            </TouchableOpacity> */}
            
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

        {/* 6. Deskripsi (Opsional) */}
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
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Simpan Transaksi</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  dateText: {
    fontSize: 16,
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