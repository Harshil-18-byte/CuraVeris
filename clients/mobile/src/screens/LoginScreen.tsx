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

const LOGIN_MESSAGES = [
  'Over 800+ medicines and implants checked against NPPA & DPCO ceilings.',
  'Section 65B tamper-evident proof certificates generated for disputes.',
  'Full right to privacy and encryption under the DPDP Act 2023.',
  'Instant verification of ICU charges and duplicate bill line items.',
];

export function LoginScreen({
  onLoginSuccess,
  onNavigateRegister,
  onForgotPassword,
}: {
  onLoginSuccess: () => void;
  onNavigateRegister: () => void;
  onForgotPassword?: () => void;
}) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOGIN_MESSAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleSignIn = () => {
    if (identifier && password) {
      onLoginSuccess();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <View style={styles.content}>
          {/* Brand Wordmark */}
          <Text style={styles.wordmark}>CURAVERIS</Text>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subTitle}>Sign in to access your audited medical bills.</Text>

          {/* Rotating Trust Message Banner */}
          <View style={styles.messageBanner}>
            <Text style={styles.messageBannerTag}>BENCHMARK</Text>
            <Text style={styles.messageBannerText} numberOfLines={2}>
              {LOGIN_MESSAGES[messageIndex]}
            </Text>
          </View>

          {/* Account Lockout Banner (if applicable) */}
          {isLockedOut && (
            <View style={styles.lockoutBanner}>
              <Text style={styles.lockoutText}>
                Account locked. Try again in 12 minutes.
              </Text>
            </View>
          )}

          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Email or Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="priya@example.com or 9876543210"
                placeholderTextColor="#8E8E93"
                autoCapitalize="none"
                value={identifier}
                onChangeText={setIdentifier}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#8E8E93"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.showButton}
                >
                  <Text style={styles.showText}>{showPassword ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={onForgotPassword}
                style={styles.forgotPasswordButton}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.bottomArea}>
          <TouchableOpacity
            style={[styles.primaryButton, (!identifier || !password) && styles.disabledButton]}
            disabled={!identifier || !password}
            onPress={handleSignIn}
          >
            <Text style={styles.buttonText}>Sign In →</Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onNavigateRegister}
          >
            <Text style={styles.secondaryButtonText}>Create Account</Text>
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
    marginBottom: 16,
  },
  messageBanner: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.neutral300,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  messageBannerTag: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    backgroundColor: Colors.primarySurface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  messageBannerText: {
    flex: 1,
    fontSize: 12,
    color: Colors.neutral600,
    lineHeight: 16,
  },
  lockoutBanner: {
    backgroundColor: Colors.warningSurface,
    borderWidth: 1,
    borderColor: Colors.warning,
    borderLeftWidth: 4,
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
  },
  lockoutText: {
    fontSize: 13,
    color: Colors.warning,
    fontWeight: '600',
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
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
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
  showButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  showText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  forgotPasswordText: {
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.neutral300,
  },
  dividerText: {
    fontSize: 13,
    color: Colors.neutral600,
  },
  secondaryButton: {
    height: 48,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
});
