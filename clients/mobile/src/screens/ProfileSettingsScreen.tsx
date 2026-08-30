import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
  TextInput,
} from 'react-native';
import { Colors } from '../theme/colors';

export function ProfileSettingsScreen({
  userName = 'Priya Sharma',
  userEmail = 'priya@example.com',
  onLogout,
  onBack,
}: {
  userName?: string;
  userEmail?: string;
  onLogout?: () => void;
  onBack?: () => void;
}) {
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const handleConfirmDelete = () => {
    if (deleteConfirmationText === 'DELETE') {
      setIsDeleteModalVisible(false);
      onLogout?.();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account & Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.userEmail}>{userEmail}</Text>
          </View>
        </View>

        {/* Section 1: Account */}
        <View style={styles.groupCard}>
          <Text style={styles.groupTitle}>Account</Text>

          <TouchableOpacity style={styles.rowItem}>
            <Text style={styles.rowLabel}>Edit Profile</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.rowItem}>
            <Text style={styles.rowLabel}>Change Password</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.rowItem, { borderBottomWidth: 0 }]}>
            <Text style={styles.rowLabel}>Active Devices & Sessions</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Section 2: Notifications */}
        <View style={styles.groupCard}>
          <Text style={styles.groupTitle}>Notifications</Text>

          <TouchableOpacity style={[styles.rowItem, { borderBottomWidth: 0 }]}>
            <Text style={styles.rowLabel}>Audit Alerts & Notifications</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Section 3: Privacy (DPDP Act) */}
        <View style={styles.groupCard}>
          <Text style={styles.groupTitle}>Data Privacy (DPDP Act 2023)</Text>

          <TouchableOpacity style={styles.rowItem}>
            <Text style={styles.rowLabel}>My Data & Privacy Consent</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.rowItem}>
            <Text style={styles.rowLabel}>Download My Data</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.rowItem, { borderBottomWidth: 0 }]}
            onPress={() => setIsDeleteModalVisible(true)}
          >
            <Text style={[styles.rowLabel, { color: Colors.danger }]}>Delete Account & Data</Text>
            <Text style={[styles.chevron, { color: Colors.danger }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Section 4: Support */}
        <View style={styles.groupCard}>
          <Text style={styles.groupTitle}>Support & Legal</Text>

          <TouchableOpacity style={styles.rowItem}>
            <Text style={styles.rowLabel}>Help Centre & FAQs</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.rowItem}>
            <Text style={styles.rowLabel}>Report a Problem</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.rowItem, { borderBottomWidth: 0 }]}>
            <Text style={styles.rowLabel}>About CuraVeris (v2.4.0)</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <Modal visible={isDeleteModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalCard}>
            <Text style={styles.deleteModalTitle}>Delete Account & All Data?</Text>
            <Text style={styles.deleteModalBody}>
              This will permanently delete all uploaded hospital bills, Section 65B hash certificates, and dispute filings. This cannot be undone.
            </Text>

            <Text style={styles.deleteModalInstruction}>
              Type <Text style={{ fontWeight: '700' }}>DELETE</Text> to confirm:
            </Text>

            <TextInput
              style={styles.deleteInput}
              placeholder="DELETE"
              placeholderTextColor="#8E8E93"
              autoCapitalize="characters"
              value={deleteConfirmationText}
              onChangeText={setDeleteConfirmationText}
            />

            <View style={styles.deleteModalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsDeleteModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.confirmDeleteButton,
                  deleteConfirmationText !== 'DELETE' && styles.disabledButton,
                ]}
                disabled={deleteConfirmationText !== 'DELETE'}
                onPress={handleConfirmDelete}
              >
                <Text style={styles.confirmDeleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 48,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.neutral300,
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral900,
  },
  userEmail: {
    fontSize: 13,
    color: Colors.neutral600,
    marginTop: 2,
  },
  groupCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.neutral300,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  groupTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: Colors.neutral600,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  rowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral300,
  },
  rowLabel: {
    fontSize: 14,
    color: Colors.neutral900,
    fontWeight: '500',
  },
  chevron: {
    fontSize: 18,
    color: Colors.neutral600,
  },
  logoutButton: {
    height: 48,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.danger,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  logoutButtonText: {
    color: Colors.danger,
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  deleteModalCard: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 24,
    gap: 12,
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.danger,
  },
  deleteModalBody: {
    fontSize: 13,
    color: Colors.neutral600,
    lineHeight: 18,
  },
  deleteModalInstruction: {
    fontSize: 13,
    color: Colors.neutral900,
    marginTop: 4,
  },
  deleteInput: {
    height: 44,
    borderWidth: 1.5,
    borderColor: Colors.neutral300,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    color: Colors.neutral900,
  },
  deleteModalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    height: 44,
    borderWidth: 1.5,
    borderColor: Colors.neutral300,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral600,
  },
  confirmDeleteButton: {
    flex: 1,
    height: 44,
    backgroundColor: Colors.danger,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: Colors.neutral300,
  },
  confirmDeleteButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});
