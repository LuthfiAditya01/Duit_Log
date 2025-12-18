import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

export default function TabLayout() {
  const { isLoading } = useAuth();
  const colors = useTheme();

  // Loading state handling (Opsional, biar smooth)
  if (isLoading) return null;

  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Kita hide header default biar bisa custom sendiri nanti
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarStyle: {
          height: 60,
          paddingBottom: 10,
          paddingTop: 10,
          backgroundColor: colors.tabBarBackground,
          borderTopWidth: 1,
          borderTopColor: colors.tabBarBorder,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      {/* 1. HOME TAB */}
      <Tabs.Screen
        name="index" // Ini ngebaca file index.tsx
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      {/* 2. BILLS TAB (Tab Baru Kita) */}
      <Tabs.Screen
        name="bills" // Ini ngebaca file bills.tsx
        options={{
          title: 'Tagihan',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt" size={size} color={color} />
          ),
        }}
      />

      {/* 3. PROFILE TAB */}
      <Tabs.Screen
        name="profile" // Ini ngebaca file profile.tsx
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}