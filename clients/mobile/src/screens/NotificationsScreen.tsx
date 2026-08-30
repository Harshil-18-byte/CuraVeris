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

const NOTIFICATIONS = [
  {
    id: '1',
    title: 'Bill Analysis Complete',
    body: 'Statutory verification for Metro Multispeciality Hospital has finished.',
    time: '10 mins ago',
    unread: true,
  },
  {
    id: '2',
    title: 'Payment Reconciled ✓',
    body: 'Your ₹73,400 settlement has been matched against the hospital ledger.',
    time: '2 hours ago',
    unread: false,
  },
  {
    id: '3',
    title: 'Dispute Letter Ready',
    body: 'Formal demand notice under Consumer Protection Act is ready for download.',
    time: 'Yesterday',
    unread: false,
  },
];

export function NotificationsScreen({
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
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.list}>
          {NOTIFICATIONS.map((n) => (
            <View
              key={n.id}
              style={[
                styles.card,
                n.unread && styles.unreadCard,
              ]}
            >
              <View style={styles.cardTop}>
                <Text style={styles.title}>{n.title}</Text>
                {n.unread && <View style={styles.unreadDot} />}
              </View>
              <Text style={styles.body}>{n.body}</Text>
              <Text style={styles.time}>{n.time}</Text>
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
  },
  list: {
    gap: 10,
  },
  card: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.neutral300,
    borderRadius: 10,
    padding: 14,
    gap: 4,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    backgroundColor: Colors.primarySurface,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.neutral900,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  body: {
    fontSize: 13,
    color: Colors.neutral600,
    lineHeight: 18,
  },
  time: {
    fontSize: 11,
    color: Colors.neutral600,
    marginTop: 4,
  },
});
