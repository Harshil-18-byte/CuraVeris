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

export function DiscrepancyResolutionScreen({
  amount = 13500,
  hospitalName = 'Metro Multispeciality',
  status = 'Awaiting response',
  onUploadDoc,
  onViewEvidence,
  onTrackStatus,
  onBack,
}: {
  amount?: number;
  hospitalName?: string;
  status?: string;
  onUploadDoc?: () => void;
  onViewEvidence?: () => void;
  onTrackStatus?: () => void;
  onBack?: () => void;
}) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Discrepancy Resolution</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.alertCard}>
          <Text style={styles.alertTitle}>
            ₹{amount.toLocaleString('en-IN')} requires clarification
          </Text>
          <Text style={styles.alertBody}>
            {hospitalName} billed charges exceeding gazetted statutory ceilings. A formal clarification notice is active.
          </Text>
          <View style={styles.statusPill}>
            <Text style={styles.statusText}>STATUS: {status}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Available Actions</Text>

        <View style={styles.actionsList}>
          <TouchableOpacity style={styles.actionCard} onPress={onViewEvidence}>
            <Text style={{ fontSize: 20 }}>📑</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.actionTitle}>View Statutory Evidence</Text>
              <Text style={styles.actionSub}>Review Gazette notifications cited in this finding</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={onUploadDoc}>
            <Text style={{ fontSize: 20 }}>📁</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.actionTitle}>Upload Supporting Document</Text>
              <Text style={styles.actionSub}>Attach hospital response or revised discharge summary</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={onTrackStatus}>
            <Text style={{ fontSize: 20 }}>⏱️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.actionTitle}>Track Resolution Timeline</Text>
              <Text style={styles.actionSub}>Follow dispute progression through hospital billing desk</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
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
  },
  alertCard: {
    backgroundColor: Colors.warningSurface,
    borderWidth: 1,
    borderColor: Colors.warning,
    borderLeftWidth: 4,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.warning,
  },
  alertBody: {
    fontSize: 13,
    color: Colors.neutral900,
    lineHeight: 18,
  },
  statusPill: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.warning,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.neutral900,
    marginTop: 8,
  },
  actionsList: {
    gap: 10,
  },
  actionCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.neutral300,
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral900,
  },
  actionSub: {
    fontSize: 12,
    color: Colors.neutral600,
    marginTop: 2,
  },
  chevron: {
    fontSize: 18,
    color: Colors.neutral600,
  },
});
