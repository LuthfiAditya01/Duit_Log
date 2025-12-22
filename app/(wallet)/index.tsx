import { useTheme } from '@/context/ThemeContext';
import api from '@/services/api';
import { formatRupiah } from '@/utils/formatCurrency';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface Wallet {
  _id: string;
  name: string;
  type: 'bank' | 'e-wallet' | 'cash' | 'other';
  balance: number;
  color: string | null;
  user: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function WalletsScreen() {
  const router = useRouter();
  const colors = useTheme();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  // Fetch wallet saat screen dibuka
  useFocusEffect(
    useCallback(() => {
      fetchWallets();
    }, [filterActive])
  );

  const fetchWallets = async () => {
    try {
      const response = await api.get('/wallet');
      const allWallets: Wallet[] = response.data.data || [];
      setWallets(allWallets);
    } catch (error) {
      console.error('Gagal fetch wallet:', error);
      Alert.alert('Error', 'Gagal memuat wallet. Coba lagi nanti.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchWallets();
  };

  // Filter wallet berdasarkan isActive
  const filteredWallets = filterActive === 'all' 
    ? wallets 
    : filterActive === 'active'
    ? wallets.filter(w => w.isActive === true)
    : wallets.filter(w => w.isActive === false);

  // Helper untuk get warna dengan fallback
  const getWalletColor = (color: string | null, type: Wallet['type']): string => {
    if (color) return color;
    // Fallback warna berdasarkan type
    const typeColors: Record<Wallet['type'], string> = {
      'bank': '#0066CC',
      'e-wallet': '#00A86B',
      'cash': '#28A745',
      'other': '#6C757D'
    };
    return typeColors[type] || colors.primary;
  };

  // Helper untuk get icon berdasarkan type
  const getWalletIcon = (type: Wallet['type']): string => {
    const icons: Record<Wallet['type'], string> = {
      'bank': 'card-outline',
      'e-wallet': 'wallet-outline',
      'cash': 'cash-outline',
      'other': 'ellipse-outline'
    };
    return icons[type] || 'ellipse-outline';
  };

  // Helper untuk get label type
  const getTypeLabel = (type: Wallet['type']): string => {
    const labels: Record<Wallet['type'], string> = {
      'bank': 'Bank',
      'e-wallet': 'E-Wallet',
      'cash': 'Cash',
      'other': 'Lainnya'
    };
    return labels[type] || 'Lainnya';
  };

  // Render item wallet
  const renderWalletItem = ({ item }: { item: Wallet }) => {
    const walletColor = getWalletColor(item.color, item.type);
    const walletIcon = getWalletIcon(item.type);
    
    return (
      <TouchableOpacity
        style={[styles.walletItem, { backgroundColor: colors.card, shadowColor: colors.shadowColor }]}
        onPress={() => router.push({
          pathname: '/(wallet)/edit' as any,
          params: { id: item._id }
        })}
        activeOpacity={0.7}
      >
        <View style={[styles.colorIndicator, { backgroundColor: walletColor }]} />
        
        <View style={styles.walletInfo}>
          <View style={styles.walletHeader}>
            <View style={styles.walletNameContainer}>
              <Ionicons name={walletIcon as any} size={20} color={walletColor} />
              <Text style={[styles.walletName, { color: colors.text }]}>{item.name}</Text>
            </View>
            <View style={[
              styles.statusBadge,
              { backgroundColor: item.isActive ? colors.incomeLight : colors.chipBackground }
            ]}>
              <Text style={[
                styles.statusBadgeText,
                { color: item.isActive ? colors.income : colors.textSecondary }
              ]}>
                {item.isActive ? 'Aktif' : 'Nonaktif'}
              </Text>
            </View>
          </View>
          
          <View style={styles.walletMeta}>
            <View style={styles.metaItem}>
              <Text style={[styles.typeLabel, { color: colors.textSecondary }]}>
                {getTypeLabel(item.type)}
              </Text>
            </View>
            <Text style={[styles.balanceText, { color: colors.text }]}>
              {formatRupiah(item.balance)}
            </Text>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Kelola Wallet</Text>
      </View>

      {/* Filter Tabs */}
      <View style={[styles.filterContainer, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={[
            styles.filterTab,
            { backgroundColor: colors.chipBackground },
            filterActive === 'all' && { backgroundColor: colors.primary }
          ]}
          onPress={() => setFilterActive('all')}
        >
          <Text style={[
            styles.filterText,
            { color: colors.textSecondary },
            filterActive === 'all' && styles.filterTextActive
          ]}>
            Semua
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterTab,
            { backgroundColor: colors.chipBackground },
            filterActive === 'active' && { backgroundColor: colors.income }
          ]}
          onPress={() => setFilterActive('active')}
        >
          <Ionicons 
            name="checkmark-circle-outline" 
            size={16} 
            color={filterActive === 'active' ? '#fff' : colors.income} 
          />
          <Text style={[
            styles.filterText,
            { color: colors.textSecondary },
            filterActive === 'active' && styles.filterTextActive
          ]}>
            Aktif
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterTab,
            { backgroundColor: colors.chipBackground },
            filterActive === 'inactive' && { backgroundColor: colors.textTertiary }
          ]}
          onPress={() => setFilterActive('inactive')}
        >
          <Ionicons 
            name="close-circle-outline" 
            size={16} 
            color={filterActive === 'inactive' ? '#fff' : colors.textTertiary} 
          />
          <Text style={[
            styles.filterText,
            { color: colors.textSecondary },
            filterActive === 'inactive' && styles.filterTextActive
          ]}>
            Nonaktif
          </Text>
        </TouchableOpacity>
      </View>

      {/* List Wallet */}
      {filteredWallets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="wallet-outline" size={64} color={colors.textTertiary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {filterActive === 'all' 
              ? 'Belum ada wallet' 
              : filterActive === 'active'
              ? 'Belum ada wallet aktif'
              : 'Belum ada wallet nonaktif'}
          </Text>
          <Text style={[styles.emptySubText, { color: colors.textTertiary }]}>
            Tap tombol + di bawah untuk membuat wallet baru
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredWallets}
          keyExtractor={(item) => item._id}
          renderItem={renderWalletItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="wallet-outline" size={64} color={colors.textTertiary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Tidak ada wallet</Text>
            </View>
          }
        />
      )}

      {/* FAB untuk Tambah Wallet */}
      <TouchableOpacity
        style={[
          styles.fab,
          {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 28,
            position: 'absolute',
            right: 24,
            bottom: 32,
            backgroundColor: colors.primary,
            elevation: 5,
            shadowColor: colors.shadowColor,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            minWidth: 180,
          },
        ]}
        activeOpacity={0.85}
        onPress={() => router.push('/(wallet)/add')}
      >
        <Ionicons name="add" size={28} color="#fff" style={{ marginRight: 8 }} />
        <Text
          style={{
            color: "#fff",
            fontWeight: "600",
            fontSize: 16,
            flexShrink: 1,
            flexWrap: 'wrap',
          }}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          Tambah Wallet
        </Text>
      </TouchableOpacity>
    </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  walletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  colorIndicator: {
    width: 4,
    height: 48,
    borderRadius: 2,
    marginRight: 15,
  },
  walletInfo: {
    flex: 1,
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  walletNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  walletName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  walletMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typeLabel: {
    fontSize: 12,
  },
  balanceText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  fab: {
    zIndex: 1000,
  },
});

