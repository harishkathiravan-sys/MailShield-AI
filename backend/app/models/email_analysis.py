from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON, Boolean, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..core.database import Base

class EmailAnalysis(Base):
    __tablename__ = "email_analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    sender_email = Column(String, index=True)
    subject = Column(String)
    body = Column(Text)
    
    # Analysis Results
    spam_score = Column(Float)
    phishing_probability = Column(Float)
    malicious_intent_score = Column(Float)
    risk_level = Column(String)  # safe, suspicious, phishing, malicious
    
    # Detected Patterns
    detected_keywords = Column(JSON)
    detected_patterns = Column(JSON)
    urgency_indicators = Column(JSON)
    credential_requests = Column(Boolean, default=False)
    
    # URLs
    extracted_urls = Column(JSON)
    
    # Metadata
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    analyzed_at = Column(DateTime(timezone=True), server_default=func.now())
    analysis_duration = Column(Float)  # seconds
    
    # Relationships
    sandbox_reports = relationship("SandboxReport", back_populates="email_analysis")
