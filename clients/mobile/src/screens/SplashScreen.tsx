import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { Colors } from '../theme/colors';

export function SplashScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      
      <View style={styles.centerContent}>
        <Text style={styles.wordmark}>CURAVERIS</Text>
        <Text style={styles.tagline}>India's Medical Bill Auditor</Text>
      </View>

      <View style={styles.bottomFootnote}>
        <Text style={styles.footnoteText}>Powered by AI · Statutory Law</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wordmark: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.75,
    marginTop: 8,
  },
  bottomFootnote: {
    paddingBottom: 16,
  },
  footnoteText: {
    fontSize: 12,
    color: Colors.white,
    opacity: 0.5,
  },
});
