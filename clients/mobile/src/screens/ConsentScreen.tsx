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

export function ConsentScreen({
  onContinue,
}: {
  onContinue: () => void;
}) {
  const [agreed, setAgreed] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Before we analyze your documents</Text>
        <Text style={styles.subTitle}>
          To provide accurate statutory verification, CuraVeris processes:
        </Text>

        <View style={styles.itemList}>
          <View style={styles.itemRow}>
            <Text style={styles.bullet}>•</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>Healthcare & Billing Documents</Text>
              <Text style={styles.itemDesc}>Itemized hospital invoices, pharmacy slips, discharge summaries.</Text>
            </View>
          </View>

          <View style={styles.itemRow}>
            <Text style={styles.bullet}>•</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>Insurance & TPA Settlements</Text>
              <Text style={styles.itemDesc}>Pre-authorizations, deduction letters, policy co-pay details.</Text>
            </View>
          </View>

          <View style={styles.itemRow}>
            <Text style={styles.bullet}>•</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>Financial & Payment Records</Text>
              <Text style={styles.itemDesc}>Razorpay receipts and transaction IDs to reconcile balances.</Text>
            </View>
          </View>
        </View>

        <View style={styles.dpdpCard}>
          <Text style={styles.dpdpTitle}>DPDP Act 2023 Compliance</Text>
          <Text style={styles.dpdpBody}>
            Your data is encrypted end-to-end and used exclusively for your bill audits. You retain full control to download or permanently erase your data at any time.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setAgreed(!agreed)}
          activeOpacity={0.8}
        >
          <View style={[styles.checkbox, agreed && styles.checkedBox]}>
            {agreed && <Text style={styles.checkMark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>
            I consent to document processing for medical bill verification under the Privacy Policy.
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.bottomArea}>
        <TouchableOpacity
          style={[styles.primaryButton, !agreed && styles.disabledButton]}
          disabled={!agreed}
          onPress={onContinue}
        >
          <Text style={styles.buttonText}>Continue →</Text>
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
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.neutral900,
  },
  subTitle: {
    fontSize: 15,
    color: Colors.neutral600,
    lineHeight: 22,
  },
  itemList: {
    gap: 16,
    marginVertical: 8,
  },
  itemRow: {
    flexDirection: 'row',
    gap: 12,
  },
  bullet: {
    fontSize: 18,
    color: Colors.primary,
    fontWeight: '700',
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.neutral900,
  },
  itemDesc: {
    fontSize: 13,
    color: Colors.neutral600,
    marginTop: 2,
  },
  dpdpCard: {
    backgroundColor: Colors.primarySurface,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    borderRadius: 8,
    padding: 16,
  },
  dpdpTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  dpdpBody: {
    fontSize: 13,
    color: Colors.neutral900,
    lineHeight: 18,
  },
  checkboxRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    marginTop: 8,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.neutral300,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkedBox: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkMark: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 13,
    color: Colors.neutral900,
    lineHeight: 18,
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
