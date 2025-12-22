// services/statusService.ts
import axios from 'axios';
import { getUrl } from './api';

// Tipe data untuk response status
export interface AppStatusData {
  isAvailable: boolean;
  isMaintenance: boolean;
  message: string;
  maintenanceStart?: string;
  maintenanceEnd?: string;
  notes?: string;
  lastUpdated: string;
}

export interface AppStatusResponse {
  success: boolean;
  data: AppStatusData;
}

// Buat instance axios khusus untuk status (tanpa interceptor token)
// Karena endpoint /status biasanya public dan gak perlu auth
const statusApi = axios.create({
  baseURL: getUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 detik timeout
});

/**
 * Fetch status aplikasi dari backend
 * @returns Promise<AppStatusData> - Data status aplikasi
 */
export async function fetchAppStatus(): Promise<AppStatusData> {
  try {
    const response = await statusApi.get<AppStatusResponse>('/status');
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    // Fallback kalau struktur response beda
    throw new Error('Format response tidak valid');
  } catch (error: any) {
    // Kalau error (network error, timeout, dll), anggap aplikasi available
    // Biar aplikasi tetap bisa jalan kalau backend lagi down
    console.warn('Gagal fetch status aplikasi:', error.message);
    
    // Return default status: aplikasi available
    return {
      isAvailable: true,
      isMaintenance: false,
      message: '',
      lastUpdated: new Date().toISOString(),
    };
  }
}

