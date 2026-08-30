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

export function VerificationResultScreen({
  hospitalBilled = 218400,
  insurancePaid = 140000,
  tpaAdjustment = 5000,
  verifiedResponsibility = 73400,
  hospitalRequested = 86900,
  unexplainedVariance = 13500,
  confidence = 'High Confidence (94%)',
  onViewEvidence,
  onViewBreakdown,
  onPayVerified,
  onBack,
}: {
  hospitalBilled?: number;
  insurancePaid?: number;
  tpaAdjustment?: number;
  verifiedResponsibility?: number;
  hospitalRequested?: number;
  unexplainedVariance?: number;
  confidence?: string;
  onViewEvidence: () => void;
  onViewBreakdown: () => void;
  onPayVerified: () => void;
  onBack?: () => void;
}) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verification Result</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.topStatus}>Your bill has been analyzed</Text>

        {/* Primary Authoritative Amount Card */}
        <View style={styles.responsibilityCard}>
          <Text style={styles.responsibilityLabel}>VERIFIED PATIENT RESPONSIBILITY</Text>
          <Text style={styles.responsibilityAmount}>
            ₹{verifiedResponsibility.toLocaleString('en-IN')}
          </Text>
          <Text style={styles.confidenceText}>✓ {confidence}</Text>
        </View>

        {/* Authoritative Financial Reconciliation Flow */}
        <View style={styles.flowCard}>
          <Text style={styles.flowTitle}>Financial Reconciliation</Text>

          <View style={styles.flowRow}>
            <Text style={styles.flowLabel}>Hospital Gross Bill</Text>
            <Text style={styles.flowValue}>₹{hospitalBilled.toLocaleString('en-IN')}</Text>
          </View>

          <View style={styles.flowRow}>
            <Text style={styles.flowLabel}>Insurance Contribution</Text>
            <Text style={[styles.flowValue, { color: Colors.success }]}>
              −₹{insurancePaid.toLocaleString('en-IN')}
            </Text>
          </View>

          <View style={styles.flowRow}>
            <Text style={styles.flowLabel}>TPA Non-Payable Adjustment</Text>
            <Text style={[styles.flowValue, { color: Colors.success }]}>
              −₹{tpaAdjustment.toLocaleString('en-IN')}
            </Text>
          </View>

          <View style={[styles.flowRow, styles.borderTop]}>
            <Text style={[styles.flowLabel, { fontWeight: '700' }]}>Verified Responsibility</Text>
            <Text style={[styles.flowValue, { fontWeight: '700', color: Colors.primary }]}>
              ₹{verifiedResponsibility.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>

        {/* Hospital Request Comparison & Discrepancy Alert */}
        <View style={styles.comparisonCard}>
          <View style={styles.comparisonRow}>
            <Text style={styles.comparisonLabel}>Hospital Currently Requested:</Text>
            <Text style={styles.comparisonValue}>₹{hospitalRequested.toLocaleString('en-IN')}</Text>
          </View>

          {unexplainedVariance > 0 && (
            <View style={styles.mismatchBanner}>
              <Text style={styles.mismatchTitle}>
                ⚠ ₹{unexplainedVariance.toLocaleString('en-IN')} needs clarification
              </Text>
              <Text style={styles.mismatchBody}>
                Hospital requested amount exceeds statutory rate ceilings on medical implants and infection control kits.
              </Text>
            </View>
          )}
        </View>

        {/* Secondary Action Links */}
        <View style={styles.secondaryActions}>
          <TouchableOpacity style={styles.secondaryButton} onPress={onViewEvidence}>
            <Text style={styles.secondaryButtonText}>View Evidence & Legal Citations</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={onViewBreakdown}>
            <Text style={styles.secondaryButtonText}>View Itemized Breakdown</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Pay Verified Amount Button */}
      <View style={styles.bottomArea}>
        <TouchableOpacity style={styles.primaryButton} onPress={onPayVerified}>
          <Text style={styles.buttonText}>
            Pay Verified Amount (₹{verifiedResponsibility.toLocaleString('en-IN')}) →
          </Text>
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
    paddingBottom: 96,
  },
  topStatus: {
    fontSize: 14,
    color: Colors.neutral600,
    fontWeight: '500',
  },
  responsibilityCard: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  responsibilityLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
    opacity: 0.85,
    letterSpacing: 0.5,
  },
  responsibilityAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.white,
    fontFamily: 'JetBrainsMono-Medium',
    marginVertical: 6,
  },
  confidenceText: {
    fontSize: 13,
    color: Colors.white,
    opacity: 0.9,
    fontWeight: '600',
  },
  flowCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.neutral300,
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  flowTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.neutral900,
    marginBottom: 4,
  },
  flowRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  flowLabel: {
    fontSize: 13,
    color: Colors.neutral600,
  },
  flowValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral900,
    fontFamily: 'JetBrainsMono-Medium',
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: Colors.neutral300,
    paddingTop: 8,
    marginTop: 4,
  },
  comparisonCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.neutral300,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  comparisonLabel: {
    fontSize: 13,
    color: Colors.neutral600,
  },
  comparisonValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.neutral900,
    fontFamily: 'JetBrainsMono-Medium',
  },
  mismatchBanner: {
    backgroundColor: Colors.warningSurface,
    borderWidth: 1,
    borderColor: Colors.warning,
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: 12,
    gap: 4,
  },
  mismatchTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.warning,
  },
  mismatchBody: {
    fontSize: 12,
    color: Colors.neutral900,
    lineHeight: 16,
  },
  secondaryActions: {
    gap: 10,
  },
  secondaryButton: {
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
