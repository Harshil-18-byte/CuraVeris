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

const RESOLUTION_STEPS = [
  { step: '1', title: 'Finding Created', date: '16 Aug, 11:45 AM', desc: 'NPPA implant rate discrepancy flagged by CuraVeris engine.' },
  { step: '2', title: 'Clarification Requested', date: '16 Aug, 02:15 PM', desc: 'Dispute demand notice served to hospital billing desk.' },
  { step: '3', title: 'Hospital Response Received', date: '17 Aug, 10:30 AM', desc: 'Hospital acknowledged overcharge on consumables; revised invoice.' },
  { step: '4', title: 'Evidence Attached', date: '17 Aug, 11:00 AM', desc: 'Revised discharge receipt and ledger credit note uploaded.' },
  { step: '5', title: 'CuraVeris Re-evaluated', date: '17 Aug, 11:15 AM', desc: 'Re-audit verified ₹13,500 adjustment against statutory caps.' },
  { step: '6', title: 'Resolution Complete', date: '17 Aug, 11:30 AM', desc: 'Case marked resolved. Net patient balance reconciled to ₹0.' },
];

export function ResolutionTimelineScreen({
  onBack,
}: {
  onBack?: () => void;
}) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Resolution Timeline</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subTitle}>
          Progress tracking for dispute resolution and hospital billing revisions.
        </Text>

        <View style={styles.timeline}>
          {RESOLUTION_STEPS.map((s, idx) => (
            <View key={s.step} style={styles.stepRow}>
              <View style={styles.indicatorCol}>
                <View style={styles.circle}>
                  <Text style={styles.circleText}>{s.step}</Text>
                </View>
                {idx < RESOLUTION_STEPS.length - 1 && <View style={styles.line} />}
              </View>

              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <Text style={styles.title}>{s.title}</Text>
                  <Text style={styles.date}>{s.date}</Text>
                </View>
                <Text style={styles.desc}>{s.desc}</Text>
              </View>
            </View>
          ))}
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
  subTitle: {
    fontSize: 14,
    color: Colors.neutral600,
    lineHeight: 20,
  },
  timeline: {
    gap: 8,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 12,
  },
  indicatorCol: {
    alignItems: 'center',
    width: 24,
  },
  circle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.white,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.neutral300,
    marginVertical: 4,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.neutral300,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    gap: 4,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.neutral900,
  },
  date: {
    fontSize: 11,
    color: Colors.neutral600,
  },
  desc: {
    fontSize: 12,
    color: Colors.neutral600,
    lineHeight: 16,
  },
});
