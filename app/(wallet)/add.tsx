import { useTheme } from '@/context/ThemeContext';
import api from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import ColorPickerWheel from 'react-native-color-picker-wheel';

export default function AddWalletScreen() {
  const router = useRouter();
  const colors = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  // State Form
  const [name, setName] = useState('');
  const [type, setType] = useState<'bank' | 'e-wallet' | 'cash' | 'other'>('bank');
  const [color, setColor] = useState('#0066CC');
  const [balance, setBalance] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Warna predefined untuk quick pick
  const predefinedColors = [
    '#0066CC', '#00A86B', '#28A745', '#6C757D', '#FF0000',
    '#FF6B00', '#FFD700', '#32CD32', '#00CED1', '#1E90FF',
    '#9370DB', '#FF1493', '#FF4500', '#00FF00', '#0000FF'
  ];

  const handleSave = async () => {
    // Validasi
    if (!name.trim()) {
      Alert.alert('Data Kurang', 'Isi dulu nama walletnya ya.');
      return;
    }

    // Validasi balance tidak boleh negatif
    const balanceNum = balance ? parseFloat(balance) : 0;
    if (balanceNum < 0) {
      Alert.alert('Saldo Tidak Valid', 'Saldo wallet tidak boleh negatif.');
      return;
    }

    // Validasi hex color
    const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (color && !hexPattern.test(color)) {
      Alert.alert('Warna Tidak Valid', 'Pilih warna yang valid ya.');
      return;
    }

    setIsLoading(true);

    try {
      const payload: any = {
        name: name.trim(),
        type,
      };

      // Tambahkan color jika ada
      if (color) {
        payload.color = color;
      }

      // Tambahkan balance jika ada
      if (balance) {
        payload.balance = balanceNum;
      }

      await api.post('/wallet', payload);

      Alert.alert('Berhasil', 'Wallet berhasil dibuat!', [
        { text: 'OK', onPress: () => router.back() }
      ]);

    } catch (error: any) {
      const msg = error.response?.data?.message || 'Gagal membuat wallet.';
      
      // Error handling khusus
      if (error.response?.status === 409) {
        Alert.alert('Nama Duplikat', msg);
      } else if (error.response?.status === 400) {
        Alert.alert('Data Tidak Valid', msg);
      } else if (error.response?.status === 401) {
        Alert.alert('Akses Ditolak', 'Login dulu bos.');
      } else {
        Alert.alert('Error', msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Helper untuk get icon berdasarkan type
  const getWalletIcon = (walletType: typeof type): string => {
    const icons: Record<typeof type, string> = {
      'bank': 'card-outline',
      'e-wallet': 'wallet-outline',
      'cash': 'cash-outline',
      'other': 'ellipse-outline'
    };
    return icons[walletType] || 'ellipse-outline';
  };

  // Helper untuk get label type
  const getTypeLabel = (walletType: typeof type): string => {
    const labels: Record<typeof type, string> = {
      'bank': 'Bank',
      'e-wallet': 'E-Wallet',
      'cash': 'Cash',
      'other': 'Lainnya'
    };
    return labels[walletType] || 'Lainnya';
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Tambah Wallet</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { backgroundColor: colors.background }]}>
        
        {/* 1. Pilih Type Wallet */}
        <Text style={[styles.label, { color: colors.text }]}>Jenis Wallet</Text>
        <View style={[styles.typeContainer, { backgroundColor: colors.chipBackground }]}>
          {(['bank', 'e-wallet', 'cash', 'other'] as const).map((walletType) => (
            <TouchableOpacity 
              key={walletType}
              style={[
                styles.typeButton, 
                type === walletType && { backgroundColor: colors.primary }
              ]} 
              onPress={() => setType(walletType)}
            >
              <Ionicons 
                name={getWalletIcon(walletType) as any} 
                size={18} 
                color={type === walletType ? '#fff' : colors.textSecondary} 
              />
              <Text style={[
                styles.typeText, 
                { color: colors.textSecondary }, 
                type === walletType && styles.activeText
              ]}>
                {getTypeLabel(walletType)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 2. Input Nama Wallet */}
        <Text style={[styles.label, { color: colors.text }]}>Nama Wallet</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }]}
          placeholder="Contoh: BCA, GoPay, Cash, dll"
          placeholderTextColor={colors.textTertiary}
          value={name}
          onChangeText={setName}
        />

        {/* 3. Input Saldo Awal (Opsional) */}
        <Text style={[styles.label, { color: colors.text }]}>Saldo Awal (Opsional)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }]}
          placeholder="0"
          placeholderTextColor={colors.textTertiary}
          keyboardType="numeric"
          value={balance}
          onChangeText={setBalance}
        />
        <Text style={[styles.helperText, { color: colors.textTertiary }]}>
          Kosongkan jika saldo awal 0
        </Text>

        {/* 4. Pilih Warna */}
        <Text style={[styles.label, { color: colors.text }]}>Warna (Opsional)</Text>
        
        {/* Preview Warna */}
        <TouchableOpacity 
          style={[styles.colorPreviewContainer, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}
          onPress={() => setShowColorPicker(true)}
        >
          <View style={[styles.colorPreview, { backgroundColor: color }]} />
          <Text style={[styles.colorText, { color: colors.text }]}>{color}</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Quick Color Picker - Warna Predefined */}
        <View style={styles.predefinedColorsContainer}>
          <Text style={[styles.subLabel, { color: colors.textSecondary }]}>Pilih Cepat:</Text>
          <View style={styles.predefinedColorsGrid}>
            {predefinedColors.map((col) => (
              <TouchableOpacity
                key={col}
                style={[
                  styles.colorDot,
                  { backgroundColor: col },
                  color === col && styles.colorDotSelected
                ]}
                onPress={() => setColor(col)}
              >
                {color === col && (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Input Hex Manual (Opsional) */}
        <Text style={[styles.subLabel, { color: colors.textSecondary }]}>Atau Masukkan Hex Code:</Text>
        <TextInput
          style={[styles.hexInput, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }]}
          placeholder="#0066CC"
          placeholderTextColor={colors.textTertiary}
          value={color}
          onChangeText={(text) => {
            // Auto tambahin # kalau belum ada
            if (text && !text.startsWith('#')) {
              setColor('#' + text);
            } else {
              setColor(text);
            }
          }}
          maxLength={7}
        />

      </ScrollView>

      {/* Footer Button */}
      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={handleSave} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Simpan Wallet</Text>}
        </TouchableOpacity>
      </View>

      {/* Modal Color Picker */}
      <Modal
        visible={showColorPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowColorPicker(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.modalOverlay }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.modalBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Pilih Warna</Text>
              <TouchableOpacity onPress={() => setShowColorPicker(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.colorPickerContainer}>
              <ColorPickerWheel
                initialColor={color}
                onColorChange={(col: string) => setColor(col)}
                style={styles.colorPickerWheel}
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalCancelButton, { backgroundColor: colors.chipBackground }]}
                onPress={() => setShowColorPicker(false)}
              >
                <Text style={[styles.modalCancelText, { color: colors.text }]}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalConfirmButton, { backgroundColor: colors.primary }]}
                onPress={() => setShowColorPicker(false)}
              >
                <Text style={styles.modalConfirmText}>Pilih</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    flexWrap: 'wrap',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    gap: 4,
  },
  typeButton: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 6,
  },
  typeText: {
    fontWeight: '600',
    fontSize: 14,
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
  subLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
  },
  helperText: {
    fontSize: 12,
    marginTop: 5,
  },
  colorPreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
  },
  colorPreview: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  colorText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  predefinedColorsContainer: {
    marginBottom: 15,
  },
  predefinedColorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  colorDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorDotSelected: {
    borderColor: '#2563eb',
    borderWidth: 3,
  },
  hexInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  colorPickerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  colorPickerWheel: {
    width: 300,
    height: 300,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalCancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalConfirmButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

