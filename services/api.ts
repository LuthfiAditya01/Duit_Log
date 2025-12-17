// services/api.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Ganti sama IP Laptop lo (kalo emulator) atau URL Vercel (kalo udah deploy)
// PENTING: Jangan pake 'localhost' kalo run di HP fisik! Pake IP LAN (192.168.x.x)
const API_URL = 'https://duit-log-backend.vercel.app/api'; 
// const API_URL = 'http://192.168.1.14:3000/api'; 

export const getUrl = () => {
  return API_URL;
}

// Bikin instance axios tanpa token dulu
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// INTERCEPTOR: "Satpam" yang nyegat setiap request keluar
// Tugasnya: Nempelin Token ke header otomatis setiap request
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('user_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;