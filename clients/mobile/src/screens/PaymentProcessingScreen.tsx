import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Colors } from '../theme/colors';

const PAYMENT_STAGES = [
  { step: 1, title: 'Payment Submitted', desc: 'Securely received via Razorpay UPI gateway.' },
  { step: 2, title: 'Payment Confirmation', desc: 'Server signature verified against bank webhook.' },
  { step: 3, title: 'Reconciliation', desc: 'Matching transaction against hospital invoice ledger.' },
];

export function PaymentProcessingScreen({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const t1 = setTimeout(() => setCurrentStep(2), 1200);
    const t2 = setTimeout(() => setCurrentStep(3), 2500);
    const t3 = setTimeout(() => onComplete(), 3800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerArea}>
          <Text style={styles.title}>Confirming your payment</Text>
          <Text style={styles.subTitle}>
            We're validating the transaction with the bank and updating your reconciliation status.
          </Text>
        </View>

        <View style={styles.track}>
          {PAYMENT_STAGES.map((s) => {
            const isDone = currentStep > s.step;
            const isActive = currentStep === s.step;

            return (
              <View key={s.step} style={styles.stepRow}>
                <View
                  style={[
                    styles.circle,
                    isDone && styles.circleDone,
                    isActive && styles.circleActive,
                  ]}
                >
                  <Text style={styles.circleText}>{s.step}</Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={[styles.stepTitle, (isDone || isActive) && styles.activeTitle]}>
                    {s.title}
                  </Text>
                  {isActive && <Text style={styles.stepDesc}>{s.desc}</Text>}
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Do not close or refresh this screen.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral50,
    justifyContent: 'center',
  },
  content: {
    padding: 24,
    gap: 32,
  },
  headerArea: {
    gap: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.neutral900,
  },
  subTitle: {
    fontSize: 14,
    color: Colors.neutral600,
    lineHeight: 20,
  },
  track: {
    gap: 24,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.neutral300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleDone: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  circleActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  circleText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.neutral600,
  },
  activeTitle: {
    color: Colors.neutral900,
  },
  stepDesc: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: Colors.neutral600,
  },
});
