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

const Stack = createNativeStackNavigator();

type Nav = NavigationProp<Record<string, object | undefined>>;

const FLOW: Record<string, string> = {
  splash: 'onboarding',
  onboarding: 'auth',
  auth: 'consent',
  consent: 'home',
  home: 'addDocuments',
  addDocuments: 'documentReview',
  cameraScanner: 'documentReview',
  documentReview: 'processing',
  processing: 'verification',
  verification: 'payment',
  breakdown: 'lineItemDetail',
  lineItemDetail: 'evidence',
  whyPaying: 'evidence',
  evidence: 'insurance',
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
};

function go(nav: Nav, route: string) {
  nav.navigate(route as never);
}

function routeProps(route: string, navigation: Nav) {
  const callbacks: Record<string, (...args: any[]) => void> = {
    onBack: () => navigation.goBack(),
    onFinish: () => go(navigation, 'auth'),
    onSkip: () => go(navigation, 'auth'),
    onContinue: () => go(navigation, FLOW[route] ?? 'home'),
    onNext: () => go(navigation, FLOW[route] ?? 'home'),
    onOtpSent: () => go(navigation, 'consent'),
    onScanBill: () => go(navigation, 'cameraScanner'),
    onUploadBillPdf: () => go(navigation, 'documentReview'),
    onUploadInsurance: () => {},
    onUploadTpa: () => {},
    onUploadProof: () => {},
    onCaptureDone: () => go(navigation, 'documentReview'),
    onCancel: () => navigation.goBack(),
    onAnalyze: () => go(navigation, 'processing'),
    onViewReport: () => go(navigation, 'verification'),
    onViewEvidence: () => go(navigation, 'evidence'),
    onViewBreakdown: () => go(navigation, 'breakdown'),
    onPayVerified: () => go(navigation, 'payment'),
    onProceedPayment: () => go(navigation, 'paymentProcessing'),
    onComplete: () => go(navigation, 'paymentSuccess'),
    onViewReceipt: () => go(navigation, 'paymentDetail'),
    onDone: () => go(navigation, 'reconciliation'),
    onSeeCalculation: () => go(navigation, 'timeline'),
    onUploadDoc: () => {},
    onTrackStatus: () => go(navigation, 'resolution'),
    onSelectBill: (id?: string) => go(navigation, 'billDetail'),
    onUploadBill: () => go(navigation, 'addDocuments'),
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
    onLogout: () => go(navigation, 'auth'),
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
  const props = routeProps(route, navigation);
  return React.createElement(Component as any, props);
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
    ['consent', ConsentScreen],
    ['home', HomeScreen],
    ['addDocuments', AddDocumentsScreen],
    ['cameraScanner', CameraScannerScreen],
    ['documentReview', DocumentReviewScreen],
    ['processing', BillProcessingStatusScreen],
    ['verification', VerificationResultScreen],
    ['breakdown', BillBreakdownScreen],
    ['lineItemDetail', LineItemDetailScreen],
    ['whyPaying', WhyPayingScreen],
    ['evidence', EvidenceViewerScreen],
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
  ];

  return (
    <NavigationContainer>
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
            children={({ navigation }) =>
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
