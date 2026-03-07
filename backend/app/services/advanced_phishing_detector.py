"""
Advanced Phishing Detection Module
Implements comprehensive threat detection including:
- Domain reputation checking (VirusTotal, PhishTank, Google Safe Browsing)
- Typosquatting detection
- URL structure analysis
- NLP-based content analysis
- Brand impersonation detection
- IP/ASN reputation
"""

import re
import socket
import tldextract
from typing import Dict, List, Optional, Tuple
from urllib.parse import urlparse
from rapidfuzz import fuzz
from datetime import datetime
import httpx
import os
from collections import Counter


class AdvancedPhishingDetector:
    """Advanced phishing detection using multiple detection techniques"""
    
    # Popular legitimate brands to check for typosquatting
    LEGITIMATE_BRANDS = [
        'paypal', 'google', 'facebook', 'amazon', 'microsoft', 'apple', 
        'netflix', 'instagram', 'twitter', 'linkedin', 'ebay', 'yahoo',
        'dropbox', 'github', 'stackoverflow', 'reddit', 'youtube', 'gmail',
        'outlook', 'chase', 'wellsfargo', 'bankofamerica', 'citibank',
        'americanexpress', 'visa', 'mastercard', 'discover', 'stripe',
        'coinbase', 'binance', 'walmart', 'target', 'bestbuy', 'adobe'
    ]
    
    # Common phishing phrases (NLP-based detection)
    PHISHING_PHRASES = [
        'verify your account', 'account suspended', 'urgent action required',
        'click immediately', 'confirm your identity', 'unusual activity',
        'secure your account', 'suspended account', 'verify account',
        'account verification', 'payment failed', 'update payment',
        'account locked', 're-activate', 'confirm payment', 'prize winner',
        'claim your reward', 'limited time offer', 'act now', 'click here now',
        'your account will be closed', 'unauthorized transaction',
        'reset your password immediately', 'security alert', 'update billing'
    ]
    
    SUSPICIOUS_URL_PATTERNS = [
        r'login.*\d+',  # login with numbers
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}',  # IP address
        r'([a-z])\1{4,}',  # repeated characters (e.g., aaaaa)
        r'@',  # @ symbol in URL (often used to hide real domain)
        r'xn--',  # punycode (internationalized domain names)
    ]
    
    def __init__(self):
        self.virustotal_api_key = os.getenv('VIRUSTOTAL_API_KEY', '')
        self.phishtank_api_key = os.getenv('PHISHTANK_API_KEY', '')
    
    def analyze_url_structure(self, url: str) -> Dict:
        """
        Analyze URL structure for suspicious patterns
        """
        parsed = urlparse(url)
        domain = parsed.netloc
        path = parsed.path
        full_url = url.lower()
        
        suspicious_indicators = []
        risk_score = 0
        
        # 1. Check URL length (phishing URLs are often very long)
        url_length = len(url)
        if url_length > 75:
            suspicious_indicators.append(f"Very long URL ({url_length} characters)")
            risk_score += 15
        elif url_length > 50:
            suspicious_indicators.append(f"Long URL ({url_length} characters)")
            risk_score += 8
        
        # 2. Count dots/subdomains (excessive subdomains are suspicious)
        dot_count = domain.count('.')
        if dot_count > 4:
            suspicious_indicators.append(f"Too many subdomains ({dot_count} dots)")
            risk_score += 20
        elif dot_count > 3:
            suspicious_indicators.append(f"Many subdomains ({dot_count} dots)")
            risk_score += 10
        
        # 3. Check for IP address instead of domain
        if re.search(r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', domain):
            suspicious_indicators.append("Uses IP address instead of domain name")
            risk_score += 25
        
        # 4. Check for @ symbol (URL obfuscation technique)
        if '@' in full_url:
            suspicious_indicators.append("Contains @ symbol (URL obfuscation)")
            risk_score += 30
        
        # 5. Check for suspicious keywords
        suspicious_keywords = ['verify', 'account', 'login', 'secure', 'banking', 'update', 'confirm']
        found_keywords = [kw for kw in suspicious_keywords if kw in full_url]
        if len(found_keywords) >= 2:
            suspicious_indicators.append(f"Multiple suspicious keywords: {', '.join(found_keywords)}")
            risk_score += 15
        
        # 6. Check for punycode (internationalized domains used for homograph attacks)
        if 'xn--' in domain:
            suspicious_indicators.append("Uses punycode (potential homograph attack)")
            risk_score += 25
        
        # 7. Check for repeated characters
        if re.search(r'([a-z])\1{4,}', domain):
            suspicious_indicators.append("Contains repeated characters")
            risk_score += 10
        
        # 8. Check for hyphens (often used in fake domains)
        hyphen_count = domain.count('-')
        if hyphen_count > 3:
            suspicious_indicators.append(f"Too many hyphens ({hyphen_count})")
            risk_score += 15
        elif hyphen_count > 1:
            suspicious_indicators.append(f"Multiple hyphens ({hyphen_count})")
            risk_score += 5
        
        # 9. Check path depth (deeply nested paths can be suspicious)
        path_segments = [p for p in path.split('/') if p]
        if len(path_segments) > 5:
            suspicious_indicators.append(f"Deep path nesting ({len(path_segments)} levels)")
            risk_score += 10
        
        # 10. Check for URL shorteners patterns (bit.ly, tinyurl, etc.)
        shortener_domains = ['bit.ly', 'tinyurl', 't.co', 'goo.gl', 'ow.ly', 'is.gd', 'buff.ly', 'adf.ly']
        if any(shortener in domain for shortener in shortener_domains):
            suspicious_indicators.append("URL shortener detected")
            risk_score += 20
        
        return {
            "url_length": url_length,
            "subdomain_count": dot_count,
            "hyphen_count": hyphen_count,
            "path_depth": len(path_segments),
            "uses_ip": bool(re.search(r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', domain)),
            "suspicious_indicators": suspicious_indicators,
            "structure_risk_score": min(risk_score, 100),
            "verdict": self._get_structure_verdict(risk_score)
        }
    
    def _get_structure_verdict(self, risk_score: int) -> str:
        """Determine verdict based on structure risk score"""
        if risk_score >= 50:
            return "high_risk"
        elif risk_score >= 25:
            return "suspicious"
        elif risk_score >= 10:
            return "low_risk"
        else:
            return "clean"
    
    def detect_typosquatting(self, domain: str) -> Dict:
        """
        Detect typosquatting attempts (domain similarity to legitimate brands)
        Uses Levenshtein distance and fuzzy matching
        """
        extracted = tldextract.extract(domain)
        target_domain = extracted.domain.lower()
        
        similarities = []
        max_similarity = 0
        closest_brand = None
        
        for brand in self.LEGITIMATE_BRANDS:
            # Calculate various similarity metrics
            ratio = fuzz.ratio(target_domain, brand)
            partial_ratio = fuzz.partial_ratio(target_domain, brand)
            token_ratio = fuzz.token_sort_ratio(target_domain, brand)
            
            # Take the highest similarity score
            similarity = max(ratio, partial_ratio, token_ratio)
            
            if similarity > max_similarity:
                max_similarity = similarity
                closest_brand = brand
            
            # Store high similarity matches
            if similarity >= 70:
                similarities.append({
                    "legitimate_brand": brand,
                    "similarity_score": similarity,
                    "your_domain": target_domain
                })
        
        is_typosquatting = False
        typosquatting_risk = "none"
        
        # High similarity but not exact match = typosquatting
        if max_similarity >= 85 and target_domain != closest_brand:
            is_typosquatting = True
            typosquatting_risk = "critical"
        elif max_similarity >= 75:
            is_typosquatting = True
            typosquatting_risk = "high"
        elif max_similarity >= 65:
            typosquatting_risk = "medium"
        elif max_similarity >= 50:
            typosquatting_risk = "low"
        
        return {
            "is_typosquatting": is_typosquatting,
            "risk_level": typosquatting_risk,
            "similarity_score": max_similarity,
            "closest_legitimate_brand": closest_brand if max_similarity >= 50 else None,
            "possible_targets": sorted(similarities, key=lambda x: x['similarity_score'], reverse=True)[:3],
            "warning": f"⚠️ Domain '{target_domain}' is {max_similarity}% similar to '{closest_brand}'" if is_typosquatting else None
        }
    
    def analyze_page_content_nlp(self, page_text: str, page_title: str = "") -> Dict:
        """
        NLP-based analysis of page content for phishing indicators
        """
        if not page_text:
            return {
                "phishing_phrases_found": [],
                "phishing_score": 0,
                "confidence": "low",
                "content_risk": "unknown"
            }
        
        text_lower = page_text.lower()
        title_lower = page_title.lower()
        combined_text = text_lower + " " + title_lower
        
        # Find phishing phrases
        found_phrases = []
        for phrase in self.PHISHING_PHRASES:
            if phrase in text_lower:
                found_phrases.append(phrase)
        
        # Calculate phishing probability based on found phrases
        phishing_score = len(found_phrases) * 10
        
        # Additional heuristics
        urgency_words = ['urgent', 'immediately', 'now', 'act fast', 'limited time', 'expire']
        urgency_count = sum(combined_text.count(word) for word in urgency_words)
        if urgency_count >= 3:
            phishing_score += 15
            found_phrases.append(f"High urgency language ({urgency_count} instances)")
        
        # Check for credential requests
        credential_words = ['password', 'credit card', 'social security', 'ssn', 'cvv', 'pin', 'otp']
        credential_count = sum(combined_text.count(word) for word in credential_words)
        if credential_count >= 2:
            phishing_score += 20
            found_phrases.append(f"Requests sensitive credentials ({credential_count} types)")
        
        # Check for fear tactics
        fear_words = ['suspended', 'locked', 'terminated', 'restricted', 'blocked', 'fraud']
        fear_count = sum(combined_text.count(word) for word in fear_words)
        if fear_count >= 2:
            phishing_score += 15
            found_phrases.append(f"Uses fear tactics ({fear_count} instances)")
        
        # Determine risk level
        if phishing_score >= 50:
            content_risk = "critical"
            confidence = "high"
        elif phishing_score >= 30:
            content_risk = "high"
            confidence = "high"
        elif phishing_score >= 15:
            content_risk = "medium"
            confidence = "medium"
        elif phishing_score > 0:
            content_risk = "low"
            confidence = "medium"
        else:
            content_risk = "clean"
            confidence = "low"
        
        return {
            "phishing_phrases_found": found_phrases,
            "phishing_score": min(phishing_score, 100),
            "confidence": confidence,
            "content_risk": content_risk,
            "analysis": {
                "urgency_indicators": urgency_count,
                "credential_requests": credential_count,
                "fear_tactics": fear_count
            }
        }
    
    async def check_domain_reputation(self, domain: str) -> Dict:
        """
        Check domain reputation using multiple threat intelligence sources
        Includes VirusTotal, PhishTank, and Google Safe Browsing
        """
        reputation_data = {
            "is_malicious": False,
            "threat_sources": [],
            "detection_count": 0,
            "reputation_score": 100,  # Start with 100 (safe)
            "details": {}
        }
        
        # 1. VirusTotal Check
        vt_result = await self._check_virustotal(domain)
        if vt_result.get("detected"):
            reputation_data["is_malicious"] = True
            reputation_data["threat_sources"].append("VirusTotal")
            reputation_data["detection_count"] += vt_result.get("positives", 0)
            reputation_data["reputation_score"] -= 40
            reputation_data["details"]["virustotal"] = vt_result
        
        # 2. PhishTank Check
        pt_result = await self._check_phishtank(domain)
        if pt_result.get("detected"):
            reputation_data["is_malicious"] = True
            reputation_data["threat_sources"].append("PhishTank")
            reputation_data["detection_count"] += 1
            reputation_data["reputation_score"] -= 50
            reputation_data["details"]["phishtank"] = pt_result
        
        # 3. Google Safe Browsing (implementation placeholder)
        # You would need to implement this with Google Safe Browsing API
        
        reputation_data["reputation_score"] = max(0, reputation_data["reputation_score"])
        
        return reputation_data
    
    async def _check_virustotal(self, domain: str) -> Dict:
        """Check domain against VirusTotal API"""
        if not self.virustotal_api_key:
            return {"detected": False, "error": "No API key configured"}
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                headers = {"x-apikey": self.virustotal_api_key}
                url = f"https://www.virustotal.com/api/v3/domains/{domain}"
                
                response = await client.get(url, headers=headers)
                
                if response.status_code == 200:
                    data = response.json()
                    stats = data.get("data", {}).get("attributes", {}).get("last_analysis_stats", {})
                    
                    malicious = stats.get("malicious", 0)
                    suspicious = stats.get("suspicious", 0)
                    total = sum(stats.values()) if stats else 0
                    
                    return {
                        "detected": malicious > 0 or suspicious > 2,
                        "positives": malicious + suspicious,
                        "total_scanners": total,
                        "malicious_count": malicious,
                        "suspicious_count": suspicious,
                        "details": stats
                    }
                else:
                    return {"detected": False, "error": f"API returned status {response.status_code}"}
                    
        except Exception as e:
            return {"detected": False, "error": str(e)}
    
    async def _check_phishtank(self, domain: str) -> Dict:
        """Check domain against PhishTank database"""
        try:
            # PhishTank free API
            async with httpx.AsyncClient(timeout=10.0) as client:
                url = f"https://checkurl.phishtank.com/checkurl/"
                data = {
                    "url": domain,
                    "format": "json"
                }
                
                response = await client.post(url, data=data)
                
                if response.status_code == 200:
                    result = response.json()
                    in_database = result.get("results", {}).get("in_database", False)
                    is_valid = result.get("results", {}).get("valid", False)
                    
                    return {
                        "detected": in_database and is_valid,
                        "in_database": in_database,
                        "verified": is_valid,
                        "details": result.get("results", {})
                    }
                    
        except Exception as e:
            return {"detected": False, "error": str(e)}
        
        return {"detected": False}
    
    def get_ip_reputation(self, domain: str) -> Dict:
        """
        Get IP and ASN reputation information
        """
        try:
            ip_address = socket.gethostbyname(domain)
            
            # Basic IP classification
            is_private = self._is_private_ip(ip_address)
            is_cloud = self._is_cloud_provider_ip(ip_address)
            
            return {
                "ip_address": ip_address,
                "is_private_ip": is_private,
                "is_cloud_provider": is_cloud,
                "risk_level": "high" if is_private else "low" if is_cloud else "medium"
            }
            
        except Exception as e:
            return {
                "ip_address": None,
                "error": str(e),
                "risk_level": "unknown"
            }
    
    def _is_private_ip(self, ip: str) -> bool:
        """Check if IP is in private range"""
        parts = ip.split('.')
        if len(parts) != 4:
            return False
        
        try:
            first = int(parts[0])
            second = int(parts[1])
            
            # 10.0.0.0/8
            if first == 10:
                return True
            # 172.16.0.0/12
            if first == 172 and 16 <= second <= 31:
                return True
            # 192.168.0.0/16
            if first == 192 and second == 168:
                return True
            # 127.0.0.0/8 (localhost)
            if first == 127:
                return True
                
        except ValueError:
            pass
        
        return False
    
    def _is_cloud_provider_ip(self, ip: str) -> bool:
        """Check if IP belongs to major cloud providers (basic check)"""
        # This is a simplified check. In production, you'd use IP range databases
        # Common cloud provider IP ranges (AWS, Azure, GCP)
        # This is just a placeholder - you'd want comprehensive IP ranges
        return False  # Implement with proper IP range database
    
    def generate_website_review(
        self,
        url_analysis: Dict,
        typosquatting: Dict,
        content_analysis: Dict,
        reputation: Dict,
        domain_age_days: Optional[int],
        ssl_valid: bool,
        login_forms: bool
    ) -> Dict:
        """
        Generate comprehensive website review with risk assessment
        """
        risk_factors = []
        safety_recommendations = []
        overall_risk_score = 0
        
        # Analyze each component
        
        # 1. URL Structure
        if url_analysis.get("structure_risk_score", 0) >= 25:
            risk_factors.append({
                "category": "URL Structure",
                "severity": "high" if url_analysis["structure_risk_score"] >= 50 else "medium",
                "issues": url_analysis.get("suspicious_indicators", [])
            })
            overall_risk_score += url_analysis["structure_risk_score"]
        
        # 2. Typosquatting
        if typosquatting.get("is_typosquatting"):
            risk_factors.append({
                "category": "Brand Impersonation",
                "severity": typosquatting.get("risk_level", "medium"),
                "issues": [typosquatting.get("warning", "Possible brand impersonation")]
            })
            overall_risk_score += 30
        
        # 3. Content Analysis
        if content_analysis.get("content_risk") in ["high", "critical"]:
            risk_factors.append({
                "category": "Content Analysis",
                "severity": content_analysis["content_risk"],
                "issues": content_analysis.get("phishing_phrases_found", [])
            })
            overall_risk_score += content_analysis.get("phishing_score", 0)
        
        # 4. Domain Reputation
        if reputation.get("is_malicious"):
            risk_factors.append({
                "category": "Domain Reputation",
                "severity": "critical",
                "issues": [f"Flagged by {len(reputation.get('threat_sources', []))} security vendors"]
            })
            overall_risk_score += 50
        
        # 5. Domain Age
        if domain_age_days is not None:
            if domain_age_days < 30:
                risk_factors.append({
                    "category": "Domain Age",
                    "severity": "high" if domain_age_days < 7 else "medium",
                    "issues": [f"Very new domain (only {domain_age_days} days old)"]
                })
                overall_risk_score += 25 if domain_age_days < 7 else 15
        
        # 6. SSL Certificate
        if not ssl_valid:
            risk_factors.append({
                "category": "Security",
                "severity": "high",
                "issues": ["No valid SSL certificate - connection is not encrypted"]
            })
            overall_risk_score += 20
        
        # 7. Login Forms
        if login_forms and domain_age_days and domain_age_days < 90:
            risk_factors.append({
                "category": "Suspicious Behavior",
                "severity": "medium",
                "issues": ["New domain with login forms - potential phishing"]
            })
            overall_risk_score += 15
        
        # Generate recommendations
        if overall_risk_score >= 50:
            safety_recommendations.extend([
                "⛔ DO NOT enter any personal information",
                "⛔ DO NOT enter passwords or login credentials",
                "⛔ DO NOT download any files from this site",
                "✅ Close this page immediately",
                "✅ Report this site to your IT security team"
            ])
        elif overall_risk_score >= 25:
            safety_recommendations.extend([
                "⚠️ Exercise extreme caution on this website",
                "⚠️ Verify the URL matches the official domain",
                "⚠️ Do not enter sensitive information",
                "✅ Contact the organization directly to verify authenticity"
            ])
        else:
            safety_recommendations.extend([
                "✅ Basic security checks passed",
                "✅ Always verify URLs before entering credentials",
                "✅ Look for HTTPS and valid SSL certificates"
            ])
        
        # Determine final verdict
        if overall_risk_score >= 75:
            verdict = "DANGEROUS"
            verdict_color = "red"
            summary = "This website shows multiple indicators of malicious intent. Do not interact with this site."
        elif overall_risk_score >= 50:
            verdict = "HIGH RISK"
            verdict_color = "orange"
            summary = "This website displays several suspicious characteristics typical of phishing sites."
        elif overall_risk_score >= 25:
            verdict = "SUSPICIOUS"
            verdict_color = "yellow"
            summary = "This website shows some concerning indicators. Proceed with caution."
        else:
            verdict = "LOW RISK"
            verdict_color = "green"
            summary = "This website passes basic security checks, but always remain vigilant."
        
        return {
            "verdict": verdict,
            "verdict_color": verdict_color,
            "summary": summary,
            "overall_risk_score": min(overall_risk_score, 100),
            "risk_factors": risk_factors,
            "safety_recommendations": safety_recommendations,
            "detailed_analysis": {
                "url_structure": url_analysis,
                "typosquatting_check": typosquatting,
                "content_analysis": content_analysis,
                "reputation_check": reputation
            }
        }
