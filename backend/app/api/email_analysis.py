from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import asyncio

from ..core.database import get_db
from ..models.email_analysis import EmailAnalysis
from ..services.email_analyzer import EmailAnalyzer

router = APIRouter()

class EmailAnalysisRequest(BaseModel):
    sender_email: EmailStr
    subject: str
    body: str
    user_id: Optional[int] = None

class EmailAnalysisResponse(BaseModel):
    id: int
    sender_email: str
    subject: str
    spam_score: float
    phishing_probability: float
    malicious_intent_score: float
    risk_level: str
    detected_keywords: dict
    detected_patterns: dict
    urgency_indicators: list
    credential_requests: bool
    extracted_urls: list
    analysis_duration: float

@router.post("/analyze", response_model=EmailAnalysisResponse)
async def analyze_email(
    request: EmailAnalysisRequest,
    db: Session = Depends(get_db)
):
    """
    Analyze an email for spam and phishing indicators
    """
    try:
        # Initialize analyzer
        analyzer = EmailAnalyzer()
        
        # Perform analysis
        analysis_result = analyzer.analyze_email(
            sender_email=request.sender_email,
            subject=request.subject,
            body=request.body
        )
        
        # Save to database
        db_analysis = EmailAnalysis(
            sender_email=request.sender_email,
            subject=request.subject,
            body=request.body,
            spam_score=analysis_result["spam_score"],
            phishing_probability=analysis_result["phishing_probability"],
            malicious_intent_score=analysis_result["malicious_intent_score"],
            risk_level=analysis_result["risk_level"],
            detected_keywords=analysis_result["detected_keywords"],
            detected_patterns=analysis_result["detected_patterns"],
            urgency_indicators=analysis_result["urgency_indicators"],
            credential_requests=analysis_result["credential_requests"],
            extracted_urls=analysis_result["extracted_urls"],
            analysis_duration=analysis_result["analysis_duration"],
            user_id=request.user_id
        )
        
        db.add(db_analysis)
        db.commit()
        db.refresh(db_analysis)
        
        return EmailAnalysisResponse(
            id=db_analysis.id,
            sender_email=db_analysis.sender_email,
            subject=db_analysis.subject,
            spam_score=db_analysis.spam_score,
            phishing_probability=db_analysis.phishing_probability,
            malicious_intent_score=db_analysis.malicious_intent_score,
            risk_level=db_analysis.risk_level,
            detected_keywords=db_analysis.detected_keywords,
            detected_patterns=db_analysis.detected_patterns,
            urgency_indicators=db_analysis.urgency_indicators,
            credential_requests=db_analysis.credential_requests,
            extracted_urls=db_analysis.extracted_urls,
            analysis_duration=db_analysis.analysis_duration
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.get("/analysis/{analysis_id}")
async def get_analysis(
    analysis_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific email analysis by ID
    """
    analysis = db.query(EmailAnalysis).filter(EmailAnalysis.id == analysis_id).first()
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    return {
        "id": analysis.id,
        "sender_email": analysis.sender_email,
        "subject": analysis.subject,
        "body": analysis.body,
        "spam_score": analysis.spam_score,
        "phishing_probability": analysis.phishing_probability,
        "malicious_intent_score": analysis.malicious_intent_score,
        "risk_level": analysis.risk_level,
        "detected_keywords": analysis.detected_keywords,
        "detected_patterns": analysis.detected_patterns,
        "urgency_indicators": analysis.urgency_indicators,
        "credential_requests": analysis.credential_requests,
        "extracted_urls": analysis.extracted_urls,
        "analyzed_at": analysis.analyzed_at.isoformat(),
        "analysis_duration": analysis.analysis_duration
    }

@router.get("/recent")
async def get_recent_analyses(
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """
    Get recent email analyses
    """
    analyses = db.query(EmailAnalysis)\
        .order_by(EmailAnalysis.analyzed_at.desc())\
        .limit(limit)\
        .all()
    
    return [{
        "id": a.id,
        "sender_email": a.sender_email,
        "subject": a.subject,
        "risk_level": a.risk_level,
        "spam_score": a.spam_score,
        "phishing_probability": a.phishing_probability,
        "analyzed_at": a.analyzed_at.isoformat()
    } for a in analyses]
