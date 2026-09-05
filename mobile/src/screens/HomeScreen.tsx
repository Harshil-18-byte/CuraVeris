import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Colors } from '../theme/colors';

interface BillItem {
  id: string;
  hospitalName: string;
  uploadDate: string;
  billType: string;
  totalBilled: number;
  overchargeAmount: number;
  status: 'COMPLETED' | 'PROCESSING' | 'FAILED';
}

const RECENT_BILLS: BillItem[] = [
  {
    id: 'MMH-8941',
    hospitalName: 'Metro Multispeciality Hospital',
    uploadDate: '30 Aug 2026',
    billType: 'Inpatient Cardiology',
    totalBilled: 184500,
    overchargeAmount: 48200,
    status: 'COMPLETED',
  },
  {
    id: 'APO-2041',
    hospitalName: 'Apollo Surgical Centre',
    uploadDate: '24 Aug 2026',
    billType: 'Orthopedic Knee Implant',
    totalBilled: 245000,
    overchargeAmount: 62000,
    status: 'COMPLETED',
  },
  {
    id: 'MAX-5512',
    hospitalName: 'Max Healthcare Institute',
    uploadDate: '18 Aug 2026',
    billType: 'ICU & Emergency Ward',
    totalBilled: 95000,
    overchargeAmount: 0,
    status: 'PROCESSING',
  },
];

export function HomeScreen({
  userName = 'Priya',
  onSelectBill,
  onUploadBill,
  onNavigateTab,
}: {
  userName?: string;
  onSelectBill: (billId: string) => void;
  onUploadBill: () => void;
  onNavigateTab?: (tab: string) => void;
}) {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header Row */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning, {userName}</Text>
          <Text style={styles.dateText}>Saturday, 30 August</Text>
        </View>
        <TouchableOpacity style={styles.notificationBell}>
          <View style={styles.badgeDot} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Horizontal Scroll Card Row (3 cards, 160px wide each) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statCardsRow}
        >
          {/* Card 1 */}
          <View style={[styles.statCard, { borderLeftColor: Colors.primary }]}>
            <Text style={styles.statLabel}>Bills Checked</Text>
            <Text style={[styles.statNumber, { color: Colors.neutral900 }]}>3</Text>
            <Text style={styles.statSubText}>Total submitted</Text>
          </View>

          {/* Card 2 */}
          <View style={[styles.statCard, { borderLeftColor: Colors.success }]}>
            <Text style={styles.statLabel}>Checks Finished</Text>
            <Text style={[styles.statNumber, { color: Colors.success }]}>2</Text>
            <Text style={styles.statSubText}>Bills completed</Text>
          </View>

          {/* Card 3 */}
          <View style={[styles.statCard, { borderLeftColor: Colors.danger }]}>
            <Text style={styles.statLabel}>Extra Charges Found</Text>
            <Text style={[styles.statNumber, { color: Colors.danger }]}>₹1,10,200</Text>
            <Text style={styles.statSubText}>Possible refund</Text>
          </View>
        </ScrollView>

        {/* Section Header: Recent Bills */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Bills</Text>
          <TouchableOpacity onPress={() => onNavigateTab?.('bills')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {/* Vertical Bill Cards List */}
        {RECENT_BILLS.length > 0 ? (
          <View style={styles.billsList}>
            {RECENT_BILLS.map((bill) => (
              <TouchableOpacity
                key={bill.id}
                style={[
                  styles.billCard,
                  bill.overchargeAmount > 0 ? styles.billCardAlert : null,
                ]}
                onPress={() => onSelectBill(bill.id)}
                activeOpacity={0.8}
              >
                <View style={styles.billCardTop}>
                  <Text style={styles.hospitalName} numberOfLines={1}>
                    {bill.hospitalName}
                  </Text>
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
                      {bill.status === 'COMPLETED' ? 'Check complete' : 'Checking'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.billMeta}>
                  {bill.uploadDate} · {bill.billType}
                </Text>

                <View style={styles.billCardBottom}>
                  <Text style={styles.billedText}>
                    Bill Total: ₹{bill.totalBilled.toLocaleString('en-IN')}
                  </Text>

                  {bill.overchargeAmount > 0 ? (
                    <Text style={styles.overchargeText}>
                      Extra Charged: ₹{bill.overchargeAmount.toLocaleString('en-IN')}
                    </Text>
                  ) : (
                    <Text style={styles.processingText}>Checking government prices...</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          /* Empty State */
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyTitle}>You haven&apos;t uploaded any bills yet</Text>
            <Text style={styles.emptyBody}>
              Take a photo of your hospital bill and we&apos;ll check it for overcharges.
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={onUploadBill}>
              <Text style={styles.emptyButtonText}>Check a Bill</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity style={styles.fab} onPress={onUploadBill} activeOpacity={0.9}>
        <Text style={styles.fabIcon}>Upload</Text>
      </TouchableOpacity>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem}>
          <Text style={styles.activeTabLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => onNavigateTab?.('bills')}>
          <Text style={styles.inactiveTabLabel}>Bills</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => onNavigateTab?.('notifications')}>
          <Text style={styles.inactiveTabLabel}>Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => onNavigateTab?.('account')}>
          <Text style={styles.inactiveTabLabel}>Account</Text>
        </TouchableOpacity>
      </View>
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
    paddingTop: 12,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.neutral900,
  },
  dateText: {
    fontSize: 14,
    color: Colors.neutral600,
    marginTop: 2,
  },
  notificationBell: {
    position: 'relative',
    padding: 8,
  },
  badgeDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.danger,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  statCardsRow: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: 160,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.neutral300,
    borderLeftWidth: 4,
    borderRadius: 12,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.neutral600,
    marginBottom: 6,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'JetBrainsMono-Medium',
  },
  statSubText: {
    fontSize: 11,
    color: Colors.neutral600,
    marginTop: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral900,
  },
  seeAllText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  billsList: {
    paddingHorizontal: 20,
    gap: 12,
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
    marginRight: 8,
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
  billMeta: {
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
  processingText: {
    fontSize: 12,
    color: Colors.primary,
  },
  emptyStateContainer: {
    alignItems: 'center',
    padding: 32,
    marginHorizontal: 20,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.neutral300,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral900,
    marginBottom: 4,
  },
  emptyBody: {
    fontSize: 13,
    color: Colors.neutral600,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 80,
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
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral300,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabIcon: {
    fontSize: 20,
    color: Colors.primary,
  },
  activeTabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: 2,
  },
  inactiveTabIcon: {
    fontSize: 20,
    color: Colors.neutral600,
  },
  inactiveTabLabel: {
    fontSize: 11,
    color: Colors.neutral600,
    marginTop: 2,
  },
});
