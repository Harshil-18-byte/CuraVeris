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

export function RegisterStep1Screen({ onNext }: { onNext: (data: { name: string; email: string }) => void }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleContinue = () => {
    if (!fullName.trim() || !email.trim()) {
      setError('Please fill in both full name and email address.');
      return;
    }
    setError(null);
    onNext({ name: fullName, email });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        {/* Progress Header: Step 1 of 4 */}
        <View style={styles.header}>
          <View style={styles.progressBar}>
            <View style={[styles.progressSegment, styles.activeSegment]} />
            <View style={styles.progressSegment} />
            <View style={styles.progressSegment} />
            <View style={styles.progressSegment} />
          </View>
          <Text style={styles.stepLabel}>Step 1 of 4</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>Create Your Account</Text>
          <Text style={styles.subTitle}>Your medical financial advocate.</Text>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Priya Sharma"
                placeholderTextColor="#8E8E93"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="priya@example.com"
                placeholderTextColor="#8E8E93"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>
        </View>

        {/* Bottom Button */}
        <View style={styles.bottomArea}>
          <TouchableOpacity
            style={[styles.primaryButton, (!fullName || !email) && styles.disabledButton]}
            onPress={handleContinue}
            disabled={!fullName || !email}
          >
            <Text style={styles.buttonText}>Continue →</Text>
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
  errorText: {
    fontSize: 13,
    color: Colors.danger,
    marginBottom: 12,
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
