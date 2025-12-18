import api from '@/services/api';
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

interface Category {
  _id: string;
  name: string;
  type: 'expense' | 'income';
  color: string | null;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function CategoriesScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');

  // Fetch kategori saat screen dibuka
  useFocusEffect(
    useCallback(() => {
      fetchCategories();
    }, [filterType])
  );

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      const allCategories: Category[] = response.data.data || [];
      setCategories(allCategories);
    } catch (error) {
      console.error('Gagal fetch kategori:', error);
      Alert.alert('Error', 'Gagal memuat kategori. Coba lagi nanti.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCategories();
  };

  // Filter kategori berdasarkan type
  const filteredCategories = filterType === 'all' 
    ? categories 
    : categories.filter(cat => cat.type === filterType);

  // Grouping kategori berdasarkan type untuk display
  const expenseCategories = filteredCategories.filter(cat => cat.type === 'expense');
  const incomeCategories = filteredCategories.filter(cat => cat.type === 'income');

  // Helper untuk get warna dengan fallback
  const getCategoryColor = (color: string | null, type: 'expense' | 'income'): string => {
    if (color) return color;
    return type === 'expense' ? '#ef4444' : '#10b981';
  };

  // Render item kategori
  const renderCategoryItem = ({ item }: { item: Category }) => {
    const categoryColor = getCategoryColor(item.color, item.type);
    
    return (
      <TouchableOpacity
        style={styles.categoryItem}
        onPress={() => router.push({
          pathname: '/(categories)/edit' as any,
          params: { id: item._id }
        })}
        activeOpacity={0.7}
      >
        <View style={[styles.colorIndicator, { backgroundColor: categoryColor }]} />
        
        <View style={styles.categoryInfo}>
          <View style={styles.categoryHeader}>
            <Text style={styles.categoryName}>{item.name}</Text>
            <View style={[
              styles.typeBadge,
              { backgroundColor: item.type === 'expense' ? '#fee2e2' : '#dcfce7' }
            ]}>
              <Text style={[
                styles.typeBadgeText,
                { color: item.type === 'expense' ? '#ef4444' : '#10b981' }
              ]}>
                {item.type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
              </Text>
            </View>
          </View>
          
          <View style={styles.categoryMeta}>
            <View style={styles.metaItem}>
              <Ionicons 
                name={item.isVisible ? 'eye-outline' : 'eye-off-outline'} 
                size={14} 
                color="#64748b" 
              />
              <Text style={styles.metaText}>
                {item.isVisible ? 'Tampil' : 'Tersembunyi'}
              </Text>
            </View>
            <Text style={styles.colorCode}>{item.color || 'Default'}</Text>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kelola Kategori</Text>
        {/* <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/(categories)/create')}
        >
          <Ionicons name="add" size={24} color="#2563eb" />
        </TouchableOpacity> */}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {/* <TouchableOpacity
          style={[styles.filterTab, filterType === 'all' && styles.filterTabActive]}
          onPress={() => setFilterType('all')}
        >
          <Text style={[styles.filterText, filterType === 'all' && styles.filterTextActive]}>
            Semua
          </Text>
        </TouchableOpacity> */}
        <TouchableOpacity
          style={[styles.filterTab, filterType === 'expense' && styles.filterTabActive]}
          onPress={() => setFilterType('expense')}
        >
          <Ionicons 
            name="arrow-down-circle" 
            size={16} 
            color={filterType === 'expense' ? '#fff' : '#ef4444'} 
          />
          <Text style={[styles.filterText, filterType === 'expense' && styles.filterTextActive]}>
            Pengeluaran
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filterType === 'income' && styles.filterTabActive]}
          onPress={() => setFilterType('income')}
        >
          <Ionicons 
            name="arrow-up-circle" 
            size={16} 
            color={filterType === 'income' ? '#fff' : '#10b981'} 
          />
          <Text style={[styles.filterText, filterType === 'income' && styles.filterTextActive]}>
            Pemasukan
          </Text>
        </TouchableOpacity>
      </View>

      {/* List Kategori */}
      {filteredCategories.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="pricetags-outline" size={64} color="#cbd5e1" />
          <Text style={styles.emptyText}>
            {filterType === 'all' 
              ? 'Belum ada kategori' 
              : `Belum ada kategori ${filterType === 'expense' ? 'pengeluaran' : 'pemasukan'}`}
          </Text>
          <Text style={styles.emptySubText}>
            Tap tombol + di atas untuk membuat kategori baru
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredCategories}
          keyExtractor={(item) => item._id}
          renderItem={renderCategoryItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2563eb']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="pricetags-outline" size={64} color="#cbd5e1" />
              <Text style={styles.emptyText}>Tidak ada kategori</Text>
            </View>
          }
        />
      )}

      {/* FAB untuk Tambah Kategori */}
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
            backgroundColor: '#2563eb',
            elevation: 5,
            shadowColor: '#1e293b',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            minWidth: 180,
          },
        ]}
        activeOpacity={0.85}
        onPress={() => router.push('/(categories)/create')}
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
          Tambah Kategori
        </Text>
      </TouchableOpacity>
    </View>
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
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  addButton: {
    padding: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
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
    backgroundColor: '#f1f5f9',
  },
  filterTabActive: {
    backgroundColor: '#2563eb',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  filterTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
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
  categoryInfo: {
    flex: 1,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  categoryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#64748b',
  },
  colorCode: {
    fontSize: 12,
    color: '#94a3b8',
    fontFamily: 'monospace',
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
    color: '#64748b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
});

