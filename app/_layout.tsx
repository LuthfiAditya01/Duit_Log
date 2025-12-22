import { AuthProvider } from "@/context/AuthContext";
import { AppStatusProvider, useAppStatus } from "@/context/AppStatusContext";
import { ThemeProvider, useThemeContext } from "@/context/ThemeContext";
import MaintenanceScreen from "@/components/MaintenanceScreen";
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar"; // 1. Import StatusBar
import { useEffect, useState } from "react";
import { ActivityIndicator, Platform } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"; // 2. Import Safe Area

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Inner component untuk akses theme context dan app status
function RootLayoutContent() {
  const { isDarkMode, colors } = useThemeContext();
  const { status, isLoading, isAvailable, isMaintenance, refreshStatus } = useAppStatus();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Handle refresh status
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshStatus();
    setIsRefreshing(false);
  };

  // Kalau masih loading, tampilkan loading indicator
  if (isLoading) {
    return (
      <>
        <StatusBar 
          style={isDarkMode ? "light" : "dark"} 
          translucent={false} 
          backgroundColor={colors.background} 
        />
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </SafeAreaView>
      </>
    );
  }

  // Kalau aplikasi tidak available atau sedang maintenance, tampilkan maintenance screen
  if (!isAvailable || isMaintenance) {
    return (
      <>
        <StatusBar 
          style={isDarkMode ? "light" : "dark"} 
          translucent={false} 
          backgroundColor={colors.background} 
        />
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          {status && (
            <MaintenanceScreen 
              status={status} 
              onRefresh={handleRefresh}
              isRefreshing={isRefreshing}
            />
          )}
        </SafeAreaView>
      </>
    );
  }

  // Kalau aplikasi available, tampilkan aplikasi normal
  return (
    <>
      <StatusBar 
        style={isDarkMode ? "light" : "dark"} 
        translucent={false} 
        backgroundColor={colors.background} 
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </SafeAreaView>
    </>
  );
}

export default function RootLayout() {
  useEffect(() => {
    async function setupNotifications() {
      // 1. Request permission dulu
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        await Notifications.requestPermissionsAsync();
      }

      // 2. Setup Android channel dengan importance MAX untuk banner notification (heads-up)
      if (Platform.OS === "android") {
        // MAX = banner muncul di atas layar dengan suara dan getar
        await Notifications.setNotificationChannelAsync("default", {
          name: "Default Notifications",
          description: "Notifikasi default untuk aplikasi",
          importance: Notifications.AndroidImportance.MAX, // MAX untuk heads-up banner
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
          sound: "default",
          enableVibrate: true,
          showBadge: false,
        });
      }
    }

    setupNotifications();
  }, []);
  
  return (
    // Bungkus semua pake AppStatusProvider, AuthProvider, dan ThemeProvider
    <SafeAreaProvider>
      <AppStatusProvider>
        <ThemeProvider>
          <AuthProvider>
            <RootLayoutContent />
          </AuthProvider>
        </ThemeProvider>
      </AppStatusProvider>
    </SafeAreaProvider>
  );
}
