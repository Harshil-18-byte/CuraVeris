import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { Colors } from '../theme/colors';

interface Bill {
  id: string;
  hospitalName: string;
  dateRange: string;
  totalBilled: number;
  overchargeAmount: number;
  status: 'COMPLETED' | 'PROCESSING' | 'FAILED';
}

const ALL_BILLS: Bill[] = [
  {
    id: 'MMH-8941',
    hospitalName: 'Metro Multispeciality Hospital',
    dateRange: '12 Aug – 16 Aug 2026',
    totalBilled: 184500,
    overchargeAmount: 48200,
    status: 'COMPLETED',
  },
  {
    id: 'APO-2041',
    hospitalName: 'Apollo Surgical Centre',
    dateRange: '20 Jul – 22 Jul 2026',
    totalBilled: 245000,
    overchargeAmount: 62000,
    status: 'COMPLETED',
  },
  {
    id: 'MAX-5512',
    hospitalName: 'Max Healthcare Institute',
    dateRange: '18 Aug – 20 Aug 2026',
    totalBilled: 95000,
    overchargeAmount: 0,
    status: 'PROCESSING',
  },
  {
    id: 'FOR-1029',
    hospitalName: 'Fortis Escorts Heart Hospital',
    dateRange: '05 Jun – 08 Jun 2026',
    totalBilled: 310000,
    overchargeAmount: 85000,
    status: 'COMPLETED',
  },
];

export function MyBillsScreen({
  onSelectBill,
  onUploadBill,
}: {
  onSelectBill: (id: string) => void;
  onUploadBill: () => void;
}) {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Processing' | 'Completed' | 'Failed'>('All');
  const [sortOption, setSortOption] = useState<'Newest' | 'Oldest' | 'Highest Overcharge'>('Newest');
  const [refreshing, setRefreshing] = useState(false);
  const [pageLimit, setPageLimit] = useState(4);

  const filters = ['All', 'Processing', 'Completed', 'Failed'] as const;

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const filteredBills = ALL_BILLS.filter((b) => {
    if (activeFilter === 'All') return true;
    return b.status.toLowerCase() === activeFilter.toLowerCase();
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Bills</Text>
        <TouchableOpacity onPress={() => setSortOption(sortOption === 'Newest' ? 'Highest Overcharge' : 'Newest')}>
          <Text style={styles.sortText}>Sort: {sortOption} ▾</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Chips Scrollable Row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {filters.map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <TouchableOpacity
              key={filter}
              style={[styles.filterChip, isActive && styles.activeFilterChip]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[styles.filterChipText, isActive && styles.activeFilterChipText]}>
                {filter}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Bills List */}
      <ScrollView
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredBills.length > 0 ? (
          <View style={{ gap: 12 }}>
            {filteredBills.slice(0, pageLimit).map((bill) => (
              <TouchableOpacity
                key={bill.id}
                style={[styles.billCard, bill.overchargeAmount > 0 ? styles.billCardAlert : null]}
                onPress={() => onSelectBill(bill.id)}
                activeOpacity={0.8}
              >
                <View style={styles.billCardTop}>
                  <Text style={styles.hospitalName}>{bill.hospitalName}</Text>
                  <View
                    style={[
                      styles.statusPill,
                      bill.status === 'COMPLETED' ? styles.statusCompleted : styles.statusProcessing,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        bill.status === 'COMPLETED' ? styles.statusCompletedText : styles.statusProcessingText,
                      ]}
                    >
                      {bill.status}
                    </Text>
                  </View>
                </View>

                <Text style={styles.dateText}>{bill.dateRange}</Text>

                <View style={styles.billCardBottom}>
                  <Text style={styles.billedText}>
                    Billed: ₹{bill.totalBilled.toLocaleString('en-IN')}
                  </Text>
                  {bill.overchargeAmount > 0 && (
                    <Text style={styles.overchargeText}>
                      Overcharge: ₹{bill.overchargeAmount.toLocaleString('en-IN')}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}

            {/* Pagination: Load More */}
            <TouchableOpacity style={styles.loadMoreButton} onPress={() => setPageLimit(pageLimit + 4)}>
              <Text style={styles.loadMoreText}>Load More Bills ({filteredBills.length} Total)</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No bills in {activeFilter}</Text>
            <Text style={styles.emptySub}>No medical bills matching this status filter.</Text>
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={onUploadBill} activeOpacity={0.9}>
        <Text style={styles.fabIcon}>Upload</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.neutral900,
  },
  sortText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  filterRow: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.neutral300,
  },
  activeFilterChip: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.neutral600,
  },
  activeFilterChipText: {
    color: Colors.white,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 96,
  },
  billCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.neutral300,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  billCardAlert: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.danger,
  },
  billCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  hospitalName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.neutral900,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  statusCompleted: {
    backgroundColor: Colors.successSurface,
  },
  statusProcessing: {
    backgroundColor: Colors.primarySurface,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusCompletedText: {
    color: Colors.success,
  },
  statusProcessingText: {
    color: Colors.primary,
  },
  dateText: {
    fontSize: 13,
    color: Colors.neutral600,
    marginBottom: 12,
  },
  billCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral300,
  },
  billedText: {
    fontSize: 13,
    color: Colors.neutral600,
    fontFamily: 'JetBrainsMono-Medium',
  },
  overchargeText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.danger,
    fontFamily: 'JetBrainsMono-Medium',
  },
  loadMoreButton: {
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.neutral300,
    marginTop: 8,
  },
  loadMoreText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral900,
  },
  emptySub: {
    fontSize: 13,
    color: Colors.neutral600,
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  fabIcon: {
    fontSize: 24,
    color: Colors.white,
  },
});
