import { useAuth } from '@/context/AuthContext';
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
  const { signOut } = useAuth();
  const router = useRouter();
  
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
      <View style={[styles.iconBox, isDestructive && styles.destructiveIconBox]}>
        <Ionicons name={icon} size={20} color={isDestructive ? '#ef4444' : '#1e293b'} />
      </View>
      <Text style={[styles.menuLabel, isDestructive && styles.destructiveLabel]}>{label}</Text>
      
      {rightElement ? rightElement : (
        <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* HEADER PROFILE */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
        </View>
        <Text style={styles.name}>{user?.name || 'User'}</Text>
        <Text style={styles.email}>{user?.email || 'email@example.com'}</Text>
        
        {/* Chip Member (Hiasan) */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Member PRO 💎</Text>
        </View>
      </View>

      {/* MENU GROUP 1: AKUN */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Akun</Text>
        <View style={styles.menuContainer}>
          <MenuItem 
            icon="person-outline" 
            label="Edit Profil" 
            onPress={() => Alert.alert('Coming Soon', 'Nanti kita bikin fitur edit ya!')} 
          />
          <View style={styles.divider} />
          <MenuItem 
            icon="lock-closed-outline" 
            label="Ganti Password" 
            onPress={() => {}} 
          />
        </View>
      </View>

      {/* MENU GROUP 2: PREFERENSI */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferensi</Text>
        <View style={styles.menuContainer}>
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
          <View style={styles.divider} />
          <MenuItem 
            icon="moon-outline" 
            label="Dark Mode" 
            onPress={() => Alert.alert('Sabar', 'Fitur ini menyusul bos!')}
          />
        </View>
      </View>

      {/* MENU GROUP 3: LAINNYA */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lainnya</Text>
        <View style={styles.menuContainer}>
          <MenuItem 
            icon="help-circle-outline" 
            label="Pusat Bantuan" 
            onPress={() => {}} 
          />
          <View style={styles.divider} />
          <MenuItem 
            icon="information-circle-outline" 
            label="Tentang Aplikasi" 
            onPress={() => {}} 
          />
        </View>
      </View>

      {/* LOGOUT BUTTON */}
      <View style={[styles.section, { marginBottom: 40 }]}>
        <View style={styles.menuContainer}>
          <MenuItem 
            icon="log-out-outline" 
            label="Keluar Akun" 
            isDestructive 
            onPress={handleLogout} 
          />
        </View>
      </View>

      <Text style={styles.versionText}>Duit Log v1.0.0 (Beta)</Text>
      <View style={{ height: 20 }} />

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
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
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 5,
  },
  email: {
    fontSize: 14,
    color: '#64748b',
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
    color: '#64748b',
    marginBottom: 10,
    marginLeft: 5,
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 5,
    shadowColor: '#000',
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
    backgroundColor: '#f1f5f9',
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
    color: '#334155',
    fontWeight: '500',
  },
  destructiveLabel: {
    color: '#ef4444',
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginLeft: 62, // Biar garisnya gak nabrak icon
  },
  versionText: {
    textAlign: 'center',
    color: '#cbd5e1',
    fontSize: 12,
    marginBottom: 20,
  },
});