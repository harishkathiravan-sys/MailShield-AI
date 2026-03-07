import asyncio
import ssl
import socket
import time
import json
import whois
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from urllib.parse import urlparse
from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeout
import requests
from bs4 import BeautifulSoup
from .advanced_phishing_detector import AdvancedPhishingDetector

class SandboxAnalyzer:
    """
    Sandbox environment for analyzing suspicious URLs using headless browser
    """
    
    # Trusted domains that should always have high safety scores
    TRUSTED_DOMAINS = {
        'google.com', 'youtube.com', 'facebook.com', 'twitter.com', 'microsoft.com',
        'apple.com', 'amazon.com', 'linkedin.com', 'instagram.com', 'github.com',
        'stackoverflow.com', 'reddit.com', 'wikipedia.org', 'medium.com', 'npmjs.com'
    }
    
    def __init__(self, timeout: int = 30):
        self.timeout = timeout * 1000  # Convert to milliseconds for Playwright
        self.user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        self.phishing_detector = AdvancedPhishingDetector()
    
    def _is_trusted_domain(self, domain: str) -> bool:
        """Check if domain is in trusted list"""
        # Remove www. prefix and port for comparison
        clean_domain = domain.lower().replace('www.', '').split(':')[0]
        return any(clean_domain.endswith(trusted) or clean_domain == trusted 
                   for trusted in self.TRUSTED_DOMAINS)
    
    async def analyze_url(self, url: str) -> Dict:
        """
        Perform comprehensive URL analysis in sandbox environment
        """
        start_time = time.time()
        https_failed = False  # Track if HTTPS was attempted but failed
        original_url = url
        
        try:
            # Ensure URL has protocol
            if not url.startswith(('http://', 'https://')):
                url = 'https://' + url  # Default to HTTPS for security
            
            # Auto-upgrade HTTP to HTTPS and try it first
            parsed_url = urlparse(url)
            domain = parsed_url.netloc
            
            # If HTTP is used, try HTTPS first (more secure by default)
            if parsed_url.scheme == 'http':
                url = url.replace('http://', 'https://', 1)
                parsed_url = urlparse(url)
            
            # Parallel analysis of SSL and domain
            ssl_analysis = await self._analyze_ssl(domain, parsed_url.scheme == 'https')
            domain_analysis = await self._analyze_domain(domain)
            
            # Browser-based analysis - try HTTPS first
            browser_analysis = await self._analyze_with_browser(url)
            
            # If browser analysis failed with HTTPS, try HTTP as fallback
            if browser_analysis.get("error") and parsed_url.scheme == 'https':
                https_failed = True
                http_url = url.replace('https://', 'http://', 1)
                browser_analysis = await self._analyze_with_browser(http_url)
                
                # Update URL and SSL analysis for HTTP fallback
                if not browser_analysis.get("error"):
                    url = http_url
                    parsed_url = urlparse(url)
                    ssl_analysis = {
                        "valid": False,
                        "security_level": "none",
                        "https_failed": True,
                        "error": "Site only supports HTTP (HTTPS failed)"
                    }
            
            # === ADVANCED PHISHING DETECTION ===
            
            # 1. URL Structure Analysis
            url_structure = self.phishing_detector.analyze_url_structure(url)
            
            # 2. Typosquatting Detection
            typosquatting = self.phishing_detector.detect_typosquatting(domain)
            
            # 3. Content Analysis (NLP)
            page_text = browser_analysis.get("content_snippet", "")
            page_title = browser_analysis.get("page_title", "")
            content_analysis = self.phishing_detector.analyze_page_content_nlp(page_text, page_title)
            
            # 4. Domain Reputation Check
            reputation = await self.phishing_detector.check_domain_reputation(domain)
            
            # 5. IP Reputation
            ip_reputation = self.phishing_detector.get_ip_reputation(domain)
            
            # 6. Generate Comprehensive Review
            website_review = self.phishing_detector.generate_website_review(
                url_analysis=url_structure,
                typosquatting=typosquatting,
                content_analysis=content_analysis,
                reputation=reputation,
                domain_age_days=domain_analysis.get("age_days"),
                ssl_valid=ssl_analysis.get("valid", False),
                login_forms=browser_analysis.get("login_forms", False)
            )
            
            # Calculate safety score (with HTTP-only penalty if applicable)
            safety_score = self._calculate_safety_score(
                ssl_analysis,
                domain_analysis,
                browser_analysis,
                https_failed,
                url_structure,
                typosquatting,
                content_analysis,
                reputation
            )
            
            # Determine verdict
            verdict = self._determine_verdict(safety_score, browser_analysis)
            
            # Add HTTP-only warning to suspicious behaviors
            suspicious_behaviors = list(browser_analysis.get("suspicious_behaviors", []))
            if https_failed:
                suspicious_behaviors.insert(0, "⚠️ WARNING: Site only supports HTTP (HTTPS failed) - No encryption!")
            
            # Add advanced detection warnings
            if typosquatting.get("is_typosquatting"):
                suspicious_behaviors.insert(0, typosquatting.get("warning", "Typosquatting detected"))
            
            if url_structure.get("structure_risk_score", 0) >= 25:
                suspicious_behaviors.append(f"Suspicious URL structure (risk: {url_structure['structure_risk_score']}/100)")
            
            if content_analysis.get("phishing_score", 0) >= 30:
                suspicious_behaviors.append(f"Phishing-like content detected (score: {content_analysis['phishing_score']}/100)")
            
            if reputation.get("is_malicious"):
                suspicious_behaviors.insert(0, f"⚠️ FLAGGED by {len(reputation.get('threat_sources', []))} security vendors")
            
            execution_time = time.time() - start_time
            
            return {
                "url": url,
                "safety_score": round(safety_score, 3),
                "verdict": verdict,
                
                # SSL Analysis
                "ssl_valid": ssl_analysis.get("valid", False),
                "ssl_issuer": ssl_analysis.get("issuer", "Unknown"),
                "ssl_expiration": ssl_analysis.get("expiration", "Unknown"),
                "ssl_security_level": ssl_analysis.get("security_level", "unknown"),
                
                # Domain Analysis (Enhanced)
                "domain_age_days": domain_analysis.get("age_days"),
                "domain_registrar": domain_analysis.get("registrar", "Unknown"),
                "domain_country": domain_analysis.get("country", "Unknown"),
                "domain_creation_date": domain_analysis.get("creation_date", "Unknown"),
                
                # Advanced Detection Results
                "url_structure_analysis": url_structure,
                "typosquatting_detection": typosquatting,
                "content_nlp_analysis": content_analysis,
                "domain_reputation": reputation,
                "ip_reputation": ip_reputation,
                "website_review": website_review,
                
                # Browser Analysis
                "redirect_chain": browser_analysis.get("redirect_chain", []),
                "redirect_count": len(browser_analysis.get("redirect_chain", [])),
                "final_url": browser_analysis.get("final_url"),
                "page_title": browser_analysis.get("page_title", "N/A"),
                "page_content_snippet": browser_analysis.get("content_snippet", "No content available"),
                "detected_scripts": browser_analysis.get("scripts", []),
                "script_threats": browser_analysis.get("script_threats", []),
                "login_forms_detected": browser_analysis.get("login_forms", False),
                "form_fields": browser_analysis.get("form_fields", []),
                "form_actions": browser_analysis.get("form_actions", []),
                "cookies_set": browser_analysis.get("cookies", []),
                "tracking_cookies": browser_analysis.get("tracking_cookie_count", 0),
                "third_party_trackers": browser_analysis.get("third_party_trackers", []),
                "auto_downloads": browser_analysis.get("downloads", False),
                "download_files": browser_analysis.get("download_files", []),
                "external_requests": browser_analysis.get("external_requests", []),
                "suspicious_behaviors": suspicious_behaviors,
                "screenshot_path": browser_analysis.get("screenshot_path"),
                
                "execution_time": round(execution_time, 3),
                "error_message": None
            }
            
        except Exception as e:
            execution_time = time.time() - start_time
            return {
                "url": url,
                "safety_score": 0.0,
                "verdict": "error",
                "error_message": str(e),
                "execution_time": round(execution_time, 3)
            }
    
    async def _analyze_ssl(self, domain: str, uses_https: bool) -> Dict:
        """Analyze SSL certificate with improved error handling"""
        if not uses_https:
            return {
                "valid": False,
                "security_level": "none",
                "error": "No HTTPS",
                "check_performed": True
            }
        
        # Try both with and without www prefix
        domains_to_try = [domain]
        if domain.startswith('www.'):
            domains_to_try.append(domain[4:])  # Remove www.
        else:
            domains_to_try.append(f'www.{domain}')  # Add www.
        
        last_error = None
        for test_domain in domains_to_try:
            try:
                context = ssl.create_default_context()
                with socket.create_connection((test_domain, 443), timeout=10) as sock:
                    with context.wrap_socket(sock, server_hostname=test_domain) as ssock:
                        cert = ssock.getpeercert()
                        
                        issuer = dict(x[0] for x in cert['issuer'])
                        expiration = datetime.strptime(cert['notAfter'], '%b %d %H:%M:%S %Y %Z')
                        
                        days_until_expiry = (expiration - datetime.now()).days
                        
                        return {
                            "valid": True,
                            "issuer": issuer.get('organizationName', 'Unknown'),
                            "expiration": expiration.isoformat(),
                            "days_until_expiry": days_until_expiry,
                            "security_level": "high" if days_until_expiry > 30 else "medium",
                            "check_performed": True,
                            "domain_used": test_domain
                        }
            except Exception as e:
                last_error = str(e)
                continue  # Try next domain variation
        
        # If all attempts failed
        return {
            "valid": False,
            "security_level": "unknown",
            "error": last_error,
            "check_performed": True,
            "note": "Could not verify SSL certificate - this may indicate a connection issue rather than invalid SSL"
        }
    
    async def _analyze_domain(self, domain: str) -> Dict:
        """Analyze domain information using WHOIS"""
        try:
            w = whois.whois(domain)
            
            creation_date = w.creation_date
            if isinstance(creation_date, list):
                creation_date = creation_date[0]
            
            if creation_date:
                age_days = (datetime.now() - creation_date).days
                
                return {
                    "age_days": age_days,
                    "creation_date": creation_date.isoformat() if creation_date else None,
                    "registrar": w.registrar,
                    "country": w.country if hasattr(w, 'country') else None,
                }
            else:
                return {"age_days": None, "error": "Could not determine domain age"}
                
        except Exception as e:
            return {
                "age_days": None,
                "error": str(e)
            }
    
    async def _analyze_with_browser(self, url: str) -> Dict:
        """Analyze URL using headless browser"""
        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(
                    headless=True,
                    args=['--no-sandbox', '--disable-setuid-sandbox']
                )
                
                context = await browser.new_context(
                    user_agent=self.user_agent,
                    viewport={'width': 1920, 'height': 1080}
                )
                
                page = await context.new_page()
                
                # Track redirects
                redirect_chain = []
                
                async def handle_response(response):
                    if response.status in [301, 302, 303, 307, 308]:
                        redirect_chain.append({
                            "from": response.url,
                            "to": response.headers.get("location", "unknown"),
                            "status": response.status
                        })
                
                page.on("response", handle_response)
                
                # Track requests for external resources
                external_requests = []
                
                async def handle_request(request):
                    if request.resource_type in ['script', 'xhr', 'fetch']:
                        external_requests.append({
                            "url": request.url,
                            "type": request.resource_type
                        })
                
                page.on("request", handle_request)
                
                # Navigate to URL
                try:
                    await page.goto(url, timeout=self.timeout, wait_until='networkidle')
                except PlaywrightTimeout:
                    await page.goto(url, timeout=self.timeout, wait_until='domcontentloaded')
                
                # Get final URL after redirects
                final_url = page.url
                
                # Get page title
                page_title = await page.title()
                
                # Get page content
                content = await page.content()
                soup = BeautifulSoup(content, 'html.parser')
                
                # Extract text snippet
                text_content = soup.get_text()
                content_snippet = ' '.join(text_content.split())[:500]
                
                # Analyze forms
                forms = soup.find_all('form')
                login_forms = False
                form_fields = []
                form_actions = []
                
                for form in forms:
                    action = form.get('action', '')
                    form_actions.append(action)
                    
                    inputs = form.find_all(['input', 'textarea'])
                    input_types = [inp.get('type', 'text') for inp in inputs]
                    input_names = [inp.get('name', '') for inp in inputs]
                    
                    # Check for login forms
                    if any(t in ['password', 'email'] for t in input_types):
                        login_forms = True
                    
                    form_fields.append({
                        "action": action,
                        "fields": list(zip(input_names, input_types))
                    })
                
                # Analyze scripts
                scripts = soup.find_all('script')
                script_urls = [s.get('src') for s in scripts if s.get('src')]
                
                script_threats = []
                for script_url in script_urls:
                    if any(threat in script_url.lower() for threat in ['miner', 'crypto', 'coinhive']):
                        script_threats.append(f"Potential crypto miner: {script_url}")
                
                # Get cookies
                cookies = await context.cookies()
                tracking_cookie_count = sum(1 for c in cookies if 'track' in c['name'].lower() or 'analytics' in c['name'].lower())
                
                # Identify third-party trackers
                parsed_main = urlparse(final_url)
                third_party_trackers = []
                for req in external_requests:
                    req_domain = urlparse(req['url']).netloc
                    if req_domain != parsed_main.netloc:
                        if any(tracker in req_domain for tracker in ['google-analytics', 'facebook', 'doubleclick', 'tracking']):
                            third_party_trackers.append(req_domain)
                
                third_party_trackers = list(set(third_party_trackers))
                
                # Detect suspicious behaviors - IMPROVED DETECTION
                suspicious_behaviors = []
                
                # Check for hidden iframes (common in phishing)
                iframes = soup.find_all('iframe')
                hidden_iframes = [iframe for iframe in iframes if iframe.get('style', '').find('display:none') != -1 or iframe.get('style', '').find('visibility:hidden') != -1]
                if hidden_iframes:
                    suspicious_behaviors.append("Hidden iframes detected")
                
                # Check for suspicious form actions (external domains)
                for form in forms:
                    action = form.get('action', '')
                    if action and action.startswith('http'):
                        action_domain = urlparse(action).netloc
                        page_domain = urlparse(final_url).netloc
                        if action_domain and action_domain != page_domain:
                            suspicious_behaviors.append(f"Form submits to external domain: {action_domain}")
                
                # Check for obfuscated JavaScript (eval, unescape, etc.)
                inline_scripts = [s.string for s in scripts if s.string]
                for script_content in inline_scripts:
                    if script_content:
                        # Count suspicious function calls
                        suspicious_js_count = sum([
                            script_content.count('eval('),
                            script_content.count('unescape('),
                            script_content.count('fromCharCode'),
                            script_content.count('atob(')
                        ])
                        if suspicious_js_count > 3:  # Multiple obfuscation techniques
                            suspicious_behaviors.append("Heavily obfuscated JavaScript detected")
                            break
                
                # Check for auto-redirect with very short timeout
                meta_refresh = soup.find('meta', attrs={'http-equiv': 'refresh'})
                if meta_refresh:
                    content_attr = meta_refresh.get('content', '')
                    if content_attr and content_attr.startswith('0;') or content_attr.startswith('1;'):
                        suspicious_behaviors.append("Immediate auto-redirect detected")
                
                # Take screenshot
                screenshot_path = None
                try:
                    screenshot_path = f"screenshots/{hash(url)}.png"
                    await page.screenshot(path=screenshot_path)
                except:
                    pass
                
                await browser.close()
                
                return {
                    "final_url": final_url,
                    "redirect_chain": redirect_chain,
                    "page_title": page_title,
                    "content_snippet": content_snippet,
                    "scripts": script_urls[:20],  # Limit to first 20
                    "script_threats": script_threats,
                    "login_forms": login_forms,
                    "form_fields": form_fields,
                    "form_actions": form_actions,
                    "cookies": [{"name": c['name'], "domain": c['domain']} for c in cookies],
                    "tracking_cookie_count": tracking_cookie_count,
                    "third_party_trackers": third_party_trackers,
                    "external_requests": [r['url'] for r in external_requests[:30]],  # Limit
                    "suspicious_behaviors": suspicious_behaviors,
                    "downloads": False,
                    "download_files": [],
                    "screenshot_path": screenshot_path
                }
                
        except Exception as e:
            return {
                "error": str(e),
                "final_url": url,
                "redirect_chain": [],
                "suspicious_behaviors": [f"Error during analysis: {str(e)}"]
            }
    
    def _calculate_safety_score(
        self,
        ssl_analysis: Dict,
        domain_analysis: Dict,
        browser_analysis: Dict,
        https_failed: bool = False,
        url_structure: Dict = None,
        typosquatting: Dict = None,
        content_analysis: Dict = None,
        reputation: Dict = None
    ) -> float:
        """Calculate overall safety score (0.0 = dangerous, 1.0 = safe) with advanced detection"""
        
        # Start with base score
        score = 1.0
        
        # Check if this is a trusted domain first
        final_url = browser_analysis.get("final_url", "")
        if final_url:
            domain = urlparse(final_url).netloc
            if self._is_trusted_domain(domain):
                # Trusted domains start with higher baseline (but still penalize HTTP-only)
                if https_failed:
                    return max(0.65, score - 0.2)  # Even trusted domains lose points for HTTP-only
                return max(0.85, score)  # Always at least 0.85 for trusted domains
        
        # === CRITICAL THREATS (Immediate major penalties) ===
        
        # Domain Reputation - CRITICAL
        if reputation and reputation.get("is_malicious"):
            score -= 0.5  # Flagged by security vendors = major red flag
        
        # Typosquatting - HIGH RISK
        if typosquatting and typosquatting.get("is_typosquatting"):
            risk_level = typosquatting.get("risk_level")
            if risk_level == "critical":
                score -= 0.45
            elif risk_level == "high":
                score -= 0.35
            elif risk_level == "medium":
                score -= 0.2
        
        # CRITICAL: HTTP-only sites (HTTPS failed) are a major security issue
        if https_failed:
            score -= 0.4  # Heavy penalty for not supporting HTTPS
        
        # === ADVANCED DETECTION PENALTIES ===
        
        # URL Structure Analysis
        if url_structure:
            structure_risk = url_structure.get("structure_risk_score", 0)
            # Normalize to 0-0.3 range
            score -= min(structure_risk / 100 * 0.3, 0.3)
        
        # Content Analysis (NLP)
        if content_analysis:
            content_risk = content_analysis.get("phishing_score", 0)
            # Normalize to 0-0.35 range
            score -= min(content_risk / 100 * 0.35, 0.35)
        
        # === STANDARD CHECKS ===
        
        # SSL issues - only penalize if clearly invalid, not if check failed
        if ssl_analysis.get("security_level") == "none":
            score -= 0.25  # No HTTPS
        elif not ssl_analysis.get("valid") and ssl_analysis.get("security_level") == "low":
            score -= 0.15  # Invalid SSL certificate
        # Don't penalize "unknown" SSL status (connection issues)
        
        # Domain age issues - newer domains are more suspicious
        age_days = domain_analysis.get("age_days")
        if age_days is not None:
            if age_days < 7:
                score -= 0.4  # Very new domain
            elif age_days < 30:
                score -= 0.25
            elif age_days < 90:
                score -= 0.1
        
        # Multiple redirects can indicate phishing
        redirect_count = len(browser_analysis.get("redirect_chain", []))
        if redirect_count > 5:
            score -= 0.3
        elif redirect_count > 3:
            score -= 0.15
        
        # Login forms on suspicious domains (potential phishing)
        if browser_analysis.get("login_forms"):
            # Only penalize if domain is also new or has other issues
            if age_days and age_days < 90:
                score -= 0.3
            elif score < 0.8:  # Already has issues
                score -= 0.2
        
        # Script threats are serious
        script_threats = browser_analysis.get("script_threats", [])
        if script_threats:
            score -= min(len(script_threats) * 0.2, 0.4)
        
        # Suspicious behaviors detected by analysis
        suspicious_count = len(browser_analysis.get("suspicious_behaviors", []))
        if suspicious_count > 0:
            score -= min(suspicious_count * 0.2, 0.5)
        
        # Excessive third-party trackers (minor issue)
        tracker_count = len(browser_analysis.get("third_party_trackers", []))
        if tracker_count > 10:
            score -= 0.05
        
        return max(0.0, min(1.0, score))
    
    def _determine_verdict(self, safety_score: float, browser_analysis: Dict) -> str:
        """Determine final verdict"""
        if safety_score >= 0.7:
            return "safe"
        elif safety_score >= 0.5:
            return "suspicious"
        elif browser_analysis.get("login_forms") and safety_score < 0.5:
            return "phishing"
        else:
            return "malicious"
