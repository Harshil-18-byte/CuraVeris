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

export function LineItemDetailScreen({
  itemName = 'Surgical Consumables & OT PPE Kit',
  billedAmount = 18000,
  referenceAmount = 15600,
  difference = 2400,
  assessment = 'Potential discrepancy',
  reason = 'Unit price is above the configured comparison/reference threshold.',
  confidence = '91%',
  sourceDoc = 'Hospital Bill · Page 7',
  analysisOrigin = 'RULE',
  onViewEvidence,
  onBack,
}: {
  itemName?: string;
  billedAmount?: number;
  referenceAmount?: number;
  difference?: number;
  assessment?: string;
  reason?: string;
  confidence?: string;
  sourceDoc?: string;
  analysisOrigin?: 'RULE' | 'ML' | 'RECONCILIATION';
  onViewEvidence: () => void;
  onBack?: () => void;
}) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Line Item Detail</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.itemName}>{itemName}</Text>

        {/* Assessment Card */}
        <View style={styles.card}>
          <View style={styles.badgeRow}>
            <View style={styles.assessmentBadge}>
              <Text style={styles.assessmentText}>⚠ {assessment}</Text>
            </View>
            <View style={styles.originBadge}>
              <Text style={styles.originText}>Origin: {analysisOrigin}</Text>
            </View>
          </View>

          <View style={styles.financialsGrid}>
            <View style={styles.gridCell}>
              <Text style={styles.cellLabel}>Hospital Billed</Text>
              <Text style={styles.cellValue}>₹{billedAmount.toLocaleString('en-IN')}</Text>
            </View>

            <View style={styles.gridCell}>
              <Text style={styles.cellLabel}>Reference / Cap</Text>
              <Text style={[styles.cellValue, { color: Colors.success }]}>
                ₹{referenceAmount.toLocaleString('en-IN')}
              </Text>
            </View>

            <View style={[styles.gridCell, styles.differenceCell]}>
              <Text style={styles.cellLabel}>Variance</Text>
              <Text style={[styles.cellValue, { color: Colors.danger }]}>
                +₹{difference.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>
        </View>

        {/* Explanation Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Why this finding?</Text>
          <Text style={styles.reasonText}>{reason}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Confidence:</Text>
            <Text style={styles.metaValue}>{confidence}</Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Document Source:</Text>
            <Text style={styles.metaValue}>{sourceDoc}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomArea}>
        <TouchableOpacity style={styles.primaryButton} onPress={onViewEvidence}>
          <Text style={styles.buttonText}>VIEW EVIDENCE →</Text>
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
  itemName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.neutral900,
  },
  card: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.neutral300,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  assessmentBadge: {
    backgroundColor: Colors.warningSurface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  assessmentText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.warning,
  },
  originBadge: {
    backgroundColor: Colors.neutral50,
    borderWidth: 1,
    borderColor: Colors.neutral300,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  originText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.neutral600,
  },
  financialsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  gridCell: {
    flex: 1,
    backgroundColor: Colors.neutral50,
    padding: 10,
    borderRadius: 6,
  },
  differenceCell: {
    backgroundColor: Colors.dangerSurface,
  },
  cellLabel: {
    fontSize: 11,
    color: Colors.neutral600,
    marginBottom: 4,
  },
  cellValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.neutral900,
    fontFamily: 'JetBrainsMono-Medium',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.neutral900,
  },
  reasonText: {
    fontSize: 13,
    color: Colors.neutral600,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral300,
  },
  metaLabel: {
    fontSize: 13,
    color: Colors.neutral600,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.neutral900,
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
