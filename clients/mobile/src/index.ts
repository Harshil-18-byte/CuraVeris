/**
 * CuraVeris Mobile Screen Inventory (Screens M01 to M30)
 * Platform: Shared Mobile Codebase (Android & iOS)
 * Built to exact calm-authority healthcare-financial specifications
 */

export * from './theme/colors';

// M01–M04: Onboarding & Authentication
export { SplashScreen } from './screens/SplashScreen'; // M01
export { OnboardingScreen } from './screens/OnboardingScreen'; // M02
export { AuthScreen } from './screens/AuthScreen'; // M03
export { ConsentScreen } from './screens/ConsentScreen'; // M04

// M05–M09: Home, Documents Ingestion & Processing
export { HomeScreen } from './screens/HomeScreen'; // M05
export { AddDocumentsScreen } from './screens/AddDocumentsScreen'; // M06
export { CameraScannerScreen } from './screens/CameraScannerScreen'; // M07
export { DocumentReviewScreen } from './screens/DocumentReviewScreen'; // M08
export { BillProcessingStatusScreen } from './screens/BillProcessingStatusScreen'; // M09

// M10–M16: Verification Result, Breakdown, Evidence & Timeline
export { VerificationResultScreen } from './screens/VerificationResultScreen'; // M10
export { BillBreakdownScreen } from './screens/BillBreakdownScreen'; // M11
export { LineItemDetailScreen } from './screens/LineItemDetailScreen'; // M12
export { WhyPayingScreen } from './screens/WhyPayingScreen'; // M13
export { EvidenceViewerScreen } from './screens/EvidenceViewerScreen'; // M14
export { InsuranceSummaryScreen } from './screens/InsuranceSummaryScreen'; // M15
export { FinancialTimelineScreen } from './screens/FinancialTimelineScreen'; // M16

// M17–M23: Razorpay Payment, Confirmation, Reconciliation & Resolution
export { PaymentScreen } from './screens/PaymentScreen'; // M17
export { PaymentProcessingScreen } from './screens/PaymentProcessingScreen'; // M18
export { PaymentSuccessScreen } from './screens/PaymentSuccessScreen'; // M19
export { PaymentDetailScreen } from './screens/PaymentDetailScreen'; // M20
export { ReconciliationResultScreen } from './screens/ReconciliationResultScreen'; // M21
export { DiscrepancyResolutionScreen } from './screens/DiscrepancyResolutionScreen'; // M22
export { ResolutionTimelineScreen } from './screens/ResolutionTimelineScreen'; // M23

// M24–M30: Bills, Payments, Support, AI Explanation, Notifications & Profile
export { MyBillsScreen } from './screens/MyBillsScreen'; // M24
export { BillDetailScreen } from './screens/BillDetailScreen'; // M25
export { PaymentsListScreen } from './screens/PaymentsListScreen'; // M26
export { SupportScreen } from './screens/SupportScreen'; // M27
export { AiExplanationScreen } from './screens/AiExplanationScreen'; // M28
export { NotificationsScreen } from './screens/NotificationsScreen'; // M29
export { ProfileSettingsScreen } from './screens/ProfileSettingsScreen'; // M30
