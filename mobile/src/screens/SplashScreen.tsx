import React from 'react';
import { View, Text, StyleSheet, StatusBar, Image } from 'react-native';
import { Colors } from '../theme/colors';

export function SplashScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      
      <View style={styles.centerContent}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.wordmark}>CURAVERIS</Text>
        <Text style={styles.tagline}>Your bill. Your rights.</Text>
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
  logoImage: {
    width: 72,
    height: 72,
    borderRadius: 16,
    marginBottom: 16,
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
