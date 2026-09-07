"""Application configuration loaded from environment variables.

All settings are read at import time.  Never access os.environ directly
elsewhere in the application — always use `get_settings()`.
"""

from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings sourced from environment variables / .env file."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application identity
    app_name: str = "Zoom Clone"
    environment: str = "development"
    debug: bool = False

    # Database
    database_url: str = "sqlite+aiosqlite:///./data/zoom_clone.db"

    # API
    api_prefix: str = "/api/v1"

    # CORS — stored as a raw string and parsed into a list
    cors_origins: str = "http://localhost:3000,http://localhost:5173"

    # Logging
    log_level: str = "INFO"

    # Server (used by startup scripts, not by uvicorn directly when deployed)
    host: str = "0.0.0.0"
    port: int = 8000

    # -----------------------------------------------------------------------
    # Derived / validated properties
    # -----------------------------------------------------------------------

    @field_validator("log_level")
    @classmethod
    def normalise_log_level(cls, v: str) -> str:
        return v.upper()

    @property
    def cors_origins_list(self) -> list[str]:
        """Split comma-separated CORS origins into a Python list."""
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def is_development(self) -> bool:
        return self.environment.lower() == "development"

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"


@lru_cache
def get_settings() -> Settings:
    """Return the cached application settings singleton."""
    return Settings()
