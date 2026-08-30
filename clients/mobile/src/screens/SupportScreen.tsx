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

const CATEGORIES = [
  { id: '1', icon: '🔍', title: 'Understand a Charge', desc: 'Questions on ICU tariffs, room limits, and DPCO price caps.' },
  { id: '2', icon: '🛡️', title: 'Understand Insurance & TPA', desc: 'Why certain consumables or sanitization items were deducted.' },
  { id: '3', icon: '💳', title: 'Understand Payment & Settlements', desc: 'Verification of Razorpay transactions and hospital receipts.' },
  { id: '4', icon: '⚖️', title: 'Dispute a Discrepancy', desc: 'Serving formal legal notices under the Consumer Protection Act.' },
];

export function SupportScreen({
  onSelectCategory,
  onBack,
}: {
  onSelectCategory?: (id: string) => void;
  onBack?: () => void;
}) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Support & Guidance</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subTitle}>
          Get contextual assistance and statutory explanations for your medical bills.
        </Text>

        <View style={styles.list}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.card}
              onPress={() => onSelectCategory?.(cat.id)}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 24 }}>{cat.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{cat.title}</Text>
                <Text style={styles.cardDesc}>{cat.desc}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Need human advocate assistance?</Text>
          <Text style={styles.contactBody}>
            Email our patient financial grievance counselors at support@curaveris.in
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
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
    lineHeight: 20,
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.neutral300,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.neutral900,
  },
  cardDesc: {
    fontSize: 12,
    color: Colors.neutral600,
    marginTop: 2,
    lineHeight: 16,
  },
  chevron: {
    fontSize: 20,
    color: Colors.neutral600,
  },
  contactCard: {
    backgroundColor: Colors.primarySurface,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 16,
    gap: 4,
    marginTop: 8,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  contactBody: {
    fontSize: 13,
    color: Colors.neutral900,
    lineHeight: 18,
  },
});
