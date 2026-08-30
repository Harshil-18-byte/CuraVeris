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

export function ReconciliationResultScreen({
  expected = 73400,
  received = 73400,
  isMatched = true,
  varianceReason = 'Zero variance — Full settlement captured',
  onBack,
}: {
  expected?: number;
  received?: number;
  isMatched?: boolean;
  varianceReason?: string;
  onBack?: () => void;
}) {
  const diff = expected - received;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Reconciliation</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, isMatched ? styles.matchedCard : styles.alertCard]}>
          <Text style={styles.statusLabel}>RECONCILIATION AUDIT</Text>
          <Text style={[styles.statusTitle, { color: isMatched ? Colors.success : Colors.warning }]}>
            {isMatched ? 'RECONCILED ✓' : 'REVIEW REQUIRED ⚠'}
          </Text>
          <Text style={styles.reasonText}>{varianceReason}</Text>
        </View>

        <View style={styles.detailsCard}>
          <View style={styles.row}>
            <Text style={styles.label}>Expected Obligation</Text>
            <Text style={styles.value}>₹{expected.toLocaleString('en-IN')}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Settled & Received</Text>
            <Text style={[styles.value, { color: Colors.success }]}>
              ₹{received.toLocaleString('en-IN')}
            </Text>
          </View>

          <View style={[styles.row, styles.borderTop]}>
            <Text style={[styles.label, { fontWeight: '700' }]}>Net Variance</Text>
            <Text style={[styles.value, { fontWeight: '700' }]}>
              ₹{diff.toLocaleString('en-IN')}
            </Text>
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
  matchedCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
  },
  alertCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.neutral600,
    letterSpacing: 0.5,
  },
  statusTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  reasonText: {
    fontSize: 13,
    color: Colors.neutral600,
    textAlign: 'center',
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
  },
  label: {
    fontSize: 13,
    color: Colors.neutral600,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral900,
    fontFamily: 'JetBrainsMono-Medium',
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: Colors.neutral300,
    paddingTop: 10,
    marginTop: 4,
  },
});
