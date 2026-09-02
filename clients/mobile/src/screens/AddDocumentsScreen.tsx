import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Colors } from '../theme/colors';

export function AddDocumentsScreen({
  onScanBill,
  onUploadBillPdf,
  onUploadInsurance,
  onUploadTpa,
  onUploadProof,
  onContinue,
  onBack,
}: {
  onScanBill: () => void;
  onUploadBillPdf: () => void;
  onUploadInsurance?: () => void;
  onUploadTpa?: () => void;
  onUploadProof?: () => void;
  onContinue: () => void;
  onBack?: () => void;
}) {
  const [hasBill, setHasBill] = useState(false);
  const [hasInsurance, setHasInsurance] = useState(false);
  const [hasTpa, setHasTpa] = useState(false);
  const [hasProof, setHasProof] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add your documents</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subTitle}>
          Supporting documents improve verification precision and uncover hidden deductions.
        </Text>

        {/* 1. Hospital Bill (Required) */}
        <View style={[styles.docCard, styles.requiredCard]}>
          <View style={styles.docTop}>
            <View>
              <Text style={styles.docTitle}>Hospital Bill</Text>
              <Text style={styles.badgeRequired}>REQUIRED</Text>
            </View>
            {hasBill && <Text style={styles.checkIcon}>Added</Text>}
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                setHasBill(true);
                onScanBill();
              }}
            >
              <Text style={styles.actionButtonText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                setHasBill(true);
                onUploadBillPdf();
              }}
            >
              <Text style={styles.actionButtonText}>Upload PDF</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. Insurance Document (Recommended) */}
        <View style={styles.docCard}>
          <View style={styles.docTop}>
            <View>
              <Text style={styles.docTitle}>Insurance Policy / Pre-Auth</Text>
              <Text style={styles.badgeRecommended}>RECOMMENDED</Text>
            </View>
            {hasInsurance ? (
              <Text style={styles.checkIcon}>Added</Text>
            ) : (
              <TouchableOpacity
                style={styles.smallUploadButton}
                onPress={() => setHasInsurance(true)}
              >
                <Text style={styles.smallUploadText}>Upload</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.docNote}>Needed to verify co-pays and non-payable exclusions.</Text>
        </View>

        {/* 3. TPA Summary (Optional) */}
        <View style={styles.docCard}>
          <View style={styles.docTop}>
            <View>
              <Text style={styles.docTitle}>TPA Settlement Letter</Text>
              <Text style={styles.badgeOptional}>OPTIONAL</Text>
            </View>
            {hasTpa ? (
              <Text style={styles.checkIcon}>Added</Text>
            ) : (
              <TouchableOpacity
                style={styles.smallUploadButton}
                onPress={() => setHasTpa(true)}
              >
                <Text style={styles.smallUploadText}>Upload</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.docNote}>Provides exact third-party administrator deduction reasons.</Text>
        </View>

        {/* 4. Payment Proof (Optional) */}
        <View style={styles.docCard}>
          <View style={styles.docTop}>
            <View>
              <Text style={styles.docTitle}>Prior Payment Receipts</Text>
              <Text style={styles.badgeOptional}>OPTIONAL</Text>
            </View>
            {hasProof ? (
              <Text style={styles.checkIcon}>Added</Text>
            ) : (
              <TouchableOpacity
                style={styles.smallUploadButton}
                onPress={() => setHasProof(true)}
              >
                <Text style={styles.smallUploadText}>Upload</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.docNote}>Advance deposit slips or hospital payment receipts.</Text>
        </View>
      </ScrollView>

      <View style={styles.bottomArea}>
        <TouchableOpacity
          style={[styles.primaryButton, !hasBill && styles.disabledButton]}
          disabled={!hasBill}
          onPress={onContinue}
        >
          <Text style={styles.buttonText}>Continue to Review →</Text>
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
    gap: 14,
    paddingBottom: 96,
  },
  subTitle: {
    fontSize: 14,
    color: Colors.neutral600,
    lineHeight: 20,
    marginBottom: 4,
  },
  docCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.neutral300,
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  requiredCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  docTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  docTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.neutral900,
  },
  badgeRequired: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 2,
  },
  badgeRecommended: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.success,
    marginTop: 2,
  },
  badgeOptional: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.neutral600,
    marginTop: 2,
  },
  checkIcon: {
    fontSize: 13,
    color: Colors.success,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  actionButton: {
    flex: 1,
    height: 40,
    backgroundColor: Colors.primarySurface,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  smallUploadButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 6,
  },
  smallUploadText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  docNote: {
    fontSize: 12,
    color: Colors.neutral600,
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
  disabledButton: {
    backgroundColor: Colors.neutral300,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
});
