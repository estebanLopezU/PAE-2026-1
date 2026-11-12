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
    OPENROUTER_MODEL: str = "nvidia/nemotron-3.5-lightning:free"
    OPENROUTER_VISION_MODEL: str = "nvidia/nemotron-3.5-super-vl:free"
    OPENROUTER_FALLBACK_MODELS: str = (
        "google/gemma-4-31b-it:free,nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free"
    )
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"
    OSR_REFERER: str = "http://localhost:3002"

    # AgentGD: limites del agente. Dos llamadas por pregunta mantienen el
    # consumo dentro del cupo gratuito de OpenRouter.
    AGENTGD_TOOLS: bool = True
    AGENTGD_IMAGES: bool = True
    AGENTGD_MAX_CALLS: int = 2
    AGENTGD_MAX_TOKENS: int = 900
    AGENTGD_MAX_HISTORY: int = 8
    AGENTGD_REQUESTS_PER_MINUTE: int = 6

    # Sincronización de entidades públicas desde el backend de interoperabilidad
    INTEROP_API_URL: str = "http://localhost:8000/api/v1"
    INTEROP_SYNC_EMAIL: str = ""
    INTEROP_SYNC_PASSWORD: str = ""
    INTEROP_TIMEOUT_SECONDS: int = 30

    # CORS
    CORS_ORIGINS: list = ["http://localhost:3002", "http://localhost:3000", "http://localhost:5173"]

    # Pagination
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    @property
    def interop_sync_credentials(self) -> tuple[str, str]:
        """Credenciales para leer el catalogo de interoperabilidad.

        Permite configurar una cuenta de servicio dedicada con
        INTEROP_SYNC_EMAIL / INTEROP_SYNC_PASSWORD. Si no se definen, se
        recurren a las credenciales de administrador de esta plataforma, que
        por defecto es la misma cuenta en ambos microservicios, para que la
        sincronizacion de entidades publicas funcione sin configuracion
        adicional en cada entorno.
        """
        email = (self.INTEROP_SYNC_EMAIL or self.ADMIN_EMAIL).strip().lower()
        password = self.INTEROP_SYNC_PASSWORD or self.ADMIN_PASSWORD
        return email, password


@lru_cache()
def get_settings():
    return Settings()