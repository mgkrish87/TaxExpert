"""Pydantic schemas for Document-related requests and responses."""

from datetime import datetime
from pydantic import BaseModel


class DocumentResponse(BaseModel):
    id: str
    user_id: str
    doc_type: str
    filename: str
    file_size: int | None
    mime_type: str | None
    parsed_data: dict | None
    uploaded_at: datetime

    class Config:
        from_attributes = True
