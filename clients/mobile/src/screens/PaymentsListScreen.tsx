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

const PAYMENTS = [
  {
    id: 'pay_P92kL18vQa910Z',
    hospital: 'Metro Multispeciality Hospital',
    amount: 73400,
    date: '16 Aug 2026',
    status: 'CAPTURED',
    reconciliation: 'MATCHED',
  },
  {
    id: 'pay_K71vN43xPz881Q',
    hospital: 'Apollo Surgical Centre',
    amount: 62000,
    date: '22 Jul 2026',
    status: 'CAPTURED',
    reconciliation: 'MATCHED',
  },
];

export function PaymentsListScreen({
  onSelectPayment,
  onBack,
}: {
  onSelectPayment?: (id: string) => void;
  onBack?: () => void;
}) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Payments & Settlements</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Current Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>CURRENT OUTSTANDING BALANCE</Text>
          <Text style={styles.balanceAmount}>₹0</Text>
          <Text style={styles.balanceSub}>All verified hospital obligations settled</Text>
        </View>

        <Text style={styles.sectionTitle}>Payment History</Text>

        <View style={styles.list}>
          {PAYMENTS.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={styles.card}
              onPress={() => onSelectPayment?.(p.id)}
              activeOpacity={0.8}
            >
              <View style={styles.cardTop}>
                <Text style={styles.hospitalName}>{p.hospital}</Text>
                <Text style={styles.amount}>₹{p.amount.toLocaleString('en-IN')}</Text>
              </View>

              <Text style={styles.dateText}>{p.date} · Ref #{p.id.slice(0, 12)}...</Text>

              <View style={styles.cardBottom}>
                <View style={styles.pillSuccess}>
                  <Text style={styles.pillText}>{p.reconciliation}</Text>
                </View>
                <Text style={styles.linkText}>View Receipt →</Text>
              </View>
            </TouchableOpacity>
          ))}
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.neutral900,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  balanceCard: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 4,
  },
  balanceLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.white,
    opacity: 0.8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.white,
    fontFamily: 'JetBrainsMono-Medium',
  },
  balanceSub: {
    fontSize: 12,
    color: Colors.white,
    opacity: 0.85,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.neutral900,
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.neutral300,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hospitalName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.neutral900,
    flex: 1,
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.neutral900,
    fontFamily: 'JetBrainsMono-Medium',
  },
  dateText: {
    fontSize: 12,
    color: Colors.neutral600,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral300,
  },
  pillSuccess: {
    backgroundColor: Colors.successSurface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.success,
  },
  linkText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
});
