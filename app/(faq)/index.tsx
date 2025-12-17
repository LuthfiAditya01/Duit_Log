import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: 'Apa itu Duit Log?',
    answer: 'Duit Log adalah aplikasi manajemen keuangan pribadi yang membantu lo untuk mencatat, melacak, dan mengelola pengeluaran serta pemasukan dengan mudah. Dengan fitur yang lengkap, lo bisa lebih bijak dalam mengelola keuangan sehari-hari.'
  },
  {
    question: 'Bagaimana cara mencatat transaksi?',
    answer: 'Untuk mencatat transaksi, lo bisa klik tombol "+" (FAB) di halaman Home, lalu isi detail transaksi seperti nominal, kategori, jenis (pemasukan/pengeluaran), deskripsi, dan tanggal. Setelah itu klik "Simpan" dan transaksi lo akan langsung tercatat.'
  },
  {
    question: 'Bagaimana cara mengatur pengingat tagihan?',
    answer: 'Lo bisa pergi ke halaman "Tagihan" dan klik tombol "+" untuk menambah tagihan baru. Lo bisa atur frekuensi (bulanan/tahunan), tanggal jatuh tempo, dan nominal tagihan. Aplikasi akan otomatis mengirim notifikasi pengingat sebelum tanggal jatuh tempo.'
  },
  {
    question: 'Apakah data saya aman?',
    answer: 'Ya, data lo sangat aman! Semua data tersimpan dengan enkripsi dan hanya lo yang bisa akses. Token autentikasi lo juga disimpan dengan aman menggunakan SecureStore yang sudah terenkripsi.'
  },
  {
    question: 'Bagaimana cara ganti password?',
    answer: 'Lo bisa ganti password dengan pergi ke halaman Profile > Ganti Password. Lo perlu masukkan password lama, password baru, dan konfirmasi password baru. Pastikan password baru minimal 6 karakter dan berbeda dengan password lama.'
  },
  {
    question: 'Bisakah saya edit atau hapus transaksi?',
    answer: 'Fitur edit dan hapus transaksi sedang dalam pengembangan. Untuk saat ini, lo bisa fokus dulu untuk mencatat transaksi. Fitur ini akan segera hadir di update berikutnya!'
  },
  {
    question: 'Bagaimana cara melihat statistik keuangan?',
    answer: 'Di halaman Home, lo bisa langsung lihat ringkasan keuangan seperti saldo, total pemasukan, total pengeluaran, dan grafik pengeluaran berdasarkan kategori. Semua data dihitung otomatis dari transaksi yang lo catat.'
  },
  {
    question: 'Apakah aplikasi ini gratis?',
    answer: 'Ya, Duit Log sepenuhnya gratis untuk digunakan! Lo bisa menikmati semua fitur tanpa biaya apapun. Aplikasi ini dibuat untuk membantu lo mengelola keuangan dengan lebih baik.'
  },
  {
    question: 'Bagaimana cara menghubungi support?',
    answer: 'Lo bisa menghubungi kami melalui email di luthfi2004aditya@gmail.com atau melalui Instagram @aditeverything_. Kami akan dengan senang hati membantu lo jika ada pertanyaan atau masalah.'
  },
  {
    question: 'Apakah data saya tersinkronisasi?',
    answer: 'Ya, semua data lo tersimpan di server backend, jadi data lo aman dan tersinkronisasi. Lo bisa akses data lo dari perangkat manapun selama lo login dengan akun yang sama.'
  }
];

export default function FAQScreen() {
  const router = useRouter();
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
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
        <Text style={styles.title}>FAQ</Text>
        <View style={{ width: 40 }} /> {/* Spacer buat balance */}
      </View>

      {/* SUBTITLE */}
      <View style={styles.subtitleSection}>
        <Text style={styles.subtitle}>
          Pertanyaan yang sering ditanyakan tentang Duit Log
        </Text>
      </View>

      {/* FAQ LIST */}
      <View style={styles.faqContainer}>
        {faqData.map((faq, index) => (
          <FAQItem
            key={index}
            question={faq.question}
            answer={faq.answer}
            isExpanded={expandedItems.has(index)}
            onToggle={() => toggleItem(index)}
          />
        ))}
      </View>

      {/* HELP SECTION */}
      <View style={styles.helpSection}>
        <View style={styles.helpCard}>
          <Ionicons name="chatbubble-ellipses-outline" size={32} color="#2563eb" />
          <Text style={styles.helpTitle}>Masih Ada Pertanyaan?</Text>
          <Text style={styles.helpText}>
            Kalau pertanyaan lo belum terjawab di sini, jangan ragu untuk menghubungi kami ya!
          </Text>
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={() => router.push('/(about)/' as any)}
          >
            <Text style={styles.contactButtonText}>Lihat Kontak Kami</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// Komponen FAQ Item (Accordion)
const FAQItem = ({ 
  question, 
  answer, 
  isExpanded, 
  onToggle 
}: { 
  question: string; 
  answer: string; 
  isExpanded: boolean; 
  onToggle: () => void;
}) => {
  return (
    <View style={styles.faqItem}>
      <TouchableOpacity 
        style={styles.faqHeader}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <Text style={styles.faqQuestion}>{question}</Text>
        <Ionicons 
          name={isExpanded ? 'chevron-up' : 'chevron-down'} 
          size={20} 
          color="#64748b" 
        />
      </TouchableOpacity>
      
      {isExpanded && (
        <View style={styles.faqAnswerContainer}>
          <Text style={styles.faqAnswer}>{answer}</Text>
        </View>
      )}
    </View>
  );
};

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
  subtitleSection: {
    marginBottom: 25,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    lineHeight: 22,
  },
  faqContainer: {
    gap: 12,
    marginBottom: 30,
  },
  faqItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    gap: 12,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    lineHeight: 22,
  },
  faqAnswerContainer: {
    paddingHorizontal: 18,
    paddingBottom: 18,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  faqAnswer: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 24,
    marginTop: 12,
  },
  helpSection: {
    marginTop: 10,
  },
  helpCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 12,
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  contactButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});

