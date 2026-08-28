import SwiftUI

public struct DashboardView: View {
    @StateObject private var networkMonitor = NetworkMonitor.shared
    @State private var isBackendHealthy: Bool? = nil
    @State private var showingDocumentPicker = false
    @State private var uploadedDocumentName: String? = nil

    public init() {}

    public var body: some View {
        NavigationStack {
            ZStack {
                AppTheme.background.ignoresSafeArea()

                ScrollView {
                    VStack(alignment: .leading, spacing: 20) {
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

                        // Hero Foundation Card
                        VStack(alignment: .leading, spacing: 8) {
                            HStack {
                                Text("Phase 7: iOS Foundation Active")
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

                            Text("Section 65B Forensics & Statutory Overcharge Invariant Verification for Apple Ecosystem.")
                                .font(.subheadline)
                                .foregroundColor(AppTheme.textSecondary)
                        }
                        .padding()
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(AppTheme.card)
                        .cornerRadius(12)

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
                        .padding()
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(AppTheme.card)
                        .cornerRadius(12)

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
                        .padding()
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(AppTheme.card)
                        .cornerRadius(12)
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
            .task {
                isBackendHealthy = await APIClient.shared.checkHealth()
            }
        }
    }
}
