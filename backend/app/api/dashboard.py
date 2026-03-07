from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from typing import Optional

from ..core.database import get_db
from ..models.email_analysis import EmailAnalysis
from ..models.sandbox_report import SandboxReport

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats(
    user_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Get overall dashboard statistics
    """
    try:
        # Build base query
        email_query = db.query(EmailAnalysis)
        sandbox_query = db.query(SandboxReport)
        
        if user_id:
            email_query = email_query.filter(EmailAnalysis.user_id == user_id)
        
        # Total emails analyzed
        total_emails = email_query.count()
        
        # Total links analyzed
        total_links = sandbox_query.count()
        
        # Threats detected
        threats_detected = email_query.filter(
            EmailAnalysis.risk_level.in_(["phishing", "malicious"])
        ).count()
        
        # Phishing attempts blocked
        phishing_blocked = email_query.filter(
            EmailAnalysis.risk_level == "phishing"
        ).count()
        
        # Get risk distribution
        risk_distribution = db.query(
            EmailAnalysis.risk_level,
            func.count(EmailAnalysis.id).label('count')
        ).group_by(EmailAnalysis.risk_level).all()
        
        risk_dist_dict = {level: count for level, count in risk_distribution}
        
        # Get recent activity (last 7 days)
        week_ago = datetime.now() - timedelta(days=7)
        recent_analyses = email_query.filter(
            EmailAnalysis.analyzed_at >= week_ago
        ).count()
        
        # Get threat categories
        malicious_count = email_query.filter(EmailAnalysis.risk_level == "malicious").count()
        phishing_count = email_query.filter(EmailAnalysis.risk_level == "phishing").count()
        suspicious_count = email_query.filter(EmailAnalysis.risk_level == "suspicious").count()
        safe_count = email_query.filter(EmailAnalysis.risk_level == "safe").count()
        
        return {
            "total_emails_analyzed": total_emails,
            "total_links_analyzed": total_links,
            "threats_detected": threats_detected,
            "phishing_attempts_blocked": phishing_blocked,
            "risk_distribution": {
                "safe": risk_dist_dict.get("safe", 0),
                "suspicious": risk_dist_dict.get("suspicious", 0),
                "phishing": risk_dist_dict.get("phishing", 0),
                "malicious": risk_dist_dict.get("malicious", 0)
            },
            "recent_activity": recent_analyses,
            "threat_categories": {
                "malicious": malicious_count,
                "phishing": phishing_count,
                "suspicious": suspicious_count,
                "safe": safe_count
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch stats: {str(e)}")

@router.get("/weekly-activity")
async def get_weekly_activity(
    user_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Get weekly threat activity data
    """
    try:
        weekly_data = []
        
        for i in range(7):
            day = datetime.now() - timedelta(days=i)
            day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day.replace(hour=23, minute=59, second=59, microsecond=999999)
            
            query = db.query(EmailAnalysis).filter(
                EmailAnalysis.analyzed_at >= day_start,
                EmailAnalysis.analyzed_at <= day_end
            )
            
            if user_id:
                query = query.filter(EmailAnalysis.user_id == user_id)
            
            total = query.count()
            threats = query.filter(
                EmailAnalysis.risk_level.in_(["phishing", "malicious"])
            ).count()
            
            weekly_data.append({
                "date": day.strftime("%Y-%m-%d"),
                "day_name": day.strftime("%A"),
                "total_analyzed": total,
                "threats_detected": threats
            })
        
        return {
            "weekly_activity": list(reversed(weekly_data))
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch weekly activity: {str(e)}")

@router.get("/recent-threats")
async def get_recent_threats(
    limit: int = 10,
    user_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Get recent threat detections
    """
    try:
        query = db.query(EmailAnalysis).filter(
            EmailAnalysis.risk_level.in_(["phishing", "malicious", "suspicious"])
        )
        
        if user_id:
            query = query.filter(EmailAnalysis.user_id == user_id)
        
        threats = query.order_by(desc(EmailAnalysis.analyzed_at)).limit(limit).all()
        
        return {
            "recent_threats": [{
                "id": t.id,
                "sender_email": t.sender_email,
                "subject": t.subject,
                "risk_level": t.risk_level,
                "spam_score": t.spam_score,
                "phishing_probability": t.phishing_probability,
                "analyzed_at": t.analyzed_at.isoformat()
            } for t in threats]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch recent threats: {str(e)}")

@router.get("/top-threats")
async def get_top_threat_types(
    db: Session = Depends(get_db)
):
    """
    Get top threat types and patterns
    """
    try:
        # Get all phishing/malicious emails
        threats = db.query(EmailAnalysis).filter(
            EmailAnalysis.risk_level.in_(["phishing", "malicious"])
        ).all()
        
        # Count keyword occurrences
        keyword_counts = {}
        pattern_counts = {}
        
        for threat in threats:
            if threat.detected_keywords:
                for category, keywords in threat.detected_keywords.items():
                    for keyword in keywords:
                        keyword_counts[keyword] = keyword_counts.get(keyword, 0) + 1
            
            if threat.detected_patterns:
                for pattern_type, patterns in threat.detected_patterns.items():
                    if isinstance(patterns, list):
                        for pattern in patterns:
                            pattern_counts[pattern] = pattern_counts.get(pattern, 0) + 1
        
        # Get top 10
        top_keywords = sorted(keyword_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        top_patterns = sorted(pattern_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        
        return {
            "top_keywords": [{"keyword": k, "count": c} for k, c in top_keywords],
            "top_patterns": [{"pattern": p, "count": c} for p, c in top_patterns]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch top threats: {str(e)}")
