import { Redirect } from 'expo-router';

export default function Index() {
  // Biarkan AuthContext yang handle redirect
  // Ini cuma fallback kalau ada yang akses index langsung
  return <Redirect href="/(auth)/login" />;
}
