import SwiftUI

public struct CopilotChatMessage: Identifiable {
    public let id = UUID()
    public let isUser: Bool
    public let text: String
    public let citation: String?
}

public struct CopilotView: View {
    var onNavigateToDispute: () -> Void = {}
    
    @State private var queryText: String = ""
    @State private var chatHistory: [CopilotChatMessage] = [
        CopilotChatMessage(
            isUser: false,
            text: "Welcome to CuraVeris Statutory Copilot. I analyze clinical bills against NPPA Price Orders, DPCO NLEM ceilings, and Indian legal precedents. How can I protect your patient rights today?",
            citation: nil
        ),
        CopilotChatMessage(
            isUser: true,
            text: "Hospital is withholding discharge summary demanding ₹85,000 extra for stent overcharges.",
            citation: nil
        ),
        CopilotChatMessage(
            isUser: false,
            text: "WITHHOLDING DISCHARGE IS ILLEGAL. Under the Bombay High Court ruling (CrWP 2502/2000), hospital detention of a patient or body for unpaid bills constitutes wrongful confinement under Bharatiya Nyaya Sanhita (BNS) Section 127. You can issue an immediate statutory legal notice.",
            citation: "Bombay HC CrWP 2502/2000 & BNS Sec 127"
        )
    ]
    
    public init(onNavigateToDispute: @escaping () -> Void = {}) {
        self.onNavigateToDispute = onNavigateToDispute
    }

    public var body: some View {
        NavigationStack {
            ZStack {
                AppTheme.background.ignoresSafeArea()
                
                VStack(spacing: 0) {
                    ScrollView {
                        VStack(spacing: 14) {
                            // Quick Action Chips
                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: 8) {
                                    QuickPromptChip(text: "🚨 Anti-Detention Notice") {
                                        queryText = "Generate anti-detention notice under BNS 127"
                                        sendMessage()
                                    }
                                    QuickPromptChip(text: "💊 Check DPCO Medicine MRP") {
                                        queryText = "What is the DPCO ceiling for Meropenem 1g?"
                                        sendMessage()
                                    }
                                    QuickPromptChip(text: "🩺 Stent Price Cap (NPPA)") {
                                        queryText = "What is the NPPA maximum cap on drug-eluting stents?"
                                        sendMessage()
                                    }
                                }
                                .padding(.horizontal)
                                .padding(.top, 8)
                            }
                            
                            // Chat Messages List
                            ForEach(chatHistory) { msg in
                                ChatBubble(message: msg)
                            }
                        }
                        .padding(.vertical)
                    }
                    
                    // Input Bar
                    VStack(spacing: 8) {
                        HStack(spacing: 8) {
                            TextField("Ask about statutory caps, BNS 127...", text: $queryText)
                                .padding(12)
                                .background(AppTheme.surface)
                                .foregroundColor(AppTheme.textPrimary)
                                .cornerRadius(8)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 8)
                                        .stroke(AppTheme.border, lineWidth: 1)
                                )
                            
                            Button(action: sendMessage) {
                                Image(systemName: "paperplane.fill")
                                    .font(.system(size: 14))
                                    .padding(12)
                                    .background(queryText.trimmingCharacters(in: .whitespaces).isEmpty ? AppTheme.card : AppTheme.primaryCyan)
                                    .foregroundColor(queryText.trimmingCharacters(in: .whitespaces).isEmpty ? AppTheme.textMuted : .black)
                                    .cornerRadius(8)
                            }
                            .disabled(queryText.trimmingCharacters(in: .whitespaces).isEmpty)
                        }
                    }
                    .padding()
                    .background(AppTheme.surface)
                }
            }
            .navigationTitle("Statutory Copilot")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: onNavigateToDispute) {
                        Text("LEGAL NOTICE")
                            .font(.system(size: 10, weight: .bold, design: .monospaced))
                            .foregroundColor(AppTheme.dangerRed)
                    }
                }
            }
        }
    }
    
    private func sendMessage() {
        let text = queryText.trimmingCharacters(in: .whitespaces)
        guard !text.isEmpty else { return }
        
        chatHistory.append(CopilotChatMessage(isUser: true, text: text, citation: nil))
        queryText = ""
        
        Task {
            try? await Task.sleep(nanoseconds: 600_000_000)
            await MainActor.run {
                chatHistory.append(CopilotChatMessage(
                    isUser: false,
                    text: "Analysis completed against statutory database. Under NPPA Gazette S.O. 1335(E) and DPCO 2013, overcharging attracts 100% statutory penalty plus 15% interest per annum.",
                    citation: "NPPA Gazette S.O. 1335(E) & Essential Commodities Act Sec 7"
                ))
            }
        }
    }
}

private struct QuickPromptChip: View {
    let text: String
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(text)
                .font(.system(size: 11, weight: .semibold))
                .foregroundColor(AppTheme.primaryCyan)
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(AppTheme.card)
                .cornerRadius(6)
                .overlay(
                    RoundedRectangle(cornerRadius: 6)
                        .stroke(AppTheme.border, lineWidth: 1)
                )
        }
    }
}

private struct ChatBubble: View {
    let message: CopilotChatMessage
    
    var body: some View {
        HStack {
            if message.isUser { Spacer() }
            
            VStack(alignment: message.isUser ? .trailing : .leading, spacing: 6) {
                Text(message.text)
                    .font(.system(size: 13))
                    .foregroundColor(message.isUser ? .white : AppTheme.textPrimary)
                
                if let citation = message.citation {
                    Text("⚖️ \(citation)")
                        .font(.system(size: 10, weight: .bold, design: .monospaced))
                        .foregroundColor(AppTheme.primaryCyan)
                        .padding(6)
                        .background(AppTheme.primaryCyan.opacity(0.12))
                        .cornerRadius(4)
                }
            }
            .padding(12)
            .background(message.isUser ? AppTheme.primaryBlue : AppTheme.card)
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(message.isUser ? Color.clear : AppTheme.border, lineWidth: 1)
            )
            .frame(maxWidth: 300, alignment: message.isUser ? .trailing : .leading)
            
            if !message.isUser { Spacer() }
        }
        .padding(.horizontal)
    }
}
