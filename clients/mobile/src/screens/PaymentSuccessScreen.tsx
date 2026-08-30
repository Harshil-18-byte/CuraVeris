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

export function PaymentSuccessScreen({
  paidAmount = 73400,
  expectedAmount = 73400,
  transactionId = 'pay_P92kL18vQa910Z',
  reconciliationStatus = 'MATCHED ✓',
  onViewReceipt,
  onDone,
}: {
  paidAmount?: number;
  expectedAmount?: number;
  transactionId?: string;
  reconciliationStatus?: string;
  onViewReceipt: () => void;
  onDone: () => void;
}) {
  const difference = expectedAmount - paidAmount;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Success Check Header */}
        <View style={styles.successHeader}>
          <View style={styles.checkCircle}>
            <Text style={styles.checkMark}>✓</Text>
          </View>
          <Text style={styles.paidAmountText}>₹{paidAmount.toLocaleString('en-IN')} Paid</Text>
          <Text style={styles.verifiedSub}>Payment Verified by Razorpay & CuraVeris</Text>
        </View>

        {/* Reconciliation Box */}
        <View style={styles.reconciliationCard}>
          <Text style={styles.cardTitle}>Reconciliation Breakdown</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Expected Verified Amount</Text>
            <Text style={styles.value}>₹{expectedAmount.toLocaleString('en-IN')}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Paid Amount</Text>
            <Text style={[styles.value, { color: Colors.success }]}>
              ₹{paidAmount.toLocaleString('en-IN')}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Remaining Variance</Text>
            <Text style={styles.value}>₹{difference.toLocaleString('en-IN')}</Text>
          </View>

          <View style={[styles.row, styles.reconciledRow]}>
            <Text style={[styles.label, { fontWeight: '700' }]}>Reconciliation Status</Text>
            <View style={styles.matchedPill}>
              <Text style={styles.matchedText}>{reconciliationStatus}</Text>
            </View>
          </View>
        </View>

        {/* Transaction Reference Card */}
        <View style={styles.refCard}>
          <Text style={styles.refLabel}>Razorpay Transaction ID:</Text>
          <Text style={styles.refValue}>{transactionId}</Text>
        </View>

        <TouchableOpacity style={styles.secondaryButton} onPress={onViewReceipt}>
          <Text style={styles.secondaryButtonText}>View Signed Receipt PDF →</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.bottomArea}>
        <TouchableOpacity style={styles.primaryButton} onPress={onDone}>
          <Text style={styles.buttonText}>Back to Home</Text>
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
  content: {
    padding: 24,
    gap: 16,
    paddingBottom: 96,
    alignItems: 'center',
  },
  successHeader: {
    alignItems: 'center',
    marginVertical: 12,
    gap: 6,
  },
  checkCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkMark: {
    fontSize: 32,
    color: Colors.white,
    fontWeight: '700',
  },
  paidAmountText: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.neutral900,
    fontFamily: 'JetBrainsMono-Medium',
  },
  verifiedSub: {
    fontSize: 14,
    color: Colors.success,
    fontWeight: '600',
  },
  reconciliationCard: {
    width: '100%',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.neutral300,
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.neutral900,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  reconciledRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.neutral300,
    paddingTop: 10,
    marginTop: 4,
  },
  matchedPill: {
    backgroundColor: Colors.successSurface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  matchedText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.success,
  },
  refCard: {
    width: '100%',
    backgroundColor: Colors.neutral50,
    borderWidth: 1,
    borderColor: Colors.neutral300,
    borderRadius: 8,
    padding: 12,
  },
  refLabel: {
    fontSize: 11,
    color: Colors.neutral600,
  },
  refValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.neutral900,
    fontFamily: 'JetBrainsMono-Medium',
    marginTop: 2,
  },
  secondaryButton: {
    width: '100%',
    height: 44,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  bottomArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral300,
  },
  primaryButton: {
    height: 48,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
});
