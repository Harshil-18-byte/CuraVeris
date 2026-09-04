import SwiftUI

public struct FinancialRiskView: View {
    @State private var dailyBurnRate: Double = 42500.0
    @State private var alosDays: Double = 4.2
    @State private var maxAlosBenchmark: Double = 6.0
    @State private var dstiRatio: Double = 68.4 // Debt Service-to-Income
    
    public init() {}

    public var body: some View {
        NavigationStack {
            ZStack {
                AppTheme.background.ignoresSafeArea()
                
                ScrollView {
                    VStack(alignment: .leading, spacing: 16) {
                        // Inpatient Burn Rate & ALOS Card
                        VStack(alignment: .leading, spacing: 12) {
                            HStack {
                                Text("INPATIENT BURN RATE (DAILY)")
                                    .font(.system(size: 11, weight: .heavy, design: .monospaced))
                                    .foregroundColor(AppTheme.primaryCyan)
                                Spacer()
                                Text("ICMR ALOS: 4.2 / 6.0 Days")
                                    .font(.system(size: 10, design: .monospaced))
                                    .foregroundColor(AppTheme.textSecondary)
                            }
                            
                            Text("₹\(Int(dailyBurnRate)) / Day")
                                .font(.system(size: 24, weight: .black, design: .monospaced))
                                .foregroundColor(AppTheme.warningAmber)
                            
                            ProgressView(value: alosDays, total: maxAlosBenchmark)
                                .tint(AppTheme.warningAmber)
                            
                            Text("ICMR Inpatient Average Length of Stay benchmark monitored. Current projection within normal clinical bounds.")
                                .font(.caption)
                                .foregroundColor(AppTheme.textSecondary)
                        }
                        .cardStyle()
                        
                        // DSTI Distress Gauge Card
                        VStack(alignment: .leading, spacing: 12) {
                            HStack {
                                Text("DSTI MEDICAL DISTRESS INDEX")
                                    .font(.system(size: 11, weight: .heavy, design: .monospaced))
                                    .foregroundColor(AppTheme.dangerRed)
                                Spacer()
                                Text("CRITICAL 68.4%")
                                    .font(.system(size: 10, weight: .bold, design: .monospaced))
                                    .foregroundColor(AppTheme.dangerRed)
                            }
                            
                            ProgressView(value: dstiRatio, total: 100.0)
                                .tint(AppTheme.dangerRed)
                            
                            Text("Out-of-Pocket healthcare liability exceeds 50% of annual household income threshold. Immediate insurance dispute and subsidy intervention recommended.")
                                .font(.caption)
                                .foregroundColor(AppTheme.textSecondary)
                        }
                        .cardStyle()
                        
                        // 4-Way Balance Reconciliation Matrix
                        VStack(alignment: .leading, spacing: 12) {
                            Text("4-WAY BALANCE RECONCILIATION MATRIX")
                                .font(.system(size: 11, weight: .heavy, design: .monospaced))
                                .foregroundColor(AppTheme.textSecondary)
                            
                            ReconciliationRow(label: "1. Gross Hospital Billed", amount: "₹2,48,000", color: AppTheme.textPrimary)
                            ReconciliationRow(label: "2. Statutory Tariff Ceiling (NPPA/DPCO)", amount: "₹1,42,500", color: AppTheme.primaryCyan)
                            ReconciliationRow(label: "3. TPA Approved Pre-Auth Settlement", amount: "₹1,20,000", color: AppTheme.successGreen)
                            ReconciliationRow(label: "4. True Patient COPAY Liability", amount: "₹22,500", color: AppTheme.accentGold)
                            
                            Divider()
                                .background(AppTheme.border)
                            
                            HStack {
                                Text("UNLAWFUL EXCESS CHARGED:")
                                    .font(.system(size: 11, weight: .heavy, design: .monospaced))
                                    .foregroundColor(AppTheme.dangerRed)
                                Spacer()
                                Text("₹1,05,500")
                                    .font(.system(size: 14, weight: .bold, design: .monospaced))
                                    .foregroundColor(AppTheme.dangerRed)
                            }
                        }
                        .cardStyle()
                    }
                    .padding()
                }
            }
            .navigationTitle("Financial Risk Forensics")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}

private struct ReconciliationRow: View {
    let label: String
    let amount: String
    let color: Color
    
    var body: some View {
        HStack {
            Text(label)
                .font(.system(size: 11))
                .foregroundColor(AppTheme.textSecondary)
            Spacer()
            Text(amount)
                .font(.system(size: 12, weight: .bold, design: .monospaced))
                .foregroundColor(color)
        }
        .padding(.vertical, 2)
    }
}
