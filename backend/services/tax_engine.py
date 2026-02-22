"""Indian Income Tax Calculation Engine — FY 2025-26 / AY 2026-27.

Supports both Old and New tax regimes with:
- Slab-based tax calculation
- Standard deduction
- Section 80C/80CCD(1B)/80D/80G/80E/24 deductions (old regime)
- HRA exemption (old regime)
- Surcharge and Health & Education Cess
"""


def _calculate_old_regime_tax(taxable_income: float) -> float:
    """Old regime slabs for FY 2025-26 (individuals < 60 years)."""
    slabs = [
        (250000, 0.00),
        (500000, 0.05),
        (1000000, 0.20),
        (float("inf"), 0.30),
    ]
    tax = 0.0
    prev = 0
    for limit, rate in slabs:
        if taxable_income <= prev:
            break
        slab_income = min(taxable_income, limit) - prev
        tax += slab_income * rate
        prev = limit

    # Section 87A rebate — old regime for income up to 5,00,000
    if taxable_income <= 500000:
        tax = max(0, tax - 12500)

    return tax


def _calculate_new_regime_tax(taxable_income: float) -> float:
    """New regime slabs for FY 2025-26 (Budget 2025 updated)."""
    slabs = [
        (400000, 0.00),
        (800000, 0.05),
        (1200000, 0.10),
        (1600000, 0.15),
        (2000000, 0.20),
        (2400000, 0.25),
        (float("inf"), 0.30),
    ]
    tax = 0.0
    prev = 0
    for limit, rate in slabs:
        if taxable_income <= prev:
            break
        slab_income = min(taxable_income, limit) - prev
        tax += slab_income * rate
        prev = limit

    # Section 87A rebate — new regime for income up to 12,00,000
    if taxable_income <= 1200000:
        tax = max(0, tax - 60000)

    return tax


def _calculate_surcharge(tax: float, taxable_income: float) -> float:
    """Surcharge on income tax."""
    if taxable_income <= 5000000:
        return 0
    elif taxable_income <= 10000000:
        return tax * 0.10
    elif taxable_income <= 20000000:
        return tax * 0.15
    elif taxable_income <= 50000000:
        return tax * 0.25
    else:
        return tax * 0.37


def _calculate_cess(tax_with_surcharge: float) -> float:
    """Health & Education Cess = 4%."""
    return tax_with_surcharge * 0.04


def compute_old_regime(income_data: dict, deduction_data: dict, tds_paid: float = 0) -> dict:
    """Full tax computation under the Old Regime."""
    # Gross Total Income
    salary = income_data.get("salary", 0)
    house_property = income_data.get("house_property", 0)
    cg_short = income_data.get("capital_gains_short", 0)
    cg_long = income_data.get("capital_gains_long", 0)
    business = income_data.get("business_income", 0)
    other = income_data.get("other_income", 0)

    gross_total_income = salary + house_property + cg_short + cg_long + business + other

    # Deductions under Old Regime
    std_deduction = min(deduction_data.get("standard_deduction", 75000), 75000)
    sec_80c = min(deduction_data.get("section_80c", 0), 150000)
    sec_80ccd_1b = min(deduction_data.get("section_80ccd_1b", 0), 50000)
    sec_80d = deduction_data.get("section_80d", 0)
    sec_80g = deduction_data.get("section_80g", 0)
    hra = deduction_data.get("hra_exemption", 0)
    home_loan = min(deduction_data.get("home_loan_interest", 0), 200000)
    edu_loan = deduction_data.get("education_loan_interest", 0)

    total_deductions = std_deduction + sec_80c + sec_80ccd_1b + sec_80d + sec_80g + hra + home_loan + edu_loan

    taxable_income = max(0, gross_total_income - total_deductions)

    tax = _calculate_old_regime_tax(taxable_income)
    surcharge = _calculate_surcharge(tax, taxable_income)
    cess = _calculate_cess(tax + surcharge)
    total_tax = round(tax + surcharge + cess, 2)
    refund_or_due = round(tds_paid - total_tax, 2)

    return {
        "regime": "old",
        "gross_total_income": gross_total_income,
        "total_deductions": total_deductions,
        "taxable_income": taxable_income,
        "tax_on_income": round(tax, 2),
        "surcharge": round(surcharge, 2),
        "cess": round(cess, 2),
        "total_tax": total_tax,
        "tds_paid": tds_paid,
        "refund_or_due": refund_or_due,
    }


def compute_new_regime(income_data: dict, deduction_data: dict, tds_paid: float = 0) -> dict:
    """Full tax computation under the New Regime."""
    salary = income_data.get("salary", 0)
    house_property = income_data.get("house_property", 0)
    cg_short = income_data.get("capital_gains_short", 0)
    cg_long = income_data.get("capital_gains_long", 0)
    business = income_data.get("business_income", 0)
    other = income_data.get("other_income", 0)

    gross_total_income = salary + house_property + cg_short + cg_long + business + other

    # New regime: only standard deduction allowed
    std_deduction = min(deduction_data.get("standard_deduction", 75000), 75000)
    total_deductions = std_deduction

    taxable_income = max(0, gross_total_income - total_deductions)

    tax = _calculate_new_regime_tax(taxable_income)
    surcharge = _calculate_surcharge(tax, taxable_income)
    cess = _calculate_cess(tax + surcharge)
    total_tax = round(tax + surcharge + cess, 2)
    refund_or_due = round(tds_paid - total_tax, 2)

    return {
        "regime": "new",
        "gross_total_income": gross_total_income,
        "total_deductions": total_deductions,
        "taxable_income": taxable_income,
        "tax_on_income": round(tax, 2),
        "surcharge": round(surcharge, 2),
        "cess": round(cess, 2),
        "total_tax": total_tax,
        "tds_paid": tds_paid,
        "refund_or_due": refund_or_due,
    }


def compare_regimes(income_data: dict, deduction_data: dict, tds_paid: float = 0) -> dict:
    """Compare both regimes and recommend the optimal one."""
    old = compute_old_regime(income_data, deduction_data, tds_paid)
    new = compute_new_regime(income_data, deduction_data, tds_paid)

    if old["total_tax"] <= new["total_tax"]:
        recommended = "old"
        savings = round(new["total_tax"] - old["total_tax"], 2)
    else:
        recommended = "new"
        savings = round(old["total_tax"] - new["total_tax"], 2)

    return {
        "old_regime": old,
        "new_regime": new,
        "recommended": recommended,
        "savings": savings,
    }


def generate_optimization_suggestions(income_data: dict, deduction_data: dict) -> list[dict]:
    """Generate AI-style tax optimization suggestions (rule-based for MVP)."""
    suggestions = []

    sec_80c = deduction_data.get("section_80c", 0)
    if sec_80c < 150000:
        remaining = 150000 - sec_80c
        suggestions.append({
            "category": "Section 80C",
            "title": f"Invest ₹{remaining:,.0f} more under Section 80C",
            "description": "Maximize your 80C deduction with ELSS, PPF, or life insurance premium.",
            "potential_saving": round(remaining * 0.30 * 1.04, 2),
            "priority": "high",
        })

    sec_80ccd = deduction_data.get("section_80ccd_1b", 0)
    if sec_80ccd < 50000:
        remaining = 50000 - sec_80ccd
        suggestions.append({
            "category": "Section 80CCD(1B)",
            "title": f"Invest ₹{remaining:,.0f} in NPS",
            "description": "Additional NPS contribution beyond 80C limit for extra deduction.",
            "potential_saving": round(remaining * 0.30 * 1.04, 2),
            "priority": "medium",
        })

    sec_80d = deduction_data.get("section_80d", 0)
    if sec_80d < 25000:
        remaining = 25000 - sec_80d
        suggestions.append({
            "category": "Section 80D",
            "title": "Get health insurance coverage",
            "description": f"Claim up to ₹{remaining:,.0f} more for health insurance premiums.",
            "potential_saving": round(remaining * 0.30 * 1.04, 2),
            "priority": "medium",
        })

    home_loan = deduction_data.get("home_loan_interest", 0)
    if home_loan == 0 and income_data.get("salary", 0) > 1000000:
        suggestions.append({
            "category": "Home Loan Interest",
            "title": "Consider home loan for tax benefit",
            "description": "Section 24 allows up to ₹2,00,000 deduction on home loan interest.",
            "potential_saving": round(200000 * 0.30 * 1.04, 2),
            "priority": "low",
        })

    salary = income_data.get("salary", 0)
    if salary > 1500000:
        suggestions.append({
            "category": "Regime Comparison",
            "title": "Compare Old vs New tax regime carefully",
            "description": "High-income earners should model both regimes. Old regime benefits from heavy deductions.",
            "potential_saving": 0,
            "priority": "high",
        })

    if not suggestions:
        suggestions.append({
            "category": "Optimized",
            "title": "Your tax planning looks optimized!",
            "description": "You are utilizing most available deductions. Keep up the good work.",
            "potential_saving": 0,
            "priority": "low",
        })

    return suggestions
