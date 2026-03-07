from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "MailShield AI"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str = "sqlite:///./mailshield.db"
    
    # Security
    SECRET_KEY: str = "dev-secret-key-change-in-production-09876543210"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # API Keys (Optional)
    VIRUSTOTAL_API_KEY: Optional[str] = None
    GOOGLE_SAFE_BROWSING_API_KEY: Optional[str] = None
    PHISHTANK_API_KEY: Optional[str] = None
    
    # Sandbox Configuration
    SANDBOX_TIMEOUT: int = 30
    MAX_REDIRECTS: int = 10
    SANDBOX_USER_AGENT: str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    
    # Analysis Configuration
    SPAM_THRESHOLD: float = 0.6
    PHISHING_THRESHOLD: float = 0.7
    DOMAIN_AGE_SUSPICIOUS_DAYS: int = 30
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
