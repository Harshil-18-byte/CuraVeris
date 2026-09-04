import SwiftUI

public enum AppTheme {
    // Core Cyber-Forensic Color Palette
    public static let background = Color(red: 10/255, green: 15/255, blue: 29/255)
    public static let surface = Color(red: 17/255, green: 24/255, blue: 39/255)
    public static let card = Color(red: 30/255, green: 41/255, blue: 59/255)
    public static let border = Color(red: 51/255, green: 65/255, blue: 85/255)
    
    // Primary Cyber Accents
    public static let primaryCyan = Color(red: 0/255, green: 240/255, blue: 255/255)
    public static let primaryBlue = Color(red: 59/255, green: 130/255, blue: 246/255)
    public static let accentGold = Color(red: 255/255, green: 184/255, blue: 0/255)
    
    // Status Tokens
    public static let successGreen = Color(red: 0/255, green: 255/255, blue: 102/255)
    public static let warningAmber = Color(red: 245/255, green: 158/255, blue: 11/255)
    public static let dangerRed = Color(red: 255/255, green: 0/255, blue: 85/255)
    
    // High-Contrast Typography Tokens
    public static let textPrimary = Color(red: 248/255, green: 250/255, blue: 252/255)
    public static let textSecondary = Color(red: 148/255, green: 163/255, blue: 184/255)
    public static let textMuted = Color(red: 100/255, green: 116/255, blue: 139/255)
}

extension View {
    public func cardStyle() -> some View {
        self
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
