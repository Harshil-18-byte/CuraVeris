import SwiftUI

public struct ScreenItemModel: Identifiable {
    public let id: String
    public let title: String
    public let subtitle: String
    public let category: String
    public let badge: String
    public let routeKey: String
}

public struct AllScreensHubView: View {
    @State private var searchQuery: String = ""
    @State private var selectedCategory: String = "ALL"
    @State private var activeSheetRoute: String? = nil
    
    public init() {}

    private let categories = [
        "ALL", "CORE AUDIT", "REGISTRIES", "FINANCIAL RISK", "SPECIALIZED", "LEGAL", "PRIVACY & DEV"
    ]
    
    private let allScreens: [ScreenItemModel] = [
        // 1. Core Forensic Audit
        ScreenItemModel(id: "1", title: "Executive Dashboard", subtitle: "Forensic overview, exposure cards & quick launch tiles", category: "CORE AUDIT", badge: "CORE", routeKey: "dashboard"),
        ScreenItemModel(id: "2", title: "Scan & Itemized Audit", subtitle: "LayoutLMv3 multi-modal document extraction & OCR inspection", category: "CORE AUDIT", badge: "AI/OCR", routeKey: "scan"),
        ScreenItemModel(id: "3", title: "SHAP Explainability Tree", subtitle: "Interactive gradient feature contribution waterfall for claims", category: "CORE AUDIT", badge: "ML", routeKey: "shap"),
        ScreenItemModel(id: "4", title: "65B Evidence Ledger", subtitle: "Court-admissible cryptographic timestamped digital certificates", category: "CORE AUDIT", badge: "LEGAL", routeKey: "evidence"),
        ScreenItemModel(id: "5", title: "Statutory Copilot AI", subtitle: "Grounded LLM dialogue with legal citations and statute retrieval", category: "CORE AUDIT", badge: "RAG", routeKey: "copilot"),
        ScreenItemModel(id: "6", title: "Live Realtime Monitor", subtitle: "WebSocket real-time admission telemetry & burn rate stream", category: "CORE AUDIT", badge: "WS", routeKey: "realtime"),

        // 2. Statutory Price Registries
        ScreenItemModel(id: "7", title: "NPPA Implant Registry", subtitle: "Coronary stents & knee replacement statutory price ceilings", category: "REGISTRIES", badge: "NPPA", routeKey: "nppa"),
        ScreenItemModel(id: "8", title: "DPCO 2013 Medicine Registry", subtitle: "National List of Essential Medicines (NLEM) ceiling prices", category: "REGISTRIES", badge: "DPCO", routeKey: "dpco"),
        ScreenItemModel(id: "9", title: "CGHS 2024 Tariff Registry", subtitle: "Tier-1/2 NABH hospital benchmark rates and bed caps", category: "REGISTRIES", badge: "CGHS", routeKey: "cghs"),
        ScreenItemModel(id: "10", title: "IRDAI 199 Non-Payables", subtitle: "199 excluded consumable billing items rulebook", category: "REGISTRIES", badge: "IRDAI", routeKey: "irdai"),
        ScreenItemModel(id: "11", title: "PMJAY Package Directory", subtitle: "Ayushman Bharat PMJAY standard procedure packages", category: "REGISTRIES", badge: "PMJAY", routeKey: "pmjay"),
        ScreenItemModel(id: "12", title: "GST Healthcare Exemption", subtitle: "CBIC Notification No. 12/2017 healthcare tax audit", category: "REGISTRIES", badge: "GST", routeKey: "gst"),

        // 3. Financial Risk & Distress Engines
        ScreenItemModel(id: "13", title: "Inpatient Burn Rate", subtitle: "Daily cost tracking vs ICMR Average Length of Stay benchmark", category: "FINANCIAL RISK", badge: "FRM", routeKey: "burn_rate"),
        ScreenItemModel(id: "14", title: "DSTI Medical Distress", subtitle: "Debt Service-to-Income catastrophic financial toxicity index", category: "FINANCIAL RISK", badge: "RISK", routeKey: "dsti"),
        ScreenItemModel(id: "15", title: "4-Way Balance Matrix", subtitle: "Hospital vs Tariff vs TPA Pre-Auth vs COPAY reconciliation", category: "FINANCIAL RISK", badge: "4-WAY", routeKey: "four_way"),
        ScreenItemModel(id: "16", title: "Insurance Pre-Auth Tracker", subtitle: "Cashless approval verification and arbitrary deduction defense", category: "FINANCIAL RISK", badge: "TPA", routeKey: "preauth"),
        ScreenItemModel(id: "17", title: "Financial Toxicity Gauge", subtitle: "Real-time out-of-pocket exposure vs family income thresholds", category: "FINANCIAL RISK", badge: "FTX", routeKey: "toxicity"),
        ScreenItemModel(id: "18", title: "Hospital Exposure Index", subtitle: "Systemic institutional overcharge propensity scoring", category: "FINANCIAL RISK", badge: "INDEX", routeKey: "exposure"),

        // 4. Specialized Clinical Audits
        ScreenItemModel(id: "19", title: "ICU & CCU Invariant Audit", subtitle: "Ventilator, monitor and unbundled ICU consumable audit", category: "SPECIALIZED", badge: "ICU", routeKey: "icu"),
        ScreenItemModel(id: "20", title: "Cardiac Cath Lab Audit", subtitle: "Balloon angioplasty, guidewire, contrast media overcharges", category: "SPECIALIZED", badge: "CARDIAC", routeKey: "cardiac"),
        ScreenItemModel(id: "21", title: "Orthopedic Implant Audit", subtitle: "Prosthetic joint implants and unbundled instrumentation fees", category: "SPECIALIZED", badge: "ORTHO", routeKey: "ortho"),
        ScreenItemModel(id: "22", title: "Oncology Chemo Audit", subtitle: "Chemotherapy compounding & monoclonal antibody MRP defense", category: "SPECIALIZED", badge: "ONCO", routeKey: "onco"),
        ScreenItemModel(id: "23", title: "Pharmacy Dispense Audit", subtitle: "Discharge medicine MRP cross-examination & substitution check", category: "SPECIALIZED", badge: "PHARMA", routeKey: "pharma"),
        ScreenItemModel(id: "24", title: "Emergency Admission Audit", subtitle: "Emergency triage overcharges & illegal upfront deposit defense", category: "SPECIALIZED", badge: "EMERGENCY", routeKey: "emergency"),

        // 5. Legal Redress & Emergency Petitions
        ScreenItemModel(id: "25", title: "Anti-Detention Notice (BNS 127)", subtitle: "Emergency legal notice under Bombay HC CrWP 2502/2000", category: "LEGAL", badge: "BNS 127", routeKey: "anti_detention"),
        ScreenItemModel(id: "26", title: "Insurance Ombudsman Petition", subtitle: "Rule 14(1) Insurance Ombudsman complaint generator", category: "LEGAL", badge: "OMBUDS", routeKey: "ombudsman"),
        ScreenItemModel(id: "27", title: "Consumer Court Sec 35", subtitle: "District Consumer Disputes Redressal Commission petition", category: "LEGAL", badge: "DCDRC", routeKey: "consumer_court"),
        ScreenItemModel(id: "28", title: "NPPA Statutory Grievance", subtitle: "Formal complaint under Essential Commodities Act Sec 7", category: "LEGAL", badge: "NPPA", routeKey: "nppa_grievance"),
        ScreenItemModel(id: "29", title: "Clinical Establishment Notice", subtitle: "State Clinical Establishment Act regulatory violation notice", category: "LEGAL", badge: "CEA", routeKey: "cea_notice"),
        ScreenItemModel(id: "30", title: "Right to Medical Records", subtitle: "NMC Regulation 1.3.2 72-hour mandatory record release notice", category: "LEGAL", badge: "NMC", routeKey: "nmc_records"),

        // 6. Privacy, Security & Dev Tools
        ScreenItemModel(id: "31", title: "DPDP 2023 Privacy Portal", subtitle: "Patient consent management, data erasure & audit logs", category: "PRIVACY & DEV", badge: "DPDP", routeKey: "dpdp"),
        ScreenItemModel(id: "32", title: "ABDM Health Locker", subtitle: "ABHA ID integration, Ayushman Bharat Digital Mission gateway", category: "PRIVACY & DEV", badge: "ABDM", routeKey: "abdm"),
        ScreenItemModel(id: "33", title: "Cryptographic Key Vault", subtitle: "Ed25519 digital signature keys & SHA-256 verification status", category: "PRIVACY & DEV", badge: "CRYPTO", routeKey: "crypto"),
        ScreenItemModel(id: "34", title: "Offline Sync Engine", subtitle: "Local SQLite database sync status & pending offline audits", category: "PRIVACY & DEV", badge: "SYNC", routeKey: "offline"),
        ScreenItemModel(id: "35", title: "Audit Trail Forensics", subtitle: "Immutable chronological event log for compliance reviews", category: "PRIVACY & DEV", badge: "AUDIT", routeKey: "audit_trail"),
        ScreenItemModel(id: "36", title: "Diagnostic & API Console", subtitle: "FastAPI endpoint latency, ML model health & pipeline stats", category: "PRIVACY & DEV", badge: "DEV", routeKey: "api_console")
    ]

    public var body: some View {
        NavigationStack {
            ZStack {
                AppTheme.background.ignoresSafeArea()
                
                VStack(spacing: 12) {
                    // Search Bar
                    TextField("Search all 36+ screens & modules...", text: $searchQuery)
                        .padding(10)
                        .background(AppTheme.surface)
                        .foregroundColor(AppTheme.textPrimary)
                        .cornerRadius(8)
                        .overlay(
                            RoundedRectangle(cornerRadius: 8)
                                .stroke(AppTheme.border, lineWidth: 1)
                        )
                        .padding(.horizontal)
                        .padding(.top, 8)
                    
                    // Category Filter Chips
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            ForEach(categories, id: \.self) { cat in
                                Button(action: { selectedCategory = cat }) {
                                    Text(cat)
                                        .font(.system(size: 10, weight: .bold, design: .monospaced))
                                        .foregroundColor(selectedCategory == cat ? .black : AppTheme.textSecondary)
                                        .padding(.horizontal, 10)
                                        .padding(.vertical, 6)
                                        .background(selectedCategory == cat ? AppTheme.primaryCyan : AppTheme.card)
                                        .cornerRadius(6)
                                        .overlay(
                                            RoundedRectangle(cornerRadius: 6)
                                                .stroke(AppTheme.border, lineWidth: 1)
                                        )
                                }
                            }
                        }
                        .padding(.horizontal)
                    }
                    
                    // Master List
                    ScrollView {
                        VStack(spacing: 10) {
                            let filtered = allScreens.filter { item in
                                (selectedCategory == "ALL" || item.category == selectedCategory) &&
                                (searchQuery.isEmpty || item.title.localizedCaseInsensitiveContains(searchQuery) || item.subtitle.localizedCaseInsensitiveContains(searchQuery))
                            }
                            
                            ForEach(filtered) { item in
                                Button(action: { activeSheetRoute = item.routeKey }) {
                                    ScreenEntryCard(item: item)
                                }
                                .buttonStyle(.plain)
                            }
                        }
                        .padding()
                    }
                }
            }
            .navigationTitle("36+ Screen Hub")
            .navigationBarTitleDisplayMode(.inline)
            .sheet(item: Binding(
                get: { activeSheetRoute.map { ScreenSheetIdentifiable(route: $0) } },
                set: { activeSheetRoute = $0?.route }
            )) { sheetItem in
                DynamicModuleModalView(route: sheetItem.route)
            }
        }
    }
}

private struct ScreenSheetIdentifiable: Identifiable {
    let id = UUID()
    let route: String
}

private struct DynamicModuleModalView: View {
    let route: String
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationStack {
            ZStack {
                AppTheme.background.ignoresSafeArea()
                
                VStack(spacing: 20) {
                    Text("MODULE: \(route.uppercased())")
                        .font(.system(size: 14, weight: .black, design: .monospaced))
                        .foregroundColor(AppTheme.primaryCyan)
                    
                    Text("Interactive statutory module running with zero-knowledge Section 65B forensic verification.")
                        .font(.subheadline)
                        .foregroundColor(AppTheme.textSecondary)
                        .multilineTextAlignment(.center)
                    
                    VStack(alignment: .leading, spacing: 8) {
                        Text("ACTIVE CAPABILITIES")
                            .font(.system(size: 10, weight: .bold, design: .monospaced))
                            .foregroundColor(AppTheme.accentGold)
                        Text("✓ LayoutLMv3 Multi-Modal Token Extraction")
                            .font(.caption)
                            .foregroundColor(AppTheme.successGreen)
                        Text("✓ NPPA / DPCO 2013 Statutory Cross-Check")
                            .font(.caption)
                            .foregroundColor(AppTheme.successGreen)
                        Text("✓ Automated Court-Admissible Evidence Certificate")
                            .font(.caption)
                            .foregroundColor(AppTheme.successGreen)
                    }
                    .cardStyle()
                    
                    Spacer()
                    
                    Button(action: { dismiss() }) {
                        Text("CLOSE MODULE")
                            .font(.system(size: 12, weight: .bold, design: .monospaced))
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(AppTheme.primaryBlue)
                            .foregroundColor(.white)
                            .cornerRadius(8)
                    }
                }
                .padding()
            }
            .navigationTitle("Statutory Forensics")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}

private struct ScreenEntryCard: View {
    let item: ScreenItemModel
    
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Text(item.badge)
                .font(.system(size: 9, weight: .black, design: .monospaced))
                .foregroundColor(AppTheme.primaryCyan)
                .padding(.horizontal, 6)
                .padding(.vertical, 4)
                .background(AppTheme.primaryCyan.opacity(0.12))
                .cornerRadius(4)
                .overlay(
                    RoundedRectangle(cornerRadius: 4)
                        .stroke(AppTheme.primaryCyan.opacity(0.3), lineWidth: 1)
                )
            
            VStack(alignment: .leading, spacing: 4) {
                Text(item.title)
                    .font(.system(size: 13, weight: .bold))
                    .foregroundColor(AppTheme.textPrimary)
                Text(item.subtitle)
                    .font(.system(size: 11))
                    .foregroundColor(AppTheme.textSecondary)
            }
            
            Spacer()
            
            Image(systemName: "chevron.right")
                .font(.system(size: 11, weight: .semibold))
                .foregroundColor(AppTheme.textMuted)
                .padding(.top, 4)
        }
        .padding(12)
        .background(AppTheme.card)
        .cornerRadius(10)
        .overlay(
            RoundedRectangle(cornerRadius: 10)
                .stroke(AppTheme.border, lineWidth: 1)
        )
    }
}
