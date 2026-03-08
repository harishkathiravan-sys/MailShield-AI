from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import asyncio

from ..core.database import get_db
from ..models.email_analysis import EmailAnalysis
from ..services.email_analyzer import EmailAnalyzer
from ..services.email_source_parser import EmailSourceParser
from ..services.sandbox_analyzer import SandboxAnalyzer

router = APIRouter()

class EmailAnalysisRequest(BaseModel):
    sender_email: EmailStr
    subject: str
    body: str
    user_id: Optional[int] = None

class EmailSourceRequest(BaseModel):
    raw_email_source: str
    user_id: Optional[int] = None

class EmailSourceAnalysisResponse(BaseModel):
    success: bool
    sender: str
    subject: str
    date: str
    urls_found: List[str]
    url_count: int
    html_links: List[dict]
    masked_urls: List[dict]
    authentication: dict
    suspicious_patterns: List[str]
    email_analysis: Optional[dict] = None
    url_analyses: Optional[List[dict]] = None
    overall_risk_score: float
    overall_verdict: str
    recommendations: List[str]

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

@router.post("/analyze-source", response_model=EmailSourceAnalysisResponse)
async def analyze_email_source(
    request: EmailSourceRequest,
    db: Session = Depends(get_db)
):
    """
    Analyze raw email source (paste entire email including headers)
    Extracts hidden URLs from HTML links and performs comprehensive analysis
    """
    try:
        # Parse email source
        parser = EmailSourceParser()
        parsed = parser.parse_email_source(request.raw_email_source)
        
        if not parsed["success"]:
            raise HTTPException(status_code=400, detail=parsed.get("error", "Failed to parse email"))
        
        # Analyze email content
        analyzer = EmailAnalyzer()
        email_analysis = analyzer.analyze_email(
            sender_email=parsed["sender"],
            subject=parsed["subject"],
            body=parsed["body_text"]
        )
        
        # Analyze all extracted URLs (limit to first 10 for performance)
        url_analyses = []
        sandbox = SandboxAnalyzer(timeout=15)
        
        urls_to_analyze = parsed["urls_found"][:10]  # Limit to 10 URLs
        
        for url in urls_to_analyze:
            try:
                url_result = await sandbox.analyze_url(url)
                
                # Extract website review warnings
                website_review = url_result.get("website_review", {})
                warnings = []
                if website_review:
                    if website_review.get("ssl_issues"):
                        warnings.extend(website_review.get("ssl_issues", []))
                    if website_review.get("domain_issues"):
                        warnings.extend(website_review.get("domain_issues", []))
                    if website_review.get("content_issues"):
                        warnings.extend(website_review.get("content_issues", []))
                    if website_review.get("behavior_issues"):
                        warnings.extend(website_review.get("behavior_issues", []))
                
                # Add suspicious behaviors as warnings
                if url_result.get("suspicious_behaviors"):
                    warnings.extend(url_result.get("suspicious_behaviors", []))
                
                url_analyses.append({
                    "url": url,
                    "safety_score": url_result.get("safety_score", 0),
                    "verdict": url_result.get("verdict", "unknown"),
                    "domain_age_days": url_result.get("domain_age_days"),
                    "typosquatting": url_result.get("typosquatting_detection", {}),
                    "risk_score": website_review.get("overall_risk_score", 0),
                    "domain_reputation": {
                        "domain_age": url_result.get("domain_age_display", "Data Unavailable"),
                        "domain_age_days": url_result.get("domain_age_days"),
                        "registrar": url_result.get("domain_registrar", "Data Unavailable"),
                        "country": url_result.get("domain_country", "Data Unavailable"),
                        "creation_date": url_result.get("domain_creation_date", "Data Unavailable"),
                        "status": url_result.get("domain_status", "Unknown"),
                        "organization": url_result.get("domain_organization"),
                        "data_available": url_result.get("domain_data_available", False),
                        "reputation_status": url_result.get("domain_reputation", {}).get("reputation_status", "Unknown")
                    },
                    "ip_reputation": url_result.get("ip_reputation", {}),
                    "warnings": warnings,
                    "page_title": url_result.get("page_title", "N/A"),
                    "login_forms_detected": url_result.get("login_forms_detected", False),
                    "ssl_valid": url_result.get("ssl_valid", False),
                    "redirect_count": url_result.get("redirect_count", 0)
                })
            except Exception as e:
                url_analyses.append({
                    "url": url,
                    "safety_score": 0,
                    "verdict": "error",
                    "error": str(e),
                    "warnings": [f"Analysis failed: {str(e)}"]
                })
        
        # Calculate overall risk score
        overall_risk_score = 0.0
        
        # Email content risk (40% weight)
        email_risk = (
            email_analysis["spam_score"] * 0.3 +
            email_analysis["phishing_probability"] * 0.5 +
            email_analysis["malicious_intent_score"] * 0.2
        )
        overall_risk_score += email_risk * 40
        
        # URL risk (40% weight)
        if url_analyses:
            avg_url_risk = sum(1 - a.get("safety_score", 0) for a in url_analyses) / len(url_analyses)
            overall_risk_score += avg_url_risk * 40
        
        # Authentication risk (10% weight)
        if parsed["authentication"]["overall"] in ["failed", "unknown"]:
            overall_risk_score += 10
        
        # Masked URLs (10% weight)
        if len(parsed["masked_urls"]) > 0:
            overall_risk_score += 10
        
        overall_risk_score = min(100, overall_risk_score)
        
        # Determine verdict
        if overall_risk_score >= 75:
            verdict = "DANGEROUS"
        elif overall_risk_score >= 50:
            verdict = "HIGH_RISK"
        elif overall_risk_score >= 25:
            verdict = "SUSPICIOUS"
        else:
            verdict = "SAFE"
        
        # Generate recommendations
        recommendations = []
        
        if parsed["masked_urls"]:
            recommendations.append("⚠️ Email contains masked URLs where display text doesn't match actual link destination")
        
        if parsed["authentication"]["overall"] in ["failed", "unknown"]:
            recommendations.append("⚠️ Email failed authentication checks (SPF/DKIM/DMARC)")
        
        if email_analysis["phishing_probability"] > 0.7:
            recommendations.append("🚨 High phishing probability detected in email content")
        
        if len(parsed["urls_found"]) > 5:
            recommendations.append(f"⚠️ Email contains {len(parsed['urls_found'])} URLs - verify each before clicking")
        
        if any(a.get("verdict") in ["phishing", "malicious"] for a in url_analyses):
            recommendations.append("🚨 One or more URLs detected as malicious - DO NOT CLICK")
        
        if verdict == "DANGEROUS":
            recommendations.extend([
                "⛔ DO NOT click any links in this email",
                "⛔ DO NOT reply to this email",
                "✅ Report as phishing to your email provider",
                "✅ Delete this email immediately"
            ])
        elif verdict in ["HIGH_RISK", "SUSPICIOUS"]:
            recommendations.extend([
                "⚠️ Exercise extreme caution with this email",
                "⚠️ Verify sender through official channels before taking action",
                "⚠️ Do not enter credentials if prompted"
            ])
        
        return EmailSourceAnalysisResponse(
            success=True,
            sender=parsed["sender"],
            subject=parsed["subject"],
            date=parsed["date"],
            urls_found=parsed["urls_found"],
            url_count=parsed["url_count"],
            html_links=parsed["html_links"],
            masked_urls=parsed["masked_urls"],
            authentication=parsed["authentication"],
            suspicious_patterns=parsed["suspicious_patterns"],
            email_analysis=email_analysis,
            url_analyses=url_analyses,
            overall_risk_score=round(overall_risk_score, 2),
            overall_verdict=verdict,
            recommendations=recommendations
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
