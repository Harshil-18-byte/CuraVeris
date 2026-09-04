import SwiftUI

public struct AuditedLineItemModel: Identifiable {
    public let id: String
    public let name: String
    public let category: String
    public let billedAmount: Double
    public let statutoryLimit: Double
    public let overcharge: Double
    public let violationType: String
    public let citation: String
}

public struct ScanAuditView: View {
    var onNavigateToDispute: () -> Void = {}
    
    @State private var selectedTab: Int = 0 // 0: Audit, 1: SHAP, 2: 65B Ledger
    @State private var isAnalyzing: Bool = false
    @State private var showingDocPicker: Bool = false
    @State private var sampleItems: [AuditedLineItemModel] = [
        AuditedLineItemModel(
            id: "1",
            name: "DES Everolimus Drug-Eluting Stent",
            category: "CARDIAC IMPLANT",
            billedAmount: 68500.0,
            statutoryLimit: 38280.0,
            overcharge: 30220.0,
            violationType: "NPPA S.O. 1335(E)",
            citation: "NPPA Stent Pricing Order 2024 (Cap ₹38,280 + 5% GST)"
        ),
        AuditedLineItemModel(
            id: "2",
            name: "Meropenem 1g IV Injection (x6)",
            category: "NLEM PHARMACEUTICAL",
            billedAmount: 14700.0,
            statutoryLimit: 5940.0,
            overcharge: 8760.0,
            violationType: "DPCO 2013 MRP CEILING",
            citation: "National List of Essential Medicines 2022 (Cap ₹990/vial)"
        ),
        AuditedLineItemModel(
            id: "3",
            name: "Sterile PPE Kit & Isolation Gown (x4)",
            category: "EXCLUDED CONSUMABLE",
            billedAmount: 6400.0,
            statutoryLimit: 0.0,
            overcharge: 6400.0,
            violationType: "IRDAI 199 NON-PAYABLE",
            citation: "IRDAI Master Circular 2024 List I - Item #42"
        ),
        AuditedLineItemModel(
            id: "4",
            name: "ICU Super-Specialty Bed Charge (Day 1-3)",
            category: "ACCOMMODATION",
            billedAmount: 48000.0,
            statutoryLimit: 25500.0,
            overcharge: 22500.0,
            violationType: "CGHS 2024 TIER-1",
            citation: "CGHS OM 2024 NABH Tertiary ICU Ceiling (₹8,500/day)"
        )
    ]
    
    public init(onNavigateToDispute: @escaping () -> Void = {}) {
        self.onNavigateToDispute = onNavigateToDispute
    }

    public var body: some View {
        NavigationStack {
            ZStack {
                AppTheme.background.ignoresSafeArea()
                
                ScrollView {
                    VStack(alignment: .leading, spacing: 16) {
                        // Ingestion Action Card
                        VStack(alignment: .leading, spacing: 12) {
                            HStack {
                                Text("INGESTION & FORENSIC OCR")
                                    .font(.system(size: 11, weight: .heavy, design: .monospaced))
                                    .foregroundColor(AppTheme.primaryCyan)
                                Spacer()
                                Text("LayoutLMv3 Multi-Modal")
                                    .font(.system(size: 10, design: .monospaced))
                                    .foregroundColor(AppTheme.textMuted)
                            }
                            
                            HStack(spacing: 12) {
                                Button(action: { showingDocPicker = true }) {
                                    HStack {
                                        Image(systemName: "camera.viewfinder")
                                        Text("SCAN BILL")
                                            .font(.system(size: 12, weight: .bold, design: .monospaced))
                                    }
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 12)
                                    .background(AppTheme.primaryBlue)
                                    .foregroundColor(.white)
                                    .cornerRadius(8)
                                }
                                
                                Button(action: runMockForensics) {
                                    HStack {
                                        Image(systemName: "arrow.triangle.2.circlepath")
                                        Text("RE-AUDIT")
                                            .font(.system(size: 12, weight: .bold, design: .monospaced))
                                    }
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 12)
                                    .background(AppTheme.surface)
                                    .foregroundColor(AppTheme.primaryCyan)
                                    .cornerRadius(8)
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 8)
                                            .stroke(AppTheme.border, lineWidth: 1)
                                    )
                                }
                            }
                        }
                        .cardStyle()
                        
                        // Summary Metrics Matrix
                        HStack(spacing: 12) {
                            let totalOvercharge = sampleItems.reduce(0) { $0 + $1.overcharge }
                            let totalBilled = sampleItems.reduce(0) { $0 + $1.billedAmount }
                            
                            MetricBox(
                                title: "TOTAL OVERCHARGE",
                                value: String(format: "₹%.0f", totalOvercharge),
                                color: AppTheme.dangerRed,
                                subtitle: "\(sampleItems.count) Violations Flagged"
                            )
                            
                            MetricBox(
                                title: "FORENSIC RISK",
                                value: "CRITICAL 94%",
                                color: AppTheme.warningAmber,
                                subtitle: "Billed ₹\(Int(totalBilled))"
                            )
                        }
                        
                        // Tab Selector
                        Picker("View Mode", selection: $selectedTab) {
                            Text("ITEMIZED").tag(0)
                            Text("SHAP TREE").tag(1)
                            Text("65B EVIDENCE").tag(2)
                        }
                        .pickerStyle(.segmented)
                        .padding(.vertical, 4)
                        
                        if selectedTab == 0 {
                            // Line Items List
                            VStack(alignment: .leading, spacing: 12) {
                                Text("STATUTORY VIOLATION BREAKDOWN")
                                    .font(.system(size: 11, weight: .heavy, design: .monospaced))
                                    .foregroundColor(AppTheme.textSecondary)
                                
                                ForEach(sampleItems) { item in
                                    LineItemCard(item: item)
                                }
                            }
                        } else if selectedTab == 1 {
                            // SHAP Waterfall
                            VStack(alignment: .leading, spacing: 12) {
                                Text("SHAP FEATURE ATTRIBUTIONS")
                                    .font(.system(size: 11, weight: .heavy, design: .monospaced))
                                    .foregroundColor(AppTheme.textSecondary)
                                
                                ShapRow(feature: "NPPA Implant Price Cap Delta", weight: "+0.42", color: AppTheme.dangerRed)
                                ShapRow(feature: "DPCO 2013 Medicine Ceiling Delta", weight: "+0.28", color: AppTheme.dangerRed)
                                ShapRow(feature: "IRDAI 199 Unbundled Consumables", weight: "+0.18", color: AppTheme.warningAmber)
                                ShapRow(feature: "ICMR ALOS Hospital Inpatient Benchmark", weight: "+0.12", color: AppTheme.warningAmber)
                            }
                            .cardStyle()
                        } else {
                            // 65B Evidence Ledger
                            VStack(alignment: .leading, spacing: 12) {
                                HStack {
                                    Text("BSA SEC 65B LEDGER RECORD")
                                        .font(.system(size: 11, weight: .heavy, design: .monospaced))
                                        .foregroundColor(AppTheme.successGreen)
                                    Spacer()
                                    Text("VERIFIED")
                                        .font(.system(size: 10, weight: .bold, design: .monospaced))
                                        .foregroundColor(AppTheme.successGreen)
                                }
                                
                                Text("Hash (SHA-256): e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
                                    .font(.system(size: 10, design: .monospaced))
                                    .foregroundColor(AppTheme.textMuted)
                                
                                Text("Timestamp: 2026-09-04T08:50:00Z | Signer: CuraVeris Legal Engine")
                                    .font(.system(size: 10, design: .monospaced))
                                    .foregroundColor(AppTheme.textSecondary)
                                
                                Text("Court-admissible certificate compliant with Section 65B of Indian Evidence Act / BSA 2023.")
                                    .font(.caption)
                                    .foregroundColor(AppTheme.textSecondary)
                            }
                            .cardStyle()
                        }
                        
                        // Emergency Legal Dispute CTA
                        Button(action: onNavigateToDispute) {
                            HStack {
                                Image(systemName: "shield.lefthalf.filled")
                                Text("GENERATE LEGAL NOTICE & BNS 127 PETITION")
                                    .font(.system(size: 12, weight: .bold, design: .monospaced))
                            }
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(AppTheme.dangerRed)
                            .foregroundColor(.white)
                            .cornerRadius(10)
                        }
                        .padding(.top, 8)
                    }
                    .padding()
                }
            }
            .navigationTitle("Scan & Audit")
            .navigationBarTitleDisplayMode(.inline)
            .sheet(isPresented: $showingDocPicker) {
                DocumentPicker { _ in }
            }
        }
    }
    
    private func runMockForensics() {
        isAnalyzing = true
        Task {
            try? await Task.sleep(nanoseconds: 800_000_000)
            await MainActor.run {
                isAnalyzing = false
            }
        }
    }
}

private struct MetricBox: View {
    let title: String
    let value: String
    let color: Color
    let subtitle: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title)
                .font(.system(size: 10, weight: .heavy, design: .monospaced))
                .foregroundColor(AppTheme.textMuted)
            Text(value)
                .font(.system(size: 18, weight: .bold, design: .monospaced))
                .foregroundColor(color)
            Text(subtitle)
                .font(.system(size: 10))
                .foregroundColor(AppTheme.textSecondary)
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(AppTheme.card)
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(AppTheme.border, lineWidth: 1)
        )
    }
}

private struct LineItemCard: View {
    let item: AuditedLineItemModel
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(item.name)
                    .font(.system(size: 13, weight: .bold))
                    .foregroundColor(AppTheme.textPrimary)
                Spacer()
                Text("+₹\(Int(item.overcharge))")
                    .font(.system(size: 13, weight: .bold, design: .monospaced))
                    .foregroundColor(AppTheme.dangerRed)
            }
            
            HStack {
                Text(item.violationType)
                    .font(.system(size: 9, weight: .heavy, design: .monospaced))
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(AppTheme.dangerRed.opacity(0.15))
                    .foregroundColor(AppTheme.dangerRed)
                    .cornerRadius(4)
                
                Spacer()
                
                Text("Billed: ₹\(Int(item.billedAmount)) | Cap: ₹\(Int(item.statutoryLimit))")
                    .font(.system(size: 10, design: .monospaced))
                    .foregroundColor(AppTheme.textMuted)
            }
            
            Text("⚖️ \(item.citation)")
                .font(.system(size: 10))
                .foregroundColor(AppTheme.textSecondary)
        }
        .padding()
        .background(AppTheme.card)
        .cornerRadius(10)
        .overlay(
            RoundedRectangle(cornerRadius: 10)
                .stroke(AppTheme.border, lineWidth: 1)
        )
    }
}

private struct ShapRow: View {
    let feature: String
    let weight: String
    let color: Color
    
    var body: some View {
        HStack {
            Text(feature)
                .font(.system(size: 11))
                .foregroundColor(AppTheme.textPrimary)
            Spacer()
            Text(weight)
                .font(.system(size: 11, weight: .bold, design: .monospaced))
                .foregroundColor(color)
        }
        .padding(.vertical, 4)
    }
}
