import SwiftUI

public struct DashboardView: View {
    @StateObject private var networkMonitor = NetworkMonitor.shared
    @State private var isBackendHealthy: Bool? = nil
    @State private var showingDocumentPicker = false
    @State private var uploadedDocumentName: String? = nil
    @State private var activeSheet: DashboardSheet? = nil

    public init() {}

    public var body: some View {
        NavigationStack {
            ZStack {
                AppTheme.background.ignoresSafeArea()

                ScrollView {
                    VStack(alignment: .leading, spacing: 18) {
                        if !networkMonitor.isConnected {
                            HStack {
                                Image(systemName: "wifi.slash")
                                Text("Device offline. Actions will sync upon reconnect.")
                                    .font(.subheadline)
                            }
                            .foregroundColor(AppTheme.dangerRed)
                            .padding()
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(AppTheme.dangerRed.opacity(0.15))
                            .cornerRadius(10)
                        }

                        // Master Hub Banner
                        Button(action: { activeSheet = .hub }) {
                            HStack(spacing: 12) {
                                Text("36+")
                                    .font(.system(size: 14, weight: .black, design: .monospaced))
                                    .foregroundColor(.black)
                                    .padding(8)
                                    .background(AppTheme.primaryCyan)
                                    .cornerRadius(6)
                                
                                VStack(alignment: .leading, spacing: 2) {
                                    Text("MASTER SCREEN HUB & DIRECTORY")
                                        .font(.system(size: 11, weight: .black, design: .monospaced))
                                        .foregroundColor(AppTheme.primaryCyan)
                                    Text("Explore all 36+ clinical audit, tariff & legal modules")
                                        .font(.system(size: 10))
                                        .foregroundColor(AppTheme.textSecondary)
                                }
                                Spacer()
                                Image(systemName: "arrow.right.circle.fill")
                                    .foregroundColor(AppTheme.primaryCyan)
                            }
                            .padding(12)
                            .background(AppTheme.card)
                            .cornerRadius(10)
                            .overlay(
                                RoundedRectangle(cornerRadius: 10)
                                    .stroke(AppTheme.primaryCyan.opacity(0.5), lineWidth: 1)
                            )
                        }
                        .buttonStyle(.plain)

                        // 4-Pillar Quick Actions
                        VStack(alignment: .leading, spacing: 10) {
                            Text("FORENSIC DEFENSE PILLARS")
                                .font(.system(size: 11, weight: .heavy, design: .monospaced))
                                .foregroundColor(AppTheme.textSecondary)

                            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
                                QuickActionCard(title: "SCAN & AUDIT", icon: "doc.viewfinder", color: AppTheme.primaryBlue) {
                                    activeSheet = .scan
                                }
                                QuickActionCard(title: "TARIFF CAPS", icon: "tablecells.fill", color: AppTheme.accentGold) {
                                    activeSheet = .tariffs
                                }
                                QuickActionCard(title: "FINANCIAL RISK", icon: "chart.line.uptrend.xyaxis", color: AppTheme.dangerRed) {
                                    activeSheet = .financialRisk
                                }
                                QuickActionCard(title: "LEGAL NOTICE", icon: "shield.lefthalf.filled", color: AppTheme.successGreen) {
                                    activeSheet = .disputes
                                }
                            }
                        }

                        // Hero Status Card
                        VStack(alignment: .leading, spacing: 8) {
                            HStack {
                                Text("CuraVeris Forensic Engine")
                                    .font(.headline)
                                    .foregroundColor(AppTheme.textPrimary)
                                Spacer()
                                if let healthy = isBackendHealthy {
                                    Text(healthy ? "● Healthy" : "● Offline")
                                        .font(.caption)
                                        .fontWeight(.semibold)
                                        .padding(.horizontal, 8)
                                        .padding(.vertical, 4)
                                        .background(healthy ? AppTheme.successGreen.opacity(0.2) : AppTheme.dangerRed.opacity(0.2))
                                        .foregroundColor(healthy ? AppTheme.successGreen : AppTheme.dangerRed)
                                        .cornerRadius(8)
                                }
                            }

                            Text("Section 65B Forensics & Statutory Overcharge Invariant Verification for Apple iOS Ecosystem.")
                                .font(.subheadline)
                                .foregroundColor(AppTheme.textSecondary)
                        }
                        .cardStyle()

                        // Upload Bill Document Action
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Medical Bill Ingestion")
                                .font(.headline)
                                .foregroundColor(AppTheme.textPrimary)

                            Text("Select an invoice PDF or photo to run NPPA, DPCO, and CGHS compliance verification.")
                                .font(.subheadline)
                                .foregroundColor(AppTheme.textSecondary)

                            Button(action: { showingDocumentPicker = true }) {
                                HStack {
                                    Image(systemName: "doc.viewfinder")
                                    Text("Pick Medical Invoice (PDF / Photo)")
                                }
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(AppTheme.primaryBlue)
                                .foregroundColor(.white)
                                .cornerRadius(10)
                                .fontWeight(.semibold)
                            }

                            if let name = uploadedDocumentName {
                                Text("Selected: \(name)")
                                    .font(.caption)
                                    .foregroundColor(AppTheme.successGreen)
                            }
                        }
                        .cardStyle()

                        // Statutory Checkpoints
                        VStack(alignment: .leading, spacing: 10) {
                            Text("Statutory Compliance Benchmarks")
                                .font(.headline)
                                .foregroundColor(AppTheme.textPrimary)

                            Text("✓ NPPA Cardiac Stent & Orthopedic Caps")
                                .font(.footnote)
                                .foregroundColor(AppTheme.successGreen)
                            Text("✓ DPCO 2013 Pharmaceutical MRP Ceilings")
                                .font(.footnote)
                                .foregroundColor(AppTheme.successGreen)
                            Text("✓ CGHS 2024 Tier Benchmark Rates")
                                .font(.footnote)
                                .foregroundColor(AppTheme.successGreen)
                            Text("✓ IRDAI 199 Excluded Consumable Rules")
                                .font(.footnote)
                                .foregroundColor(AppTheme.successGreen)
                        }
                        .cardStyle()
                    }
                    .padding()
                }
            }
            .navigationTitle("⚖️ CuraVeris")
            .sheet(isPresented: $showingDocumentPicker) {
                DocumentPicker { url in
                    uploadedDocumentName = url.lastPathComponent
                }
            }
            .sheet(item: $activeSheet) { sheet in
                switch sheet {
                case .hub:
                    AllScreensHubView()
                case .scan:
                    ScanAuditView()
                case .tariffs:
                    TariffRegistryView()
                case .financialRisk:
                    FinancialRiskView()
                case .disputes:
                    LegalDisputeView()
                case .copilot:
                    CopilotView()
                }
            }
            .task {
                isBackendHealthy = await APIClient.shared.checkHealth()
            }
        }
    }
}

public enum DashboardSheet: String, Identifiable {
    case hub, scan, tariffs, financialRisk, disputes, copilot
    public var id: String { rawValue }
}

private struct QuickActionCard: View {
    let title: String
    let icon: String
    let color: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(alignment: .leading, spacing: 8) {
                Image(systemName: icon)
                    .font(.system(size: 18))
                    .foregroundColor(color)
                Text(title)
                    .font(.system(size: 11, weight: .bold, design: .monospaced))
                    .foregroundColor(AppTheme.textPrimary)
            }
            .padding()
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(AppTheme.card)
            .cornerRadius(10)
            .overlay(
                RoundedRectangle(cornerRadius: 10)
                    .stroke(AppTheme.border, lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
    }
}
