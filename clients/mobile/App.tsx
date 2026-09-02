import React, { useEffect } from 'react';
import { NavigationContainer, NavigationProp } from '@react-navigation/native';
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
    onUploadInsurance: () => {},
    onUploadTpa: () => {},
    onUploadProof: () => {},
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
    onUploadDoc: () => {},
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

export default function App() {
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
    <NavigationContainer linking={linking}>
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
  );
}
