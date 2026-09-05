import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
} from 'react-native';
import { Colors } from '../theme/colors';

interface DocItem {
  id: string;
  title: string;
  desc: string;
  status: 'READY' | 'DRAFT' | 'NOT_GENERATED';
  statute: string;
}

const DOCS: DocItem[] = [
  {
    id: 'D1',
    title: 'Hospital Overcharge Dispute Notice',
    desc: 'Formal demand for refund of ₹48,200 citing NPPA price cap violation.',
    status: 'READY',
    statute: 'Consumer Protection Act 2019, Section 2(47)',
  },
  {
    id: 'D2',
    title: 'IRDAI Ombudsman Grievance Petition',
    desc: 'Dispute unlawful deduction of OT sanitization and consumables.',
    status: 'READY',
    statute: 'IRDAI Master Circular 2024, Schedule I',
  },
  {
    id: 'D3',
    title: 'Anti-Detention Emergency Notice',
    desc: 'Prohibits hospital from unlawfully detaining discharged patient.',
    status: 'DRAFT',
    statute: 'Delhi High Court W.P.(C) 402/2018',
  },
];

const STATES = ['Maharashtra', 'Delhi NCR', 'Karnataka', 'Tamil Nadu', 'Telangana'];

export function LegalDocumentsHubScreen({
  onBack,
}: {
  onBack?: () => void;
}) {
  const [selectedDoc, setSelectedDoc] = useState<DocItem | null>(null);
  const [selectedState, setSelectedState] = useState('Maharashtra');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReady, setGeneratedReady] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedReady(true);
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dispute Documents</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subTitle}>
          Pre-formatted legal documents ready to file with hospital billing desks or insurance ombudsman.
        </Text>

        {/* Bill Reference Chip */}
        <View style={styles.billChip}>
          <Text style={styles.billChipText}>Active Bill: Metro Multispeciality (MMH-8941)</Text>
        </View>

        {/* Document List */}
        <View style={{ gap: 12 }}>
          {DOCS.map((doc) => (
            <View key={doc.id} style={styles.docCard}>
              <View style={styles.docTop}>
                <Text style={styles.docTitle}>{doc.title}</Text>
                <View
                  style={[
                    styles.statusPill,
                    doc.status === 'READY' ? styles.statusReady : styles.statusDraft,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusPillText,
                      doc.status === 'READY' ? styles.statusReadyText : styles.statusDraftText,
                    ]}
                  >
                    {doc.status}
                  </Text>
                </View>
              </View>

              <Text style={styles.docDesc}>{doc.desc}</Text>
              <Text style={styles.statuteText}>Statute: {doc.statute}</Text>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  setSelectedDoc(doc);
                  setGeneratedReady(doc.status === 'READY');
                }}
              >
                <Text style={styles.actionButtonText}>
                  {doc.status === 'READY' ? 'Download PDF →' : 'Generate Document →'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Legal Disclaimer Note */}
        <View style={styles.legalNoteCard}>
          <Text style={styles.legalNoteText}>
            These documents are generated from your audit. They are not legal advice. Consult a qualified advocate for formal courtroom proceedings.
          </Text>
        </View>
      </ScrollView>

      {/* Generation Modal / Bottom Sheet */}
      {selectedDoc && (
        <Modal visible transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.bottomSheet}>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>{selectedDoc.title}</Text>
                <TouchableOpacity onPress={() => setSelectedDoc(null)}>
                  <Text style={{ fontSize: 14, color: Colors.neutral600, fontWeight: '600' }}>Close</Text>
                </TouchableOpacity>
              </View>

              {generatedReady ? (
                <View style={styles.sheetReadyArea}>
                  <Text style={styles.readyTitle}>Document Ready for Filing</Text>
                  <Text style={styles.readySub}>
                    Signed and formatted under {selectedState} jurisdiction.
                  </Text>

                  <TouchableOpacity style={styles.downloadButton}>
                    <Text style={styles.downloadButtonText}>Download PDF Document</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.sheetForm}>
                  <Text style={styles.jurisdictionLabel}>Select Jurisdiction (State):</Text>
                  <View style={styles.statesRow}>
                    {STATES.map((st) => (
                      <TouchableOpacity
                        key={st}
                        style={[styles.stateChip, selectedState === st && styles.stateChipActive]}
                        onPress={() => setSelectedState(st)}
                      >
                        <Text
                          style={[
                            styles.stateChipText,
                            selectedState === st && styles.stateChipActiveText,
                          ]}
                        >
                          {st}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={styles.generateButton}
                    onPress={handleGenerate}
                    disabled={isGenerating}
                  >
                    <Text style={styles.generateButtonText}>
                      {isGenerating ? 'Compiling Legal Petition...' : 'Generate Document'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>
      )}
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
  subTitle: {
    fontSize: 14,
    color: Colors.neutral600,
  },
  billChip: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primarySurface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  billChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  docCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.neutral300,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  docTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  docTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.neutral900,
    marginRight: 8,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  statusReady: {
    backgroundColor: Colors.successSurface,
  },
  statusDraft: {
    backgroundColor: Colors.neutral300,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusReadyText: {
    color: Colors.success,
  },
  statusDraftText: {
    color: Colors.neutral600,
  },
  docDesc: {
    fontSize: 13,
    color: Colors.neutral600,
    lineHeight: 18,
  },
  statuteText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  actionButton: {
    marginTop: 8,
    height: 40,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  legalNoteCard: {
    backgroundColor: Colors.neutral50,
    borderWidth: 1,
    borderColor: Colors.neutral300,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  legalNoteText: {
    fontSize: 12,
    color: Colors.neutral600,
    lineHeight: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    gap: 16,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.neutral300,
    alignSelf: 'center',
    marginBottom: 8,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.neutral900,
    flex: 1,
  },
  sheetReadyArea: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  readyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.neutral900,
  },
  readySub: {
    fontSize: 13,
    color: Colors.neutral600,
    marginTop: 4,
    marginBottom: 20,
  },
  downloadButton: {
    width: '100%',
    height: 48,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  sheetForm: {
    gap: 16,
  },
  jurisdictionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.neutral900,
  },
  statesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  stateChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: Colors.neutral50,
    borderWidth: 1,
    borderColor: Colors.neutral300,
  },
  stateChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  stateChipText: {
    fontSize: 12,
    color: Colors.neutral600,
  },
  stateChipActiveText: {
    color: Colors.white,
    fontWeight: '600',
  },
  generateButton: {
    height: 48,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  generateButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
});
