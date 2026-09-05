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

export function WhyPayingScreen({
  hospitalRequested = 86900,
  verifiedResponsibility = 73400,
  difference = 13500,
  onBack,
}: {
  hospitalRequested?: number;
  verifiedResponsibility?: number;
  difference?: number;
  onBack?: () => void;
}) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Why am I paying this?</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Comparison Header Box */}
        <View style={styles.comparisonBox}>
          <View style={styles.compRow}>
            <Text style={styles.compLabel}>Hospital Requested Amount:</Text>
            <Text style={styles.compValue}>₹{hospitalRequested.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.compRow}>
            <Text style={styles.compLabel}>Verified Patient Responsibility:</Text>
            <Text style={[styles.compValue, { color: Colors.primary }]}>
              ₹{verifiedResponsibility.toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={[styles.compRow, styles.diffRow]}>
            <Text style={[styles.compLabel, { color: Colors.danger, fontWeight: '700' }]}>
              Identified Discrepancy:
            </Text>
            <Text style={[styles.compValue, { color: Colors.danger, fontWeight: '700' }]}>
              ₹{difference.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>

        {/* Explanation Categories */}
        <Text style={styles.sectionHeader}>Breakdown of Verified Responsibility</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>1. Co-Payment & Policy Deductible (₹36,000)</Text>
          <Text style={styles.cardBody}>
            Your insurance policy terms require a 10% co-payment on room rent and surgical fees.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>2. Verified Medicines & Non-Capped Implants (₹37,400)</Text>
          <Text style={styles.cardBody}>
            These items conform directly with statutory DPCO ceilings and hospital gazetted tariffs.
          </Text>
        </View>

        <View style={[styles.card, styles.alertCard]}>
          <Text style={styles.alertTitle}>3. What you SHOULD NOT pay (₹{difference.toLocaleString('en-IN')})</Text>
          <Text style={styles.cardBody}>
            Sanitization consumables and medical device pricing billed beyond legal ceilings are excluded from your verified responsibility.
          </Text>
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
  comparisonBox: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.neutral300,
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  compRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compLabel: {
    fontSize: 13,
    color: Colors.neutral600,
  },
  compValue: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.neutral900,
    fontFamily: 'JetBrainsMono-Medium',
  },
  diffRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.neutral300,
    paddingTop: 8,
    marginTop: 4,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.neutral900,
  },
  card: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.neutral300,
    borderRadius: 12,
    padding: 16,
    gap: 6,
  },
  alertCard: {
    backgroundColor: Colors.dangerSurface,
    borderColor: Colors.danger,
    borderLeftWidth: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.neutral900,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.danger,
  },
  cardBody: {
    fontSize: 13,
    color: Colors.neutral600,
    lineHeight: 18,
  },
});
