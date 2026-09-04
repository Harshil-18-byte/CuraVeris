import SwiftUI

public struct MainAppShell: View {
    @State private var selectedTab: Int = 0

    public init() {}

    public var body: some View {
        TabView(selection: $selectedTab) {
            DashboardView()
                .tabItem {
                    Label("HOME", systemImage: "house.fill")
                }
                .tag(0)

            ScanAuditView()
                .tabItem {
                    Label("SCAN", systemImage: "doc.viewfinder.fill")
                }
                .tag(1)

            TariffRegistryView()
                .tabItem {
                    Label("TARIFFS", systemImage: "tablecells.fill")
                }
                .tag(2)

            FinancialRiskView()
                .tabItem {
                    Label("RISK", systemImage: "chart.line.uptrend.xyaxis")
                }
                .tag(3)

            LegalDisputeView()
                .tabItem {
                    Label("REDRESS", systemImage: "shield.lefthalf.filled")
                }
                .tag(4)

            AllScreensHubView()
                .tabItem {
                    Label("36+ HUB", systemImage: "square.grid.2x2.fill")
                }
                .tag(5)
        }
        .tint(AppTheme.primaryCyan)
    }
}
