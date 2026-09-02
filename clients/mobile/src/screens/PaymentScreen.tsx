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

export function PaymentScreen({
  verifiedAmount = 73400,
  invoiceRef = 'MMH-8941',
  hospitalName = 'Metro Multispeciality Hospital',
  onProceedPayment,
  onBack,
}: {
  verifiedAmount?: number;
  invoiceRef?: string;
  hospitalName?: string;
  onProceedPayment: (paymentMethod: string) => void;
  onBack?: () => void;
}) {
  const [selectedMethod, setSelectedMethod] = useState<'UPI' | 'NETBANKING' | 'CARD'>('UPI');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pay Verified Amount</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subTitle}>
          CuraVeris verified this amount from your available financial information.
        </Text>

        {/* Amount Box */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>PAYABLE AMOUNT</Text>
          <Text style={styles.amountValue}>₹{verifiedAmount.toLocaleString('en-IN')}</Text>
          <Text style={styles.metaText}>{hospitalName} · Ref #{invoiceRef}</Text>
        </View>

        {/* Payment Methods */}
        <Text style={styles.sectionTitle}>Select Payment Method (Razorpay)</Text>

        <View style={styles.methodList}>
          {/* UPI */}
          <TouchableOpacity
            style={[styles.methodCard, selectedMethod === 'UPI' && styles.methodSelected]}
            onPress={() => setSelectedMethod('UPI')}
            activeOpacity={0.8}
          >
            <View style={styles.methodLeft}>
              <View>
                <Text style={styles.methodTitle}>UPI (Google Pay, PhonePe, Paytm)</Text>
                <Text style={styles.methodSub}>Instant settlement · Zero extra surcharge</Text>
              </View>
            </View>
            <View style={[styles.radio, selectedMethod === 'UPI' && styles.radioSelected]} />
          </TouchableOpacity>

          {/* Net Banking */}
          <TouchableOpacity
            style={[styles.methodCard, selectedMethod === 'NETBANKING' && styles.methodSelected]}
            onPress={() => setSelectedMethod('NETBANKING')}
            activeOpacity={0.8}
          >
            <View style={styles.methodLeft}>
              <View>
                <Text style={styles.methodTitle}>Net Banking</Text>
                <Text style={styles.methodSub}>All major Indian retail banks</Text>
              </View>
            </View>
            <View style={[styles.radio, selectedMethod === 'NETBANKING' && styles.radioSelected]} />
          </TouchableOpacity>

          {/* Cards */}
          <TouchableOpacity
            style={[styles.methodCard, selectedMethod === 'CARD' && styles.methodSelected]}
            onPress={() => setSelectedMethod('CARD')}
            activeOpacity={0.8}
          >
            <View style={styles.methodLeft}>
              <View>
                <Text style={styles.methodTitle}>Debit / Credit Card</Text>
                <Text style={styles.methodSub}>Visa, MasterCard, RuPay</Text>
              </View>
            </View>
            <View style={[styles.radio, selectedMethod === 'CARD' && styles.radioSelected]} />
          </TouchableOpacity>
        </View>

        <View style={styles.securityNote}>
          <Text style={styles.securityText}>
            Secured with 256-bit bank encryption via Razorpay.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomArea}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => onProceedPayment(selectedMethod)}
        >
          <Text style={styles.buttonText}>
            Pay ₹{verifiedAmount.toLocaleString('en-IN')} via Razorpay →
          </Text>
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
    gap: 16,
    paddingBottom: 96,
  },
  subTitle: {
    fontSize: 14,
    color: Colors.neutral600,
    lineHeight: 20,
  },
  amountCard: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 4,
  },
  amountLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.white,
    opacity: 0.8,
    letterSpacing: 0.5,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.white,
    fontFamily: 'JetBrainsMono-Medium',
  },
  metaText: {
    fontSize: 12,
    color: Colors.white,
    opacity: 0.85,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.neutral900,
    marginTop: 8,
  },
  methodList: {
    gap: 10,
  },
  methodCard: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.neutral300,
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  methodSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySurface,
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  methodTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral900,
  },
  methodSub: {
    fontSize: 12,
    color: Colors.neutral600,
    marginTop: 2,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.neutral300,
  },
  radioSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  securityNote: {
    alignItems: 'center',
    marginTop: 8,
  },
  securityText: {
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
  buttonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
});
