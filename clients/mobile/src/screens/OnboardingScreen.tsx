import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { Colors } from '../theme/colors';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    step: 1,
    title: 'Upload Your Hospital Bill',
    body: 'PDF, image, or photo — we accept any format. We\'ll extract every line item automatically.',
  },
  {
    step: 2,
    title: 'We Check Every Charge By Law',
    body: 'Our engine cross-checks each item against CGHS rates, NPPA implant caps, DPCO drug ceilings, and IRDAI guidelines.',
  },
  {
    step: 3,
    title: 'Fight Back With Evidence',
    body: 'Get a cryptographically signed audit report and ready-to-file dispute documents — ombudsman petitions, anti-detention notices, and more.',
  },
];

export function OnboardingScreen({ onFinish }: { onFinish?: () => void }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else if (onFinish) {
      onFinish();
    }
  };

  const slide = SLIDES[currentSlide];

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar with Skip */}
      <View style={styles.topBar}>
        <View />
        <TouchableOpacity onPress={onFinish} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Top 45%: Illustration Area */}
      <View style={styles.illustrationArea}>
        <View style={styles.geometricIconContainer}>
          <Text style={{ fontSize: 36, fontWeight: '700', color: Colors.primary }}>Step {slide.step}</Text>
        </View>
      </View>

      {/* Bottom 55%: Text & Action Area */}
      <View style={styles.contentArea}>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.body}>{slide.body}</Text>

        {/* Dots Indicator */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                idx === currentSlide ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        {/* Action Button (Height 48px, Radius 8px) */}
        <TouchableOpacity style={styles.primaryButton} onPress={handleNext} activeOpacity={0.9}>
          <Text style={styles.buttonText}>
            {currentSlide === SLIDES.length - 1 ? 'Get Started' : 'Next →'}
          </Text>
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 14,
    color: Colors.neutral600,
    fontWeight: '500',
  },
  illustrationArea: {
    height: '40%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  geometricIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 16,
    backgroundColor: Colors.primarySurface,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentArea: {
    height: '60%',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.neutral900,
    lineHeight: 30,
    marginBottom: 12,
  },
  body: {
    fontSize: 16,
    color: Colors.neutral600,
    lineHeight: 24,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 24,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: Colors.primary,
  },
  inactiveDot: {
    width: 8,
    backgroundColor: Colors.neutral300,
  },
  primaryButton: {
    height: 48,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
});
