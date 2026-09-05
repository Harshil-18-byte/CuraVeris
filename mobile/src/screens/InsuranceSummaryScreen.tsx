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

export function InsuranceSummaryScreen({
  hospitalBilled = 218400,
  insuranceApproved = 140000,
  tpaAdjustment = 5000,
  patientShare = 73400,
  status = 'PARTIALLY RECONCILED',
  onSeeCalculation,
  onBack,
}: {
  hospitalBilled?: number;
  insuranceApproved?: number;
  tpaAdjustment?: number;
  patientShare?: number;
  status?: string;
  onSeeCalculation?: () => void;
  onBack?: () => void;
}) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Who is paying what?</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subTitle}>
          Authoritative multi-party claim settlement & co-pay attribution.
        </Text>

        <View style={styles.statusBanner}>
          <Text style={styles.statusLabel}>RECONCILIATION STATUS:</Text>
          <Text style={styles.statusValue}>● {status}</Text>
        </View>

        {/* 4 Summary Cards */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Hospital Invoiced Gross</Text>
            <Text style={styles.value}>₹{hospitalBilled.toLocaleString('en-IN')}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Insurance / TPA Approved</Text>
            <Text style={[styles.value, { color: Colors.success }]}>
              ₹{insuranceApproved.toLocaleString('en-IN')}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Disallowed Deductions Adjusted</Text>
            <Text style={[styles.value, { color: Colors.warning }]}>
              ₹{tpaAdjustment.toLocaleString('en-IN')}
            </Text>
          </View>

          <View style={[styles.row, styles.totalRow]}>
            <Text style={[styles.label, { fontWeight: '700' }]}>Patient Responsibility</Text>
            <Text style={[styles.value, { fontWeight: '700', color: Colors.primary }]}>
              ₹{patientShare.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.secondaryButton} onPress={onSeeCalculation}>
          <Text style={styles.secondaryButtonText}>See Detailed Calculation Formula →</Text>
        </TouchableOpacity>
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
  statusBanner: {
    backgroundColor: Colors.primarySurface,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  statusValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  card: {
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
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.neutral300,
    paddingTop: 10,
    marginTop: 4,
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
});
