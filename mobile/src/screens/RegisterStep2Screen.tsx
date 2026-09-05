import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors } from '../theme/colors';

export function RegisterStep2Screen({
  onNext,
  onBack,
}: {
  onNext: (phone: string) => void;
  onBack?: () => void;
}) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [simDetected, setSimDetected] = useState<string | null>(null);

  // Silent SIM detection on mount
  useEffect(() => {
    // Simulated silent SIM detection without intrusive spinners
    const detected = '9876543210';
    setSimDetected(detected);
    setPhoneNumber(detected);
  }, []);

  const handleSendOtp = () => {
    if (phoneNumber.length >= 10) {
      onNext(phoneNumber);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        {/* Progress Header: Step 2 of 4 */}
        <View style={styles.header}>
          <View style={styles.progressBar}>
            <View style={[styles.progressSegment, styles.activeSegment]} />
            <View style={[styles.progressSegment, styles.activeSegment]} />
            <View style={styles.progressSegment} />
            <View style={styles.progressSegment} />
          </View>
          <Text style={styles.stepLabel}>Step 2 of 4</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>Your Phone Number</Text>
          <Text style={styles.subTitle}>We'll send a verification code to this number.</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Mobile Number</Text>
            
            {/* Phone Input with Non-Editable +91 Prefix */}
            <View style={styles.phoneInputContainer}>
              <View style={styles.prefixContainer}>
                <Text style={styles.flagText}>🇮🇳</Text>
                <Text style={styles.prefixText}>+91</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder="10-digit number"
                placeholderTextColor="#8E8E93"
                keyboardType="phone-pad"
                maxLength={10}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
              />
            </View>

            {/* Silent SIM Detection Chip */}
            {simDetected && (
              <TouchableOpacity
                onPress={() => setPhoneNumber(simDetected)}
                style={styles.simChip}
              >
                <Text style={styles.simChipText}>
                  Detected from SIM · Tap to edit
                </Text>
              </TouchableOpacity>
            )}

            <Text style={styles.privacyNote}>We'll never share your number.</Text>
          </View>
        </View>

        {/* Bottom Button */}
        <View style={styles.bottomArea}>
          <TouchableOpacity
            style={[styles.primaryButton, phoneNumber.length < 10 && styles.disabledButton]}
            onPress={handleSendOtp}
            disabled={phoneNumber.length < 10}
          >
            <Text style={styles.buttonText}>Send OTP →</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral50,
  },
  keyboardContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 16,
    marginBottom: 24,
  },
  progressBar: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.neutral300,
  },
  activeSegment: {
    backgroundColor: Colors.primary,
  },
  stepLabel: {
    fontSize: 12,
    color: Colors.neutral600,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.neutral900,
    marginBottom: 4,
  },
  subTitle: {
    fontSize: 14,
    color: Colors.neutral600,
    marginBottom: 24,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.neutral900,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    height: 48,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.neutral300,
    borderRadius: 8,
    overflow: 'hidden',
  },
  prefixContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: Colors.neutral50,
    borderRightWidth: 1,
    borderRightColor: Colors.neutral300,
    gap: 4,
  },
  flagText: {
    fontSize: 16,
  },
  prefixText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral900,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.neutral900,
    fontFamily: 'JetBrainsMono-Medium',
  },
  simChip: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primarySurface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 4,
  },
  simChipText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  privacyNote: {
    fontSize: 13,
    color: Colors.neutral600,
    marginTop: 4,
  },
  bottomArea: {
    paddingBottom: 24,
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
