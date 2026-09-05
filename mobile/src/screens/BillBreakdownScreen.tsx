import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Colors } from '../theme/colors';

interface CategoryItem {
  id: string;
  name: string;
  billed: number;
  verified: number;
  variance: number;
  itemsCount: number;
}

const CATEGORIES: CategoryItem[] = [
  { id: '1', name: 'Room & Stay (ICU / Ward)', billed: 36000, verified: 36000, variance: 0, itemsCount: 3 },
  { id: '2', name: 'Surgical Procedures', billed: 95000, verified: 72000, variance: 23000, itemsCount: 2 },
  { id: '3', name: 'Medicines & Injections', billed: 28400, verified: 26800, variance: 1600, itemsCount: 14 },
  { id: '4', name: 'Doctor & Consultation Fees', billed: 22000, verified: 22000, variance: 0, itemsCount: 4 },
  { id: '5', name: 'Consumables & OT Kits', billed: 19000, verified: 4500, variance: 14500, itemsCount: 6 },
  { id: '6', name: 'Taxes & Statutory Levies', billed: 18000, verified: 18000, variance: 0, itemsCount: 1 },
];

export function BillBreakdownScreen({
  onSelectItem,
  onBack,
}: {
  onSelectItem?: (category: string) => void;
  onBack?: () => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>('5');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bill Breakdown</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subTitle}>
          Category totals cross-checked against statutory caps and hospital rate schedules.
        </Text>

        <View style={styles.categoriesList}>
          {CATEGORIES.map((cat) => {
            const isExpanded = expandedId === cat.id;
            return (
              <View
                key={cat.id}
                style={[
                  styles.categoryCard,
                  cat.variance > 0 ? styles.categoryCardAlert : null,
                ]}
              >
                <TouchableOpacity
                  style={styles.cardHeader}
                  onPress={() => setExpandedId(isExpanded ? null : cat.id)}
                  activeOpacity={0.8}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.categoryName}>{cat.name}</Text>
                    <Text style={styles.itemsCount}>{cat.itemsCount} line items</Text>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.billedAmount}>₹{cat.billed.toLocaleString('en-IN')}</Text>
                    {cat.variance > 0 ? (
                      <Text style={styles.varianceText}>
                        −₹{cat.variance.toLocaleString('en-IN')} discrepancy
                      </Text>
                    ) : (
                      <Text style={styles.verifiedText}>Verified</Text>
                    )}
                  </View>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.expandedContent}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Hospital Billed:</Text>
                      <Text style={styles.detailValue}>₹{cat.billed.toLocaleString('en-IN')}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Verified Benchmark Rate:</Text>
                      <Text style={[styles.detailValue, { color: Colors.success }]}>
                        ₹{cat.verified.toLocaleString('en-IN')}
                      </Text>
                    </View>
                    {cat.variance > 0 && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Unexplained Variance:</Text>
                        <Text style={[styles.detailValue, { color: Colors.danger, fontWeight: '700' }]}>
                          +₹{cat.variance.toLocaleString('en-IN')}
                        </Text>
                      </View>
                    )}

                    <TouchableOpacity
                      style={styles.viewItemsButton}
                      onPress={() => onSelectItem?.(cat.name)}
                    >
                      <Text style={styles.viewItemsText}>View Individual Line Items →</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
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
    paddingVertical: 12,
  },
  backText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.neutral900,
  },
  content: {
    padding: 20,
    gap: 16,
    paddingBottom: 48,
  },
  subTitle: {
    fontSize: 14,
    color: Colors.neutral600,
    lineHeight: 20,
  },
  categoriesList: {
    gap: 12,
  },
  categoryCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.neutral300,
    borderRadius: 12,
    padding: 16,
  },
  categoryCardAlert: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.neutral900,
  },
  itemsCount: {
    fontSize: 12,
    color: Colors.neutral600,
    marginTop: 2,
  },
  billedAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.neutral900,
    fontFamily: 'JetBrainsMono-Medium',
  },
  varianceText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.danger,
    marginTop: 2,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.success,
    marginTop: 2,
  },
  expandedContent: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral300,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 13,
    color: Colors.neutral600,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.neutral900,
    fontFamily: 'JetBrainsMono-Medium',
  },
  viewItemsButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  viewItemsText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
});
