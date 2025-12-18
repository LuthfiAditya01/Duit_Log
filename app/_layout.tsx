import { AuthProvider } from "@/context/AuthContext";
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar"; // 1. Import StatusBar
import { useEffect } from "react";
import { Platform } from "react-native";
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
    // Bungkus semua pake AuthProvider
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" translucent={false} backgroundColor="#fff" />
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
        </SafeAreaView>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
