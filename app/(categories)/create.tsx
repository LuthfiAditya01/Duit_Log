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

export default function CreateCategoryScreen() {
  const router = useRouter();
  const colors = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  // State Form
  const [name, setName] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [color, setColor] = useState('#FF0000');
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Warna predefined untuk quick pick
  const predefinedColors = [
    '#FF0000', '#FF6B00', '#FFD700', '#32CD32', '#00CED1',
    '#1E90FF', '#9370DB', '#FF1493', '#FF4500', '#00FF00',
    '#0000FF', '#8B00FF', '#FF69B4', '#00FA9A', '#FF6347'
  ];

  const handleSave = async () => {
    // Validasi
    if (!name.trim()) {
      Alert.alert('Data Kurang', 'Isi dulu nama kategorinya ya.');
      return;
    }

    // Validasi hex color
    const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexPattern.test(color)) {
      Alert.alert('Warna Tidak Valid', 'Pilih warna yang valid ya.');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        name: name.trim(),
        type,
        color
      };

      await api.post('/categories', payload);

      Alert.alert('Berhasil', 'Kategori berhasil dibuat!', [
        { text: 'OK', onPress: () => router.back() }
      ]);

    } catch (error: any) {
      const msg = error.response?.data?.message || 'Gagal membuat kategori.';
      Alert.alert('Error', msg);
    } finally {
      setIsLoading(false);
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Tambah Kategori</Text>
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

        {/* 2. Input Nama Kategori */}
        <Text style={[styles.label, { color: colors.text }]}>Nama Kategori</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }]}
          placeholder="Contoh: Makan, Transport, dll"
          placeholderTextColor={colors.textTertiary}
          value={name}
          onChangeText={setName}
        />

        {/* 3. Pilih Warna */}
        <Text style={[styles.label, { color: colors.text }]}>Warna</Text>
        
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
          placeholder="#FF0000"
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
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Simpan Kategori</Text>}
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

