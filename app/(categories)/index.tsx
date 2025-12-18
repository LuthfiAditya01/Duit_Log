import { useTheme } from '@/context/ThemeContext';
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
  const colors = useTheme();
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
    return type === 'expense' ? colors.expense : colors.income;
  };

  // Render item kategori
  const renderCategoryItem = ({ item }: { item: Category }) => {
    const categoryColor = getCategoryColor(item.color, item.type);
    
    return (
      <TouchableOpacity
        style={[styles.categoryItem, { backgroundColor: colors.card, shadowColor: colors.shadowColor }]}
        onPress={() => router.push({
          pathname: '/(categories)/edit' as any,
          params: { id: item._id }
        })}
        activeOpacity={0.7}
      >
        <View style={[styles.colorIndicator, { backgroundColor: categoryColor }]} />
        
        <View style={styles.categoryInfo}>
          <View style={styles.categoryHeader}>
            <Text style={[styles.categoryName, { color: colors.text }]}>{item.name}</Text>
            <View style={[
              styles.typeBadge,
              { backgroundColor: item.type === 'expense' ? colors.expenseLight : colors.incomeLight }
            ]}>
              <Text style={[
                styles.typeBadgeText,
                { color: item.type === 'expense' ? colors.expense : colors.income }
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
                color={colors.textSecondary} 
              />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {item.isVisible ? 'Tampil' : 'Tersembunyi'}
              </Text>
            </View>
            <Text style={[styles.colorCode, { color: colors.textTertiary }]}>{item.color || 'Default'}</Text>
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Kelola Kategori</Text>
        {/* <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/(categories)/create')}
        >
          <Ionicons name="add" size={24} color="#2563eb" />
        </TouchableOpacity> */}
      </View>

      {/* Filter Tabs */}
      <View style={[styles.filterContainer, { backgroundColor: colors.surface }]}>
        {/* <TouchableOpacity
          style={[styles.filterTab, filterType === 'all' && styles.filterTabActive]}
          onPress={() => setFilterType('all')}
        >
          <Text style={[styles.filterText, filterType === 'all' && styles.filterTextActive]}>
            Semua
          </Text>
        </TouchableOpacity> */}
        <TouchableOpacity
          style={[
            styles.filterTab,
            { backgroundColor: colors.chipBackground },
            filterType === 'expense' && { backgroundColor: colors.expense }
          ]}
          onPress={() => setFilterType('expense')}
        >
          <Ionicons 
            name="arrow-down-circle" 
            size={16} 
            color={filterType === 'expense' ? '#fff' : colors.expense} 
          />
          <Text style={[
            styles.filterText,
            { color: colors.textSecondary },
            filterType === 'expense' && styles.filterTextActive
          ]}>
            Pengeluaran
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterTab,
            { backgroundColor: colors.chipBackground },
            filterType === 'income' && { backgroundColor: colors.income }
          ]}
          onPress={() => setFilterType('income')}
        >
          <Ionicons 
            name="arrow-up-circle" 
            size={16} 
            color={filterType === 'income' ? '#fff' : colors.income} 
          />
          <Text style={[
            styles.filterText,
            { color: colors.textSecondary },
            filterType === 'income' && styles.filterTextActive
          ]}>
            Pemasukan
          </Text>
        </TouchableOpacity>
      </View>

      {/* List Kategori */}
      {filteredCategories.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="pricetags-outline" size={64} color={colors.textTertiary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {filterType === 'all' 
              ? 'Belum ada kategori' 
              : `Belum ada kategori ${filterType === 'expense' ? 'pengeluaran' : 'pemasukan'}`}
          </Text>
          <Text style={[styles.emptySubText, { color: colors.textTertiary }]}>
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
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="pricetags-outline" size={64} color={colors.textTertiary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Tidak ada kategori</Text>
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
  addButton: {
    padding: 4,
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
  filterTabActive: {
    backgroundColor: '#2563eb',
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
  categoryItem: {
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
  },
  colorCode: {
    fontSize: 12,
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
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
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

