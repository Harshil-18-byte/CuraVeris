import SwiftUI
import UIKit

public struct LegalDisputeView: View {
    @State private var disputeType: Int = 0 // 0: Anti-Detention, 1: Ombudsman, 2: Legal Notice
    @State private var patientName: String = "Rahul Sharma"
    @State private var hospitalName: String = "Apex Multi-Specialty Hospital"
    @State private var billNumber: String = "INV-2026-90812"
    @State private var disputedAmount: String = "67,880"
    @State private var isCopied: Bool = false
    
    public init() {}

    private var generatedPetitionText: String {
        switch disputeType {
        case 0:
            return """
            EMERGENCY LEGAL NOTICE & CEASE-AND-DESIST UNDER BNS SECTION 127
            To: The Medical Superintendent / Managing Director, \(hospitalName)
            Date: September 4, 2026
            Ref: Illegal Patient Detention for Disputed Inpatient Bill No: \(billNumber)

            TAKE FORMAL NOTICE THAT:
            1. You are unlawfully withholding the discharge of patient \(patientName) citing pending disputed charges of ₹\(disputedAmount).
            2. The Hon'ble Bombay High Court in Criminal Writ Petition No. 2502/2000 has unequivocally held that hospital detention of a patient or mortal remains for disputed medical bills is unconstitutional and constitutes wrongful confinement under the law.
            3. Under Section 127 of the Bharatiya Nyaya Sanhita (BNS) 2023, wrongful confinement is a cognizable criminal offense punishable by imprisonment and monetary fines.
            4. You are hereby ordered to release the patient and complete discharge documentation immediately without coercion.

            Issued via CuraVeris Statutory Forensics Engine (Hash: 65B-CERT-SEC902)
            """
        case 1:
            return """
            FORMAL PETITION UNDER RULE 14(1) OF THE INSURANCE OMBUDSMAN RULES, 2017
            To: The Hon'ble Insurance Ombudsman
            Complainant: \(patientName)
            Opposite Party: Insurer / TPA & \(hospitalName)
            Disputed Medical Bill: \(billNumber) | Disputed Deduction: ₹\(disputedAmount)

            STATEMENT OF CLAIM:
            1. The complainant was hospitalized for necessary inpatient care under cashless health policy.
            2. Insurer/TPA arbitrarily deducted ₹\(disputedAmount) claiming 'Non-Payables' in violation of IRDAI Master Circular 2024 List I guidelines.
            3. The complainant seeks complete reimbursement with 15% statutory penal interest.
            """
        default:
            return """
            STATUTORY OVERCHARGE DEFENSE NOTICE UNDER DPCO 2013 & NPPA S.O. 1335(E)
            To: Billing Department, \(hospitalName)
            Ref: Forensic Audit of Invoice No: \(billNumber)

            Forensic verification has confirmed statutory overcharges of ₹\(disputedAmount) violating NPPA ceiling prices. You are requested to revise the invoice to statutory limits within 24 hours.
            """
        }
    }

    public var body: some View {
        NavigationStack {
            ZStack {
                AppTheme.background.ignoresSafeArea()
                
                ScrollView {
                    VStack(alignment: .leading, spacing: 16) {
                        // Notice Type Selector
                        Picker("Dispute Type", selection: $disputeType) {
                            Text("BNS 127 Anti-Detention").tag(0)
                            Text("Ombudsman Rule 14").tag(1)
                            Text("NPPA / DPCO Notice").tag(2)
                        }
                        .pickerStyle(.segmented)
                        .padding(.vertical, 4)
                        
                        // Input Metadata Card
                        VStack(alignment: .leading, spacing: 12) {
                            Text("DISPUTE PARAMETERS")
                                .font(.system(size: 11, weight: .heavy, design: .monospaced))
                                .foregroundColor(AppTheme.primaryCyan)
                            
                            HStack(spacing: 12) {
                                VStack(alignment: .leading, spacing: 4) {
                                    Text("Patient Name")
                                        .font(.caption)
                                        .foregroundColor(AppTheme.textMuted)
                                    TextField("Patient Name", text: $patientName)
                                        .padding(8)
                                        .background(AppTheme.surface)
                                        .foregroundColor(AppTheme.textPrimary)
                                        .cornerRadius(6)
                                }
                                
                                VStack(alignment: .leading, spacing: 4) {
                                    Text("Disputed Amount (₹)")
                                        .font(.caption)
                                        .foregroundColor(AppTheme.textMuted)
                                    TextField("Amount", text: $disputedAmount)
                                        .padding(8)
                                        .background(AppTheme.surface)
                                        .foregroundColor(AppTheme.dangerRed)
                                        .cornerRadius(6)
                                }
                            }
                            
                            VStack(alignment: .leading, spacing: 4) {
                                Text("Hospital / Medical Institution")
                                    .font(.caption)
                                    .foregroundColor(AppTheme.textMuted)
                                TextField("Hospital", text: $hospitalName)
                                    .padding(8)
                                    .background(AppTheme.surface)
                                    .foregroundColor(AppTheme.textPrimary)
                                    .cornerRadius(6)
                            }
                        }
                        .cardStyle()
                        
                        // Generated Petition Card
                        VStack(alignment: .leading, spacing: 12) {
                            HStack {
                                Text("GENERATED LEGAL NOTICE")
                                    .font(.system(size: 11, weight: .heavy, design: .monospaced))
                                    .foregroundColor(AppTheme.accentGold)
                                Spacer()
                                if isCopied {
                                    Text("COPIED TO CLIPBOARD!")
                                        .font(.system(size: 10, weight: .bold, design: .monospaced))
                                        .foregroundColor(AppTheme.successGreen)
                                }
                            }
                            
                            Text(generatedPetitionText)
                                .font(.system(size: 11, design: .monospaced))
                                .foregroundColor(AppTheme.textPrimary)
                                .padding(10)
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .background(AppTheme.surface)
                                .cornerRadius(8)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 8)
                                        .stroke(AppTheme.border, lineWidth: 1)
                                )
                            
                            Button(action: copyToClipboard) {
                                HStack {
                                    Image(systemName: "doc.on.doc.fill")
                                    Text("COPY FORMAL LEGAL NOTICE")
                                        .font(.system(size: 12, weight: .bold, design: .monospaced))
                                }
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(AppTheme.primaryCyan)
                                .foregroundColor(.black)
                                .cornerRadius(8)
                            }
                        }
                        .cardStyle()
                    }
                    .padding()
                }
            }
            .navigationTitle("Legal Petitions & Redress")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
    
    private func copyToClipboard() {
        UIPasteboard.general.string = generatedPetitionText
        let generator = UINotificationFeedbackGenerator()
        generator.notificationOccurred(.success)
        isCopied = true
        Task {
            try? await Task.sleep(nanoseconds: 2_000_000_000)
            await MainActor.run {
                isCopied = false
            }
        }
    }
}
