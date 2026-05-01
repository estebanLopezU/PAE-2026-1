from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "X-Road Interoperability Mapper"
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
    DATABASE_URL: str = "sqlite:///./xroad_colombia.db"
    
    # CORS
    CORS_ORIGINS: list = ["http://localhost:5173", "http://localhost:3000"]
    
    # Pagination
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings():
    return Settings()