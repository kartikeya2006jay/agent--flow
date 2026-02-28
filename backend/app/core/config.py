from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import List

class Settings(BaseSettings):
    # App
    PROJECT_NAME: str = "AgentFlow OS"
    API_V1_STR: str = "/api/v1"
    VERSION: str = "0.1.0"
    
    # Security
    SECRET_KEY: str = "dev-secret-key-change-in-prod"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Database
    DATABASE_URL: str = "sqlite:///./agentflow.db"
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # CORS
    CORS_ORIGINS: List[str] = ["*"]
    
    # Business logic
    AUTO_APPROVAL_AMOUNT_THRESHOLD: float = 1000.0
    
    # Config: allow extra env vars + case-insensitive matching
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",  # ← Critical: ignore unknown env vars like LOG_LEVEL
        case_sensitive=False  # ← Match LOG_LEVEL to log_level
    )

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
