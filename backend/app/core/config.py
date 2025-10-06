from pathlib import Path
from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict

# Resolve to backend project root so env_file can be located reliably
BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    """Application configuration sourced from environment variables."""

    finnhub_api_key: str = Field(
        ...,
        validation_alias=AliasChoices("FINNHUB_API_KEY", "finnhub_api_key"),
    )
    sentiment_model_name: str = Field(
        "yiyanghkust/finbert-tone",
        alias="SENTIMENT_MODEL_NAME",
    )

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
        populate_by_name=True,
    )


settings = Settings()
