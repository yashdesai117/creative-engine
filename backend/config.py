from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""

    # LLM
    ANTHROPIC_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    DEFAULT_LLM_PROVIDER: str = "anthropic"
    DEFAULT_MODEL: str = "claude-3-5-sonnet-20241022"

    # ShopDeck internal
    SHOPDECK_API_URL: str = ""
    SHOPDECK_API_KEY: str = ""

    # App
    APP_ENV: str = "development"
    ALLOWED_ORIGINS: str = "http://localhost:3000"
    MARGIN_FLOOR_DEFAULT: float = 15.0
    OPTIONS_PER_TEMPLATE: int = 6

    # Sentry
    SENTRY_DSN: Optional[str] = None

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
