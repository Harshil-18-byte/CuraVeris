import SwiftUI

public struct SplashView: View {
    var onFinished: (Bool) -> Void
    @State private var pulseScale: CGFloat = 0.95
    @State private var pulseOpacity: Double = 0.6
    
    public init(onFinished: @escaping (Bool) -> Void = { _ in }) {
        self.onFinished = onFinished
    }

    public var body: some View {
        ZStack {
            AppTheme.background.ignoresSafeArea()
            
            VStack(spacing: 24) {
                Spacer()
                
                // Pulsing Logo Icon
                ZStack {
                    Circle()
                        .fill(AppTheme.primaryCyan.opacity(0.15))
                        .frame(width: 140, height: 140)
                        .scaleEffect(pulseScale)
                        .opacity(pulseOpacity)
                    
                    Circle()
                        .stroke(AppTheme.primaryCyan, lineWidth: 2)
                        .frame(width: 110, height: 110)
                    
                    Text("⚖️")
                        .font(.system(size: 48))
                }
                .onAppear {
                    withAnimation(
                        Animation.easeInOut(duration: 1.2)
                            .repeatForever(autoreverses: true)
                    ) {
                        pulseScale = 1.15
                        pulseOpacity = 0.2
                    }
                }
                
                // Brand Title
                VStack(spacing: 6) {
                    Text("CURAVERIS")
                        .font(.system(size: 26, weight: .black, design: .monospaced))
                        .foregroundColor(AppTheme.primaryCyan)
                        .tracking(3)
                    
                    Text("STATUTORY HEALTHCARE FORENSICS")
                        .font(.system(size: 11, weight: .bold, design: .monospaced))
                        .foregroundColor(AppTheme.textSecondary)
                        .tracking(1.5)
                }
                
                // Trust Badges
                HStack(spacing: 8) {
                    BadgePill(text: "DPDP 2023", color: AppTheme.successGreen)
                    BadgePill(text: "SEC 65B EVIDENCE", color: AppTheme.accentGold)
                    BadgePill(text: "AIRA ML AUDIT", color: AppTheme.primaryCyan)
                }
                .padding(.top, 8)
                
                Spacer()
                
                // Initializing Indicator
                HStack(spacing: 8) {
                    ProgressView()
                        .tint(AppTheme.primaryCyan)
                    Text("INITIALIZING CRYPTOGRAPHIC ENGINE...")
                        .font(.system(size: 10, weight: .semibold, design: .monospaced))
                        .foregroundColor(AppTheme.textMuted)
                }
                .padding(.bottom, 32)
            }
            .padding()
        }
        .task {
            // Check session status and proceed
            try? await Task.sleep(nanoseconds: 1_200_000_000) // 1.2s splash duration
            let isAuthenticated = KeychainManager.shared.isAuthenticated
            onFinished(isAuthenticated)
        }
    }
}

private struct BadgePill: View {
    let text: String
    let color: Color
    
    var body: some View {
        Text(text)
            .font(.system(size: 9, weight: .heavy, design: .monospaced))
            .foregroundColor(color)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(color.opacity(0.12))
            .cornerRadius(4)
            .overlay(
                RoundedRectangle(cornerRadius: 4)
                    .stroke(color.opacity(0.4), lineWidth: 1)
            )
    }
}
