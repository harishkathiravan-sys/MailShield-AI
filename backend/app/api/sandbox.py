from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from pydantic import BaseModel, HttpUrl
from typing import Optional, List
from datetime import datetime
import asyncio

from ..core.database import get_db
from ..models.sandbox_report import SandboxReport
from ..models.email_analysis import EmailAnalysis
from ..services.sandbox_analyzer import SandboxAnalyzer

router = APIRouter()

def parse_datetime(date_string):
    """Parse ISO format datetime string to datetime object"""
    if not date_string:
        return None
    try:
        return datetime.fromisoformat(date_string.replace('Z', '+00:00'))
    except (ValueError, AttributeError):
        return None

class SandboxAnalysisRequest(BaseModel):
    url: str
    email_analysis_id: Optional[int] = None

class BatchSandboxAnalysisRequest(BaseModel):
    urls: List[str]
    email_analysis_id: Optional[int] = None

class SandboxAnalysisResponse(BaseModel):
    id: int
    url: str
    safety_score: float
    verdict: str
    ssl_valid: bool
    domain_age_days: Optional[int]
    redirect_count: int
    login_forms_detected: bool
    execution_time: float

@router.post("/analyze", response_model=SandboxAnalysisResponse)
async def analyze_url_in_sandbox(
    request: SandboxAnalysisRequest,
    db: Session = Depends(get_db)
):
    """
    Analyze a URL in the sandbox environment
    """
    try:
        # Initialize sandbox analyzer
        analyzer = SandboxAnalyzer(timeout=30)
        
        # Perform sandbox analysis
        result = await analyzer.analyze_url(request.url)
        
        # Save to database
        db_report = SandboxReport(
            email_analysis_id=request.email_analysis_id,
            url=result["url"],
            safety_score=result["safety_score"],
            verdict=result["verdict"],
            ssl_valid=result.get("ssl_valid", False),
            ssl_issuer=result.get("ssl_issuer"),
            ssl_expiration=parse_datetime(result.get("ssl_expiration")),
            ssl_security_level=result.get("ssl_security_level"),
            domain_age_days=result.get("domain_age_days"),
            domain_registrar=result.get("domain_registrar"),
            domain_country=result.get("domain_country"),
            domain_creation_date=parse_datetime(result.get("domain_creation_date")),
            redirect_chain=result.get("redirect_chain", []),
            redirect_count=result.get("redirect_count", 0),
            final_url=result.get("final_url"),
            page_title=result.get("page_title"),
            page_content_snippet=result.get("page_content_snippet"),
            detected_scripts=result.get("detected_scripts", []),
            script_threats=result.get("script_threats", []),
            login_forms_detected=result.get("login_forms_detected", False),
            form_fields=result.get("form_fields", []),
            form_actions=result.get("form_actions", []),
            cookies_set=result.get("cookies_set", []),
            tracking_cookies=result.get("tracking_cookies", 0),
            total_cookies=result.get("total_cookies", 0),
            advertising_cookies=result.get("advertising_cookies", 0),
            analytics_cookies=result.get("analytics_cookies", 0),
            functional_cookies=result.get("functional_cookies", 0),
            session_cookies=result.get("session_cookies", 0),
            persistent_cookies=result.get("persistent_cookies", 0),
            third_party_cookies=result.get("third_party_cookies", 0),
            tracking_cookie_details=result.get("tracking_cookie_details", []),
            advertising_cookie_details=result.get("advertising_cookie_details", []),
            analytics_cookie_details=result.get("analytics_cookie_details", []),
            third_party_trackers=result.get("third_party_trackers", []),
            analytics_services=result.get("analytics_services", []),
            ad_networks=result.get("ad_networks", []),
            social_trackers=result.get("social_trackers", []),
            page_metadata=result.get("page_metadata", {}),
            auto_downloads=result.get("auto_downloads", False),
            download_files=result.get("download_files", []),
            external_requests=result.get("external_requests", []),
            suspicious_behaviors=result.get("suspicious_behaviors", []),
            screenshot_path=result.get("screenshot_path"),
            execution_time=result["execution_time"],
            error_message=result.get("error_message")
        )
        
        db.add(db_report)
        db.commit()
        db.refresh(db_report)
        
        return SandboxAnalysisResponse(
            id=db_report.id,
            url=db_report.url,
            safety_score=db_report.safety_score,
            verdict=db_report.verdict,
            ssl_valid=db_report.ssl_valid,
            domain_age_days=db_report.domain_age_days,
            redirect_count=db_report.redirect_count,
            login_forms_detected=db_report.login_forms_detected,
            execution_time=db_report.execution_time
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sandbox analysis failed: {str(e)}")

@router.get("/report/{report_id}")
async def get_sandbox_report(
    report_id: int,
    db: Session = Depends(get_db)
):
    """
    Get detailed sandbox report by ID
    """
    report = db.query(SandboxReport).filter(SandboxReport.id == report_id).first()
    
    if not report:
        raise HTTPException(status_code=404, detail="Sandbox report not found")
    
    return {
        "id": report.id,
        "url": report.url,
        "safety_score": report.safety_score,
        "verdict": report.verdict,
        
        # SSL Analysis
        "ssl_analysis": {
            "valid": report.ssl_valid,
            "issuer": report.ssl_issuer,
            "expiration": report.ssl_expiration.isoformat() if report.ssl_expiration else None,
            "security_level": report.ssl_security_level
        },
        
        # Domain Analysis
        "domain_analysis": {
            "age_days": report.domain_age_days,
            "registrar": report.domain_registrar,
            "country": report.domain_country,
            "creation_date": report.domain_creation_date.isoformat() if report.domain_creation_date else None
        },
        
        # Redirect Analysis
        "redirect_analysis": {
            "chain": report.redirect_chain,
            "count": report.redirect_count,
            "final_url": report.final_url
        },
        
        # Page Analysis
        "page_analysis": {
            "title": report.page_title,
            "content_snippet": report.page_content_snippet,
            "scripts": report.detected_scripts,
            "script_threats": report.script_threats
        },
        
        # Form Analysis
        "form_analysis": {
            "login_forms_detected": report.login_forms_detected,
            "form_fields": report.form_fields,
            "form_actions": report.form_actions
        },
        
        # Cookie & Tracking Analysis
        "tracking_analysis": {
            "cookies": report.cookies_set,
            "total_cookies": getattr(report, 'total_cookies', 0),
            "tracking_cookies": getattr(report, 'tracking_cookies', 0),
            "advertising_cookies": getattr(report, 'advertising_cookies', 0),
            "analytics_cookies": getattr(report, 'analytics_cookies', 0),
            "functional_cookies": getattr(report, 'functional_cookies', 0),
            "session_cookies": getattr(report, 'session_cookies', 0),
            "persistent_cookies": getattr(report, 'persistent_cookies', 0),
            "third_party_cookies": getattr(report, 'third_party_cookies', 0),
            "tracking_cookie_details": getattr(report, 'tracking_cookie_details', []),
            "advertising_cookie_details": getattr(report, 'advertising_cookie_details', []),
            "analytics_cookie_details": getattr(report, 'analytics_cookie_details', []),
            "third_party_trackers": report.third_party_trackers,
            "analytics_services": getattr(report, 'analytics_services', []),
            "ad_networks": getattr(report, 'ad_networks', []),
            "social_trackers": getattr(report, 'social_trackers', [])
        },
        
        # Page Information
        "page_information": {
            "title": report.page_title,
            "content_preview": report.page_content_snippet[:200] if report.page_content_snippet else "No content available",
            "metadata": getattr(report, 'page_metadata', {})
        },
        
        # Behavioral Analysis
        "behavioral_analysis": {
            "auto_downloads": report.auto_downloads,
            "download_files": report.download_files,
            "external_requests": report.external_requests,
            "suspicious_behaviors": report.suspicious_behaviors
        },
        
        "screenshot_path": report.screenshot_path,
        "analyzed_at": report.analyzed_at.isoformat(),
        "execution_time": report.execution_time,
        "error_message": report.error_message
    }

@router.post("/batch-analyze")
async def batch_analyze_urls(
    body: dict = Body(...),
    db: Session = Depends(get_db)
):
    """
    Analyze multiple URLs in parallel
    """
    try:
        urls = body.get("urls", [])
        email_analysis_id = body.get("email_analysis_id")
        
        analyzer = SandboxAnalyzer(timeout=30)
        
        # Analyze all URLs in parallel
        tasks = [analyzer.analyze_url(url) for url in urls]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Save all reports
        report_ids = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                continue
            
            db_report = SandboxReport(
                email_analysis_id=email_analysis_id,
                url=result["url"],
                safety_score=result["safety_score"],
                verdict=result["verdict"],
                ssl_valid=result.get("ssl_valid", False),
                ssl_issuer=result.get("ssl_issuer"),
                ssl_expiration=parse_datetime(result.get("ssl_expiration")),
                ssl_security_level=result.get("ssl_security_level"),
                domain_age_days=result.get("domain_age_days"),
                domain_registrar=result.get("domain_registrar"),
                domain_country=result.get("domain_country"),
                domain_creation_date=parse_datetime(result.get("domain_creation_date")),
                redirect_count=result.get("redirect_count", 0),
                login_forms_detected=result.get("login_forms_detected", False),
                execution_time=result["execution_time"],
                redirect_chain=result.get("redirect_chain", []),
                final_url=result.get("final_url"),
                page_title=result.get("page_title"),
                detected_scripts=result.get("detected_scripts", []),
                script_threats=result.get("script_threats", []),
                form_fields=result.get("form_fields", []),
                form_actions=result.get("form_actions", []),
                cookies_set=result.get("cookies_set", []),
                tracking_cookies=result.get("tracking_cookies", 0),
                total_cookies=result.get("total_cookies", 0),
                advertising_cookies=result.get("advertising_cookies", 0),
                analytics_cookies=result.get("analytics_cookies", 0),
                functional_cookies=result.get("functional_cookies", 0),
                session_cookies=result.get("session_cookies", 0),
                persistent_cookies=result.get("persistent_cookies", 0),
                third_party_cookies=result.get("third_party_cookies", 0),
                tracking_cookie_details=result.get("tracking_cookie_details", []),
                advertising_cookie_details=result.get("advertising_cookie_details", []),
                analytics_cookie_details=result.get("analytics_cookie_details", []),
                third_party_trackers=result.get("third_party_trackers", []),
                analytics_services=result.get("analytics_services", []),
                ad_networks=result.get("ad_networks", []),
                social_trackers=result.get("social_trackers", []),
                page_metadata=result.get("page_metadata", {}),
                suspicious_behaviors=result.get("suspicious_behaviors", []),
                error_message=result.get("error_message")
            )
            
            db.add(db_report)
            db.commit()
            db.refresh(db_report)
            report_ids.append(db_report.id)
        
        return {
            "analyzed_count": len(report_ids),
            "report_ids": report_ids,
            "results": [r for r in results if not isinstance(r, Exception)]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch analysis failed: {str(e)}")
