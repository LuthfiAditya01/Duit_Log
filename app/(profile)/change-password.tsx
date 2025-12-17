import api from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '@/context/AuthContext';

export default function ChangePasswordScreen() {
    const router = useRouter();
    const auth = useAuth();
    const { signOut } = auth;


    // State buat form
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        // 1. Validasi Input
        if (!oldPassword || !newPassword || !confirmPassword) {
            Alert.alert('Data Kurang', 'Semua field password harus diisi dong.');
            return;
        }

        // Validasi panjang password baru (minimal 6 karakter)
        if (newPassword.length < 6) {
            Alert.alert('Password Terlalu Pendek', 'Password baru minimal 6 karakter ya.');
            return;
        }

        // Validasi password baru sama dengan konfirmasi
        if (newPassword !== confirmPassword) {
            Alert.alert('Password Tidak Cocok', 'Password baru dan konfirmasi password harus sama.');
            return;
        }

        // Validasi password baru tidak sama dengan password lama
        if (oldPassword === newPassword) {
            Alert.alert('Password Sama', 'Password baru harus berbeda dengan password lama.');
            return;
        }

        setIsLoading(true);

        try {
            // 2. Kirim ke Backend
            // Asumsi endpoint: PUT /auth/change-password atau PUT /auth/password
            // Payload: { oldPassword, newPassword }
            await api.put('/auth/change-password', {
                oldPassword: oldPassword,
                newPassword: newPassword
            });

            // 3. Sukses! Balik ke profile
            Alert.alert(
                'Berhasil! 🎉',
                'Password berhasil diganti. Silakan login ulang dengan password baru.',
                [
                    {
                        text: 'OK',
                        onPress: async () => {
                            await signOut();
                            // Router bakal auto-redirect via AuthContext
                        }
                    }
                ]
            );

        } catch (error: any) {
            // 4. Handle Error
            const message = error.response?.data?.message || 'Gagal ganti password, coba lagi nanti.';

            // Handle error khusus untuk password lama salah
            if (error.response?.status === 401 || error.response?.status === 403) {
                Alert.alert('Password Lama Salah', 'Password lama yang lo masukkan tidak benar. Coba lagi ya.');
            } else {
                Alert.alert('Gagal Ganti Password', message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView
                style={styles.scrollView}
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
                    <Text style={styles.title}>Ganti Password</Text>
                    <View style={{ width: 40 }} /> {/* Spacer buat balance */}
                </View>

                {/* INFO BOX */}
                <View style={styles.infoBox}>
                    <Ionicons name="lock-closed" size={20} color="#2563eb" />
                    <Text style={styles.infoText}>
                        Pastikan password baru lo kuat dan mudah diingat ya!
                    </Text>
                </View>

                {/* FORM */}
                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password Lama</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Masukkan password lama lo"
                            value={oldPassword}
                            onChangeText={setOldPassword}
                            secureTextEntry
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password Baru</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Masukkan password baru (min. 6 karakter)"
                            value={newPassword}
                            onChangeText={setNewPassword}
                            secureTextEntry
                            autoCapitalize="none"
                        />
                        <Text style={styles.hintText}>
                            Minimal 6 karakter, lebih panjang lebih aman
                        </Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Konfirmasi Password Baru</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Masukkan lagi password baru"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            autoCapitalize="none"
                        />
                        <Text style={styles.hintText}>
                            Pastikan sama dengan password baru di atas
                        </Text>
                    </View>

                    {/* TOMBOL SAVE */}
                    <TouchableOpacity
                        style={[styles.button, isLoading && styles.buttonDisabled]}
                        onPress={handleSave}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Ganti Password</Text>
                        )}
                    </TouchableOpacity>

                    {/* TOMBOL BATAL */}
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => router.back()}
                        disabled={isLoading}
                    >
                        <Text style={styles.cancelButtonText}>Batal</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 20,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
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
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eff6ff',
        padding: 15,
        borderRadius: 12,
        marginBottom: 25,
        gap: 10,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: '#1e40af',
        lineHeight: 20,
    },
    form: {
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
    },
    input: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        backgroundColor: '#fff',
        color: '#1e293b',
    },
    hintText: {
        fontSize: 12,
        color: '#64748b',
        marginTop: -4,
    },
    button: {
        backgroundColor: '#2563eb',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cancelButton: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    cancelButtonText: {
        color: '#64748b',
        fontSize: 16,
        fontWeight: '600',
    },
});

