import { useAuth } from '@/context/AuthContext'; // Import hook Auth kita
import api from '@/services/api'; // Import Axios config yang udah kita buat
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth(); // Ambil fungsi signIn dari Context
  
  // State buat form
  const [email, setEmail] = useState('user@example.com');
  const [password, setPassword] = useState('user123');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    // 1. Validasi Input
    if (!email || !password) {
      Alert.alert('Eits!', 'Email sama Password harus diisi dong.');
      return;
    }

    setIsLoading(true);

    try {
      // 2. Hit API Login Backend
      const response = await api.post('/auth/login', {
        email: email,
        password: password
      });

      // 3. Ambil Token dari Response
      // Structure response backend lo: { message, token, user }
      const { token } = response.data;

      // 4. Masukin ke AuthContext (Otomatis redirect ke Home)
      await signIn(token);

    } catch (error: any) {
      // 5. Handle Error
      const message = error.response?.data?.message || 'Login gagal, coba cek koneksi.';
      Alert.alert('Waduh Gagal Login', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Welcome Back! 👋</Text>
        <Text style={styles.subtitle}>Masuk buat lanjutin catet duit lo.</Text>

        {/* Form Input */}
        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="nama@email.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Rahasia negara..."
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {/* Tombol Login */}
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Link ke Register */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Belum punya akun? </Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text style={styles.link}>Daftar dulu</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    backgroundColor: '#2563eb', // Warna biru estetik
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
    color: '#2563eb',
    fontWeight: 'bold',
  },
});