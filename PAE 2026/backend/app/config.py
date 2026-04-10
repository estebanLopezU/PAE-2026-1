from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "X-Road Interoperability Mapper"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Auth
    AUTH_ENABLED: bool = False
    JWT_SECRET_KEY: str = "change-this-secret-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120

    # Demo users (move to DB/users service in next phase)
    ADMIN_EMAIL: str = "elopezu@unal.edu.co"
    ADMIN_PASSWORD: str = "BZTfne48"
    ANALYST_EMAIL: str = "analista@xroad.gov.co"
    ANALYST_PASSWORD: str = "Analista123*"
    
    # Database - Using SQLite for development
    DATABASE_URL: str = "sqlite:///./xroad_colombia.db"
    
    # CORS
    CORS_ORIGINS: list = ["http://localhost:5173", "http://localhost:3000"]
    
    # Pagination
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100
    
    class Config:
        env_file = ".env"


@lru_cache()
def get_settings():
    return Settings()