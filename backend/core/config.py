from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    mongodb_url: str = "mongodb://localhost:27017"
    db_name: str = "scamchecksa"
    secret_key: str = "change-me-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24
    anthropic_api_key: str = ""
    admin_username: str = "admin"
    admin_password: str = "admin123"
    admin_email: str = "marnichr@gmail.com"
    google_client_id: str = ""
    google_client_secret: str = ""
    frontend_url: str = "http://localhost:3000"
    backend_url: str = "http://localhost:8000"

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
