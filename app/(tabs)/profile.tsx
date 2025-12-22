import { useAuth } from '@/context/AuthContext';
import { useTheme, useThemeContext } from '@/context/ThemeContext';
import api from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function ProfileScreen() {
  const auth = useAuth();
  const router = useRouter();
  const colors = useTheme();
  const { isDarkMode, toggleTheme } = useThemeContext();

  if (!auth) {
    return null; // Atau bisa return loading screen
  }

  const { signOut } = auth;

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isNotifEnabled, setIsNotifEnabled] = useState(true); // Dummy toggle

  // 1. Fetch Data User Pas Screen Dibuka
  useFocusEffect(
    useCallback(() => {
      fetchUserProfile();
    }, [])
  );

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Keluar Akun', 'Yakin mau cabut bro?', [
      { text: 'Gak Jadi', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          // Router bakal auto-redirect via AuthContext
        }
      }
    ]);
  };

  // Helper buat bikin inisial nama (Misal: "Luthfi Aditya" -> "LA")
  const getInitials = (name: string) => {
    if (!name) return 'U';
    const names = name.split(' ');
    let initials = names[0].substring(0, 1).toUpperCase();
    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
  };

  // Komponen Menu Item biar rapi
  const MenuItem = ({ icon, label, onPress, isDestructive = false, rightElement }: any) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[
        styles.iconBox,
        { backgroundColor: isDestructive ? colors.errorLight : colors.iconBackground }
      ]}>
        <Ionicons name={icon} size={20} color={isDestructive ? colors.error : colors.text} />
      </View>
      <Text style={[
        styles.menuLabel,
        { color: isDestructive ? colors.error : colors.text }
      ]}>
        {label}
      </Text>

      {rightElement ? rightElement : (
        <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>

      {/* HEADER PROFILE */}
      <View style={[styles.header, { backgroundColor: colors.surface, shadowColor: colors.shadowColor }]}>
        <View style={[styles.avatarContainer, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>{getInitials(user?.name)}</Text>
        </View>
        <Text style={[styles.name, { color: colors.text }]}>{user?.name || 'User'}</Text>
        <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email || 'email@example.com'}</Text>

        {/* Chip Member (Hiasan) */}
        {/* <View style={styles.badge}>
          <Text style={styles.badgeText}>Member PRO 💎</Text>
        </View> */}
      </View>

      {/* MENU GROUP 1: AKUN */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Akun</Text>
        <View style={[styles.menuContainer, { backgroundColor: colors.surface, shadowColor: colors.shadowColor }]}>
          <MenuItem
            icon="person-outline"
            label="Edit Profil"
            onPress={() => router.push('/(profile)/edit')}
          />
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <MenuItem
            icon="lock-closed-outline"
            label="Ganti Password"
            onPress={() => router.push('/(profile)/change-password')}
          />
        </View>
      </View>

      {/* MENU GROUP 2: MANAJEMEN */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Manajemen</Text>
        <View style={[styles.menuContainer, { backgroundColor: colors.surface, shadowColor: colors.shadowColor }]}>
          <MenuItem
            icon="pricetags-outline"
            label="Kelola Kategori"
            onPress={() => router.push('/(categories)/' as any)}
          />
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <MenuItem
            icon="wallet-outline"
            label="Kelola Sumber Keuangan"
            onPress={() => router.push('/(wallet)/' as any)}
          />
        </View>
      </View>

      {/* MENU GROUP 3: PREFERENSI */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Preferensi</Text>
        <View style={[styles.menuContainer, { backgroundColor: colors.surface, shadowColor: colors.shadowColor }]}>
          <MenuItem
            icon="notifications-outline"
            label="Notifikasi"
            rightElement={
              <Switch
                value={isNotifEnabled}
                onValueChange={setIsNotifEnabled}
                trackColor={{ false: '#cbd5e1', true: '#2563eb' }}
              />
            }
          />
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <MenuItem
            icon="moon-outline"
            label="Dark Mode"
            rightElement={
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: '#cbd5e1', true: '#2563eb' }}
              />
            }
          />
        </View>
      </View>

      {/* MENU GROUP 4: LAINNYA */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Lainnya</Text>
        <View style={[styles.menuContainer, { backgroundColor: colors.surface, shadowColor: colors.shadowColor }]}>
          <MenuItem
            icon="help-circle-outline"
            label="FAQ"
            onPress={() => router.push('/(faq)/' as any)}
          />
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <MenuItem
            icon="information-circle-outline"
            label="Tentang Aplikasi"
            onPress={() => router.push('/(about)/' as any)}
          />
        </View>
      </View>

      {/* LOGOUT BUTTON */}
      <View style={[styles.section, { marginBottom: 40 }]}>
        <View style={[styles.menuContainer, { backgroundColor: colors.surface, shadowColor: colors.shadowColor }]}>
          <MenuItem
            icon="log-out-outline"
            label="Keluar Akun"
            isDestructive
            onPress={handleLogout}
          />
        </View>
      </View>

      <Text style={[styles.versionText, { color: colors.textTertiary }]}>Duit Log v1.0.0 (Beta)</Text>
      <View style={{ height: 20 }} />

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  email: {
    fontSize: 14,
    marginBottom: 15,
  },
  badge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    marginLeft: 5,
  },
  menuContainer: {
    borderRadius: 16,
    padding: 5,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  destructiveIconBox: {
    backgroundColor: '#fee2e2',
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  destructiveLabel: {
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    marginLeft: 62, // Biar garisnya gak nabrak icon
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 20,
  },
});