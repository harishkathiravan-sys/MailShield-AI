import re
import time
from typing import Dict, List, Tuple
from datetime import datetime

class EmailAnalyzer:
    """
    Real email analysis engine that detects spam and phishing indicators
    using keyword matching, pattern recognition, and heuristic analysis.
    """
    
    # Spam keywords
    SPAM_KEYWORDS = [
        "congratulations", "winner", "prize", "lottery", "claim", "free money",
        "million dollars", "inheritance", "beneficiary", "transfer funds",
        "limited time", "act now", "click here now", "urgent response",
        "nigerian prince", "foreign transfer", "bank transfer", "wire transfer",
        "casino", "viagra", "pills", "weight loss", "earn money fast",
        "work from home", "make money online", "no investment", "guaranteed income"
    ]
    
    # Phishing keywords
    PHISHING_KEYWORDS = [
        "verify your account", "confirm your identity", "suspended account",
        "unusual activity", "security alert", "update payment", "billing problem",
        "expire", "suspended", "locked", "unauthorized access", "verify identity",
        "confirm password", "update credentials", "account verification",
        "re-activate", "click here immediately", "action required",
        "account will be closed", "validate your account", "security check"
    ]
    
    # Urgency patterns
    URGENCY_PATTERNS = [
        r"\b(urgent|immediately|asap|right now|within \d+ hours?)\b",
        r"\b(act now|respond now|click now|hurry)\b",
        r"\b(expires? (today|soon|in \d+ hours?))\b",
        r"\b(limited time|time sensitive|deadline)\b",
        r"\b(last chance|final (notice|warning))\b"
    ]
    
    # Credential request patterns
    CREDENTIAL_PATTERNS = [
        r"\b(password|passcode|pin|ssn|social security)\b",
        r"\b(credit card|debit card|card number)\b",
        r"\b(account number|routing number|bank account)\b",
        r"\b(login credentials|username and password)\b",
        r"\b(verify (your )?(identity|account|payment))\b"
    ]
    
    # Suspicious sender patterns
    SUSPICIOUS_SENDER_PATTERNS = [
        r"@.*\.(xyz|top|club|loan|gq|ml|ga|cf|tk)$",  # Suspicious TLDs
        r"noreply.*@",
        r"support.*@(?!.*\.(com|org|net|gov|edu))",
        r"\d{5,}@",  # Many numbers in email
    ]
    
    def __init__(self):
        self.analysis_start_time = None
    
    def analyze_email(
        self,
        sender_email: str,
        subject: str,
        body: str
    ) -> Dict:
        """
        Perform comprehensive email analysis
        """
        self.analysis_start_time = time.time()
        
        # Combine all text for analysis
        full_text = f"{subject} {body}".lower()
        
        # Perform individual analyses
        spam_indicators = self._detect_spam_keywords(full_text)
        phishing_indicators = self._detect_phishing_keywords(full_text)
        urgency_indicators = self._detect_urgency_patterns(full_text)
        credential_requests = self._detect_credential_requests(full_text)
        sender_suspicious = self._analyze_sender(sender_email)
        
        # Calculate scores
        spam_score = self._calculate_spam_score(
            spam_indicators,
            urgency_indicators,
            sender_suspicious
        )
        
        phishing_probability = self._calculate_phishing_probability(
            phishing_indicators,
            credential_requests,
            urgency_indicators,
            sender_suspicious
        )
        
        malicious_intent_score = max(spam_score, phishing_probability)
        
        # Determine risk level
        risk_level = self._determine_risk_level(
            spam_score,
            phishing_probability,
            malicious_intent_score
        )
        
        # Extract URLs
        urls = self._extract_urls(body)
        
        analysis_duration = time.time() - self.analysis_start_time
        
        return {
            "spam_score": round(spam_score, 3),
            "phishing_probability": round(phishing_probability, 3),
            "malicious_intent_score": round(malicious_intent_score, 3),
            "risk_level": risk_level,
            "detected_keywords": {
                "spam": spam_indicators,
                "phishing": phishing_indicators
            },
            "detected_patterns": {
                "urgency": urgency_indicators,
                "credential_requests": credential_requests,
                "suspicious_sender": sender_suspicious
            },
            "urgency_indicators": urgency_indicators,
            "credential_requests": len(credential_requests) > 0,
            "extracted_urls": urls,
            "analysis_duration": round(analysis_duration, 3)
        }
    
    def _detect_spam_keywords(self, text: str) -> List[str]:
        """Detect spam keywords in text"""
        found = []
        for keyword in self.SPAM_KEYWORDS:
            if keyword.lower() in text:
                found.append(keyword)
        return found
    
    def _detect_phishing_keywords(self, text: str) -> List[str]:
        """Detect phishing keywords in text"""
        found = []
        for keyword in self.PHISHING_KEYWORDS:
            if keyword.lower() in text:
                found.append(keyword)
        return found
    
    def _detect_urgency_patterns(self, text: str) -> List[str]:
        """Detect urgency patterns in text"""
        found = []
        for pattern in self.URGENCY_PATTERNS:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                found.extend([m if isinstance(m, str) else m[0] for m in matches])
        return list(set(found))
    
    def _detect_credential_requests(self, text: str) -> List[str]:
        """Detect credential request patterns"""
        found = []
        for pattern in self.CREDENTIAL_PATTERNS:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                found.extend([m if isinstance(m, str) else m[0] for m in matches])
        return list(set(found))
    
    def _analyze_sender(self, sender_email: str) -> List[str]:
        """Analyze sender email for suspicious patterns"""
        suspicious = []
        sender_lower = sender_email.lower()
        
        for pattern in self.SUSPICIOUS_SENDER_PATTERNS:
            if re.search(pattern, sender_lower):
                suspicious.append(f"Suspicious pattern in email: {pattern}")
        
        # Check for domain mismatch (common in phishing)
        if "paypal" in sender_lower and not "@paypal.com" in sender_lower:
            suspicious.append("Paypal domain mismatch")
        if "amazon" in sender_lower and not "@amazon.com" in sender_lower:
            suspicious.append("Amazon domain mismatch")
        if "bank" in sender_lower and not any(x in sender_lower for x in ["@chase.com", "@bankofamerica.com", "@wellsfargo.com"]):
            suspicious.append("Banking domain mismatch")
        if "apple" in sender_lower and not "@apple.com" in sender_lower:
            suspicious.append("Apple domain mismatch")
        if "microsoft" in sender_lower and not "@microsoft.com" in sender_lower:
            suspicious.append("Microsoft domain mismatch")
        
        return suspicious
    
    def _calculate_spam_score(
        self,
        spam_indicators: List[str],
        urgency_indicators: List[str],
        sender_suspicious: List[str]
    ) -> float:
        """Calculate spam score (0.0 to 1.0)"""
        score = 0.0
        
        # Spam keywords contribute
        score += min(len(spam_indicators) * 0.15, 0.5)
        
        # Urgency patterns contribute
        score += min(len(urgency_indicators) * 0.1, 0.3)
        
        # Suspicious sender contributes
        score += min(len(sender_suspicious) * 0.1, 0.2)
        
        return min(score, 1.0)
    
    def _calculate_phishing_probability(
        self,
        phishing_indicators: List[str],
        credential_requests: List[str],
        urgency_indicators: List[str],
        sender_suspicious: List[str]
    ) -> float:
        """Calculate phishing probability (0.0 to 1.0)"""
        score = 0.0
        
        # Phishing keywords are strong indicators
        score += min(len(phishing_indicators) * 0.2, 0.6)
        
        # Credential requests are very suspicious
        score += min(len(credential_requests) * 0.3, 0.5)
        
        # Urgency + phishing is very suspicious
        if urgency_indicators and phishing_indicators:
            score += 0.2
        
        # Suspicious sender + phishing keywords = likely phishing
        if sender_suspicious and phishing_indicators:
            score += 0.15
        
        return min(score, 1.0)
    
    def _determine_risk_level(
        self,
        spam_score: float,
        phishing_probability: float,
        malicious_intent_score: float
    ) -> str:
        """Determine overall risk level"""
        if phishing_probability >= 0.7 or malicious_intent_score >= 0.8:
            return "malicious"
        elif phishing_probability >= 0.5 or spam_score >= 0.6:
            return "phishing"
        elif spam_score >= 0.4 or phishing_probability >= 0.3:
            return "suspicious"
        else:
            return "safe"
    
    def _extract_urls(self, text: str) -> List[str]:
        """Extract all URLs from text"""
        # URL regex pattern
        url_pattern = r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
        urls = re.findall(url_pattern, text)
        
        # Also find URLs without http://
        www_pattern = r'www\.[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:/[^\s]*)?'
        www_urls = re.findall(www_pattern, text)
        www_urls = ['http://' + url for url in www_urls]
        
        return list(set(urls + www_urls))
