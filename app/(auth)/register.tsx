import api from '@/services/api';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView // Pake ScrollView biar aman kalo keyboard muncul
    ,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function RegisterScreen() {
  const router = useRouter();
  
  // State form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    // 1. Validasi
    if (!name || !email || !password) {
      Alert.alert('Data Kurang', 'Lengkapi dulu semua datanya dong.');
      return;
    }

    setIsLoading(true);

    try {
      // 2. Hit API Register
      // Ingat backend kita return { message, user }, gak ada token.
      await api.post('/auth/register', {
        name,
        email,
        password
      });

      // 3. Sukses! Arahkan ke Login
      Alert.alert(
        'Mantap! 🎉', 
        'Akun berhasil dibuat. Silakan login ya.',
        [
          { 
            text: 'Oke Siap', 
            onPress: () => router.replace('/(auth)/login') // Manual Navigation (Logic View)
          }
        ]
      );

    } catch (error: any) {
      // 4. Handle Error (Email duplikat, dll)
      const message = error.response?.data?.message || 'Gagal daftar, coba lagi nanti.';
      Alert.alert('Waduh Gagal', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Buat Akun Baru 🚀</Text>
          <Text style={styles.subtitle}>Mulai atur keuangan lo biar gak boncos.</Text>

          {/* Form Input */}
          <View style={styles.form}>
            
            {/* Input Nama */}
            <Text style={styles.label}>Nama Lengkap</Text>
            <TextInput
              style={styles.input}
              placeholder="Budi Santoso"
              value={name}
              onChangeText={setName}
            />

            {/* Input Email */}
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="nama@email.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            {/* Input Password */}
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Minimal 6 karakter"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {/* Tombol Register */}
            <TouchableOpacity 
              style={styles.button} 
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign Up Sekarang</Text>
              )}
            </TouchableOpacity>

            {/* Link ke Login */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Udah punya akun? </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.link}>Login aja</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 30,
  },
  form: {
    gap: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f8fafc',
  },
  button: {
    backgroundColor: '#10b981', // Gw ganti warna ijo biar beda sama Login
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#64748b',
  },
  link: {
    color: '#10b981', // Warna ijo juga
    fontWeight: 'bold',
  },
});