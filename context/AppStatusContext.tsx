// context/AppStatusContext.tsx
import { AppStatusData, fetchAppStatus } from '@/services/statusService';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

interface AppStatusContextProps {
  status: AppStatusData | null;
  isLoading: boolean;
  isAvailable: boolean;
  isMaintenance: boolean;
  refreshStatus: () => Promise<void>;
}

const AppStatusContext = createContext<AppStatusContextProps | null>(null);

// Custom Hook untuk akses status aplikasi
export function useAppStatus() {
  const context = useContext(AppStatusContext);
  if (!context) {
    throw new Error('useAppStatus must be used within AppStatusProvider');
  }
  return context;
}

interface AppStatusProviderProps {
  children: React.ReactNode;
}

export function AppStatusProvider({ children }: AppStatusProviderProps) {
  const [status, setStatus] = useState<AppStatusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const previousStatusRef = useRef<AppStatusData | null>(null);

  // Log helper untuk format timestamp
  const logWithTimestamp = (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    if (data) {
      console.log(`[AppStatus] ${timestamp} - ${message}`, data);
    } else {
      console.log(`[AppStatus] ${timestamp} - ${message}`);
    }
  };

  // Fungsi untuk fetch status dari backend
  const refreshStatus = useCallback(async () => {
    const startTime = Date.now();
    logWithTimestamp('🔄 Memulai fetch status aplikasi dari backend...');
    
    try {
      setIsLoading(true);
      const appStatus = await fetchAppStatus();
      const duration = Date.now() - startTime;
      
      logWithTimestamp('✅ Fetch status berhasil', {
        duration: `${duration}ms`,
        status: {
          isAvailable: appStatus.isAvailable,
          isMaintenance: appStatus.isMaintenance,
          message: appStatus.message,
          maintenanceStart: appStatus.maintenanceStart,
          maintenanceEnd: appStatus.maintenanceEnd,
          notes: appStatus.notes,
          lastUpdated: appStatus.lastUpdated,
        }
      });

      // Log perubahan status jika ada (pakai ref untuk compare)
      const previousStatus = previousStatusRef.current;
      if (previousStatus) {
        const statusChanged = 
          previousStatus.isAvailable !== appStatus.isAvailable ||
          previousStatus.isMaintenance !== appStatus.isMaintenance;
        
        if (statusChanged) {
          logWithTimestamp('⚠️ Status aplikasi berubah!', {
            sebelumnya: {
              isAvailable: previousStatus.isAvailable,
              isMaintenance: previousStatus.isMaintenance,
            },
            sekarang: {
              isAvailable: appStatus.isAvailable,
              isMaintenance: appStatus.isMaintenance,
            }
          });
        }
      }

      // Update ref dan state
      previousStatusRef.current = appStatus;
      setStatus(appStatus);
      
      // Log kesimpulan status
      if (!appStatus.isAvailable || appStatus.isMaintenance) {
        logWithTimestamp('🚫 Aplikasi TIDAK TERSEDIA - MaintenanceScreen akan ditampilkan');
      } else {
        logWithTimestamp('✅ Aplikasi TERSEDIA - Aplikasi normal akan ditampilkan');
      }
      
    } catch (error: any) {
      const duration = Date.now() - startTime;
      logWithTimestamp('❌ Error fetching app status', {
        duration: `${duration}ms`,
        error: {
          message: error?.message || 'Unknown error',
          response: error?.response?.data || null,
          status: error?.response?.status || null,
          code: error?.code || null,
        }
      });
      
      // Kalau error, set default status (available)
      const fallbackStatus = {
        isAvailable: true,
        isMaintenance: false,
        message: '',
        lastUpdated: new Date().toISOString(),
      };
      
      logWithTimestamp('🔄 Menggunakan fallback status (available)', fallbackStatus);
      previousStatusRef.current = fallbackStatus;
      setStatus(fallbackStatus);
    } finally {
      setIsLoading(false);
      logWithTimestamp('🏁 Fetch status selesai, isLoading: false');
    }
  }, []);

  // Fetch status saat aplikasi pertama kali dibuka
  useEffect(() => {
    logWithTimestamp('🚀 AppStatusProvider mounted - Memulai fetch status pertama kali');
    refreshStatus();
    
    return () => {
      logWithTimestamp('🔌 AppStatusProvider unmounted');
    };
  }, [refreshStatus]);

  // Auto-refresh status setiap 30 detik (opsional, bisa diubah)
  useEffect(() => {
    if (!status) {
      logWithTimestamp('⏳ Status belum ada, menunggu status pertama kali...');
      return;
    }

    if (status.isAvailable && !status.isMaintenance) {
      // Kalau aplikasi available, refresh setiap 5 menit
      const intervalMs = 5 * 60 * 1000; // 5 menit
      logWithTimestamp(`⏰ Setup auto-refresh interval: ${intervalMs / 1000} detik (5 menit) - Aplikasi available`);
      
      const interval = setInterval(() => {
        logWithTimestamp('⏰ Auto-refresh triggered (interval 5 menit)');
        refreshStatus();
      }, intervalMs);

      return () => {
        logWithTimestamp('🛑 Auto-refresh interval dihentikan (aplikasi available)');
        clearInterval(interval);
      };
    } else {
      // Kalau lagi maintenance atau tidak available, refresh lebih sering (30 detik)
      const intervalMs = 30 * 1000; // 30 detik
      logWithTimestamp(`⏰ Setup auto-refresh interval: ${intervalMs / 1000} detik (30 detik) - Aplikasi maintenance/tidak available`, {
        isAvailable: status.isAvailable,
        isMaintenance: status.isMaintenance,
      });
      
      const interval = setInterval(() => {
        logWithTimestamp('⏰ Auto-refresh triggered (interval 30 detik) - Cek cepat status maintenance');
        refreshStatus();
      }, intervalMs);

      return () => {
        logWithTimestamp('🛑 Auto-refresh interval dihentikan (maintenance/tidak available)');
        clearInterval(interval);
      };
    }
  }, [status, refreshStatus]);

  const isAvailable = status?.isAvailable ?? true;
  const isMaintenance = status?.isMaintenance ?? false;

  // Log setiap kali computed values berubah
  useEffect(() => {
    logWithTimestamp('📊 Status computed values updated', {
      isAvailable,
      isMaintenance,
      isLoading,
      hasStatus: !!status,
    });
  }, [isAvailable, isMaintenance, isLoading, status]);

  return (
    <AppStatusContext.Provider
      value={{
        status,
        isLoading,
        isAvailable,
        isMaintenance,
        refreshStatus,
      }}
    >
      {children}
    </AppStatusContext.Provider>
  );
}

