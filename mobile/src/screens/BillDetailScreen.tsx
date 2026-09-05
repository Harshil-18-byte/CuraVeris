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

export function BillDetailScreen({
  billId = 'MMH-8941',
  hospitalName = 'Metro Multispeciality Hospital',
  onBack,
}: {
  billId?: string;
  hospitalName?: string;
  onBack?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'BREAKDOWN' | 'INSURANCE' | 'PAYMENTS' | 'EVIDENCE' | 'TIMELINE'>('OVERVIEW');

  const tabs = ['OVERVIEW', 'BREAKDOWN', 'INSURANCE', 'PAYMENTS', 'EVIDENCE', 'TIMELINE'] as const;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{hospitalName}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs Header */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsRow}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === 'OVERVIEW' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Bill Summary</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Hospital Invoiced:</Text>
              <Text style={styles.value}>₹2,18,400</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Verified Responsibility:</Text>
              <Text style={[styles.value, { color: Colors.primary }]}>₹73,400</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Overcharges Excluded:</Text>
              <Text style={[styles.value, { color: Colors.danger }]}>₹13,500</Text>
            </View>
          </View>
        )}

        {activeTab === 'BREAKDOWN' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>6 Itemized Categories</Text>
            <Text style={styles.bodyText}>Room Rent, Procedures, Pharmacy, Fees, Consumables, Taxes.</Text>
          </View>
        )}

        {activeTab === 'INSURANCE' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Insurance Coverage</Text>
            <Text style={styles.bodyText}>Star Health Insurance approved ₹1,40,000 via TPA cashless portal.</Text>
          </View>
        )}

        {activeTab === 'PAYMENTS' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Payment Status</Text>
            <Text style={styles.bodyText}>₹73,400 settled via Razorpay UPI · Reconciliation: MATCHED</Text>
          </View>
        )}

        {activeTab === 'EVIDENCE' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Statutory Evidence</Text>
            <Text style={styles.bodyText}>Section 65B hash verified against NPPA S.O. 1335(E) and DPCO 2013 schedules.</Text>
          </View>
        )}

        {activeTab === 'TIMELINE' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Financial Timeline</Text>
            <Text style={styles.bodyText}>Admission → Pre-Auth → Audit → Razorpay Payment → Reconciliation.</Text>
          </View>
        )}
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
    fontSize: 16,
    fontWeight: '700',
    color: Colors.neutral900,
    maxWidth: 220,
  },
  tabsRow: {
    paddingHorizontal: 20,
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral300,
    backgroundColor: Colors.white,
  },
  tabButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  activeTabButton: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.neutral600,
  },
  activeTabText: {
    color: Colors.white,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  card: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.neutral300,
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.neutral900,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 13,
    color: Colors.neutral600,
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'JetBrainsMono-Medium',
  },
  bodyText: {
    fontSize: 13,
    color: Colors.neutral600,
    lineHeight: 18,
  },
});
