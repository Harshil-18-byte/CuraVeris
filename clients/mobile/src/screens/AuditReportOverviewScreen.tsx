import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
} from 'react-native';
import { Colors } from '../theme/colors';

interface Finding {
  id: string;
  name: string;
  category: string;
  billedAmount: number;
  benchmarkAmount: number;
  overchargeAmount: number;
  statutoryBasis: string;
  plainLegalBasis: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

const FINDINGS: Finding[] = [
  {
    id: 'F1',
    name: 'Coronary DES Stent (Sierra)',
    category: 'NPPA',
    billedAmount: 65000,
    benchmarkAmount: 38260,
    overchargeAmount: 26740,
    statutoryBasis: 'NPPA Order S.O. 1335(E)',
    plainLegalBasis: 'Coronary stents have a statutory price ceiling of ₹38,260 plus applicable GST. Overcharging violates Essential Commodities Act.',
    severity: 'CRITICAL',
  },
  {
    id: 'F2',
    name: 'OT Sanitization & PPE Kit',
    category: 'IRDAI',
    billedAmount: 14500,
    benchmarkAmount: 0,
    overchargeAmount: 14500,
    statutoryBasis: 'IRDAI Master Circular 2024 (Clause 19.3)',
    plainLegalBasis: 'Hospitals cannot bill infection control overheads as separate patient line items.',
    severity: 'HIGH',
  },
  {
    id: 'F3',
    name: 'Paracetamol IV 100ml',
    category: 'DPCO',
    billedAmount: 450,
    benchmarkAmount: 185,
    overchargeAmount: 265,
    statutoryBasis: 'DPCO 2013 NLEM Schedule',
    plainLegalBasis: 'Essential intravenous analgesic formulation exceeds notified government MRP ceiling.',
    severity: 'MEDIUM',
  },
];

export function AuditReportOverviewScreen({
  onGenerateDispute,
  onBack,
}: {
  onGenerateDispute: () => void;
  onBack?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'confirmed' | 'aiRisk'>('confirmed');
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);

  const totalOvercharge = FINDINGS.reduce((sum, f) => sum + f.overchargeAmount, 0);

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Audit Report</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Hospital & Date Info */}
        <View style={styles.metaRow}>
          <Text style={styles.hospitalText}>Metro Multispeciality Hospital</Text>
          <Text style={styles.dateText}>12 Aug – 16 Aug 2026</Text>
        </View>

        {/* Summary Highlight Card: Primary bg, White text */}
        <View style={styles.highlightCard}>
          <Text style={styles.highlightTitle}>
            Potential Overcharge: ₹{totalOvercharge.toLocaleString('en-IN')}
          </Text>
          <Text style={styles.highlightSub}>Based on statutory law audit</Text>
        </View>

        {/* Risk Badge Row */}
        <View style={styles.badgeRow}>
          <View style={styles.riskChip}>
            <Text style={styles.riskChipText}>HIGH RISK (72/100)</Text>
          </View>
          <View style={styles.versionChip}>
            <Text style={styles.versionChipText}>Audit Engine v2.4</Text>
          </View>
        </View>

        {/* Two Tabs: Confirmed Findings | AI Risk */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'confirmed' && styles.activeTabButton]}
            onPress={() => setActiveTab('confirmed')}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'confirmed' && styles.activeTabButtonText,
              ]}
            >
              Confirmed Findings ({FINDINGS.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'aiRisk' && styles.activeTabButton]}
            onPress={() => setActiveTab('aiRisk')}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'aiRisk' && styles.activeTabButtonText,
              ]}
            >
              AI Risk
            </Text>
          </TouchableOpacity>
        </View>

        {/* TAB 1: CONFIRMED FINDINGS */}
        {activeTab === 'confirmed' && (
          <View style={{ gap: 12 }}>
            {FINDINGS.map((finding) => (
              <TouchableOpacity
                key={finding.id}
                style={[
                  styles.findingCard,
                  finding.severity === 'CRITICAL' || finding.severity === 'HIGH'
                    ? styles.findingCardDanger
                    : styles.findingCardWarning,
                ]}
                onPress={() => setSelectedFinding(finding)}
                activeOpacity={0.8}
              >
                <View style={styles.findingTop}>
                  <Text style={styles.findingName}>{finding.name}</Text>
                  <View style={styles.categoryChip}>
                    <Text style={styles.categoryText}>{finding.category}</Text>
                  </View>
                </View>

                <View style={styles.findingBottom}>
                  <Text style={styles.statuteText}>{finding.statutoryBasis}</Text>
                  <Text style={styles.overchargeAmount}>
                    Overcharge: ₹{finding.overchargeAmount.toLocaleString('en-IN')}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}

            {/* Total Overcharge Summary */}
            <View style={styles.totalSummaryCard}>
              <Text style={styles.totalSummaryLabel}>Total Confirmed Overcharges:</Text>
              <Text style={styles.totalSummaryAmount}>
                ₹{totalOvercharge.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>
        )}

        {/* TAB 2: AI RISK & SHAP */}
        {activeTab === 'aiRisk' && (
          <View style={{ gap: 16 }}>
            {/* Amber Info Banner */}
            <View style={styles.amberBanner}>
              <Text style={styles.amberBannerText}>
                ⚠️ AI Prediction — Not a Formal Legal Finding
              </Text>
            </View>

            {/* Score Gauge Display */}
            <View style={styles.gaugeCard}>
              <Text style={styles.scoreText}>Risk Score: 72</Text>
              <Text style={styles.confidenceText}>Confidence Range: 58% – 85%</Text>
            </View>

            {/* SHAP Factors */}
            <View style={styles.shapCard}>
              <Text style={styles.shapTitle}>Why this score?</Text>

              <View style={styles.factorRow}>
                <Text style={styles.factorIconRed}>↑</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.factorName}>Stent Rate Ratio (+38.4%)</Text>
                  <Text style={styles.factorDesc}>Invoiced price is 1.70x above notified ceiling.</Text>
                </View>
              </View>

              <View style={styles.factorRow}>
                <Text style={styles.factorIconRed}>↑</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.factorName}>High Consumables Overhead (+22.1%)</Text>
                  <Text style={styles.factorDesc}>Consumables exceed 20% of total invoiced bill.</Text>
                </View>
              </View>

              <View style={styles.factorRow}>
                <Text style={styles.factorIconGreen}>↓</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.factorName}>Standard Pharmacy MRP (-9.2%)</Text>
                  <Text style={styles.factorDesc}>Oral tablets conform to DPCO retail price schedule.</Text>
                </View>
              </View>

              <Text style={styles.footnoteText}>
                CuraVeris AI v2.4 · Trained on Indian hospital billing data
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Primary Button */}
      <View style={styles.bottomArea}>
        <TouchableOpacity style={styles.primaryButton} onPress={onGenerateDispute}>
          <Text style={styles.buttonText}>Generate Dispute Documents →</Text>
        </TouchableOpacity>
      </View>

      {/* Finding Detail Bottom Sheet Modal */}
      {selectedFinding && (
        <Modal visible transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.bottomSheet}>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>{selectedFinding.name}</Text>
                <TouchableOpacity onPress={() => setSelectedFinding(null)}>
                  <Text style={{ fontSize: 18, color: Colors.neutral600 }}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.sheetContent}>
                <View style={styles.sheetRow}>
                  <Text style={styles.sheetLabel}>Hospital Billed:</Text>
                  <Text style={styles.sheetValue}>₹{selectedFinding.billedAmount.toLocaleString('en-IN')}</Text>
                </View>

                <View style={styles.sheetRow}>
                  <Text style={styles.sheetLabel}>Statutory Cap:</Text>
                  <Text style={[styles.sheetValue, { color: Colors.success }]}>
                    ₹{selectedFinding.benchmarkAmount.toLocaleString('en-IN')}
                  </Text>
                </View>

                <View style={styles.sheetRow}>
                  <Text style={styles.sheetLabel}>Overcharge:</Text>
                  <Text style={[styles.sheetValue, { color: Colors.danger, fontWeight: '700' }]}>
                    ₹{selectedFinding.overchargeAmount.toLocaleString('en-IN')}
                  </Text>
                </View>

                <View style={{ marginTop: 12 }}>
                  <Text style={styles.sheetSectionTitle}>Legal Basis (Gazette):</Text>
                  <Text style={styles.sheetLegalText}>{selectedFinding.statutoryBasis}</Text>
                  <Text style={styles.sheetPlainLegalText}>{selectedFinding.plainLegalBasis}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.sheetButton}
                onPress={() => {
                  setSelectedFinding(null);
                  onGenerateDispute();
                }}
              >
                <Text style={styles.sheetButtonText}>Add to Dispute Document →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
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
  metaRow: {
    marginBottom: 4,
  },
  hospitalText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.neutral900,
  },
  dateText: {
    fontSize: 13,
    color: Colors.neutral600,
    marginTop: 2,
  },
  highlightCard: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 20,
  },
  highlightTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.white,
    fontFamily: 'JetBrainsMono-Medium',
  },
  highlightSub: {
    fontSize: 13,
    color: Colors.white,
    opacity: 0.8,
    marginTop: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  riskChip: {
    backgroundColor: Colors.dangerSurface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  riskChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.danger,
  },
  versionChip: {
    backgroundColor: Colors.neutral300,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  versionChipText: {
    fontSize: 11,
    color: Colors.neutral600,
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral300,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: Colors.primary,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.neutral600,
  },
  activeTabButtonText: {
    color: Colors.primary,
    fontWeight: '700',
  },
  findingCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.neutral300,
    borderRadius: 8,
    padding: 14,
  },
  findingCardDanger: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.danger,
  },
  findingCardWarning: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
  },
  findingTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  findingName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral900,
    flex: 1,
  },
  categoryChip: {
    backgroundColor: Colors.neutral50,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.neutral600,
  },
  findingBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statuteText: {
    fontSize: 12,
    color: Colors.neutral600,
  },
  overchargeAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.danger,
    fontFamily: 'JetBrainsMono-Medium',
  },
  totalSummaryCard: {
    backgroundColor: Colors.dangerSurface,
    borderWidth: 1,
    borderColor: Colors.danger,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  totalSummaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral900,
  },
  totalSummaryAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.danger,
    fontFamily: 'JetBrainsMono-Medium',
  },
  amberBanner: {
    backgroundColor: Colors.warningSurface,
    borderWidth: 1,
    borderColor: Colors.warning,
    borderRadius: 6,
    padding: 12,
  },
  amberBannerText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.warning,
  },
  gaugeCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.neutral300,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.danger,
    fontFamily: 'JetBrainsMono-Medium',
  },
  confidenceText: {
    fontSize: 13,
    color: Colors.neutral600,
    marginTop: 4,
  },
  shapCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.neutral300,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  shapTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral900,
  },
  factorRow: {
    flexDirection: 'row',
    gap: 10,
    padding: 8,
    backgroundColor: Colors.neutral50,
    borderRadius: 6,
  },
  factorIconRed: {
    fontSize: 18,
    color: Colors.danger,
    fontWeight: '700',
  },
  factorIconGreen: {
    fontSize: 18,
    color: Colors.success,
    fontWeight: '700',
  },
  factorName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.neutral900,
  },
  factorDesc: {
    fontSize: 12,
    color: Colors.neutral600,
    marginTop: 2,
  },
  footnoteText: {
    fontSize: 11,
    color: Colors.neutral600,
    marginTop: 8,
    textAlign: 'center',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    gap: 16,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.neutral300,
    alignSelf: 'center',
    marginBottom: 8,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.neutral900,
    flex: 1,
  },
  sheetContent: {
    gap: 8,
  },
  sheetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  sheetLabel: {
    fontSize: 13,
    color: Colors.neutral600,
  },
  sheetValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral900,
    fontFamily: 'JetBrainsMono-Medium',
  },
  sheetSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.neutral900,
    marginTop: 8,
  },
  sheetLegalText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  sheetPlainLegalText: {
    fontSize: 12,
    color: Colors.neutral600,
    marginTop: 4,
    lineHeight: 16,
  },
  sheetButton: {
    height: 48,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  sheetButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});
