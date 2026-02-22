"""Filing API routes — CRUD + tax calculation."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.user import User
from models.filing import Filing
from schemas.filing import (
    FilingCreate, FilingUpdate, FilingResponse,
    TaxComparisonResponse, IncomeData, DeductionData,
)
from services.tax_engine import compare_regimes, generate_optimization_suggestions
from utils.security import get_current_user

router = APIRouter(prefix="/api/filings", tags=["Filings"])


@router.post("/", response_model=FilingResponse, status_code=status.HTTP_201_CREATED)
async def create_filing(
    data: FilingCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new tax filing."""
    filing = Filing(
        user_id=current_user.id,
        financial_year=data.financial_year,
        assessment_year=data.assessment_year,
        itr_type=data.itr_type,
        regime=data.regime,
    )
    db.add(filing)
    await db.flush()
    await db.refresh(filing)
    return FilingResponse.model_validate(filing)


@router.get("/", response_model=list[FilingResponse])
async def list_filings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all filings for the current user."""
    result = await db.execute(
        select(Filing)
        .where(Filing.user_id == current_user.id)
        .order_by(Filing.created_at.desc())
    )
    return [FilingResponse.model_validate(f) for f in result.scalars().all()]


@router.get("/{filing_id}", response_model=FilingResponse)
async def get_filing(
    filing_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific filing by ID."""
    result = await db.execute(
        select(Filing).where(Filing.id == filing_id, Filing.user_id == current_user.id)
    )
    filing = result.scalar_one_or_none()
    if not filing:
        raise HTTPException(status_code=404, detail="Filing not found")
    return FilingResponse.model_validate(filing)


@router.put("/{filing_id}", response_model=FilingResponse)
async def update_filing(
    filing_id: str,
    data: FilingUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update filing data (used by the wizard to save each step)."""
    result = await db.execute(
        select(Filing).where(Filing.id == filing_id, Filing.user_id == current_user.id)
    )
    filing = result.scalar_one_or_none()
    if not filing:
        raise HTTPException(status_code=404, detail="Filing not found")

    update_fields = data.model_dump(exclude_unset=True)
    for field, value in update_fields.items():
        if value is not None:
            if hasattr(value, "model_dump"):
                setattr(filing, field, value.model_dump())
            else:
                setattr(filing, field, value)

    if data.status:
        filing.status = data.status

    db.add(filing)
    await db.flush()
    await db.refresh(filing)
    return FilingResponse.model_validate(filing)


@router.post("/{filing_id}/calculate", response_model=TaxComparisonResponse)
async def calculate_tax(
    filing_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Run the tax engine on a filing — returns old vs new regime comparison."""
    result = await db.execute(
        select(Filing).where(Filing.id == filing_id, Filing.user_id == current_user.id)
    )
    filing = result.scalar_one_or_none()
    if not filing:
        raise HTTPException(status_code=404, detail="Filing not found")

    income_data = filing.income_data or {}
    deduction_data = filing.deduction_data or {}
    tds_paid = filing.tds_paid or 0

    comparison = compare_regimes(income_data, deduction_data, tds_paid)

    # Save computation result
    filing.tax_computation = comparison
    chosen = comparison[f"{filing.regime}_regime"]
    filing.total_income = chosen["gross_total_income"]
    filing.tax_payable = chosen["total_tax"]
    filing.refund = max(0, chosen["refund_or_due"])
    filing.status = "calculated"

    db.add(filing)
    await db.flush()
    await db.refresh(filing)

    return TaxComparisonResponse(**comparison)


@router.get("/{filing_id}/suggestions")
async def get_suggestions(
    filing_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get tax optimization suggestions for a filing."""
    result = await db.execute(
        select(Filing).where(Filing.id == filing_id, Filing.user_id == current_user.id)
    )
    filing = result.scalar_one_or_none()
    if not filing:
        raise HTTPException(status_code=404, detail="Filing not found")

    income_data = filing.income_data or {}
    deduction_data = filing.deduction_data or {}

    return generate_optimization_suggestions(income_data, deduction_data)
