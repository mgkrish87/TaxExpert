"""Pydantic schemas for User-related requests and responses."""

from datetime import datetime
from pydantic import BaseModel, EmailStr


class UserRegister(BaseModel):
    email: str
    password: str
    full_name: str
    phone: str | None = None


class UserLogin(BaseModel):
    email: str
    password: str


class UserUpdate(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    pan: str | None = None
    aadhaar: str | None = None
    date_of_birth: str | None = None


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    phone: str | None
    pan: str | None
    aadhaar: str | None
    date_of_birth: str | None
    role: str
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
