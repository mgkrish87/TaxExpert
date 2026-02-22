"""Application configuration using pydantic-settings."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "TaxExpert AI"
    DEBUG: bool = True

    # Database (SQLite for dev, set env var for PostgreSQL in production)
    DATABASE_URL: str = "sqlite+aiosqlite:///./taxexpert.db"

    # CORS
    CORS_ORIGINS: str = ""

    # JWT
    SECRET_KEY: str = "taxexpert-dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # File uploads
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10 MB

    class Config:
        env_file = ".env"


settings = Settings()
