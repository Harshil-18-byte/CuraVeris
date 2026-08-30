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

interface TimelineEvent {
  id: string;
  timestamp: string;
  stage: string;
  title: string;
  amount?: string;
  source: string;
  reason: string;
}

const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: '1',
    timestamp: '12 Aug 2026, 10:15 AM',
    stage: 'Admission',
    title: 'Estimated Initial Responsibility',
    amount: '₹35,000',
    source: 'Hospital Reception Desk',
    reason: 'Initial admission deposit and room category allocation.',
  },
  {
    id: '2',
    timestamp: '13 Aug 2026, 04:30 PM',
    stage: 'Pre-Authorization',
    title: 'TPA Pre-Auth Approval',
    amount: '₹1,40,000',
    source: 'Star Health Insurance TPA Desk',
    reason: 'Initial cashless authorization granted for cardiology stent procedure.',
  },
  {
    id: '3',
    timestamp: '16 Aug 2026, 11:00 AM',
    stage: 'Final Bill',
    title: 'Hospital Discharge Invoiced',
    amount: '₹2,18,400',
    source: 'Hospital Billing Department',
    reason: 'Consolidated final itemized inpatient invoice generated.',
  },
  {
    id: '4',
    timestamp: '16 Aug 2026, 11:45 AM',
    stage: 'Verification',
    title: 'CuraVeris Statutory Audit',
    amount: '₹73,400 (Verified)',
    source: 'CuraVeris Forensic Ledger Engine',
    reason: 'Flagged ₹14,500 unbundled sanitization and ₹26,740 stent ceiling overcharge.',
  },
  {
    id: '5',
    timestamp: '16 Aug 2026, 01:20 PM',
    stage: 'Payment',
    title: 'Patient Settlement Complete',
    amount: '₹73,400',
    source: 'Razorpay UPI Gateway',
    reason: 'Verified balance settled cleanly into hospital escrow.',
  },
];

export function FinancialTimelineScreen({
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
        <Text style={styles.headerTitle}>Your Financial Journey</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subTitle}>
          Complete audit trail tracking every material change, deduction, and payment.
        </Text>

        <View style={styles.timelineList}>
          {TIMELINE_EVENTS.map((event, idx) => (
            <View key={event.id} style={styles.eventRow}>
              {/* Timeline Indicator Line */}
              <View style={styles.indicatorCol}>
                <View style={styles.circle} />
                {idx < TIMELINE_EVENTS.length - 1 && <View style={styles.line} />}
              </View>

              {/* Event Content Card */}
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <Text style={styles.stageTag}>{event.stage}</Text>
                  <Text style={styles.timestamp}>{event.timestamp}</Text>
                </View>

                <Text style={styles.title}>{event.title}</Text>
                {event.amount && <Text style={styles.amountText}>{event.amount}</Text>}

                <Text style={styles.reasonText}>{event.reason}</Text>

                <View style={styles.sourceRow}>
                  <Text style={styles.sourceLabel}>Source:</Text>
                  <Text style={styles.sourceValue}>{event.source}</Text>
                </View>
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
  timelineList: {
    gap: 8,
  },
  eventRow: {
    flexDirection: 'row',
    gap: 12,
  },
  indicatorCol: {
    alignItems: 'center',
    width: 20,
  },
  circle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
    marginTop: 6,
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
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    gap: 6,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stageTag: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    backgroundColor: Colors.primarySurface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  timestamp: {
    fontSize: 11,
    color: Colors.neutral600,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.neutral900,
  },
  amountText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.neutral900,
    fontFamily: 'JetBrainsMono-Medium',
  },
  reasonText: {
    fontSize: 12,
    color: Colors.neutral600,
    lineHeight: 16,
  },
  sourceRow: {
    flexDirection: 'row',
    gap: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral300,
  },
  sourceLabel: {
    fontSize: 11,
    color: Colors.neutral600,
  },
  sourceValue: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.neutral900,
  },
});
