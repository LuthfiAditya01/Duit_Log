import { Stack } from "expo-router";
import { AuthProvider } from "@/context/AuthContext";
import { View, ActivityIndicator } from "react-native";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { Platform } from "react-native";
import { StatusBar } from "expo-status-bar"; // 1. Import StatusBar
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
    async function setupAndroidChannel() {
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          // IMPORTANCE: MAX ini kuncinya!
          // Ini yang bikin notif lo "Nongol" (Heads-up) di atas layar, gak cuma bunyi doang.
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250], // Pola getar: diem-getar-diem-getar
          lightColor: "#FF231F7C",
        });
      }
    }

    setupAndroidChannel();
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
