from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "X-Road Interoperability Mapper"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
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