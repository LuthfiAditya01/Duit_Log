// components/MaintenanceScreen.tsx
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppStatusData } from '@/services/statusService';

interface MaintenanceScreenProps {
  status: AppStatusData;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function MaintenanceScreen({ status, onRefresh, isRefreshing = false }: MaintenanceScreenProps) {
  const colors = useTheme();

  // Format tanggal untuk ditampilkan
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  // Hitung waktu tersisa maintenance (jika ada maintenanceEnd)
  const getTimeRemaining = () => {
    if (!status.maintenanceEnd) return null;
    
    try {
      const endTime = new Date(status.maintenanceEnd).getTime();
      const now = new Date().getTime();
      const diff = endTime - now;
      
      if (diff <= 0) return null; // Maintenance sudah selesai
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 0) {
        return `${hours} jam ${minutes} menit`;
      }
      return `${minutes} menit`;
    } catch {
      return null;
    }
  };

  const timeRemaining = getTimeRemaining();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          ) : undefined
        }
      >
        {/* Icon Maintenance */}
        <View style={[styles.iconContainer, { backgroundColor: colors.card + '40' }]}>
          <Ionicons name="construct-outline" size={80} color={colors.primary} />
        </View>

        {/* Judul */}
        <Text style={[styles.title, { color: colors.text }]}>
          {status.isMaintenance ? 'Aplikasi Sedang Maintenance' : 'Aplikasi Tidak Tersedia'}
        </Text>

        {/* Pesan */}
        {status.message && (
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            {status.message}
          </Text>
        )}

        {/* Info Maintenance */}
        {status.isMaintenance && (
          <View style={[styles.infoContainer, { backgroundColor: colors.card }]}>
            {/* Waktu Mulai */}
            {status.maintenanceStart && (
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={20} color={colors.primary} />
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                    Waktu Mulai
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {formatDate(status.maintenanceStart)}
                  </Text>
                </View>
              </View>
            )}

            {/* Waktu Selesai */}
            {status.maintenanceEnd && (
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={20} color={colors.primary} />
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                    Perkiraan Selesai
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {formatDate(status.maintenanceEnd)}
                  </Text>
                </View>
              </View>
            )}

            {/* Waktu Tersisa */}
            {timeRemaining && (
              <View style={[styles.timeRemainingContainer, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="hourglass-outline" size={18} color={colors.primary} />
                <Text style={[styles.timeRemainingText, { color: colors.primary }]}>
                  Perkiraan waktu tersisa: {timeRemaining}
                </Text>
              </View>
            )}

            {/* Notes */}
            {status.notes && (
              <View style={[styles.notesContainer, { borderTopColor: colors.textSecondary + '30' }]}>
                <Text style={[styles.notesLabel, { color: colors.textSecondary }]}>
                  Catatan:
                </Text>
                <Text style={[styles.notesText, { color: colors.text }]}>
                  {status.notes}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Last Updated */}
        {status.lastUpdated && (
          <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>
            Terakhir diperbarui: {formatDate(status.lastUpdated)}
          </Text>
        )}

        {/* Loading Indicator */}
        {isRefreshing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Memeriksa status...
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  infoContainer: {
    width: '100%',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  timeRemainingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  timeRemainingText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  notesContainer: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  notesLabel: {
    fontSize: 12,
    marginBottom: 8,
    fontWeight: '600',
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },
  lastUpdated: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
  },
  loadingText: {
    fontSize: 14,
    marginLeft: 8,
  },
});

