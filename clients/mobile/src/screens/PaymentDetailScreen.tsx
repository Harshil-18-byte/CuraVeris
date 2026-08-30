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

export function PaymentDetailScreen({
  amount = 73400,
  date = '16 Aug 2026, 01:20 PM',
  status = 'CAPTURED',
  method = 'UPI (Google Pay)',
  razorpayRef = 'pay_P92kL18vQa910Z',
  obligationId = 'OBL-2026-8941',
  reconciliationId = 'REC-2026-5512',
  onBack,
}: {
  amount?: number;
  date?: string;
  status?: string;
  method?: string;
  razorpayRef?: string;
  obligationId?: string;
  reconciliationId?: string;
  onBack?: () => void;
}) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Detail</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.amountLabel}>SETTLED AMOUNT</Text>
          <Text style={styles.amountValue}>₹{amount.toLocaleString('en-IN')}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>✓ {status}</Text>
          </View>
        </View>

        <View style={styles.detailsCard}>
          <View style={styles.row}>
            <Text style={styles.label}>Date & Timestamp</Text>
            <Text style={styles.value}>{date}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Payment Method</Text>
            <Text style={styles.value}>{method}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Razorpay Reference</Text>
            <Text style={[styles.value, styles.mono]}>{razorpayRef}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Internal Obligation ID</Text>
            <Text style={[styles.value, styles.mono]}>{obligationId}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Reconciliation Ledger ID</Text>
            <Text style={[styles.value, styles.mono]}>{reconciliationId}</Text>
          </View>
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
  },
  card: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.neutral300,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 6,
  },
  amountLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.neutral600,
    letterSpacing: 0.5,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.neutral900,
    fontFamily: 'JetBrainsMono-Medium',
  },
  statusBadge: {
    backgroundColor: Colors.successSurface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.success,
  },
  detailsCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.neutral300,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  label: {
    fontSize: 13,
    color: Colors.neutral600,
  },
  value: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.neutral900,
  },
  mono: {
    fontFamily: 'JetBrainsMono-Medium',
  },
});
