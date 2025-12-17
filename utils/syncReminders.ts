import api from '@/services/api';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';

// Tipe Data Bill (Sesuai dengan Model MongoDB)
interface Bill {
  _id: string;
  name: string;
  amount: number;
  dueDay: number; // 1 - 31
  frequency: 'MONTHLY' | 'YEARLY';
  dueMonth?: number; // 0 (Jan) - 11 (Des), optional
}

// Helper: Hitung jumlah hari dalam bulan tertentu (Handle Kabisat juga)
// getDaysInMonth(2025, 1) -> 28 (Februari 2025)
// getDaysInMonth(2024, 1) -> 29 (Februari 2024 - Kabisat)
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

export const syncBillReminders = async () => {
  try {
    // 1. Cek Permission Notifikasi
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return;
    }

    // 2. Ambil Token Auth
    const token = await SecureStore.getItemAsync('user_token');
    if (!token) {
      return;
    }

    // 3. Fetch Data dari Backend
    const response = await api.get('/bills');
    const bills: Bill[] = response.data.data;
    
    // 4. RESET: Hapus semua jadwal lama
    await Notifications.cancelAllScheduledNotificationsAsync();

    // 5. Inisialisasi Waktu Sekarang
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();

    let successCount = 0;

    // 6. Loop Setiap Tagihan
    for (const bill of bills) {
      let targetDate = new Date();
      let targetYear = currentYear;
      let targetMonth = currentMonth;
      
      // === LOGIC BULANAN ===
      if (bill.frequency === 'MONTHLY') {
        targetYear = currentYear;
        targetMonth = currentMonth;

        const maxDaysCurrent = getDaysInMonth(targetYear, targetMonth);
        const effectiveDueDayCurrent = Math.min(bill.dueDay, maxDaysCurrent);

        if (currentDay > effectiveDueDayCurrent) {
          // Pindah ke Bulan Depan
          targetMonth = targetMonth + 1;
          
          // Handle ganti tahun (Desember -> Januari)
          if (targetMonth > 11) {
            targetMonth = 0;
            targetYear = targetYear + 1;
          }
        }

        // Hitung Tanggal Final untuk Bulan Target (Bisa bulan ini atau depan)
        const maxDaysTarget = getDaysInMonth(targetYear, targetMonth);
        const finalDay = Math.min(bill.dueDay, maxDaysTarget);

        // Set Date (Jam 09:00 Pagi)
        targetDate = new Date(targetYear, targetMonth, finalDay, 9, 0, 0);
      } 
      
      // === LOGIC TAHUNAN ===
      else if (bill.frequency === 'YEARLY') {
        // Pastikan dueMonth valid (0-11)
        let tMonth = bill.dueMonth !== undefined && bill.dueMonth !== null ? bill.dueMonth : 0;
        let tYear = currentYear;
        
        // Cek tanggal valid di tahun ini
        let maxDays = getDaysInMonth(tYear, tMonth);
        let finalDay = Math.min(bill.dueDay, maxDays);

        // Buat objek tanggal tentatif tahun ini
        targetDate = new Date(tYear, tMonth, finalDay, 9, 0, 0);

        // Kalau tanggal itu sudah lewat di tahun ini?
        if (targetDate < now) {
          // Pindah Tahun Depan
          tYear = tYear + 1;
          
          // Cek tanggal valid lagi (Penting buat kasus 29 Feb)
          maxDays = getDaysInMonth(tYear, tMonth);
          finalDay = Math.min(bill.dueDay, maxDays);
          
          targetDate = new Date(tYear, tMonth, finalDay, 9, 0, 0);
        }
      }

      // 7. Format Rupiah untuk Body Notifikasi
      const formattedAmount = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(bill.amount);

      // 8. Eksekusi Jadwal Notifikasi
      const notificationTitle = bill.frequency === 'YEARLY' 
        ? `🗓️ Pajak Tahunan: ${bill.name}` 
        : `💸 Tagihan Bulanan: ${bill.name}`;
      const notificationBody = `Jangan lupa siapin dana ${formattedAmount} hari ini ya!`;
      
      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: notificationTitle,
            body: notificationBody,
            sound: 'default',
            data: { billId: bill._id },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: targetDate, // Menggunakan objek Date yang sudah dikalkulasi
          },
        });
        successCount++;
      } catch (_) {
        // Skip error per-notification
      }
    }

    // Summary popup
    // alert(`🎉 Sync reminders selesai!\n\nTotal bills: ${bills.length}\nSuccessfully scheduled: ${successCount}\nFailed: ${bills.length - successCount}`);

  } catch (_) {
    // Silent fail as requested (no logs)
  }
};