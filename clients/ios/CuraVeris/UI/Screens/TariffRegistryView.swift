import SwiftUI

public struct TariffItemModel: Identifiable {
    public let id: String
    public let name: String
    public let standardCap: String
    public let statutorySource: String
    public let penaltyNotice: String
}

public struct TariffRegistryView: View {
    @State private var selectedTab: Int = 0 // 0: NPPA, 1: DPCO, 2: CGHS, 3: IRDAI
    @State private var searchQuery: String = ""
    
    public init() {}

    private var itemsForCurrentTab: [TariffItemModel] {
        switch selectedTab {
        case 0:
            return [
                TariffItemModel(id: "n1", name: "Drug-Eluting Stent (DES) & Bioresorbable", standardCap: "₹38,280", statutorySource: "NPPA S.O. 1335(E)", penaltyNotice: "100% statutory forfeiture + 15% interest"),
                TariffItemModel(id: "n2", name: "Bare Metal Stent (BMS)", standardCap: "₹10,509", statutorySource: "NPPA S.O. 1335(E)", penaltyNotice: "100% statutory forfeiture + 15% interest"),
                TariffItemModel(id: "n3", name: "Total Knee System (Cruciate Retaining)", standardCap: "₹62,130", statutorySource: "NPPA S.O. 2668(E)", penaltyNotice: "Section 7 Essential Commodities Act"),
                TariffItemModel(id: "n4", name: "Total Knee System (Posterior Stabilized)", standardCap: "₹69,320", statutorySource: "NPPA S.O. 2668(E)", penaltyNotice: "Section 7 Essential Commodities Act")
            ]
        case 1:
            return [
                TariffItemModel(id: "d1", name: "Meropenem 1g Injection", standardCap: "₹990 / vial", statutorySource: "DPCO 2013 NLEM 2022", penaltyNotice: "100% overcharge recovery under DPCO para 23"),
                TariffItemModel(id: "d2", name: "Enoxaparin 40mg/0.4ml Pre-filled Syringe", standardCap: "₹392 / syringe", statutorySource: "DPCO 2013 NLEM 2022", penaltyNotice: "100% overcharge recovery under DPCO para 23"),
                TariffItemModel(id: "d3", name: "Piperacillin + Tazobactam 4.5g Injection", standardCap: "₹465 / vial", statutorySource: "DPCO 2013 NLEM 2022", penaltyNotice: "100% overcharge recovery under DPCO para 23"),
                TariffItemModel(id: "d4", name: "Human Normal Immunoglobulin 5g IV", standardCap: "₹14,500 / vial", statutorySource: "DPCO 2013 NLEM 2022", penaltyNotice: "100% overcharge recovery under DPCO para 23")
            ]
        case 2:
            return [
                TariffItemModel(id: "c1", name: "ICU Bed Charge (Tertiary / NABH)", standardCap: "₹8,500 / day", statutorySource: "CGHS OM 2024 Revision", penaltyNotice: "Includes nursing, monitoring & duty RMO"),
                TariffItemModel(id: "c2", name: "Coronary Angiography (CAG)", standardCap: "₹14,000", statutorySource: "CGHS OM 2024 Revision", penaltyNotice: "Single procedure tariff cap"),
                TariffItemModel(id: "c3", name: "CABG (Bypass Surgery - NABH)", standardCap: "₹1,45,000", statutorySource: "CGHS OM 2024 Revision", penaltyNotice: "Comprehensive package rate"),
                TariffItemModel(id: "c4", name: "Hemodialysis (per session)", standardCap: "₹1,800", statutorySource: "CGHS OM 2024 Revision", penaltyNotice: "Includes dialyzer re-use norms")
            ]
        default:
            return [
                TariffItemModel(id: "i1", name: "PPE Kits, Masks & Gloves (List I - 42)", standardCap: "₹0 (Included in Bed Charge)", statutorySource: "IRDAI Master Circular 2024", penaltyNotice: "Non-payable to patient directly"),
                TariffItemModel(id: "i2", name: "Syringes, Needles & Cannula (List I - 15)", standardCap: "₹0 (Hospital Overhead)", statutorySource: "IRDAI Master Circular 2024", penaltyNotice: "Unbundled billing illegal"),
                TariffItemModel(id: "i3", name: "Admission / Registration Charges (List I - 1)", standardCap: "₹0 (Disallowed)", statutorySource: "IRDAI Master Circular 2024", penaltyNotice: "Mandatory waiver for all claims"),
                TariffItemModel(id: "i4", name: "Infusion Pump Charges (List I - 88)", standardCap: "₹0 (ICU Overhead)", statutorySource: "IRDAI Master Circular 2024", penaltyNotice: "Cannot separate from room tariff")
            ]
        }
    }

    public var body: some View {
        NavigationStack {
            ZStack {
                AppTheme.background.ignoresSafeArea()
                
                VStack(spacing: 14) {
                    // Search Bar
                    TextField("Search statutory items...", text: $searchQuery)
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
                    
                    // Tab Selector
                    Picker("Registry", selection: $selectedTab) {
                        Text("NPPA").tag(0)
                        Text("DPCO").tag(1)
                        Text("CGHS").tag(2)
                        Text("IRDAI").tag(3)
                    }
                    .pickerStyle(.segmented)
                    .padding(.horizontal)
                    
                    // List
                    ScrollView {
                        VStack(spacing: 12) {
                            let filtered = itemsForCurrentTab.filter {
                                searchQuery.isEmpty || $0.name.localizedCaseInsensitiveContains(searchQuery)
                            }
                            
                            ForEach(filtered) { item in
                                TariffCard(item: item)
                            }
                        }
                        .padding()
                    }
                }
            }
            .navigationTitle("Statutory Registries")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}

private struct TariffCard: View {
    let item: TariffItemModel
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(item.name)
                    .font(.system(size: 13, weight: .bold))
                    .foregroundColor(AppTheme.textPrimary)
                Spacer()
                Text(item.standardCap)
                    .font(.system(size: 13, weight: .bold, design: .monospaced))
                    .foregroundColor(AppTheme.primaryCyan)
            }
            
            HStack {
                Text(item.statutorySource)
                    .font(.system(size: 9, weight: .bold, design: .monospaced))
                    .foregroundColor(AppTheme.accentGold)
                Spacer()
                Text("⚖️ \(item.penaltyNotice)")
                    .font(.system(size: 9, design: .monospaced))
                    .foregroundColor(AppTheme.textMuted)
            }
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
