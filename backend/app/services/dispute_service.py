from datetime import datetime
from typing import Dict, Any, List


class DisputeLetterService:
    def generate_letter(
        self,
        bill_data: Dict[str, Any],
        forum_type: str,
        patient_name: str = "Aggrieved Patient",
        patient_address: str = "India",
        patient_phone: str = "+91-9876543210"
    ) -> Dict[str, Any]:
        """
        Generates legally sound petitions formatted for Indian statutory authorities.
        """
        hospital = bill_data.get("hospital_name", "Hospital Management")
        city = bill_data.get("city", "Delhi")
        bill_id = bill_data.get("bill_id", "INV-UNKNOWN")
        total_billed = bill_data.get("total_billed", 0)
        total_overcharge = bill_data.get("total_overcharge", 0)
        items = bill_data.get("line_items", [])
        date_str = datetime.now().strftime("%d %B %Y")

        flagged_items = [i for i in items if i.get("is_flagged", False)]

        # Build itemized table
        table_lines = []
        for idx, item in enumerate(flagged_items, 1):
            table_lines.append(
                f"{idx}. {item['raw_text']} | Charged: INR {item['charged_rate']:,.2f} | "
                f"Benchmarked Legal Rate: INR {(item.get('nppa_ceiling') or item.get('mrp') or item.get('cghs_rate') or 0):,.2f} | "
                f"Overcharge: INR {item['overcharge_amount']:,.2f} | Law Cited: {item.get('legal_citation', 'Statutory Norms')}"
            )
        items_summary_text = "\n".join(table_lines) if table_lines else "Itemized Schedule of Overcharges"

        if forum_type == "hospital_grievance":
            target = f"The Medical Superintendent / Patient Grievance Officer\n{hospital}, {city}"
            title = f"FORMAL NOTICE & DEMAND FOR IMMEDIATE REFUND OF UNLAWFUL BILLING (INVOICE NO: {bill_id})"
            body = f"""Date: {date_str}

TO:
{target}

FROM:
{patient_name}
Contact: {patient_phone}
Address: {patient_address}

SUBJECT: NOTICE FOR IMMEDIATE CANCELLATION AND REFUND OF STATUTORY OVERCHARGES AND UNFAIR TRADE PRACTICES IN BILL NO. {bill_id}

Respected Sir / Madam,

1. I am writing to formally place on record serious statutory violations, price cap breaches, and erroneous entries in the final inpatient hospitalization invoice #{bill_id} issued by {hospital} totaling INR {total_billed:,.2f}.

2. An independent statutory audit reveals that {hospital} has billed the patient a sum of INR {total_overcharge:,.2f} in clear violation of applicable Central Government drug pricing orders, NPPA notifications, and tax regulations.

3. SCHEDULE OF SPECIFIC OVERCHARGES & STATUTORY VIOLATIONS:
{items_summary_text}

4. GROUNDS OF DEMAND:
a) Medicines / Devices Capped by Law: Certain medical devices/medicines have been billed above the ceiling price notified under DPCO 2013 and NPPA orders, which is an offense under Section 7 of the Essential Commodities Act, 1955.
b) Unfair Trade Practice: Under Section 2(47) of the Consumer Protection Act, 2019, billing for duplicate services or unbundled routine consumables is an unlawful practice.
c) Improper Tax Levies: Healthcare services are legally exempt from GST under Notification No. 12/2017-Central Tax (Rate).

5. PRAYER / DEMAND FOR RELIEF:
In light of the above facts, you are hereby requested to:
i. Issue a revised hospitalization invoice deleting the unlawful overcharge of INR {total_overcharge:,.2f}.
ii. Refund / Credit the excess amount of INR {total_overcharge:,.2f} to the patient's account within 7 (seven) business days.

Failing an amicable resolution within 7 days, the undersigned shall be constrained to initiate formal regulatory complaints before the National Pharmaceutical Pricing Authority (NPPA), State Health Authority, and District Consumer Commission, with cost and penal interest.

Yours faithfully,

{patient_name}
(Complainant / Patient)
"""
            citations = [
                "Drugs (Prices Control) Order, 2013",
                "NPPA Price Ceiling Orders",
                "Consumer Protection Act, 2019 Section 2(47)",
                "GST Notification No. 12/2017-Central Tax (Rate)"
            ]

        elif forum_type == "nppa":
            target = "The Member Secretary / Monitoring Division\nNational Pharmaceutical Pricing Authority (NPPA)\nDepartment of Pharmaceuticals, Govt. of India, New Delhi"
            title = f"COMPLAINT UNDER DPCO 2013 FOR OVERCHARGING BY {hospital.upper()} (INVOICE NO: {bill_id})"
            body = f"""Date: {date_str}

BEFORE THE NATIONAL PHARMACEUTICAL PRICING AUTHORITY (NPPA)
DEPARTMENT OF PHARMACEUTICALS, MINISTRY OF CHEMICALS & FERTILIZERS, NEW DELHI

IN THE MATTER OF:
{patient_name}, Resident of {patient_address} ... COMPLAINANT
VERSUS
{hospital}, {city} ... RESPONDENT HOSPITAL

SUBJECT: COMPLAINT UNDER SECTION 7 OF ESSENTIAL COMMODITIES ACT, 1955 READ WITH PARAGRAPH 24 OF DPCO, 2013 FOR CONTRAVENTION OF STATUTORY CEILING PRICES

RESPECTFULLY SHEWETH:

1. That the Complainant was admitted for treatment at the Respondent Hospital under Inpatient Invoice #{bill_id}.

2. That the Respondent Hospital has deliberately charged the Complainant for medical devices and/or scheduled formulations at rates in blatant excess of the NPPA notified maximum ceiling prices.

3. DETAILS OF SCHEDULED COMMODITIES OVERCHARGED:
{items_summary_text}

4. PRAYER:
The Complainant respectfully prays that the Hon'ble Authority may be pleased to:
a) Direct the Respondent Hospital to refund the overcharged amount of INR {total_overcharge:,.2f} along with interest at 18% per annum under DPCO 2013.
b) Initiate penal recovery proceedings against the Respondent Hospital under Section 7 of the Essential Commodities Act, 1955.

COMPLAINANT: {patient_name}
"""
            citations = ["DPCO 2013 Paragraph 24", "Essential Commodities Act 1955 Section 7", "NPPA Price Notifications"]

        elif forum_type == "irdai":
            target = "Grievance Redressal Officer, Consumer Affairs Department\nInsurance Regulatory and Development Authority of India (IRDAI)\nBima Bharosa Portal"
            title = f"GRIEVANCE REGARDING ARBITRARY DEDUCTIONS & UNJUST SETTLEMENT (BILL #{bill_id})"
            body = f"""Date: {date_str}

TO:
{target}

COMPLAINANT: {patient_name}
AGAINST: TPA / General Insurance Provider
HOSPITAL INVOICE NO: {bill_id}

SUBJECT: UNJUST AND ARBITRARY DISALLOWANCE OF LEGITIMATE HOSPITALIZATION EXPENSES AND PROPORTIONATE DEDUCTION VIOLATION

Respected Authority,

1. That the Complainant was covered under a valid health insurance policy and underwent hospitalization at {hospital}.
2. That the Insurer / TPA arbitrarily disallowed legitimate in-hospital expenses and misapplied proportionate deductions.
3. IRDAI circular IRDA/HLT/REG/CIR/146/07/2020 explicitly prohibits arbitrary deductions where the hospital has bundled services under standard tariffs.
4. The Complainant seeks intervention for reimbursement of INR {total_overcharge:,.2f} unlawfully shifted to the patient.

Submitted respectfully,
{patient_name}
"""
            citations = ["IRDAI Circular IRDA/HLT/REG/CIR/146/07/2020", "IRDAI Protection of Policyholders' Interests Regulations"]

        else:  # consumer_court
            target = f"Before the Hon'ble District Consumer Disputes Redressal Commission\nDistrict: {city}"
            title = f"CONSUMER COMPLAINT UNDER SECTION 35 OF CONSUMER PROTECTION ACT, 2019"
            body = f"""Date: {date_str}

{target}

CONSUMER COMPLAINT NO. _____ OF {datetime.now().year}

IN THE MATTER OF:
{patient_name}, Resident of {patient_address} ... COMPLAINANT
VERSUS
1. {hospital}, {city} ... OPPOSITE PARTY NO. 1
2. Authorized TPA / Billing Desk ... OPPOSITE PARTY NO. 2

PETITION UNDER SECTION 35 OF THE CONSUMER PROTECTION ACT, 2019 FOR DEFICIENCY IN SERVICE AND UNFAIR TRADE PRACTICE

MOST RESPECTFULLY SHEWETH:

1. The Complainant is a 'Consumer' within the meaning of Section 2(7) of the Consumer Protection Act, 2019.
2. The Opposite Parties billed the Complainant an exorbitant sum of INR {total_billed:,.2f} under Bill #{bill_id}.
3. The Opposite Party billed duplicate charges and charges far in excess of statutory price caps, totaling INR {total_overcharge:,.2f}.
4. SCHEDULE OF UNFAIR BILLINGS:
{items_summary_text}

PRAYER:
The Complainant prays for an order directing Opposite Parties to:
a) Refund the excess amount of INR {total_overcharge:,.2f} with 12% interest.
b) Pay INR 50,000 as compensation for harassment and mental agony.
c) Pay INR 15,000 towards litigation costs.

COMPLAINANT: {patient_name}
"""
            citations = ["Consumer Protection Act 2019 Section 35", "Consumer Protection Act 2019 Section 2(47)"]

        return {
            "letter_id": f"DISP_{bill_id[:6]}_{forum_type.upper()}",
            "bill_id": bill_id,
            "forum_type": forum_type,
            "target_authority": target,
            "letter_title": title,
            "letter_body": body,
            "statutory_citations": citations,
            "total_disputed_amount": float(total_overcharge),
            "created_at": datetime.utcnow()
        }

    def generate_emergency_detention_notice(
        self,
        hospital_name: str,
        patient_name: str,
        attendant_name: str,
        attendant_phone: str,
        disputed_amount: float,
        city: str = "India"
    ) -> Dict[str, Any]:
        """
        Generates an immediate High Court Emergency Notice against unlawful hospital detention
        or withholding of patient/discharge summary for non-payment of disputed bills.
        Cites Bombay HC & Delhi HC landmark rulings and BNS Section 127 (Wrongful Confinement).
        """
        date_str = datetime.now().strftime("%d %B %Y, %I:%M %p")
        title = f"EMERGENCY LEGAL REQUISITION: CEASE AND DESIST UNLAWFUL DETENTION OF PATIENT ({patient_name})"
        
        body = f"""DATE & TIME: {date_str}

URGENT / LEGAL NOTICE UNDER ARTICLE 21 OF THE CONSTITUTION OF INDIA
AND SECTION 127 OF BHARATIYA NYAYA SANHITA (BNS) 2023 (FORMERLY SECTION 340/342 IPC)

TO:
1. The Medical Superintendent / Managing Director, {hospital_name}, {city}
2. The Station House Officer (SHO), Local Police Station
3. The District Magistrate / Chief Medical Officer (CMO), District Health Authority

FROM:
Aggrieved Family / Attendant: {attendant_name}
On Behalf of Patient: {patient_name}
Contact: {attendant_phone}

SUBJECT: UNCONDITIONAL DEMAND FOR IMMEDIATE PHYSICAL RELEASE OF PATIENT / DISCHARGE PAPERS; RESTRAINT AGAINST ILLEGAL DETENTION FOR DISPUTED DUES OF INR {disputed_amount:,.2f}

SIR / MADAM,

1. UNLAWFUL CONFINEMENT PLACED ON RECORD:
It is formally placed on record that your hospital administration and security staff are unlawfully withholding the physical discharge / discharge summary / mortal remains of the patient, {patient_name}, solely on the grounds of an unsettled, disputed billing balance of INR {disputed_amount:,.2f}.

2. SETTLED CONSTITUTIONAL LAW & LANDMARK HIGH COURT PRECEDENTS:
Your attention is explicitly drawn to authoritative and binding constitutional precedents:
   a) BOMBAY HIGH COURT in 'Association of Medical Consultants vs Union of India':
      Held categorically: "No hospital or doctor can detain a patient or the dead body of a patient under any pretext of non-payment of hospital dues. Such detention constitutes the cognizable offense of Wrongful Confinement under the criminal law."
   b) DELHI HIGH COURT in 'Deen Dayal Upadhyay Hospital / Multiple Petitions':
      Reiterated that hospitals have legal civil remedies to recover money (via civil suit or consumer dispute), but under NO circumstances do they possess any possessory lien or physical detention right over a human being.
   c) ARTICLE 21 OF THE CONSTITUTION OF INDIA:
      No citizen can be deprived of their personal liberty except according to procedure established by law. Detention by private security or hospital staff is a flagrant constitutional violation.

3. CRIMINAL LIABILITY WARNED:
Withholding a patient or coercively blocking their exit constitutes:
   - SECTION 127 BNS 2023 (formerly Section 340/342 IPC): Wrongful Confinement (Punishable with imprisonment and non-bailable cognizance).
   - SECTION 308 BNS 2023: Extortion by putting a person in fear of injury.
   - Clinical Establishments Act Section 12: Revocation of hospital registration.

4. DEMAND FOR IMMEDIATE RELEASE:
You are hereby commanded to IMMEDIATELY allow {patient_name} and family to exit the hospital premises along with the full Inpatient Discharge Summary, Diagnostic Reports, and Death Certificate (if applicable), within 30 minutes of receipt of this notice.

If physical restraint continues, this requisition stands transmitted directly to the Police Control Room (Dial 112), the District Magistrate, and the Vacation Bench of the Hon'ble High Court for immediate habeas corpus and criminal FIR registration.

ISSUED BY:
{attendant_name} (Attendant for {patient_name})
Phone: {attendant_phone}
"""
        return {
            "notice_id": f"DETENTION_NOTICE_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
            "hospital_name": hospital_name,
            "patient_name": patient_name,
            "attendant_name": attendant_name,
            "disputed_amount": disputed_amount,
            "title": title,
            "notice_body": body,
            "statutory_citations": [
                "Bombay High Court: Association of Medical Consultants vs Union of India",
                "Bharatiya Nyaya Sanhita 2023 Sec 127 / Indian Penal Code Sec 340/342 (Wrongful Confinement)",
                "Article 21 of the Constitution of India (Protection of Liberty)",
                "Delhi High Court Patient Discharge Detention Directives"
            ],
            "emergency_escalations": [
                "Police Control Room (Dial 112)",
                "District Magistrate Emergency Grievance Cell",
                "State Human Rights Commission (SHRC)"
            ],
            "created_at": datetime.utcnow()
        }


dispute_service = DisputeLetterService()

