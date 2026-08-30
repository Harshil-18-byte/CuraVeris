import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Colors } from '../theme/colors';

const STEPS = [
  { step: 1, title: 'Reading Bill', desc: 'Extracting OCR line items...' },
  { step: 2, title: 'Statutory Check', desc: 'Matching NPPA, DPCO & CGHS rate caps...' },
  { step: 3, title: 'AI Analysis', desc: 'Evaluating SHAP anomaly vectors...' },
  { step: 4, title: 'Financial Analysis', desc: 'Calculating statutory restitution...' },
  { step: 5, title: 'Report Ready', desc: 'Compiling Section 65B hash certificate...' },
];

export function BillProcessingStatusScreen({
  hospitalName = 'Metro Multispeciality',
  onViewReport,
  onBack,
}: {
  hospitalName?: string;
  onViewReport: () => void;
  onBack?: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStep(2), 1200);
    const timer2 = setTimeout(() => setCurrentStep(3), 2400);
    const timer3 = setTimeout(() => setCurrentStep(4), 3600);
    const timer4 = setTimeout(() => setCurrentStep(5), 4800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerHospital} numberOfLines={1}>
          {hospitalName}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Headline */}
        <View style={styles.headlineArea}>
          <Text style={styles.headline}>
            {currentStep < 5 ? 'Analysing Your Bill' : 'Audit Complete'}
          </Text>
          <Text style={styles.subHeadline}>
            {currentStep < 5
              ? 'Cross-checking invoiced items against statutory price schedules.'
              : 'All statutory rate checks and anomaly checks have finished.'}
          </Text>
        </View>

        {/* 5 Vertical Step Track */}
        <View style={styles.stepTrack}>
          {STEPS.map((s) => {
            const isDone = currentStep > s.step;
            const isActive = currentStep === s.step;
            const isPending = currentStep < s.step;

            return (
              <View key={s.step} style={styles.stepRow}>
                {/* Circle Indicator */}
                <View
                  style={[
                    styles.stepCircle,
                    isDone && styles.circleDone,
                    isActive && styles.circleActive,
                    isPending && styles.circlePending,
                  ]}
                >
                  <Text
                    style={[
                      styles.circleText,
                      isDone || isActive ? styles.whiteText : styles.neutralText,
                    ]}
                  >
                    {isDone ? '✓' : s.step}
                  </Text>
                </View>

                {/* Step Info */}
                <View style={styles.stepInfo}>
                  <Text
                    style={[
                      styles.stepTitle,
                      isDone || isActive ? styles.stepTitleActive : styles.stepTitlePending,
                    ]}
                  >
                    {s.title}
                  </Text>
                  {isActive && <Text style={styles.stepDesc}>{s.desc}</Text>}
                </View>
              </View>
            );
          })}
        </View>

        {/* Estimated Time Remaining */}
        {currentStep < 5 && (
          <View style={styles.timeArea}>
            <Text style={styles.timeText}>Estimated time remaining: ~30 seconds</Text>
          </View>
        )}
      </View>

      {/* View Report Button (Enabled on completion) */}
      <View style={styles.bottomArea}>
        <TouchableOpacity
          style={[styles.primaryButton, currentStep < 5 && styles.disabledButton]}
          disabled={currentStep < 5}
          onPress={onViewReport}
        >
          <Text style={styles.buttonText}>View Your Report →</Text>
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
  headerHospital: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.neutral900,
    maxWidth: 200,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  headlineArea: {
    marginBottom: 32,
  },
  headline: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.neutral900,
    marginBottom: 4,
  },
  subHeadline: {
    fontSize: 14,
    color: Colors.neutral600,
    lineHeight: 20,
  },
  stepTrack: {
    gap: 24,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleDone: {
    backgroundColor: Colors.success,
  },
  circleActive: {
    backgroundColor: Colors.primary,
  },
  circlePending: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.neutral300,
  },
  circleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  whiteText: {
    color: Colors.white,
  },
  neutralText: {
    color: Colors.neutral600,
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  stepTitleActive: {
    color: Colors.neutral900,
  },
  stepTitlePending: {
    color: Colors.neutral600,
  },
  stepDesc: {
    fontSize: 13,
    color: Colors.primary,
    marginTop: 2,
  },
  timeArea: {
    marginTop: 32,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 13,
    color: Colors.neutral600,
  },
  bottomArea: {
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
