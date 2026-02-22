"""Pydantic schemas for Filing-related requests and responses."""

from datetime import datetime
from pydantic import BaseModel


class IncomeData(BaseModel):
    salary: float = 0
    house_property: float = 0
    capital_gains_short: float = 0
    capital_gains_long: float = 0
    business_income: float = 0
    other_income: float = 0
    exempt_income: float = 0


class DeductionData(BaseModel):
    section_80c: float = 0         # Max 1,50,000
    section_80ccd_1b: float = 0    # Max 50,000 (NPS)
    section_80d: float = 0         # Health insurance
    section_80g: float = 0         # Donations
    hra_exemption: float = 0
    home_loan_interest: float = 0  # Section 24
    education_loan_interest: float = 0  # Section 80E
    standard_deduction: float = 75000  # FY 2025-26


class PersonalInfo(BaseModel):
    full_name: str = ""
    pan: str = ""
    date_of_birth: str = ""
    gender: str = ""
    residential_status: str = "resident"
    employer_name: str = ""
    employer_tan: str = ""


class FilingCreate(BaseModel):
    financial_year: str = "2025-2026"
    assessment_year: str = "2026-2027"
    itr_type: str = "ITR-1"
    regime: str = "new"


class FilingUpdate(BaseModel):
    personal_info: PersonalInfo | None = None
    income_data: IncomeData | None = None
    deduction_data: DeductionData | None = None
    regime: str | None = None
    tds_paid: float | None = None
    status: str | None = None


class TaxComputationResult(BaseModel):
    regime: str
    gross_total_income: float
    total_deductions: float
    taxable_income: float
    tax_on_income: float
    surcharge: float
    cess: float
    total_tax: float
    tds_paid: float
    refund_or_due: float  # positive = refund, negative = due


class TaxComparisonResponse(BaseModel):
    old_regime: TaxComputationResult
    new_regime: TaxComputationResult
    recommended: str
    savings: float


class FilingResponse(BaseModel):
    id: str
    user_id: str
    financial_year: str
    assessment_year: str
    itr_type: str
    status: str
    regime: str
    personal_info: dict | None
    income_data: dict | None
    deduction_data: dict | None
    tax_computation: dict | None
    total_income: float
    tax_payable: float
    tds_paid: float
    refund: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
