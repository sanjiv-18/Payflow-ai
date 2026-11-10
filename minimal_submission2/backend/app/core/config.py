from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables or .env file."""

    DATABASE_URL: str = "sqlite:///./payflow.db"
    SECRET_KEY: str = "dev-secret-key-change-in-production-32-chars!!"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days

    AI_PROVIDER: str = "gemini"
    GEMINI_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None

    PAYPAL_CLIENT_ID: Optional[str] = None
    PAYPAL_CLIENT_SECRET: Optional[str] = None
    PAYPAL_BASE_URL: str = "https://api-m.sandbox.paypal.com"

    FRONTEND_URL: str = "http://localhost:5173"
    BACKEND_URL: str = "http://localhost:8000"
    DEMO_MODE: bool = True

    # Configurable Subscription Tier Ingestion & Seat Limits
    LIMIT_FREE_INVOICES: int = 10
    LIMIT_FREE_SEATS: int = 1
    LIMIT_STARTER_INVOICES: int = 60
    LIMIT_STARTER_SEATS: int = 2
    LIMIT_PRO_INVOICES: int = 300
    LIMIT_PRO_SEATS: int = 5
    LIMIT_BUSINESS_INVOICES: int = 999999
    LIMIT_BUSINESS_SEATS: int = 999

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
