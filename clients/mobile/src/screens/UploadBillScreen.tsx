import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { Colors } from '../theme/colors';

const OFFLINE_QUEUE_KEY = 'curaveris_offline_bill_queue';

export function UploadBillScreen({
  onStartAnalysis,
  onBack,
}: {
  onStartAnalysis: (data: any) => void;
  onBack?: () => void;
}) {
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: number; type: string } | null>(null);
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [hospitalName, setHospitalName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [billDate, setBillDate] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  const handleSimulateFileSelect = (source: 'camera' | 'file') => {
    setSelectedFile({
      name: source === 'camera' ? 'camera_bill_scan.jpg' : 'apollo_hospital_invoice.pdf',
      size: 2450000,
      type: source === 'camera' ? 'image/jpeg' : 'application/pdf',
    });
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    if (isOffline) {
      Alert.alert(
        "Saved for Later",
        "No internet connection. Your bill photo has been saved to the offline queue and will be uploaded automatically when you reconnect.",
        [{ text: "OK" }]
      );
      return;
    }

    setUploadProgress(45);
    setTimeout(() => {
      setUploadProgress(100);
      onStartAnalysis({ selectedFile, hospitalName, totalAmount, billDate });
    }, 800);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upload Bill</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Two Large Action Tiles (100px tall each) */}
        <View style={styles.tilesRow}>
          {/* Tile 1: Camera */}
          <TouchableOpacity
            style={styles.actionTile}
            onPress={() => handleSimulateFileSelect('camera')}
            activeOpacity={0.8}
          >
            <Text style={styles.tileTitle}>Take a Photo</Text>
            <Text style={styles.tileSub}>Photograph your paper bill</Text>
          </TouchableOpacity>

          {/* Tile 2: File Picker */}
          <TouchableOpacity
            style={styles.actionTile}
            onPress={() => handleSimulateFileSelect('file')}
            activeOpacity={0.8}
          >
            <Text style={styles.tileTitle}>Choose File</Text>
            <Text style={styles.tileSub}>PDF, PNG, JPEG · Max 50MB</Text>
          </TouchableOpacity>
        </View>

        {/* Selected File Preview Area */}
        {selectedFile && (
          <View style={styles.previewCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fileName}>{selectedFile.name}</Text>
              <Text style={styles.fileSize}>{(selectedFile.size / 1024 / 1024).toFixed(1)} MB</Text>
            </View>
            <Text style={styles.checkMark}>Ready</Text>
          </View>
        )}

        {/* Optional Fields Collapsed Section */}
        <View style={styles.optionalCard}>
          <TouchableOpacity
            style={styles.optionalHeader}
            onPress={() => setShowOptionalFields(!showOptionalFields)}
          >
            <Text style={styles.optionalTitle}>Add Details (Optional)</Text>
            <Text style={styles.expandText}>{showOptionalFields ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {showOptionalFields && (
            <View style={styles.optionalForm}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Hospital Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter hospital name"
                  placeholderTextColor="#8E8E93"
                  value={hospitalName}
                  onChangeText={setHospitalName}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Total Amount (₹)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 185000"
                  placeholderTextColor="#8E8E93"
                  keyboardType="numeric"
                  value={totalAmount}
                  onChangeText={setTotalAmount}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Bill Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor="#8E8E93"
                  value={billDate}
                  onChangeText={setBillDate}
                />
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Upload & Analyse Primary Button */}
      <View style={styles.bottomArea}>
        <TouchableOpacity
          style={[styles.primaryButton, !selectedFile && styles.disabledButton]}
          disabled={!selectedFile}
          onPress={handleUpload}
        >
          <Text style={styles.buttonText}>
            {uploadProgress ? `Uploading ${uploadProgress}%...` : 'Upload & Analyse →'}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.neutral900,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  tilesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionTile: {
    flex: 1,
    height: 100,
    backgroundColor: Colors.neutral50,
    borderWidth: 1.5,
    borderColor: Colors.neutral300,
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
  },
  tileTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.neutral900,
  },
  tileSub: {
    fontSize: 11,
    color: Colors.neutral600,
    marginTop: 2,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primarySurface,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  fileIconBox: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral900,
  },
  fileSize: {
    fontSize: 12,
    color: Colors.neutral600,
  },
  checkMark: {
    fontSize: 16,
    color: Colors.success,
    fontWeight: '700',
  },
  optionalCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.neutral300,
    borderRadius: 12,
    padding: 16,
  },
  optionalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral900,
  },
  expandText: {
    fontSize: 12,
    color: Colors.primary,
  },
  optionalForm: {
    marginTop: 16,
    gap: 12,
  },
  formGroup: {
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.neutral900,
  },
  input: {
    height: 44,
    borderWidth: 1.5,
    borderColor: Colors.neutral300,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: Colors.neutral900,
  },
  bottomArea: {
    padding: 20,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral300,
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
