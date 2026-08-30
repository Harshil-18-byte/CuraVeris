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

export function EvidenceViewerScreen({
  sourceDoc = 'Metro_Hospital_Final_Tax_Invoice.pdf',
  page = 7,
  lineItem = 'Coronary Drug Eluting Stent (Sierra)',
  extractedValue = '₹65,000',
  statutoryCap = '₹38,260',
  finding = 'Price exceeds NPPA Gazette Notification S.O. 1335(E)',
  confidence = '94%',
  ruleOrigin = 'NPPA_DEVICE_CAP',
  onBack,
}: {
  sourceDoc?: string;
  page?: number;
  lineItem?: string;
  extractedValue?: string;
  statutoryCap?: string;
  finding?: string;
  confidence?: string;
  ruleOrigin?: string;
  onBack?: () => void;
}) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Evidence Viewer</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Document Preview Box with Bounding Box Region */}
        <View style={styles.previewBox}>
          <View style={styles.previewHeader}>
            <Text style={styles.docName} numberOfLines={1}>📄 {sourceDoc}</Text>
            <Text style={styles.pageNumber}>Page {page}</Text>
          </View>

          {/* Simulated Invoiced Document Surface */}
          <View style={styles.documentSurface}>
            <Text style={styles.docLineMuted}>... Item 14: 2D Echocardiography ............ ₹4,500</Text>
            
            {/* Highlighted Bounding Box Region */}
            <View style={styles.highlightBoundingBox}>
              <Text style={styles.highlightText}>
                Item 15: {lineItem} ........... {extractedValue}
              </Text>
              <View style={styles.boundingTag}>
                <Text style={styles.boundingTagText}>FLAGGED REGION</Text>
              </View>
            </View>

            <Text style={styles.docLineMuted}>... Item 16: Angioplasty Cathlab Fee ...... ₹45,000</Text>
          </View>
        </View>

        {/* Forensic Evidence Detail Card */}
        <View style={styles.evidenceCard}>
          <Text style={styles.sectionTitle}>Finding & Statutory Ground</Text>
          <Text style={styles.findingText}>{finding}</Text>

          <View style={styles.grid}>
            <View style={styles.gridCell}>
              <Text style={styles.cellLabel}>Extracted Billed</Text>
              <Text style={[styles.cellValue, { color: Colors.danger }]}>{extractedValue}</Text>
            </View>
            <View style={styles.gridCell}>
              <Text style={styles.cellLabel}>Notified Legal Cap</Text>
              <Text style={[styles.cellValue, { color: Colors.success }]}>{statutoryCap}</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Rule Subsystem:</Text>
            <Text style={styles.metaValue}>{ruleOrigin}</Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Extraction Confidence:</Text>
            <Text style={styles.metaValue}>{confidence}</Text>
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
    paddingBottom: 48,
  },
  previewBox: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.neutral300,
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.neutral50,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral300,
  },
  docName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.neutral900,
    flex: 1,
  },
  pageNumber: {
    fontSize: 12,
    color: Colors.neutral600,
    fontWeight: '500',
  },
  documentSurface: {
    padding: 16,
    gap: 8,
    backgroundColor: '#FAF9F6',
  },
  docLineMuted: {
    fontSize: 12,
    color: '#8A8A9A',
    fontFamily: 'JetBrainsMono-Medium',
  },
  highlightBoundingBox: {
    backgroundColor: 'rgba(253, 237, 236, 0.9)',
    borderWidth: 1.5,
    borderColor: Colors.danger,
    borderRadius: 4,
    padding: 8,
    position: 'relative',
    marginVertical: 4,
  },
  highlightText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.danger,
    fontFamily: 'JetBrainsMono-Medium',
  },
  boundingTag: {
    position: 'absolute',
    top: -9,
    right: 8,
    backgroundColor: Colors.danger,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 2,
  },
  boundingTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.white,
  },
  evidenceCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.neutral300,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.neutral900,
  },
  findingText: {
    fontSize: 13,
    color: Colors.neutral600,
    lineHeight: 18,
  },
  grid: {
    flexDirection: 'row',
    gap: 10,
  },
  gridCell: {
    flex: 1,
    backgroundColor: Colors.neutral50,
    padding: 10,
    borderRadius: 6,
  },
  cellLabel: {
    fontSize: 11,
    color: Colors.neutral600,
    marginBottom: 2,
  },
  cellValue: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'JetBrainsMono-Medium',
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
});
