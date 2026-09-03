import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { NavigationContainer, NavigationProp, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  SplashScreen,
  OnboardingScreen,
  AuthScreen,
  ConsentScreen,
  HomeScreen,
  AddDocumentsScreen,
  CameraScannerScreen,
  DocumentReviewScreen,
  BillProcessingStatusScreen,
  VerificationResultScreen,
  BillBreakdownScreen,
  LineItemDetailScreen,
  WhyPayingScreen,
  EvidenceViewerScreen,
  InsuranceSummaryScreen,
  FinancialTimelineScreen,
  PaymentScreen,
  PaymentProcessingScreen,
  PaymentSuccessScreen,
  PaymentDetailScreen,
  ReconciliationResultScreen,
  DiscrepancyResolutionScreen,
  ResolutionTimelineScreen,
  MyBillsScreen,
  BillDetailScreen,
  PaymentsListScreen,
  SupportScreen,
  AiExplanationScreen,
  NotificationsScreen,
  ProfileSettingsScreen,
} from './src';
import { AuditReportOverviewScreen } from './src/screens/AuditReportOverviewScreen';
import { EvidenceCertificateScreen } from './src/screens/EvidenceCertificateScreen';
import { LegalDocumentsHubScreen } from './src/screens/LegalDocumentsHubScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { OtpVerificationScreen } from './src/screens/OtpVerificationScreen';
import { RegisterStep1Screen } from './src/screens/RegisterStep1Screen';
import { RegisterStep2Screen } from './src/screens/RegisterStep2Screen';
import { RegisterStep3Screen } from './src/screens/RegisterStep3Screen';
import { UploadBillScreen } from './src/screens/UploadBillScreen';

export const navigationRef = createNavigationContainerRef<any>();

const Stack = createNativeStackNavigator();
type Nav = NavigationProp<Record<string, object | undefined>>;

const FLOW: Record<string, string> = {
  splash: 'onboarding',
  onboarding: 'auth',
  auth: 'otpVerification',
  otpVerification: 'consent',
  consent: 'home',
  home: 'addDocuments',
  addDocuments: 'documentReview',
  uploadBill: 'documentReview',
  cameraScanner: 'documentReview',
  documentReview: 'processing',
  processing: 'auditReport',
  auditReport: 'verification',
  verification: 'payment',
  breakdown: 'lineItemDetail',
  lineItemDetail: 'evidence',
  whyPaying: 'payment',
  evidence: 'evidenceCertificate',
  evidenceCertificate: 'verification',
  insurance: 'timeline',
  timeline: 'payment',
  payment: 'paymentProcessing',
  paymentProcessing: 'paymentSuccess',
  paymentSuccess: 'paymentDetail',
  paymentDetail: 'reconciliation',
  reconciliation: 'discrepancy',
  discrepancy: 'resolution',
  resolution: 'myBills',
  myBills: 'billDetail',
  billDetail: 'verification',
  payments: 'paymentDetail',
  support: 'aiExplanation',
  aiExplanation: 'notifications',
  notifications: 'profile',
  profile: 'home',
  legalDocumentsHub: 'verification',
  loginScreen: 'home',
  registerStep1: 'registerStep2',
  registerStep2: 'registerStep3',
  registerStep3: 'consent',
};

function go(nav: Nav, route: string) {
  nav.navigate(route as never);
}

function routeProps(route: string, navigation: Nav) {
  const callbacks: Record<string, (...args: any[]) => void> = {
    onBack: () => navigation.goBack(),
    onFinish: () => go(navigation, route === 'registerStep3' ? 'consent' : 'auth'),
    onSkip: () => go(navigation, 'auth'),
    onContinue: () => go(navigation, FLOW[route] ?? 'home'),
    onNext: () => go(navigation, FLOW[route] ?? 'home'),
    onOtpSent: () => go(navigation, 'otpVerification'),
    onVerified: () => go(navigation, 'consent'),
    onLoginSuccess: () => go(navigation, 'home'),
    onNavigateRegister: () => go(navigation, 'registerStep1'),
    onForgotPassword: () => go(navigation, 'otpVerification'),
    onScanBill: () => go(navigation, 'cameraScanner'),
    onUploadBillPdf: () => go(navigation, 'uploadBill'),
    onUploadInsurance: () => go(navigation, 'insurance'),
    onUploadTpa: () => go(navigation, 'addDocuments'),
    onUploadProof: () => go(navigation, 'addDocuments'),
    onCaptureDone: () => go(navigation, 'documentReview'),
    onCancel: () => navigation.goBack(),
    onAnalyze: () => go(navigation, 'processing'),
    onViewReport: () => go(navigation, 'auditReport'),
    onGenerateDispute: () => go(navigation, 'legalDocumentsHub'),
    onViewEvidence: () => go(navigation, 'evidence'),
    onViewBreakdown: () => go(navigation, 'breakdown'),
    onSelectItem: () => go(navigation, 'lineItemDetail'),
    onPayVerified: () => go(navigation, 'payment'),
    onProceedPayment: () => go(navigation, 'paymentProcessing'),
    onComplete: () => go(navigation, 'paymentSuccess'),
    onViewReceipt: () => go(navigation, 'paymentDetail'),
    onDone: () => go(navigation, 'reconciliation'),
    onSeeCalculation: () => go(navigation, 'timeline'),
    onAddPage: () => go(navigation, 'addDocuments'),
    onUploadDoc: () => go(navigation, 'uploadBill'),
    onTrackStatus: () => go(navigation, 'resolution'),
    onSelectBill: () => go(navigation, 'billDetail'),
    onUploadBill: () => go(navigation, 'addDocuments'),
    onStartAnalysis: () => go(navigation, 'documentReview'),
    onNavigateTab: (tab?: string) => {
      const map: Record<string, string> = {
        bills: 'myBills',
        notifications: 'notifications',
        account: 'profile',
        home: 'home',
      };
      go(navigation, map[tab ?? ''] ?? 'home');
    },
    onSelectPayment: () => go(navigation, 'paymentDetail'),
    onSelectCategory: () => go(navigation, 'aiExplanation'),
    onLogout: () => go(navigation, 'loginScreen'),
  };

  return new Proxy(callbacks, {
    get(target, property, receiver) {
      if (property in target) return Reflect.get(target, property, receiver);
      if (typeof property === 'string' && property.startsWith('on')) {
        return (..._args: any[]) => navigation.goBack();
      }
      return Reflect.get(target, property, receiver);
    },
  });
}

function RoutedScreen({ component: Component, route, navigation }: any) {
  return React.createElement(Component as any, routeProps(route, navigation));
}

function SplashRoute({ navigation }: { navigation: Nav }) {
  useEffect(() => {
    const timer = setTimeout(() => go(navigation, 'onboarding'), 1200);
    return () => clearTimeout(timer);
  }, [navigation]);
  return <SplashScreen />;
}

const ALL_SCREENS_CATALOG: Array<{ id: string; title: string; category: string }> = [
  // 1. Auth & Onboarding
  { id: 'splash', title: 'Splash Screen', category: 'Auth & Onboarding' },
  { id: 'onboarding', title: 'Onboarding Walkthrough', category: 'Auth & Onboarding' },
  { id: 'auth', title: 'Auth Choice (Login/Register)', category: 'Auth & Onboarding' },
  { id: 'loginScreen', title: 'Login with Password / OTP', category: 'Auth & Onboarding' },
  { id: 'registerStep1', title: 'Register - Step 1 (Basics)', category: 'Auth & Onboarding' },
  { id: 'registerStep2', title: 'Register - Step 2 (Phone/OTP)', category: 'Auth & Onboarding' },
  { id: 'registerStep3', title: 'Register - Step 3 (Password/DPDP)', category: 'Auth & Onboarding' },
  { id: 'otpVerification', title: 'OTP Verification', category: 'Auth & Onboarding' },
  { id: 'consent', title: 'DPDP 2023 Consent Screen', category: 'Auth & Onboarding' },

  // 2. Home & Upload
  { id: 'home', title: 'Home Dashboard', category: 'Home & Upload' },
  { id: 'addDocuments', title: 'Add Documents Hub', category: 'Home & Upload' },
  { id: 'uploadBill', title: 'Upload Bill PDF / Image', category: 'Home & Upload' },
  { id: 'cameraScanner', title: 'Camera Bill Scanner', category: 'Home & Upload' },
  { id: 'documentReview', title: 'Document Pre-Scan Review', category: 'Home & Upload' },
  { id: 'processing', title: 'Live AI Processing Status', category: 'Home & Upload' },

  // 3. Audit, Breakdown & Evidence
  { id: 'auditReport', title: 'Audit Report Overview', category: 'Audit & Evidence' },
  { id: 'verification', title: 'Verification Result & Verdict', category: 'Audit & Evidence' },
  { id: 'breakdown', title: 'Itemized Bill Breakdown', category: 'Audit & Evidence' },
  { id: 'lineItemDetail', title: 'Line Item Price Benchmark', category: 'Audit & Evidence' },
  { id: 'whyPaying', title: 'Why Am I Paying Explanation', category: 'Audit & Evidence' },
  { id: 'evidence', title: 'Evidence & Rate Benchmark Viewer', category: 'Audit & Evidence' },
  { id: 'evidenceCertificate', title: 'Evidence Cryptographic Certificate', category: 'Audit & Evidence' },
  { id: 'legalDocumentsHub', title: 'Legal Notice & Dispute Generator', category: 'Audit & Evidence' },

  // 4. Insurance & Financial
  { id: 'insurance', title: 'Insurance Policy Summary & Cap', category: 'Insurance & Timeline' },
  { id: 'timeline', title: 'Financial Settlement Timeline', category: 'Insurance & Timeline' },
  { id: 'aiExplanation', title: 'AI Assistant & Copilot Q&A', category: 'Insurance & Timeline' },

  // 5. Payment & Settlement
  { id: 'payment', title: 'Verified Payment Checkout', category: 'Payment & Settlement' },
  { id: 'paymentProcessing', title: 'Payment Processing State', category: 'Payment & Settlement' },
  { id: 'paymentSuccess', title: 'Payment Success & Receipt', category: 'Payment & Settlement' },
  { id: 'paymentDetail', title: 'Payment Settlement Detail', category: 'Payment & Settlement' },
  { id: 'payments', title: 'Transaction History List', category: 'Payment & Settlement' },
  { id: 'reconciliation', title: '3-Way Reconciliation Result', category: 'Payment & Settlement' },
  { id: 'discrepancy', title: 'Discrepancy Resolution Screen', category: 'Payment & Settlement' },
  { id: 'resolution', title: 'Resolution Progress Timeline', category: 'Payment & Settlement' },

  // 6. Account & Support
  { id: 'myBills', title: 'My Bills Archive', category: 'Account & Support' },
  { id: 'billDetail', title: 'Bill Details & Audit Status', category: 'Account & Support' },
  { id: 'notifications', title: 'Notifications & Alerts', category: 'Account & Support' },
  { id: 'profile', title: 'Profile & DPDP Settings', category: 'Account & Support' },
  { id: 'support', title: 'Help & Consumer Rights Support', category: 'Account & Support' },
];

export default function App() {
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const routes: Array<[string, React.ComponentType<any>]> = [
    ['splash', SplashScreen],
    ['onboarding', OnboardingScreen],
    ['auth', AuthScreen],
    ['otpVerification', OtpVerificationScreen],
    ['consent', ConsentScreen],
    ['home', HomeScreen],
    ['addDocuments', AddDocumentsScreen],
    ['uploadBill', UploadBillScreen],
    ['cameraScanner', CameraScannerScreen],
    ['documentReview', DocumentReviewScreen],
    ['processing', BillProcessingStatusScreen],
    ['auditReport', AuditReportOverviewScreen],
    ['verification', VerificationResultScreen],
    ['breakdown', BillBreakdownScreen],
    ['lineItemDetail', LineItemDetailScreen],
    ['whyPaying', WhyPayingScreen],
    ['evidence', EvidenceViewerScreen],
    ['evidenceCertificate', EvidenceCertificateScreen],
    ['insurance', InsuranceSummaryScreen],
    ['timeline', FinancialTimelineScreen],
    ['payment', PaymentScreen],
    ['paymentProcessing', PaymentProcessingScreen],
    ['paymentSuccess', PaymentSuccessScreen],
    ['paymentDetail', PaymentDetailScreen],
    ['reconciliation', ReconciliationResultScreen],
    ['discrepancy', DiscrepancyResolutionScreen],
    ['resolution', ResolutionTimelineScreen],
    ['myBills', MyBillsScreen],
    ['billDetail', BillDetailScreen],
    ['payments', PaymentsListScreen],
    ['support', SupportScreen],
    ['aiExplanation', AiExplanationScreen],
    ['notifications', NotificationsScreen],
    ['profile', ProfileSettingsScreen],
    ['legalDocumentsHub', LegalDocumentsHubScreen],
    ['loginScreen', LoginScreen],
    ['registerStep1', RegisterStep1Screen],
    ['registerStep2', RegisterStep2Screen],
    ['registerStep3', RegisterStep3Screen],
  ];

  const categories = ['ALL', 'Auth & Onboarding', 'Home & Upload', 'Audit & Evidence', 'Insurance & Timeline', 'Payment & Settlement', 'Account & Support'];

  const filteredScreens = ALL_SCREENS_CATALOG.filter((s) => {
    const matchesCategory = selectedCategory === 'ALL' || s.category === selectedCategory;
    const matchesQuery = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const jumpToScreen = (screenId: string) => {
    setIsCatalogOpen(false);
    if (navigationRef.isReady()) {
      navigationRef.navigate(screenId as never);
    }
  };

  const linking = {
    prefixes: ['curaveris://', 'https://app.curaveris.internal', 'https://cura-veris.vercel.app'],
    config: {
      screens: {
        home: '',
        billDetail: 'bill/:billId',
        auditReport: 'audit/:billId',
      },
    },
  };

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer ref={navigationRef} linking={linking}>
        <Stack.Navigator
          initialRouteName="splash"
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          {routes.map(([name, Component]) => (
            <Stack.Screen
              key={name}
              name={name}
              children={({ navigation }: any) =>
                name === 'splash' ? (
                  <SplashRoute navigation={navigation as Nav} />
                ) : (
                  <RoutedScreen component={Component} route={name} navigation={navigation} />
                )
              }
            />
          ))}
        </Stack.Navigator>
      </NavigationContainer>

      {/* Floating Screen Explorer Launcher */}
      <TouchableOpacity
        style={styles.floatingButton}
        activeOpacity={0.85}
        onPress={() => setIsCatalogOpen(true)}
      >
        <Text style={styles.floatingButtonText}>📱 All Screens ({ALL_SCREENS_CATALOG.length})</Text>
      </TouchableOpacity>

      {/* Screen Explorer Modal */}
      <Modal
        visible={isCatalogOpen}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsCatalogOpen(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>CuraVeris Screen Catalog</Text>
              <Text style={styles.modalSubtitle}>Jump directly to any of the {ALL_SCREENS_CATALOG.length} screens</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setIsCatalogOpen(false)}>
              <Text style={styles.closeBtnText}>✕ Close</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search screens by name or route ID..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.categoryChipText, selectedCategory === cat && styles.categoryChipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView style={styles.screensList}>
            {filteredScreens.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={styles.screenItem}
                activeOpacity={0.7}
                onPress={() => jumpToScreen(item.id)}
              >
                <View style={styles.screenItemLeft}>
                  <View style={styles.screenIndexBadge}>
                    <Text style={styles.screenIndexText}>{index + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.screenItemTitle}>{item.title}</Text>
                    <Text style={styles.screenItemRoute}>route: <Text style={{ fontFamily: 'Courier', fontWeight: 'bold' }}>{item.id}</Text> • {item.category}</Text>
                  </View>
                </View>
                <View style={styles.screenJumpTag}>
                  <Text style={styles.screenJumpTagText}>Open →</Text>
                </View>
              </TouchableOpacity>
            ))}
            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    backgroundColor: '#0F766E',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 9999,
  },
  floatingButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  searchInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  categoryScroll: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    maxHeight: 48,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
    alignSelf: 'center',
  },
  categoryChipActive: {
    backgroundColor: '#0F766E',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  screensList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  screenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  screenItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  screenIndexBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenIndexText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F766E',
  },
  screenItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  screenItemRoute: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  screenJumpTag: {
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#99F6E4',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  screenJumpTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F766E',
  },
});
