import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Colors } from '../theme/colors';

export function EvidenceCertificateScreen({
  onBack,
}: {
  onBack?: () => void;
}) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const handleCopy = (field: string) => {
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Audit Evidence</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subTitle}>Cryptographic proof your audit data is unchanged.</Text>

        {/* Certificate Card: White bg, Top 8px Primary Band */}
        <View style={styles.certificateCard}>
          <View style={styles.topBand} />

          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>CuraVeris Audit Certificate</Text>
          </View>

          <View style={styles.fieldsContainer}>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Evidence ID</Text>
              <Text style={styles.fieldValueMono}>EVD-2026-8941-SEC65B</Text>
            </View>

            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Bill Reference ID</Text>
              <Text style={styles.fieldValueMono}>MMH-8941-2026</Text>
            </View>

            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Issued At</Text>
              <Text style={styles.fieldValueMono}>30 Aug 2026, 17:30 IST</Text>
            </View>

            {/* Merkle Root Hash with Copy Action */}
            <View style={styles.hashRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Merkle Root Hash</Text>
                <Text style={styles.hashTextMono}>e3b0c44298fc1c14...855</Text>
              </View>
              <TouchableOpacity onPress={() => handleCopy('merkle')} style={styles.copyButton}>
                <Text style={styles.copyText}>{copiedField === 'merkle' ? 'Copied' : 'Copy'}</Text>
              </TouchableOpacity>
            </View>

            {/* HMAC Signature with Copy Action */}
            <View style={styles.hashRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>HMAC-SHA256 Signature</Text>
                <Text style={styles.hashTextMono}>7f83b1657ff1fc53...b1f</Text>
              </View>
              <TouchableOpacity onPress={() => handleCopy('hmac')} style={styles.copyButton}>
                <Text style={styles.copyText}>{copiedField === 'hmac' ? 'Copied' : 'Copy'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Integrity Status Row */}
          <View style={styles.statusChip}>
            <Text style={styles.statusChipText}>Verified — Data Intact</Text>
          </View>

          {/* Legal Disclaimer Accordion */}
          <View style={styles.accordionContainer}>
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => setShowDisclaimer(!showDisclaimer)}
            >
              <Text style={styles.accordionTitle}>What does this mean?</Text>
              <Text style={styles.accordionIcon}>{showDisclaimer ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {showDisclaimer && (
              <Text style={styles.accordionBody}>
                This certificate proves that the line items, hospital charges, and statutory rate matches have not been altered since the moment of invoice ingestion, complying with Section 65B of the Indian Evidence Act.
              </Text>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.buttonText}>Download PDF Certificate</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Verify Independently</Text>
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
  },
  subTitle: {
    fontSize: 14,
    color: Colors.neutral600,
  },
  certificateCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.neutral300,
    borderRadius: 12,
    overflow: 'hidden',
    padding: 20,
    gap: 16,
  },
  topBand: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: Colors.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.neutral900,
  },
  fieldsContainer: {
    gap: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.neutral300,
    paddingVertical: 12,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldLabel: {
    fontSize: 13,
    color: Colors.neutral600,
  },
  fieldValueMono: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.neutral900,
    fontFamily: 'JetBrainsMono-Medium',
  },
  hashRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  hashTextMono: {
    fontSize: 12,
    color: Colors.primary,
    fontFamily: 'JetBrainsMono-Medium',
    marginTop: 2,
  },
  copyButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: Colors.primarySurface,
    borderRadius: 4,
  },
  copyText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  statusChip: {
    backgroundColor: Colors.successSurface,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  statusChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.success,
  },
  accordionContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.neutral300,
    paddingTop: 8,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  accordionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.neutral900,
  },
  accordionIcon: {
    fontSize: 12,
    color: Colors.neutral600,
  },
  accordionBody: {
    fontSize: 12,
    color: Colors.neutral600,
    lineHeight: 18,
    marginTop: 6,
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
  secondaryButton: {
    height: 48,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
});
