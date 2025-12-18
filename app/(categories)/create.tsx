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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tambah Kategori</Text>
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

        {/* 2. Input Nama Kategori */}
        <Text style={styles.label}>Nama Kategori</Text>
        <TextInput
          style={styles.input}
          placeholder="Contoh: Makan, Transport, dll"
          value={name}
          onChangeText={setName}
        />

        {/* 3. Pilih Warna */}
        <Text style={styles.label}>Warna</Text>
        
        {/* Preview Warna */}
        <TouchableOpacity 
          style={styles.colorPreviewContainer}
          onPress={() => setShowColorPicker(true)}
        >
          <View style={[styles.colorPreview, { backgroundColor: color }]} />
          <Text style={styles.colorText}>{color}</Text>
          <Ionicons name="chevron-forward" size={20} color="#64748b" />
        </TouchableOpacity>

        {/* Quick Color Picker - Warna Predefined */}
        <View style={styles.predefinedColorsContainer}>
          <Text style={styles.subLabel}>Pilih Cepat:</Text>
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
        <Text style={styles.subLabel}>Atau Masukkan Hex Code:</Text>
        <TextInput
          style={styles.hexInput}
          placeholder="#FF0000"
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
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isLoading}>
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih Warna</Text>
              <TouchableOpacity onPress={() => setShowColorPicker(false)}>
                <Ionicons name="close" size={24} color="#1e293b" />
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
                style={styles.modalCancelButton}
                onPress={() => setShowColorPicker(false)}
              >
                <Text style={styles.modalCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalConfirmButton}
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
  subLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
    marginBottom: 8,
    marginTop: 10,
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
  colorPreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
    color: '#1e293b',
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
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#1e293b',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
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
    color: '#1e293b',
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
    backgroundColor: '#f1f5f9',
  },
  modalCancelText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600',
  },
  modalConfirmButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#2563eb',
  },
  modalConfirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

