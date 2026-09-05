import React, { useState, useRef, useEffect } from 'react';
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

export function OtpVerificationScreen({
  phone = '9876543210',
  onVerified,
}: {
  phone?: string;
  onVerified: () => void;
}) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(47);
  const [hasError, setHasError] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState(4);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const last4 = phone.slice(-4) || '3210';

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleDigitChange = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, '');
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setHasError(false);

    // Auto-advance to next cell
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify on 6th digit
    if (index === 5 && digit) {
      const fullCode = newOtp.join('');
      if (fullCode === '123456' || fullCode.length === 6) {
        onVerified();
      } else {
        setHasError(true);
        setAttemptsRemaining((prev: number) => Math.max(0, prev - 1));
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent?.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Enter Verification Code</Text>
          <Text style={styles.subTitle}>
            Sent to +91 XXXXX X{last4}
          </Text>
        </View>

        {/* 6 Individual 48x56px OTP Cells */}
        <View style={styles.otpRow}>
          {otp.map((digit: string, idx: number) => (
            <TextInput
              key={idx}
              ref={(ref: any) => {
                inputRefs.current[idx] = ref;
              }}
              style={[
                styles.otpBox,
                digit ? styles.filledBox : null,
                hasError ? styles.errorBox : null,
              ]}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={(text: string) => handleDigitChange(text, idx)}
              onKeyPress={(e: any) => handleKeyPress(e, idx)}
            />
          ))}
        </View>

        {/* Error Message */}
        {hasError && (
          <Text style={styles.errorText}>
            Incorrect code. {attemptsRemaining} attempts remaining.
          </Text>
        )}

        {/* Countdown / Resend */}
        <View style={styles.resendArea}>
          {countdown > 0 ? (
            <Text style={styles.countdownText}>
              Resend in 0:{countdown < 10 ? `0${countdown}` : countdown}
            </Text>
          ) : (
            <TouchableOpacity onPress={() => setCountdown(47)}>
              <Text style={styles.resendLink}>Resend Code</Text>
            </TouchableOpacity>
          )}
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
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  header: {
    marginBottom: 32,
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
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  otpBox: {
    width: 48,
    height: 56,
    borderWidth: 1.5,
    borderColor: Colors.neutral300,
    borderRadius: 8,
    backgroundColor: Colors.white,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: Colors.neutral900,
  },
  filledBox: {
    backgroundColor: Colors.primarySurface,
    borderColor: Colors.primary,
  },
  errorBox: {
    borderColor: Colors.danger,
    backgroundColor: Colors.dangerSurface,
  },
  errorText: {
    fontSize: 13,
    color: Colors.danger,
    marginBottom: 16,
    textAlign: 'center',
  },
  resendArea: {
    alignItems: 'center',
    marginTop: 16,
  },
  countdownText: {
    fontSize: 13,
    color: Colors.neutral600,
  },
  resendLink: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
});
