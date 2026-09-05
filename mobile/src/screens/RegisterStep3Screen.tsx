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

export function RegisterStep3Screen({
  onFinish,
}: {
  onFinish: (data: { password: string }) => void;
}) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [dpdpConsent, setDpdpConsent] = useState(false);

  // Password Strength Calculation (0-4)
  const getStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = getStrength(password);
  const strengthLabels = ['Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = [Colors.danger, Colors.danger, Colors.warning, Colors.primaryLight, Colors.success];

  const isValid = password.length >= 8 && password === confirmPassword && dpdpConsent;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        {/* Progress: Step 4 of 4 */}
        <View style={styles.header}>
          <View style={styles.progressBar}>
            <View style={[styles.progressSegment, styles.activeSegment]} />
            <View style={[styles.progressSegment, styles.activeSegment]} />
            <View style={[styles.progressSegment, styles.activeSegment]} />
            <View style={[styles.progressSegment, styles.activeSegment]} />
          </View>
          <Text style={styles.stepLabel}>Step 4 of 4</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Set Your Password</Text>
          <Text style={styles.subTitle}>Secure your medical billing data.</Text>

          <View style={styles.form}>
            {/* Password Input */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Min. 8 characters"
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

              {/* Real-Time 4-Segment Strength Bar */}
              {password.length > 0 && (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthBarRow}>
                    {[1, 2, 3, 4].map((seg) => (
                      <View
                        key={seg}
                        style={[
                          styles.strengthSegment,
                          {
                            backgroundColor:
                              seg <= strength ? strengthColors[strength] : Colors.neutral300,
                          },
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={[styles.strengthLabel, { color: strengthColors[strength] }]}>
                    {strengthLabels[strength]}
                  </Text>
                </View>
              )}
            </View>

            {/* Confirm Password */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Re-enter password"
                placeholderTextColor="#8E8E93"
                secureTextEntry={!showPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            {/* DPDP Consent Section */}
            <View style={styles.consentSection}>
              <Text style={styles.consentTitle}>Data Privacy Consent</Text>
              <Text style={styles.consentBody}>
                CuraVeris collects and processes your medical bill data solely to perform billing audits on your behalf. Your data is encrypted and never sold. You may request deletion at any time.
              </Text>

              <TouchableOpacity
                onPress={() => setDpdpConsent(!dpdpConsent)}
                style={styles.checkboxRow}
                activeOpacity={0.8}
              >
                <View style={[styles.checkbox, dpdpConsent && styles.checkedBox]}>
                  {dpdpConsent && <View style={{ width: 10, height: 10, backgroundColor: '#fff', borderRadius: 2 }} />}
                </View>
                <Text style={styles.checkboxLabel}>
                  I agree to the Privacy Policy and consent to data processing under the DPDP Act 2023.
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Bottom Button */}
        <View style={styles.bottomArea}>
          <TouchableOpacity
            style={[styles.primaryButton, !isValid && styles.disabledButton]}
            disabled={!isValid}
            onPress={() => onFinish({ password })}
          >
            <Text style={styles.buttonText}>Create Account →</Text>
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
    marginBottom: 20,
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
    marginBottom: 20,
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
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  strengthBarRow: {
    flexDirection: 'row',
    gap: 4,
    flex: 1,
    marginRight: 12,
  },
  strengthSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  consentSection: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral300,
  },
  consentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral900,
    marginBottom: 4,
  },
  consentBody: {
    fontSize: 13,
    color: Colors.neutral600,
    lineHeight: 18,
    marginBottom: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.neutral300,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkedBox: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkMark: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 13,
    color: Colors.neutral900,
    lineHeight: 18,
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
