import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { Colors } from '../theme/colors';

export function SplashScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      
      <View style={styles.centerContent}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoBadgeText}>CV</Text>
        </View>
        <Text style={styles.wordmark}>CURAVERIS</Text>
        <Text style={styles.tagline}>Your bills, your rights.</Text>
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
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  logoBadgeText: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -1,
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
