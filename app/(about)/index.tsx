import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function AboutScreen() {
  const router = useRouter();

  const handleOpenLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.log("Tidak bisa buka link:", url);
      }
    } catch (error) {
      console.error("Error buka link:", error);
    }
  };

  return (
    <ScrollView 
      style={styles.container}
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
        <Text style={styles.title}>Tentang Aplikasi</Text>
        <View style={{ width: 40 }} /> {/* Spacer buat balance */}
      </View>

      {/* APP ICON & INFO */}
      <View style={styles.appInfoSection}>
        <View style={styles.appIconContainer}>
          <Ionicons name="wallet" size={64} color="#2563eb" />
        </View>
        <Text style={styles.appName}>Duit Log</Text>
        <Text style={styles.appVersion}>Versi 1.0.0 (Beta)</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Aplikasi Manajemen Keuangan 💰</Text>
        </View>
      </View>

      {/* DESKRIPSI */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tentang</Text>
        <View style={styles.card}>
          <Text style={styles.description}>
            Duit Log adalah aplikasi manajemen keuangan pribadi yang membantu lo 
            untuk mencatat, melacak, dan mengelola pengeluaran serta pemasukan dengan mudah. 
            Dengan fitur yang lengkap dan antarmuka yang user-friendly, lo bisa lebih 
            bijak dalam mengelola keuangan sehari-hari.
          </Text>
        </View>
      </View>

      {/* FITUR UTAMA */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fitur Utama</Text>
        <View style={styles.card}>
          <FeatureItem 
            icon="cash-outline" 
            title="Catat Transaksi" 
            description="Catat semua pemasukan dan pengeluaran dengan mudah"
          />
          <View style={styles.divider} />
          <FeatureItem 
            icon="calendar-outline" 
            title="Pengingat Tagihan" 
            description="Atur pengingat untuk tagihan bulanan atau tahunan"
          />
          <View style={styles.divider} />
          <FeatureItem 
            icon="stats-chart-outline" 
            title="Statistik & Grafik" 
            description="Lihat ringkasan keuangan dengan grafik yang mudah dipahami"
          />
          <View style={styles.divider} />
          <FeatureItem 
            icon="shield-checkmark-outline" 
            title="Keamanan Data" 
            description="Data lo tersimpan dengan aman dan terenkripsi"
          />
        </View>
      </View>

      {/* INFORMASI TEKNIS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informasi Teknis</Text>
        <View style={styles.card}>
          <InfoRow label="Platform" value={Platform.OS === 'ios' ? 'iOS' : 'Android'} />
          <View style={styles.divider} />
          <InfoRow label="Build" value="1.0.0-beta" />
          <View style={styles.divider} />
          <InfoRow label="Status" value="Beta Testing" />
        </View>
      </View>

      {/* KONTAK & SUPPORT */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kontak & Dukungan</Text>
        <View style={styles.card}>
          <TouchableOpacity 
            style={styles.linkItem}
            onPress={() => handleOpenLink('mailto:luthfi2004aditya@gmail.com')}
          >
            <Ionicons name="mail-outline" size={20} color="#2563eb" />
            <Text style={styles.linkText}>luthfi2004aditya@gmail.com</Text>
            <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity 
            style={styles.linkItem}
            onPress={() => handleOpenLink('https://www.instagram.com/aditeverything_')}
          >
            <Ionicons name="logo-instagram" size={20} color="#2563eb" />
            <Text style={styles.linkText}>@aditeverything_</Text>
            <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity 
            style={styles.linkItem}
            onPress={() => handleOpenLink('https://github.com/LuthfiAditya01/Duit_Log')}
          >
            <Ionicons name="logo-github" size={20} color="#2563eb" />
            <Text style={styles.linkText}>GitHub Repository</Text>
            <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
          </TouchableOpacity>
        </View>
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Dibuat dengan ❤️ untuk membantu lo mengelola keuangan
        </Text>
        <Text style={styles.copyrightText}>
          © 2024 Duit Log. All rights reserved.
        </Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// Komponen Feature Item
const FeatureItem = ({ icon, title, description }: { icon: string; title: string; description: string }) => (
  <View style={styles.featureItem}>
    <View style={styles.featureIcon}>
      <Ionicons name={icon as any} size={24} color="#2563eb" />
    </View>
    <View style={styles.featureContent}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </View>
);

// Komponen Info Row
const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
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
  appInfoSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  appIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#2563eb',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 5,
  },
  appVersion: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 15,
  },
  badge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
    marginLeft: 5,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: '#475569',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 15,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 15,
    marginLeft: 63, // Biar sejajar dengan icon
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 15,
    color: '#64748b',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  linkText: {
    flex: 1,
    fontSize: 15,
    color: '#2563eb',
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  footerText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 8,
  },
  copyrightText: {
    fontSize: 12,
    color: '#cbd5e1',
    textAlign: 'center',
  },
});

