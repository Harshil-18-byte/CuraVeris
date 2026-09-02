"""
Quantitative Financial Risk Framework (FRM) Layer for CuraVeris.

Adapts Expected Loss (EL = PD × LGD × EAD), Liquidity Risk (LCR & Time-to-Insolvency),
Stress Testing (5 Adverse Scenarios), VaR / CVaR (10,000 Monte Carlo Simulations),
and Model Risk Management (SR 11-7 adapted) to healthcare billing and insurance settlements.
"""

DISCLAIMER_EL = (
    "Expected Loss is a quantitative estimate based on AI-predicted recovery probability "
    "and historical settlement rates. It is not a guaranteed outcome. Actual financial results "
    "depend on insurer, legal, and hospital decisions outside CuraVeris's control."
)

DISCLAIMER_VAR = (
    "VaR and CVaR are statistical measures of tail risk computed via Monte Carlo simulation. "
    "They represent probabilistic loss thresholds, not predictions of a specific outcome. "
    "Methodology follows standard quantitative risk management practice adapted for healthcare billing."
)

DISCLAIMER_MODEL_RISK = (
    "Model Risk Assessment follows principles adapted from regulatory Model Risk Management "
    "frameworks. It quantifies uncertainty in CuraVeris's own AI predictions and does not "
    "constitute a credit or insurance assessment."
)

DISCLAIMER_STRESS = (
    "Stress scenarios are hypothetical adverse conditions, not predictions. They are designed "
    "to reveal vulnerability, not to forecast specific events."
)

DISCLAIMER_LEGAL = (
    "All FRM outputs are analytical tools to support patient decision-making. They do not "
    "constitute financial advice, legal advice, or insurance guidance. Consult qualified "
    "professionals for formal financial, legal, or insurance decisions."
)

__all__ = [
    "DISCLAIMER_EL",
    "DISCLAIMER_VAR",
    "DISCLAIMER_MODEL_RISK",
    "DISCLAIMER_STRESS",
    "DISCLAIMER_LEGAL",
]
