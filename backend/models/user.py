"""User SQLAlchemy model."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import String, DateTime, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    phone: Mapped[str | None] = mapped_column(String(15), nullable=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    pan: Mapped[str | None] = mapped_column(String(10), unique=True, nullable=True)
    aadhaar: Mapped[str | None] = mapped_column(String(12), unique=True, nullable=True)
    date_of_birth: Mapped[str | None] = mapped_column(String(10), nullable=True)
    role: Mapped[str] = mapped_column(
        SAEnum("user", "ca", "admin", name="user_role"), default="user"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    filings = relationship("Filing", back_populates="user", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")
