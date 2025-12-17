import api, { getUrl } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
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

export default function EditProfileScreen() {
  const router = useRouter();
  
  // State buat form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Fetch data user pas pertama kali buka
  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  const fetchUserData = async () => {
    try {
      const response = await api.get('/auth/me');
      const userData = response.data.data;
      setName(userData.name || '');
      setEmail(userData.email || '');
    } catch (error: any) {
      console.error('Gagal ambil data user:', error);
      Alert.alert('Error', 'Gagal memuat data profil');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSave = async () => {
    // 1. Validasi Input
    if (!name.trim() || !email.trim()) {
      Alert.alert('Data Kurang', 'Nama dan Email harus diisi dong.');
      return;
    }

    if (!password) {
      Alert.alert('Password Diperlukan', 'Masukkan password untuk konfirmasi perubahan.');
      return;
    }

    // Validasi format email sederhana
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Email Tidak Valid', 'Format email lo kurang tepat nih.');
      return;
    }

    setIsLoading(true);

    try {
      // 2. Kirim ke Backend dengan password untuk konfirmasi
      // Asumsi endpoint: PUT /auth/profile atau PUT /auth/me
      // Payload: { name, email, password }

      console.log(`Kirim ke URL : ${getUrl()}`)

      const payload = {
        name: name.trim(),
        email: email.trim(),
        password: password
      };

      console.log(`Payload yang akan dikirim : ${JSON.stringify(payload)}`);
      const response = await api.put('/profile', payload);

      console.log(`Hasil Payload : ${JSON.stringify(response)}`);

      // 3. Sukses! Balik ke profile
      Alert.alert(
        'Berhasil! 🎉',
        'Profil berhasil diupdate.',
        [
          {
            text: 'OK',
            onPress: () => {
              router.back();
            }
          }
        ]
      );

    } catch (error: any) {
      // 4. Handle Error
      const message = error.response?.data?.message || 'Gagal update profil, coba lagi nanti.';
      
      // Handle error khusus untuk password salah
      if (error.response?.status === 401 || error.response?.status === 403) {
        Alert.alert('Password Salah', 'Password yang lo masukkan tidak benar. Coba lagi ya.');
      } else if (error.response?.status === 409) {
        Alert.alert('Email Sudah Dipakai', 'Email ini sudah digunakan oleh akun lain.');
      } else {
        Alert.alert('Gagal Update', message);
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
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text style={styles.title}>Edit Profil</Text>
          <View style={{ width: 40 }} /> {/* Spacer buat balance */}
        </View>

        {/* INFO BOX */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#2563eb" />
          <Text style={styles.infoText}>
            Masukkan password untuk konfirmasi perubahan profil
          </Text>
        </View>

        {/* FORM */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nama</Text>
            <TextInput
              style={styles.input}
              placeholder="Masukkan nama lo"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="nama@email.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password Konfirmasi</Text>
            <TextInput
              style={styles.input}
              placeholder="Masukkan password untuk konfirmasi"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <Text style={styles.hintText}>
              Password diperlukan untuk memastikan ini benar-benar lo yang update profil
            </Text>
          </View>

          {/* TOMBOL SAVE */}
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Simpan Perubahan</Text>
            )}
          </TouchableOpacity>

          {/* TOMBOL BATAL */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>Batal</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 25,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#1e293b',
  },
  hintText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: -4,
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cancelButtonText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600',
  },
});

