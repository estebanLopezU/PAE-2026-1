from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "GOVStake 360 API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Auth
    AUTH_ENABLED: bool = True
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 10080
    RATE_LIMIT_PER_MINUTE: int = 120

    # Demo users (move to DB/users service in next phase)
    ADMIN_EMAIL: str
    ADMIN_PASSWORD: str
    ANALYST_EMAIL: str
    ANALYST_PASSWORD: str

    # Database
    DATABASE_URL: str = "sqlite:///./govstake360.db"

    # OpenRouter (AgentGD IA)
    OPENROUTER_API_KEY: str = ""
    OPENROUTER_MODEL: str = "google/gemma-4-31b-it:free"
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"
    OSR_REFERER: str = "http://localhost:3002"

    # CORS
    CORS_ORIGINS: list = ["http://localhost:3002", "http://localhost:3000", "http://localhost:5173"]

    # Pagination
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings():
    return Settings()