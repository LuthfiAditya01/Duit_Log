import { useTheme } from '@/context/ThemeContext';
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
  const colors = useTheme();
  
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
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>Buat Akun Baru 🚀</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Mulai atur keuangan lo biar gak boncos.</Text>

          {/* Form Input */}
          <View style={styles.form}>
            
            {/* Input Nama */}
            <Text style={[styles.label, { color: colors.text }]}>Nama Lengkap</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }]}
              placeholder="Budi Santoso"
              placeholderTextColor={colors.textTertiary}
              value={name}
              onChangeText={setName}
            />

            {/* Input Email */}
            <Text style={[styles.label, { color: colors.text }]}>Email</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }]}
              placeholder="nama@email.com"
              placeholderTextColor={colors.textTertiary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            {/* Input Password */}
            <Text style={[styles.label, { color: colors.text }]}>Password</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }]}
              placeholder="Minimal 6 karakter"
              placeholderTextColor={colors.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {/* Tombol Register */}
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: colors.success }]} 
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
              <Text style={[styles.footerText, { color: colors.textSecondary }]}>Udah punya akun? </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text style={[styles.link, { color: colors.success }]}>Login aja</Text>
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
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
  },
  form: {
    gap: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
  },
  button: {
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
    fontSize: 14,
  },
  link: {
    fontWeight: 'bold',
  },
});