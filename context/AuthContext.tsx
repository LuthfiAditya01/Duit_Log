import { useRouter, useSegments } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';

// Tipe data Auth
interface AuthProps {
  userToken: string | null;
  isLoading: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthProps | null>(null);

// Custom Hook biar gampang dipanggil
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments(); // Buat tau user lagi di halaman mana
  const [navigationReady, setNavigationReady] = useState(false);

  // 1. Cek kapan navigation siap
  useEffect(() => {
    // Tunggu sampai segments ada (root layout sudah mount)
    if (segments.length > 0) {
      setNavigationReady(true);
    }
  }, [segments]);

  // 2. Cek token pas aplikasi dibuka
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = await SecureStore.getItemAsync('user_token');
        if (token) {
          setUserToken(token);
          console.log("Token ditemukan:", token);
        }
      } catch (e) {
        console.error("Gagal ambil token", e);
      } finally {
        setIsLoading(false);
      }
    };
    checkLogin();
  }, []);

  // 3. Logic Proteksi Route (Navigation Guard)
  useEffect(() => {
    if (isLoading || !navigationReady) return;

    const inAuthGroup = segments[0] === '(auth)';
    
    if (!userToken && !inAuthGroup) {
      // Kalau gak ada token & bukan di halaman login -> Tendang ke Login
      router.replace('/(auth)/login');
    } else if (userToken && inAuthGroup) {
      // Kalau ada token & lagi di halaman login -> Tendang ke Home
      router.replace('/(tabs)');
    }
  }, [userToken, isLoading, navigationReady]);

  // 4. Fungsi Login
  const signIn = async (token: string) => {
    await SecureStore.setItemAsync('user_token', token);
    console.log("Token disimpan:", token);
    setUserToken(token);
    // Router redirect bakal dihandle useEffect di atas
  };

  // 5. Fungsi Logout
  const signOut = async () => {
    await SecureStore.deleteItemAsync('user_token');
    setUserToken(null);
    // Router redirect bakal dihandle useEffect di atas
  };

  return (
    <AuthContext.Provider value={{ userToken, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}   