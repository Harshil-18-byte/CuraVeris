import SwiftUI

public struct AuthView: View {
    var onLoginSuccess: () -> Void
    
    @State private var destination: String = ""
    @State private var otpCode: String = ""
    @State private var isOtpSent: Bool = false
    @State private var isLoading: Bool = false
    @State private var errorMessage: String? = nil
    @State private var successMessage: String? = nil
    @State private var countdown: Int = 30
    @State private var timerActive: Bool = false
    
    public init(onLoginSuccess: @escaping () -> Void = {}) {
        self.onLoginSuccess = onLoginSuccess
    }

    public var body: some View {
        ZStack {
            AppTheme.background.ignoresSafeArea()
            
            ScrollView {
                VStack(spacing: 24) {
                    // Header Branding
                    VStack(spacing: 8) {
                        Text("⚖️ CURAVERIS")
                            .font(.system(size: 22, weight: .black, design: .monospaced))
                            .foregroundColor(AppTheme.primaryCyan)
                        
                        Text("FORENSIC PATIENT AUTHENTICATION")
                            .font(.system(size: 11, weight: .bold, design: .monospaced))
                            .foregroundColor(AppTheme.textSecondary)
                    }
                    .padding(.top, 40)
                    
                    // Main Auth Card
                    VStack(alignment: .leading, spacing: 18) {
                        if !isOtpSent {
                            // Step 1: Request OTP
                            Text("ENTER YOUR IDENTIFIER")
                                .font(.system(size: 11, weight: .heavy, design: .monospaced))
                                .foregroundColor(AppTheme.primaryCyan)
                            
                            Text("Provide your registered email address or mobile number to receive a cryptographic 6-digit one-time password.")
                                .font(.subheadline)
                                .foregroundColor(AppTheme.textSecondary)
                            
                            TextField("Email or Phone (+91...)", text: $destination)
                                .padding()
                                .background(AppTheme.surface)
                                .foregroundColor(AppTheme.textPrimary)
                                .cornerRadius(8)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 8)
                                        .stroke(AppTheme.border, lineWidth: 1)
                                )
                                .textInputAutocapitalization(.never)
                                .autocorrectionDisabled(true)
                                .keyboardType(.emailAddress)
                            
                            Button(action: sendOTP) {
                                HStack {
                                    if isLoading {
                                        ProgressView()
                                            .tint(.white)
                                            .padding(.trailing, 4)
                                    }
                                    Text("DISPATCH VERIFICATION CODE")
                                        .font(.system(size: 13, weight: .bold, design: .monospaced))
                                }
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(destination.trimmingCharacters(in: .whitespaces).isEmpty ? AppTheme.card : AppTheme.primaryBlue)
                                .foregroundColor(.white)
                                .cornerRadius(8)
                            }
                            .disabled(destination.trimmingCharacters(in: .whitespaces).isEmpty || isLoading)
                        } else {
                            // Step 2: Verify 6-digit OTP
                            HStack {
                                Text("ENTER 6-DIGIT OTP")
                                    .font(.system(size: 11, weight: .heavy, design: .monospaced))
                                    .foregroundColor(AppTheme.primaryCyan)
                                Spacer()
                                Button(action: { isOtpSent = false; errorMessage = nil }) {
                                    Text("CHANGE")
                                        .font(.system(size: 10, weight: .bold, design: .monospaced))
                                        .foregroundColor(AppTheme.textMuted)
                                }
                            }
                            
                            Text("Code delivered to: \(destination)")
                                .font(.footnote)
                                .foregroundColor(AppTheme.textSecondary)
                            
                            TextField("6-Digit Code", text: $otpCode)
                                .padding()
                                .background(AppTheme.surface)
                                .foregroundColor(AppTheme.primaryCyan)
                                .font(.system(size: 20, weight: .bold, design: .monospaced))
                                .multilineTextAlignment(.center)
                                .cornerRadius(8)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 8)
                                        .stroke(AppTheme.primaryCyan.opacity(0.6), lineWidth: 1)
                                )
                                .keyboardType(.numberPad)
                            
                            Button(action: verifyOTP) {
                                HStack {
                                    if isLoading {
                                        ProgressView()
                                            .tint(.white)
                                            .padding(.trailing, 4)
                                    }
                                    Text("VERIFY & AUTHENTICATE")
                                        .font(.system(size: 13, weight: .bold, design: .monospaced))
                                }
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(otpCode.count < 6 ? AppTheme.card : AppTheme.successGreen)
                                .foregroundColor(.black)
                                .cornerRadius(8)
                            }
                            .disabled(otpCode.count < 6 || isLoading)
                            
                            // Resend timer
                            HStack {
                                Spacer()
                                if countdown > 0 {
                                    Text("Resend code in \(countdown)s")
                                        .font(.system(size: 11, design: .monospaced))
                                        .foregroundColor(AppTheme.textMuted)
                                } else {
                                    Button(action: sendOTP) {
                                        Text("RESEND OTP")
                                            .font(.system(size: 11, weight: .bold, design: .monospaced))
                                            .foregroundColor(AppTheme.primaryCyan)
                                    }
                                }
                                Spacer()
                            }
                            .padding(.top, 4)
                        }
                        
                        // Error / Success Feedback
                        if let error = errorMessage {
                            Text(error)
                                .font(.footnote)
                                .foregroundColor(AppTheme.dangerRed)
                                .padding(8)
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .background(AppTheme.dangerRed.opacity(0.1))
                                .cornerRadius(6)
                        }
                        
                        if let success = successMessage {
                            Text(success)
                                .font(.footnote)
                                .foregroundColor(AppTheme.successGreen)
                                .padding(8)
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .background(AppTheme.successGreen.opacity(0.1))
                                .cornerRadius(6)
                        }
                    }
                    .padding()
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(AppTheme.card)
                    .cornerRadius(12)
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(AppTheme.border, lineWidth: 1)
                    )
                    
                    // Compliance Footnote
                    VStack(spacing: 4) {
                        Text("🔒 DPDP ACT 2023 ZERO-KNOWLEDGE PROTOCOL")
                            .font(.system(size: 10, weight: .bold, design: .monospaced))
                            .foregroundColor(AppTheme.textMuted)
                        Text("OTP is hashed via SHA-256 and salted with an ephemeral session token.")
                            .font(.system(size: 9))
                            .foregroundColor(AppTheme.textMuted)
                            .multilineTextAlignment(.center)
                    }
                    .padding(.horizontal)
                }
                .padding()
            }
        }
    }
    
    private func sendOTP() {
        guard !destination.trimmingCharacters(in: .whitespaces).isEmpty else { return }
        isLoading = true
        errorMessage = nil
        successMessage = nil
        
        Task {
            do {
                let payload = OTPSendRequestPayload(destination: destination.trimmingCharacters(in: .whitespaces))
                let response: OTPSendResponsePayload = try await APIClient.shared.post(endpoint: "/api/v1/auth/otp/send", body: payload)
                
                await MainActor.run {
                    isLoading = false
                    isOtpSent = true
                    successMessage = response.message
                    startTimer()
                }
            } catch {
                await MainActor.run {
                    isLoading = false
                    errorMessage = "Failed to dispatch verification code: \(error.localizedDescription)"
                }
            }
        }
    }
    
    private func verifyOTP() {
        guard otpCode.count >= 4 else { return }
        isLoading = true
        errorMessage = nil
        successMessage = nil
        
        Task {
            do {
                let payload = OTPVerifyRequestPayload(
                    destination: destination.trimmingCharacters(in: .whitespaces),
                    otp: otpCode.trimmingCharacters(in: .whitespaces)
                )
                let response: AuthTokenResponse = try await APIClient.shared.post(endpoint: "/api/v1/auth/otp/verify", body: payload)
                
                await MainActor.run {
                    isLoading = false
                    KeychainManager.shared.saveAccessToken(response.access_token)
                    KeychainManager.shared.saveRefreshToken(response.refresh_token)
                    onLoginSuccess()
                }
            } catch {
                await MainActor.run {
                    isLoading = false
                    errorMessage = "Invalid verification code. Please check and retry."
                }
            }
        }
    }
    
    private func startTimer() {
        countdown = 30
        timerActive = true
        Task {
            while countdown > 0 && timerActive {
                try? await Task.sleep(nanoseconds: 1_000_000_000)
                await MainActor.run {
                    if countdown > 0 {
                        countdown -= 1
                    }
                }
            }
        }
    }
}
