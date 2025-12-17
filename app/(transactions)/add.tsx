import api from '@/services/api';
import { formatRupiah } from '@/utils/formatCurrency';
import { syncBillReminders } from '@/utils/syncReminders'; // Opsional, best practice aja
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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

export default function AddTransactionScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // State Form
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [date, setDate] = useState(new Date());
  
  // State buat DatePicker
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Daftar Kategori Umum (Bisa ditambahin)
  const categories = [
    'Makan', 'Transport', 'Belanja', 'Tagihan', 
    'Hiburan', 'Kesehatan', 'Gaji', 'Bonus', 'Lainnya'
  ];

  const handleSave = async () => {
    // 1. Validasi
    if (!amount || !category) {
      Alert.alert('Data Kurang', 'Isi dulu nominal sama kategorinya bos.');
      return;
    }

    setIsLoading(true);

    try {
      // 2. Kirim ke Backend
      // Convert amount string "15000" jadi number 15000
      const payload = {
        amount: parseInt(amount),
        category,
        description,
        type,
        date: date.toISOString(), // Backend nerima format ISO string
      };

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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tambah Transaksi</Text>
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
        {/* Helper text buat liat format rupiah pas ngetik */}
        {amount ? <Text style={styles.helperText}>{formatRupiah(parseInt(amount))}</Text> : null}

        {/* 3. Input Tanggal */}
        <Text style={styles.label}>Tanggal</Text>
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
          <Ionicons name="calendar-outline" size={20} color="#64748b" />
          <Text style={styles.dateText}>{date.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
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

        {/* 5. Deskripsi (Opsional) */}
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
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  dateText: {
    fontSize: 16,
    color: '#1e293b',
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