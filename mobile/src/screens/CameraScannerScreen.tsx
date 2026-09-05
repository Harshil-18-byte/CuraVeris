import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Colors } from '../theme/colors';

export function CameraScannerScreen({
  onCaptureDone,
  onCancel,
}: {
  onCaptureDone: (capturedPages: string[]) => void;
  onCancel: () => void;
}) {
  const [pageCount, setPageCount] = useState(1);
  const [flashOn, setFlashOn] = useState(false);
  const [capturedList, setCapturedList] = useState<string[]>(['page_1.jpg']);

  const handleCapture = () => {
    const nextCount = pageCount + 1;
    setPageCount(nextCount);
    setCapturedList([...capturedList, `page_${nextCount}.jpg`]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onCancel} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.topBarText}>Cancel</Text>
        </TouchableOpacity>

        <Text style={styles.pageCountText}>Page {pageCount} of {pageCount}</Text>

        <TouchableOpacity onPress={() => setFlashOn(!flashOn)}>
          <Text style={styles.topBarText}>{flashOn ? 'Flash On' : 'Flash Off'}</Text>
        </TouchableOpacity>
      </View>

      {/* Viewfinder Area with Document Edge Guide */}
      <View style={styles.viewfinder}>
        <View style={styles.documentGuide}>
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />

          <Text style={styles.guideText}>
            Align medical bill within borders · Keep steady
          </Text>
        </View>
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomBar}>
        <View style={{ width: 60 }} />

        {/* Capture Shutter Button */}
        <TouchableOpacity style={styles.shutterOuter} onPress={handleCapture} activeOpacity={0.8}>
          <View style={styles.shutterInner} />
        </TouchableOpacity>

        {/* Done / Review Button */}
        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => onCaptureDone(capturedList)}
        >
          <Text style={styles.doneButtonText}>Done ({capturedList.length})</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A14',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  topBarText: {
    fontSize: 14,
    color: Colors.white,
    fontWeight: '500',
  },
  pageCountText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
  viewfinder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  documentGuide: {
    width: '100%',
    height: '85%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: Colors.primaryLight,
  },
  cornerTL: { top: -2, left: -2, borderTopWidth: 3, borderLeftWidth: 3 },
  cornerTR: { top: -2, right: -2, borderTopWidth: 3, borderRightWidth: 3 },
  cornerBL: { bottom: -2, left: -2, borderBottomWidth: 3, borderLeftWidth: 3 },
  cornerBR: { bottom: -2, right: -2, borderBottomWidth: 3, borderRightWidth: 3 },
  guideText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  shutterOuter: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 4,
    borderColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.white,
  },
  doneButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  doneButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
});
