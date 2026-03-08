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
                "domain_age_display": domain_analysis.get("age_display", "Unknown"),
                "domain_registrar": domain_analysis.get("registrar", "Data Unavailable"),
                "domain_country": domain_analysis.get("country", "Data Unavailable"),
                "domain_creation_date": domain_analysis.get("creation_date", "Data Unavailable"),
                "domain_status": domain_analysis.get("status", "Unknown"),
                "domain_organization": domain_analysis.get("organization"),
                "domain_name_servers": domain_analysis.get("name_servers", []),
                "domain_data_available": domain_analysis.get("data_available", False),
                
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
                "page_metadata": browser_analysis.get("page_metadata", {}),
                "detected_scripts": browser_analysis.get("scripts", []),
                "script_threats": browser_analysis.get("script_threats", []),
                "login_forms_detected": browser_analysis.get("login_forms", False),
                "form_fields": browser_analysis.get("form_fields", []),
                "form_actions": browser_analysis.get("form_actions", []),
                
                # Enhanced cookie information
                "cookies_set": browser_analysis.get("cookies", []),
                "total_cookies": browser_analysis.get("total_cookies", 0),
                "tracking_cookies": browser_analysis.get("tracking_cookies", 0),
                "advertising_cookies": browser_analysis.get("advertising_cookies", 0),
                "analytics_cookies": browser_analysis.get("analytics_cookies", 0),
                "functional_cookies": browser_analysis.get("functional_cookies", 0),
                "session_cookies": browser_analysis.get("session_cookies", 0),
                "persistent_cookies": browser_analysis.get("persistent_cookies", 0),
                "third_party_cookies": browser_analysis.get("third_party_cookies", 0),
                "tracking_cookie_details": browser_analysis.get("tracking_cookie_details", []),
                "advertising_cookie_details": browser_analysis.get("advertising_cookie_details", []),
                "analytics_cookie_details": browser_analysis.get("analytics_cookie_details", []),
                
                # Enhanced tracking information
                "third_party_trackers": browser_analysis.get("third_party_trackers", []),
                "analytics_services": browser_analysis.get("analytics_services", []),
                "ad_networks": browser_analysis.get("ad_networks", []),
                "social_trackers": browser_analysis.get("social_trackers", []),
                
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
        """Analyze domain information using WHOIS with improved data extraction"""
        try:
            # Clean domain (remove www., port, path)
            clean_domain = domain.lower().replace('www.', '').split(':')[0].split('/')[0]
            
            # Attempt WHOIS lookup
            w = whois.whois(clean_domain)
            
            # Extract creation date (handle list or single value)
            creation_date = None
            if hasattr(w, 'creation_date') and w.creation_date:
                if isinstance(w.creation_date, list):
                    creation_date = w.creation_date[0] if w.creation_date[0] else None
                else:
                    creation_date = w.creation_date
            
            # Calculate domain age
            age_days = None
            age_display = "Unknown"
            if creation_date:
                try:
                    # Handle timezone-aware datetime objects
                    if hasattr(creation_date, 'tzinfo') and creation_date.tzinfo is not None:
                        creation_date = creation_date.replace(tzinfo=None)
                    
                    age_days = (datetime.now() - creation_date).days
                    years = age_days // 365
                    months = (age_days % 365) // 30
                    
                    if years >= 1:
                        age_display = f"{years} year{'s' if years != 1 else ''}"
                        if months > 0:
                            age_display += f", {months} month{'s' if months != 1 else ''}"
                    elif months >= 1:
                        age_display = f"{months} month{'s' if months != 1 else ''}"
                    else:
                        age_display = f"{age_days} day{'s' if age_days != 1 else ''}"
                except Exception as e:
                    age_display = f"Calculation Error: {str(e)[:30]}"
            
            # Extract registrar (handle various formats)
            registrar = "Unknown"
            if hasattr(w, 'registrar') and w.registrar:
                if isinstance(w.registrar, list):
                    registrar = w.registrar[0] if w.registrar else "Unknown"
                else:
                    registrar = str(w.registrar)
                # Clean up registrar name
                if registrar and registrar != "Unknown":
                    # Remove common suffixes for cleaner display
                    registrar = registrar.replace(', LLC', '').replace(' LLC', '').replace(', Inc.', '').strip()[:50]
            
            # Extract country
            country = "Unknown"
            if hasattr(w, 'country') and w.country:
                if isinstance(w.country, list):
                    country = w.country[0] if w.country else "Unknown"
                else:
                    country = str(w.country)
            
            # Extract registrant organization (additional info)
            organization = None
            if hasattr(w, 'org') and w.org:
                organization = str(w.org) if not isinstance(w.org, list) else (w.org[0] if w.org else None)
            
            # Extract name servers
            name_servers = []
            if hasattr(w, 'name_servers') and w.name_servers:
                if isinstance(w.name_servers, list):
                    name_servers = [str(ns).lower() for ns in w.name_servers[:3]]  # Limit to 3
                else:
                    name_servers = [str(w.name_servers).lower()]
            
            # Extract status
            status = []
            if hasattr(w, 'status') and w.status:
                if isinstance(w.status, list):
                    status = [str(s).lower() for s in w.status if s]
                else:
                    status = [str(w.status).lower()]
            
            # Determine domain status summary
            status_summary = "Active"
            if any('clienthold' in s for s in status):
                status_summary = "On Hold"
            elif any('pendingdelete' in s for s in status):
                status_summary = "Pending Deletion"
            elif any('redemption' in s for s in status):
                status_summary = "Redemption Period"
            
            return {
                "age_days": age_days,
                "age_display": age_display,
                "creation_date": creation_date.strftime("%Y-%m-%d") if creation_date else "Unknown",
                "registrar": registrar,
                "country": country,
                "organization": organization,
                "name_servers": name_servers,
                "status": status_summary,
                "raw_status": status,
                "data_available": registrar != "Unknown" or country != "Unknown" or age_days is not None
            }
                
        except Exception as e:
            # Return structured "no data available" response
            error_msg = str(e).lower()
            
            # Provide more specific error messages
            if "no match" in error_msg or "not found" in error_msg:
                reason = "Domain not registered or WHOIS data unavailable"
            elif "timeout" in error_msg:
                reason = "WHOIS server timeout"
            elif "connection" in error_msg:
                reason = "Cannot connect to WHOIS server"
            else:
                reason = "WHOIS lookup failed"
            
            return {
                "age_days": None,
                "age_display": "Data Unavailable",
                "creation_date": "Data Unavailable",
                "registrar": "Data Unavailable",
                "country": "Data Unavailable",
                "organization": None,
                "name_servers": [],
                "status": "Unknown",
                "raw_status": [],
                "data_available": False,
                "error": reason
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
                
                # Get HTTP response details
                http_status = None
                server_info = None
                content_type = None
                
                async def capture_main_response(response):
                    nonlocal http_status, server_info, content_type
                    if response.url == final_url or response.url.rstrip('/') == final_url.rstrip('/'):
                        http_status = response.status
                        server_info = response.headers.get('server', 'Unknown')
                        content_type = response.headers.get('content-type', 'Unknown')
                
                page.on("response", capture_main_response)
                
                # Get page title
                page_title = await page.title()
                
                # Get page content
                content = await page.content()
                soup = BeautifulSoup(content, 'html.parser')
                
                # Extract text snippet with multiple fallback strategies
                content_snippet = ""
                
                # Strategy 1: Try to get meaningful content from specific tags
                main_content = soup.find('main') or soup.find('article') or soup.find('div', class_=['content', 'main-content', 'page-content'])
                if main_content:
                    text_content = main_content.get_text()
                    content_snippet = ' '.join(text_content.split())[:500]
                
                # Strategy 2: Extract from paragraphs if main content not found
                if not content_snippet or len(content_snippet) < 50:
                    paragraphs = soup.find_all('p')
                    if paragraphs:
                        para_texts = [p.get_text().strip() for p in paragraphs[:5] if p.get_text().strip()]
                        content_snippet = ' '.join(para_texts)[:500]
                
                # Strategy 3: Extract from headings if no paragraphs
                if not content_snippet or len(content_snippet) < 30:
                    headings = soup.find_all(['h1', 'h2', 'h3'])
                    if headings:
                        heading_texts = [h.get_text().strip() for h in headings[:5] if h.get_text().strip()]
                        content_snippet = ' | '.join(heading_texts)[:500]
                
                # Strategy 4: Get all text as last resort
                if not content_snippet:
                    text_content = soup.get_text()
                    content_snippet = ' '.join(text_content.split())[:500]
                
                # If still no content, provide URL information
                if not content_snippet or content_snippet.strip() == '':
                    parsed_url = urlparse(final_url)
                    content_snippet = f"URL: {final_url} | Domain: {parsed_url.netloc} | Path: {parsed_url.path or '/'}"
                
                # Extract comprehensive page metadata
                page_metadata = {}
                
                # Add HTTP response information
                page_metadata['http_status'] = http_status or 'Unknown'
                page_metadata['server'] = server_info or 'Unknown'
                page_metadata['content_type'] = content_type or 'Unknown'
                page_metadata['final_url'] = final_url
                page_metadata['url_scheme'] = urlparse(final_url).scheme.upper()
                page_metadata['domain'] = urlparse(final_url).netloc
                
                # Meta tags
                meta_description = soup.find('meta', attrs={'name': 'description'})
                meta_keywords = soup.find('meta', attrs={'name': 'keywords'})
                meta_author = soup.find('meta', attrs={'name': 'author'})
                meta_viewport = soup.find('meta', attrs={'name': 'viewport'})
                
                page_metadata['description'] = meta_description.get('content', 'N/A') if meta_description else 'N/A'
                page_metadata['keywords'] = meta_keywords.get('content', 'N/A') if meta_keywords else 'N/A'
                page_metadata['author'] = meta_author.get('content', 'N/A') if meta_author else 'N/A'
                page_metadata['viewport'] = meta_viewport.get('content', 'N/A') if meta_viewport else 'N/A'
                
                # Open Graph data
                og_title = soup.find('meta', property='og:title')
                og_description = soup.find('meta', property='og:description')
                og_image = soup.find('meta', property='og:image')
                og_type = soup.find('meta', property='og:type')
                
                page_metadata['og_title'] = og_title.get('content', 'N/A') if og_title else 'N/A'
                page_metadata['og_description'] = og_description.get('content', 'N/A') if og_description else 'N/A'
                page_metadata['og_image'] = og_image.get('content', 'N/A') if og_image else 'N/A'
                page_metadata['og_type'] = og_type.get('content', 'N/A') if og_type else 'N/A'
                
                # Improve page title with fallbacks
                if not page_title or page_title.strip() == '':
                    # Try Open Graph title
                    if page_metadata['og_title'] != 'N/A':
                        page_title = page_metadata['og_title']
                    # Try h1 tag
                    elif soup.find('h1'):
                        page_title = soup.find('h1').get_text().strip()[:100]
                    # Use domain as last resort
                    else:
                        page_title = f"{urlparse(final_url).netloc} - Page"
                
                # Favicon
                favicon = soup.find('link', rel='icon') or soup.find('link', rel='shortcut icon')
                page_metadata['favicon'] = favicon.get('href', 'N/A') if favicon else 'N/A'
                
                # Language
                html_tag = soup.find('html')
                page_metadata['language'] = html_tag.get('lang', 'N/A') if html_tag else 'N/A'
                
                # Character encoding
                charset = soup.find('meta', attrs={'charset': True})
                if not charset:
                    charset = soup.find('meta', attrs={'http-equiv': 'Content-Type'})
                    if charset:
                        page_metadata['charset'] = charset.get('content', 'N/A').split('charset=')[-1] if 'charset=' in charset.get('content', '') else 'N/A'
                    else:
                        page_metadata['charset'] = 'N/A'
                else:
                    page_metadata['charset'] = charset.get('charset', 'N/A')
                
                # Count resources
                images = soup.find_all('img')
                stylesheets = soup.find_all('link', rel='stylesheet')
                scripts_local = soup.find_all('script', src=True)
                
                page_metadata['image_count'] = len(images)
                page_metadata['stylesheet_count'] = len(stylesheets)
                page_metadata['script_count'] = len(scripts_local)
                
                # Detect frameworks and libraries
                detected_technologies = []
                html_content_lower = content.lower()
                
                if 'react' in html_content_lower or 'reactdom' in html_content_lower:
                    detected_technologies.append('React')
                if 'vue.js' in html_content_lower or 'vue.min.js' in html_content_lower:
                    detected_technologies.append('Vue.js')
                if 'angular' in html_content_lower:
                    detected_technologies.append('Angular')
                if 'jquery' in html_content_lower:
                    detected_technologies.append('jQuery')
                if 'bootstrap' in html_content_lower:
                    detected_technologies.append('Bootstrap')
                if 'wordpress' in html_content_lower or 'wp-content' in html_content_lower:
                    detected_technologies.append('WordPress')
                
                page_metadata['technologies'] = detected_technologies if detected_technologies else ['None detected']
                
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
                
                # Get cookies with detailed analysis
                cookies = await context.cookies()
                parsed_main = urlparse(final_url)
                main_domain = parsed_main.netloc
                
                # Categorize cookies
                cookie_details = []
                tracking_cookies = []
                advertising_cookies = []
                analytics_cookies = []
                functional_cookies = []
                session_cookies = []
                persistent_cookies = []
                third_party_cookies = []
                
                # Known tracking/advertising domains
                tracking_domains = ['doubleclick', 'google-analytics', 'googletagmanager', 'facebook', 'fbcdn', 
                                   'twitter', 'linkedin', 'pinterest', 'analytics', 'tracking', 'ads', 'advertisement']
                
                for cookie in cookies:
                    cookie_domain = cookie.get('domain', '').lstrip('.')
                    cookie_name = cookie.get('name', '').lower()
                    
                    # Determine cookie type
                    is_third_party = cookie_domain not in main_domain and main_domain not in cookie_domain
                    is_session = cookie.get('expires', -1) == -1
                    
                    # Calculate expiry duration
                    expiry_info = "Session"
                    if not is_session and cookie.get('expires'):
                        expiry_timestamp = cookie.get('expires')
                        expiry_date = datetime.fromtimestamp(expiry_timestamp)
                        days_until_expiry = (expiry_date - datetime.now()).days
                        if days_until_expiry > 0:
                            if days_until_expiry < 7:
                                expiry_info = f"{days_until_expiry} days"
                            elif days_until_expiry < 365:
                                expiry_info = f"{days_until_expiry // 30} months"
                            else:
                                expiry_info = f"{days_until_expiry // 365} years"
                        else:
                            expiry_info = "Expired"
                    
                    cookie_info = {
                        'name': cookie.get('name'),
                        'domain': cookie_domain,
                        'expiry': expiry_info,
                        'secure': cookie.get('secure', False),
                        'httpOnly': cookie.get('httpOnly', False),
                        'sameSite': cookie.get('sameSite', 'None'),
                        'is_third_party': is_third_party,
                        'is_session': is_session
                    }
                    
                    cookie_details.append(cookie_info)
                    
                    # Categorize by type
                    if is_session:
                        session_cookies.append(cookie_info)
                    else:
                        persistent_cookies.append(cookie_info)
                    
                    if is_third_party:
                        third_party_cookies.append(cookie_info)
                    
                    # Categorize by purpose
                    if any(keyword in cookie_name for keyword in ['_ga', '_gid', '_gat', 'analytics', 'utm_', '_fbp']):
                        analytics_cookies.append(cookie_info)
                    elif any(keyword in cookie_name for keyword in ['ad', 'doubleclick', 'adsense', '_gcl_', 'idam']):
                        advertising_cookies.append(cookie_info)
                    elif any(keyword in cookie_name for keyword in ['track', 'visitor', 'uid', 'uuid']):
                        tracking_cookies.append(cookie_info)
                    else:
                        functional_cookies.append(cookie_info)
                
                # Identify third-party trackers and analytics services
                third_party_trackers = []
                analytics_services = []
                ad_networks = []
                social_trackers = []
                
                for req in external_requests:
                    req_url = req['url']
                    req_domain = urlparse(req_url).netloc
                    
                    if req_domain != main_domain:
                        # Analytics services
                        if 'google-analytics' in req_domain or 'googletagmanager' in req_domain:
                            analytics_services.append('Google Analytics')
                        elif 'facebook' in req_domain or 'fbcdn' in req_domain:
                            social_trackers.append('Facebook Pixel')
                        elif 'linkedin' in req_domain:
                            social_trackers.append('LinkedIn Insight')
                        elif 'twitter' in req_domain:
                            social_trackers.append('Twitter Analytics')
                        elif 'hotjar' in req_domain:
                            analytics_services.append('Hotjar')
                        elif 'mixpanel' in req_domain:
                            analytics_services.append('Mixpanel')
                        
                        # Ad networks
                        if 'doubleclick' in req_domain or 'adsense' in req_domain:
                            ad_networks.append('Google Ads')
                        elif 'advertising.com' in req_domain:
                            ad_networks.append('Advertising.com')
                        
                        # General trackers
                        if any(tracker in req_domain for tracker in tracking_domains):
                            if req_domain not in third_party_trackers:
                                third_party_trackers.append(req_domain)
                
                # Remove duplicates
                third_party_trackers = list(set(third_party_trackers))
                analytics_services = list(set(analytics_services))
                ad_networks = list(set(ad_networks))
                social_trackers = list(set(social_trackers))
                
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
                    "page_metadata": page_metadata,
                    "scripts": script_urls[:20],  # Limit to first 20
                    "script_threats": script_threats,
                    "login_forms": login_forms,
                    "form_fields": form_fields,
                    "form_actions": form_actions,
                    
                    # Enhanced cookie information
                    "cookies": cookie_details,
                    "total_cookies": len(cookies),
                    "tracking_cookies": len(tracking_cookies),
                    "advertising_cookies": len(advertising_cookies),
                    "analytics_cookies": len(analytics_cookies),
                    "functional_cookies": len(functional_cookies),
                    "session_cookies": len(session_cookies),
                    "persistent_cookies": len(persistent_cookies),
                    "third_party_cookies": len(third_party_cookies),
                    "tracking_cookie_details": tracking_cookies,
                    "advertising_cookie_details": advertising_cookies,
                    "analytics_cookie_details": analytics_cookies,
                    
                    # Enhanced tracking information
                    "third_party_trackers": third_party_trackers,
                    "analytics_services": analytics_services,
                    "ad_networks": ad_networks,
                    "social_trackers": social_trackers,
                    
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
