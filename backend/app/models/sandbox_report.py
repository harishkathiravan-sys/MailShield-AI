from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON, Boolean, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..core.database import Base

class SandboxReport(Base):
    __tablename__ = "sandbox_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    email_analysis_id = Column(Integer, ForeignKey("email_analyses.id"))
    url = Column(String, index=True)
    
    # Overall Assessment
    safety_score = Column(Float)
    verdict = Column(String)  # safe, suspicious, phishing, malicious
    
    # SSL Certificate Analysis
    ssl_valid = Column(Boolean)
    ssl_issuer = Column(String, nullable=True)
    ssl_expiration = Column(DateTime, nullable=True)
    ssl_security_level = Column(String, nullable=True)
    
    # Domain Analysis
    domain_age_days = Column(Integer, nullable=True)
    domain_registrar = Column(String, nullable=True)
    domain_country = Column(String, nullable=True)
    domain_creation_date = Column(DateTime, nullable=True)
    
    # Redirect Analysis
    redirect_chain = Column(JSON)
    redirect_count = Column(Integer, default=0)
    final_url = Column(String, nullable=True)
    
    # Page Analysis
    page_title = Column(String, nullable=True)
    page_content_snippet = Column(Text, nullable=True)
    detected_scripts = Column(JSON)
    script_threats = Column(JSON)
    
    # Form Analysis
    login_forms_detected = Column(Boolean, default=False)
    form_fields = Column(JSON)
    form_actions = Column(JSON)
    
    # Cookie Analysis
    cookies_set = Column(JSON)
    tracking_cookies = Column(Integer, default=0)
    third_party_trackers = Column(JSON)
    
    # Behavioral Analysis
    auto_downloads = Column(Boolean, default=False)
    download_files = Column(JSON)
    external_requests = Column(JSON)
    suspicious_behaviors = Column(JSON)
    
    # Screenshots
    screenshot_path = Column(String, nullable=True)
    
    # Metadata
    analyzed_at = Column(DateTime(timezone=True), server_default=func.now())
    execution_time = Column(Float)
    error_message = Column(Text, nullable=True)
    
    # Relationships
    email_analysis = relationship("EmailAnalysis", back_populates="sandbox_reports")
