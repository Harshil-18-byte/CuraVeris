"""Room Tariff, ICU, and NABH Accreditation Multiplier Rules."""

from typing import Dict, Any


def audit_room_charge(
    room_type: str,
    days: float,
    charged_rate: float,
    is_nabh: bool = True,
    tier: int = 1
) -> Dict[str, Any]:
    # Benchmark standard tariffs for Tier-1/2/3
    tier_mult = 1.0 if tier == 1 else (0.80 if tier == 2 else 0.60)
    nabh_mult = 1.15 if is_nabh else 1.0

    if "icu" in room_type.lower():
        base_rate = 5400.0 * tier_mult * nabh_mult
    elif "private" in room_type.lower() or "deluxe" in room_type.lower():
        base_rate = 6300.0 * tier_mult * nabh_mult
    elif "twin" in room_type.lower() or "ordinary" in room_type.lower() or "special" in room_type.lower():
        base_rate = 3000.0 * tier_mult * nabh_mult
    else:
        base_rate = 1500.0 * tier_mult * nabh_mult

    benchmark_rate = round(base_rate, 2)
    # Allow 25% commercial variance before hard flag
    max_allowable = round(benchmark_rate * 1.25, 2)
    is_violation = charged_rate > max_allowable
    overcharge = max(0.0, (charged_rate - max_allowable) * days) if is_violation else 0.0

    return {
        "rule": "ROOM_TARIFF_BENCHMARK_CGHS_AIIMS",
        "charged_rate": charged_rate,
        "benchmark_rate": benchmark_rate,
        "max_allowable_rate": max_allowable,
        "days": days,
        "charged_total": round(charged_rate * days, 2),
        "allowed_total": round(max_allowable * days, 2),
        "overcharge_amount": round(overcharge, 2),
        "is_violation": is_violation
    }
