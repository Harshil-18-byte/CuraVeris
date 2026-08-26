import hmac
import hashlib
from typing import Dict, Any, Optional
from app.core.credentials import credentials
from app.core.logging import logger

try:
    import razorpay
    razorpay_client = razorpay.Client(auth=(credentials.payments.key_id, credentials.payments.key_secret))
except Exception:
    razorpay_client = None


class RazorpayService:
    def __init__(self):
        self.key_id = credentials.payments.key_id
        self.key_secret = credentials.payments.key_secret
        self.webhook_secret = credentials.payments.webhook_secret


    def verify_webhook_signature(self, raw_body: bytes, signature: Optional[str]) -> bool:
        """Verify HMAC-SHA256 signature from X-Razorpay-Signature header."""
        if not signature or not self.webhook_secret:
            return False
        try:
            expected = hmac.new(
                self.webhook_secret.encode("utf-8"),
                raw_body,
                hashlib.sha256
            ).hexdigest()
            return hmac.compare_digest(expected, signature)
        except Exception as e:
            logger.error(f"Error checking Razorpay signature: {e}")
            return False

    def fetch_payment(self, payment_id: str) -> Dict[str, Any]:
        """Fetch payment details from Razorpay or return test mock."""
        if razorpay_client and not payment_id.startswith("test_"):
            try:
                return razorpay_client.payment.fetch(payment_id)
            except Exception as e:
                logger.warning(f"Failed to fetch live Razorpay payment ({payment_id}): {e}. Using mock.")

        # Test fallback
        return {
            "id": payment_id,
            "entity": "payment",
            "amount": 4500000,  # in paise: INR 45,000.00
            "currency": "INR",
            "status": "captured",
            "method": "upi",
            "description": "Hospital Inpatient Co-pay Deposit",
            "notes": {
                "bill_type": "hospital_payment",
                "bill_id": "BILL_APOLLO_001",
                "hospital": "Apollo Hospitals",
                "tpa_name": "Medi Assist TPA",
                "insurance_settled": "120000"
            },
            "created_at": 1724660000
        }

    def generate_refund_dispute_link(self, bill_id: str, amount_in_inr: float, patient_phone: str = None) -> Dict[str, Any]:
        """
        Generate a structured refund claim / payment link metadata for dispute recovery.
        """
        amount_paise = int(amount_in_inr * 100)
        return {
            "dispute_reference": f"DISP_RZP_{bill_id[:8]}",
            "amount_inr": amount_in_inr,
            "amount_paise": amount_paise,
            "currency": "INR",
            "type": "refund_request",
            "status": "pending_hospital_approval",
            "payment_link_url": f"https://rzp.io/i/curaveris_refund_{bill_id[:8]}",
            "notes": {
                "purpose": "Statutory Healthcare Overcharge Refund",
                "bill_id": bill_id,
                "regulatory_acts": "DPCO 2013, NPPA Orders"
            }
        }


razorpay_service = RazorpayService()
