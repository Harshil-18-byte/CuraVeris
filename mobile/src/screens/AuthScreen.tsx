import React, { useState } from 'react';
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

export function AuthScreen({
  onOtpSent,
  onSkip,
}: {
  onOtpSent: (phone: string, email?: string) => void;
  onSkip?: () => void;
}) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [showEmail, setShowEmail] = useState(false);

  const handleSendOtp = () => {
    if (phoneNumber.length >= 10) {
      onOtpSent(phoneNumber, email);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <View style={styles.content}>
          <Text style={styles.wordmark}>CURAVERIS</Text>
          <Text style={styles.title}>Sign in to CuraVeris</Text>
          <Text style={styles.subTitle}>
            Healthcare Financial Verification · Know what you actually owe.
          </Text>

          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Mobile Phone Number</Text>
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
            </View>

            {showEmail ? (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Email Address (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="name@example.com"
                  placeholderTextColor="#8E8E93"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            ) : (
              <TouchableOpacity onPress={() => setShowEmail(true)}>
                <Text style={styles.linkText}>+ Add email for detailed audit statements</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.bottomArea}>
          <TouchableOpacity
            style={[styles.primaryButton, phoneNumber.length < 10 && styles.disabledButton]}
            disabled={phoneNumber.length < 10}
            onPress={handleSendOtp}
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
    paddingTop: 32,
  },
  content: {
    flex: 1,
  },
  wordmark: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.neutral900,
    marginBottom: 4,
  },
  subTitle: {
    fontSize: 14,
    color: Colors.neutral600,
    marginBottom: 24,
    lineHeight: 20,
  },
  form: {
    gap: 16,
  },
  formGroup: {
    gap: 6,
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
  },
  input: {
    height: 48,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.neutral300,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 15,
    color: Colors.neutral900,
  },
  linkText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
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
