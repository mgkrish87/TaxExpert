"""Filing SQLAlchemy model."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import String, DateTime, Float, ForeignKey, JSON, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class Filing(Base):
    __tablename__ = "filings"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False, index=True
    )
    financial_year: Mapped[str] = mapped_column(String(9), nullable=False)  # e.g., "2025-2026"
    assessment_year: Mapped[str] = mapped_column(String(9), nullable=False)  # e.g., "2026-2027"
    itr_type: Mapped[str] = mapped_column(
        SAEnum("ITR-1", "ITR-2", "ITR-3", "ITR-4", name="itr_type"), default="ITR-1"
    )
    status: Mapped[str] = mapped_column(
        SAEnum("draft", "in_progress", "calculated", "submitted", "filed", name="filing_status"),
        default="draft",
    )
    regime: Mapped[str] = mapped_column(
        SAEnum("old", "new", name="tax_regime"), default="new"
    )

    # Wizard step data stored as JSON
    personal_info: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    income_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    deduction_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    tax_computation: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    # Calculated results
    total_income: Mapped[float] = mapped_column(Float, default=0.0)
    tax_payable: Mapped[float] = mapped_column(Float, default=0.0)
    tds_paid: Mapped[float] = mapped_column(Float, default=0.0)
    refund: Mapped[float] = mapped_column(Float, default=0.0)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    user = relationship("User", back_populates="filings")
