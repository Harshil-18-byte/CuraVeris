import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Colors } from '../theme/colors';

export function DocumentReviewScreen({
  pages = ['Page 1: Inpatient Invoice', 'Page 2: Pharmacy Breakdown', 'Page 3: Consumables Schedule'],
  onAnalyze,
  onAddPage,
  onBack,
}: {
  pages?: string[];
  onAnalyze: () => void;
  onAddPage?: () => void;
  onBack?: () => void;
}) {
  const [pageList, setPageList] = useState(pages);

  const handleDelete = (index: number) => {
    setPageList(pageList.filter((_: string, idx: number) => idx !== index));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Documents</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statusRow}>
          <Text style={styles.countText}>{pageList.length} Pages Attached</Text>
          <View style={styles.readabilityPill}>
            <Text style={styles.readabilityText}>✓ High Readability</Text>
          </View>
        </View>

        {/* Page Thumbnails Grid / List */}
        <View style={styles.pageList}>
          {pageList.map((pageTitle: string, idx: number) => (
            <View key={idx} style={styles.pageCard}>
              <View style={styles.pageThumbnail}>
                <Text style={{ fontSize: 28 }}>📄</Text>
                <Text style={styles.pageBadge}>P.{idx + 1}</Text>
              </View>

              <View style={styles.pageMeta}>
                <Text style={styles.pageTitle}>{pageTitle}</Text>
                <Text style={styles.pageSub}>Clean scan · Text extracted</Text>

                <View style={styles.pageActions}>
                  <TouchableOpacity style={styles.smallAction}>
                    <Text style={styles.actionText}>↻ Rotate</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.smallAction} onPress={() => handleDelete(idx)}>
                    <Text style={[styles.actionText, { color: Colors.danger }]}>✕ Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Add Another Page Button */}
        <TouchableOpacity style={styles.addPageButton} onPress={onAddPage}>
          <Text style={styles.addPageText}>+ Add Another Page / Document</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.bottomArea}>
        <TouchableOpacity
          style={[styles.primaryButton, pageList.length === 0 && styles.disabledButton]}
          disabled={pageList.length === 0}
          onPress={onAnalyze}
        >
          <Text style={styles.buttonText}>Analyze Documents →</Text>
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
    paddingBottom: 96,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral900,
  },
  readabilityPill: {
    backgroundColor: Colors.successSurface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  readabilityText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.success,
  },
  pageList: {
    gap: 12,
  },
  pageCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.neutral300,
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  pageThumbnail: {
    width: 64,
    height: 76,
    backgroundColor: Colors.neutral50,
    borderWidth: 1,
    borderColor: Colors.neutral300,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  pageBadge: {
    position: 'absolute',
    bottom: 4,
    fontSize: 10,
    fontWeight: '700',
    color: Colors.neutral600,
  },
  pageMeta: {
    flex: 1,
    justifyContent: 'space-between',
  },
  pageTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral900,
  },
  pageSub: {
    fontSize: 12,
    color: Colors.neutral600,
  },
  pageActions: {
    flexDirection: 'row',
    gap: 16,
  },
  smallAction: {
    paddingVertical: 2,
  },
  actionText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  addPageButton: {
    height: 44,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primarySurface,
  },
  addPageText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  bottomArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
