"""
Real-Time In-Patient Admission Monitor & Interim Bill Burn Rate Forecaster.
Monitors day-by-day bill accumulation during active hospital stay before discharge.
Enforces Clinical Establishments Act (CEA) Right to Daily Itemized Interim Bill.
"""
from datetime import date, datetime
from typing import Dict, Any, Optional
from app.db.disease_registry import lookup_disease_context


def monitor_interim_admission_bill(
    patient_name: str,
    hospital_name: str,
    admission_date: str,            # 'YYYY-MM-DD'
    current_date: Optional[str] = None, # 'YYYY-MM-DD' or defaults to today
    primary_diagnosis: str = "General Medical Inpatient",
    room_category: str = "general",  # 'general', 'semi_private', 'private', 'icu'
    current_interim_total: float = 0.0,
    advance_deposit_requested: float = 0.0
) -> Dict[str, Any]:
    """
    Evaluates running interim hospital bill against clinical ALOS (Average Length of Stay)
    and expected daily burn rate according to CGHS / PM-JAY benchmark standards.
    """
    try:
        d_adm = datetime.strptime(admission_date, "%Y-%m-%d").date()
    except Exception:
        d_adm = date.today()

    if current_date:
        try:
            d_curr = datetime.strptime(current_date, "%Y-%m-%d").date()
        except Exception:
            d_curr = date.today()
    else:
        d_curr = date.today()

    days_elapsed = max(1, (d_curr - d_adm).days)

    # Resolve benchmark package
    pkg = lookup_disease_context(primary_diagnosis) or {
        "canonical_name": primary_diagnosis,
        "icd_10": "Z03.8",
        "typical_alos_days": 3,
        "fair_package_cost_inr": 35000.0
    }
    expected_alos = pkg.get("typical_alos_days", 3)
    benchmark_pkg_cost = pkg.get("fair_package_cost_inr", 35000.0)

    # Calculate expected daily benchmark burn rate
    base_daily_burn = benchmark_pkg_cost / max(1, expected_alos)
    
    # Adjust for room category multiplier
    room_mult = 1.0
    if room_category.lower() == "semi_private":
        room_mult = 1.25
    elif room_category.lower() == "private":
        room_mult = 1.60
    elif room_category.lower() == "icu":
        room_mult = 2.40

    expected_daily_burn = base_daily_burn * room_mult
    expected_spend_so_far = expected_daily_burn * days_elapsed

    actual_daily_burn = current_interim_total / days_elapsed
    burn_ratio = actual_daily_burn / max(1.0, expected_daily_burn)

    is_overburn = burn_ratio > 1.30  # > 30% above expected daily rate
    days_remaining_in_alos = max(0, expected_alos - days_elapsed)
    projected_final_bill = current_interim_total + (actual_daily_burn * days_remaining_in_alos)

    # Verify advance deposit reasonableness
    deposit_anomaly = False
    deposit_advisory = None
    if advance_deposit_requested > 0:
        if advance_deposit_requested > (expected_daily_burn * 3.0):
            deposit_anomaly = True
            deposit_advisory = (
                f"Requested advance deposit of ₹{advance_deposit_requested:,.2f} exceeds 3 days of expected "
                f"clinical treatment (₹{expected_daily_burn * 3:,.2f}). Ask billing desk for an itemized advance estimate."
            )

    # Patient Alert Generation (WhatsApp / SMS format)
    diag_name = pkg.get("canonical_name", "Clinical Inpatient Care")
    if is_overburn:
        alert_status = "WARNING_HIGH_BURN"
        alert_message = (
            f"⚠️ CuraVeris Admission Alert for {patient_name} at {hospital_name}: "
            f"Your interim bill is accumulating at ₹{actual_daily_burn:,.2f}/day, which is {round((burn_ratio - 1) * 100)}% "
            f"higher than the standard benchmark (₹{expected_daily_burn:,.2f}/day) for {diag_name}. "
            f"Under Clinical Establishments Act, you have the statutory right to an itemized interim statement today. "
            f"Ask the billing desk before discharge."
        )
    else:
        alert_status = "NORMAL_PROGRESSION"
        alert_message = (
            f"✅ CuraVeris Admission Status: Interim billing for {patient_name} is running at "
            f"₹{actual_daily_burn:,.2f}/day (within clinical benchmark ₹{expected_daily_burn:,.2f}/day)."
        )

    return {
        "patient_name": patient_name,
        "hospital_name": hospital_name,
        "diagnosis_resolved": diag_name,
        "icd_10_code": pkg.get("icd_10", "Z03.8"),
        "days_elapsed": days_elapsed,
        "clinical_alos_days": expected_alos,
        "current_interim_billed_inr": round(current_interim_total, 2),
        "actual_daily_burn_inr": round(actual_daily_burn, 2),
        "expected_daily_burn_inr": round(expected_daily_burn, 2),
        "burn_rate_ratio": round(burn_ratio, 2),
        "is_burn_exceeded": is_overburn,
        "projected_bill_at_alos_inr": round(projected_final_bill, 2),
        "deposit_requested_inr": round(advance_deposit_requested, 2),
        "deposit_anomaly_flag": deposit_anomaly,
        "deposit_advisory": deposit_advisory,
        "alert_status": alert_status,
        "whatsapp_sms_advisory": alert_message
    }
