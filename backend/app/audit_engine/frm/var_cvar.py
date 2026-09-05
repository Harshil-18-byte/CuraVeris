"""
VaR / CVaR (Expected Shortfall) via Monte Carlo Simulation

Extends the ML Monte Carlo engine to 10,000 samples
and simulates financial recovery, insurance, and charge distributions.
"""

import numpy as np
from dataclasses import dataclass
from typing import Dict, Any, List


@dataclass
class VaRInputs:
    ead: float
    pd_mean: float
    pd_uncertainty_lower: float
    pd_uncertainty_upper: float
    recovery_rate_mean: float
    expected_insurance_amount: float
    insurance_coverage_claimed: float
    n_samples: int = 10000
    random_seed: int = 42


@dataclass
class VaRResult:
    el_mean: float
    el_std: float
    var_90: float
    var_95: float
    var_99: float
    cvar_95: float
    cvar_99: float
    el_distribution_summary: Dict[str, Any]
    plain_english_var95: str
    plain_english_cvar95: str


def compute_var_cvar(inputs: VaRInputs) -> VaRResult:
    rng = np.random.default_rng(inputs.random_seed)
    
    # 1. Simulate PD uncertainty using Beta distribution
    pd_std = (float(inputs.pd_uncertainty_upper) - float(inputs.pd_uncertainty_lower)) / 4.0
    pd_mean = float(inputs.pd_mean)
    
    if pd_std > 0 and 0.0 < pd_mean < 1.0:
        max_possible_var = pd_mean * (1.0 - pd_mean) * 0.95
        var = min(pd_std ** 2, max_possible_var)
        var = max(var, 1e-6)
        factor = (pd_mean * (1.0 - pd_mean) / var) - 1.0
        alpha = max(0.1, pd_mean * factor)
        beta_param = max(0.1, (1.0 - pd_mean) * factor)
        pd_samples = rng.beta(alpha, beta_param, inputs.n_samples)
    else:
        pd_samples = np.full(inputs.n_samples, pd_mean)
    pd_samples = np.clip(pd_samples, 0.0, 1.0)
    
    # 2. Simulate recovery rate using Beta(2, 3) — skewed toward lower recovery
    recovery_samples = rng.beta(2, 3, inputs.n_samples)
    recovery_samples = np.clip(recovery_samples, 0.0, 0.95)
    
    # 3. Simulate insurance reimbursement uncertainty
    claimed = float(inputs.insurance_coverage_claimed)
    expected_ins = float(inputs.expected_insurance_amount)
    ins_std = 0.20 * claimed
    
    if ins_std > 0:
        ins_samples = rng.normal(expected_ins, ins_std, inputs.n_samples)
    else:
        ins_samples = np.full(inputs.n_samples, expected_ins)
    ins_samples = np.clip(ins_samples, 0.0, max(0.0, claimed))
    
    # 4. Simulate additional disputed charges (Poisson-distributed)
    ead = float(inputs.ead)
    additional_samples = rng.poisson(lam=0.15, size=inputs.n_samples).astype(float) * (0.10 * ead)
    
    # 5. Compute EL for each sample
    lgd_samples = 1.0 - recovery_samples
    ead_samples = ead + additional_samples - ins_samples
    ead_samples = np.maximum(ead_samples, 0.0)
    el_samples = pd_samples * lgd_samples * ead_samples
    
    # 6. VaR and CVaR calculations
    var_90 = float(np.percentile(el_samples, 90))
    var_95 = float(np.percentile(el_samples, 95))
    var_99 = float(np.percentile(el_samples, 99))
    
    tail_95 = el_samples[el_samples >= var_95]
    cvar_95 = float(np.mean(tail_95)) if len(tail_95) > 0 else var_95
    
    tail_99 = el_samples[el_samples >= var_99]
    cvar_99 = float(np.mean(tail_99)) if len(tail_99) > 0 else var_99
    
    # 7. Distribution summary for charts
    percentiles = [10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99]
    distribution_summary = {
        'percentiles': {str(p): round(float(np.percentile(el_samples, p)), 2) for p in percentiles},
        'histogram': _compute_histogram(el_samples, bins=20),
        'mean': round(float(np.mean(el_samples)), 2),
        'median': round(float(np.median(el_samples)), 2),
        'std': round(float(np.std(el_samples)), 2),
        'min': round(float(np.min(el_samples)), 2),
        'max': round(float(np.max(el_samples)), 2),
    }
    
    plain_var95 = (
        f"In the worst 5% of scenarios, your financial loss from this bill "
        f"would be ₹{var_95:,.0f} or more."
    )
    plain_cvar95 = (
        f"In those worst 5% of scenarios, your average loss would be ₹{cvar_95:,.0f}. "
        f"This is your Expected Shortfall — the risk you cannot diversify away."
    )
    
    return VaRResult(
        el_mean=round(float(np.mean(el_samples)), 2),
        el_std=round(float(np.std(el_samples)), 2),
        var_90=round(var_90, 2),
        var_95=round(var_95, 2),
        var_99=round(var_99, 2),
        cvar_95=round(cvar_95, 2),
        cvar_99=round(cvar_99, 2),
        el_distribution_summary=distribution_summary,
        plain_english_var95=plain_var95,
        plain_english_cvar95=plain_cvar95,
    )


def _compute_histogram(data: np.ndarray, bins: int) -> List[Dict[str, Any]]:
    counts, edges = np.histogram(data, bins=bins)
    total_count = len(data) if len(data) > 0 else 1
    return [
        {
            'bin_start': round(float(edges[i]), 2),
            'bin_end': round(float(edges[i + 1]), 2),
            'count': int(counts[i]),
            'frequency': round(float(counts[i] / total_count), 4),
        }
        for i in range(len(counts))
    ]


class VaRCVaREngine:
    """Wrapper class providing object-oriented and static access to VaR / CVaR Monte Carlo engine."""

    @staticmethod
    def compute(inputs: VaRInputs) -> VaRResult:
        return compute_var_cvar(inputs)

    @staticmethod
    def compute_var_cvar(inputs: VaRInputs) -> VaRResult:
        return compute_var_cvar(inputs)

