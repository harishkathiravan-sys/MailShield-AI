"""
Email Source Parser
Extracts URLs, metadata, and content from raw email HTML/source
Handles Gmail, Outlook, Yahoo formats
"""

import re
import base64
import quopri
from typing import Dict, List, Optional, Tuple
from bs4 import BeautifulSoup
from urllib.parse import urlparse, unquote
from email import message_from_string
from email.header import decode_header
import html as html_module


class EmailSourceParser:
    """Parse raw email source to extract URLs and analyze content"""
    
    def __init__(self):
        # Regex patterns for URL detection
        self.url_pattern = re.compile(
            r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
        )
        
        # Patterns for encoded URLs
        self.encoded_url_patterns = [
            re.compile(r'3D"(https?://[^"]+)"'),  # Quoted-printable encoding
            re.compile(r'=\s*\n\s*3D'),  # Line breaks in encoded URLs
        ]
    
    def parse_email_source(self, raw_email: str) -> Dict:
        """
        Parse raw email source and extract all information
        
        Args:
            raw_email: Complete email source (headers + body)
            
        Returns:
            Dictionary with extracted data
        """
        try:
            # Parse email message
            msg = message_from_string(raw_email)
            
            # Extract headers
            headers = self._extract_headers(msg)
            
            # Extract body (handles multipart)
            body_text, body_html = self._extract_body(msg)
            
            # Extract all URLs from HTML and text
            urls = self._extract_all_urls(body_html, body_text, raw_email)
            
            # Detect hidden/masked URLs
            masked_urls = self._detect_masked_urls(body_html)
            
            # Extract links from HTML <a> tags
            html_links = self._extract_html_links(body_html)
            
            # Analyze email authentication
            auth_results = self._analyze_authentication(headers, raw_email)
            
            # Detect suspicious patterns
            suspicious_patterns = self._detect_suspicious_patterns(
                body_text, body_html, headers, urls
            )
            
            return {
                "success": True,
                "headers": headers,
                "body_text": body_text[:5000],  # Limit to 5000 chars
                "body_html": body_html[:10000] if body_html else "",
                "urls_found": urls,
                "url_count": len(urls),
                "html_links": html_links,
                "masked_urls": masked_urls,
                "authentication": auth_results,
                "suspicious_patterns": suspicious_patterns,
                "sender": headers.get("from", "Unknown"),
                "subject": headers.get("subject", "No Subject"),
                "date": headers.get("date", "Unknown"),
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "urls_found": [],
                "url_count": 0
            }
    
    def _extract_headers(self, msg) -> Dict[str, str]:
        """Extract important email headers"""
        headers = {}
        
        important_headers = [
            'from', 'to', 'subject', 'date', 'message-id',
            'reply-to', 'return-path', 'received-spf', 'dkim-signature',
            'authentication-results', 'received'
        ]
        
        for header in important_headers:
            value = msg.get(header, '')
            if value:
                # Decode header if needed
                if header in ['from', 'to', 'subject']:
                    decoded = decode_header(value)
                    if decoded:
                        text, encoding = decoded[0]
                        if isinstance(text, bytes):
                            value = text.decode(encoding or 'utf-8', errors='ignore')
                        else:
                            value = text
                
                headers[header.lower()] = str(value)
        
        return headers
    
    def _extract_body(self, msg) -> Tuple[str, str]:
        """Extract text and HTML body from email"""
        text_body = ""
        html_body = ""
        
        if msg.is_multipart():
            for part in msg.walk():
                content_type = part.get_content_type()
                content_disposition = str(part.get("Content-Disposition", ""))
                
                # Skip attachments
                if "attachment" in content_disposition:
                    continue
                
                try:
                    payload = part.get_payload(decode=True)
                    if payload:
                        charset = part.get_content_charset() or 'utf-8'
                        decoded = payload.decode(charset, errors='ignore')
                        
                        if content_type == "text/plain":
                            text_body += decoded
                        elif content_type == "text/html":
                            html_body += decoded
                except Exception:
                    continue
        else:
            # Single part email
            try:
                payload = msg.get_payload(decode=True)
                if payload:
                    charset = msg.get_content_charset() or 'utf-8'
                    content = payload.decode(charset, errors='ignore')
                    
                    if msg.get_content_type() == "text/html":
                        html_body = content
                    else:
                        text_body = content
            except Exception:
                pass
        
        # If no text body, extract from HTML
        if not text_body and html_body:
            soup = BeautifulSoup(html_body, 'html.parser')
            text_body = soup.get_text(separator=' ', strip=True)
        
        return text_body, html_body
    
    def _extract_all_urls(self, html: str, text: str, raw: str) -> List[str]:
        """Extract all URLs from email (including encoded ones)"""
        urls = set()
        
        # Extract from HTML links
        if html:
            soup = BeautifulSoup(html, 'html.parser')
            for link in soup.find_all('a', href=True):
                url = link['href']
                if url.startswith('http'):
                    urls.add(url)
        
        # Extract from text using regex
        for match in self.url_pattern.finditer(text):
            urls.add(match.group(0))
        
        # Extract from raw source (catches encoded URLs)
        for match in self.url_pattern.finditer(raw):
            urls.add(match.group(0))
        
        # Decode quoted-printable URLs
        for pattern in self.encoded_url_patterns:
            for match in pattern.finditer(raw):
                try:
                    decoded_url = quopri.decodestring(match.group(0)).decode('utf-8', errors='ignore')
                    url_matches = self.url_pattern.finditer(decoded_url)
                    for url_match in url_matches:
                        urls.add(url_match.group(0))
                except:
                    pass
        
        # Clean up URLs (remove tracking parameters for display)
        cleaned_urls = []
        for url in urls:
            # Decode URL entities
            url = html_module.unescape(url)
            url = unquote(url)
            
            # Remove trailing punctuation
            url = url.rstrip('.,;:!?)')
            
            cleaned_urls.append(url)
        
        return sorted(list(set(cleaned_urls)))
    
    def _extract_html_links(self, html: str) -> List[Dict]:
        """Extract link text and actual URLs from HTML"""
        if not html:
            return []
        
        links = []
        soup = BeautifulSoup(html, 'html.parser')
        
        for link in soup.find_all('a', href=True):
            href = link['href']
            text = link.get_text(strip=True)
            
            if href.startswith('http'):
                links.append({
                    "display_text": text[:200] if text else "(no text)",
                    "actual_url": href,
                    "is_masked": self._is_url_masked(text, href)
                })
        
        return links
    
    def _is_url_masked(self, display_text: str, actual_url: str) -> bool:
        """Check if link text is masking the real URL"""
        # If display text looks like a URL but doesn't match actual URL
        if re.match(r'https?://', display_text):
            display_domain = urlparse(display_text).netloc.lower()
            actual_domain = urlparse(actual_url).netloc.lower()
            
            return display_domain != actual_domain
        
        return False
    
    def _detect_masked_urls(self, html: str) -> List[Dict]:
        """Detect URLs where display text doesn't match actual link"""
        if not html:
            return []
        
        masked = []
        soup = BeautifulSoup(html, 'html.parser')
        
        for link in soup.find_all('a', href=True):
            href = link['href']
            text = link.get_text(strip=True)
            
            # Check if text looks like a URL
            if re.match(r'https?://', text):
                text_domain = urlparse(text).netloc.lower()
                actual_domain = urlparse(href).netloc.lower()
                
                if text_domain != actual_domain and text_domain and actual_domain:
                    masked.append({
                        "displayed": text,
                        "actual": href,
                        "severity": "high",
                        "warning": f"Link displays '{text_domain}' but goes to '{actual_domain}'"
                    })
            
            # Check for other masking techniques
            elif text and len(text) > 10:
                # If display text mentions a brand but URL is different
                brands = ['paypal', 'google', 'amazon', 'microsoft', 'apple', 'facebook', 'bank']
                text_lower = text.lower()
                actual_domain = urlparse(href).netloc.lower()
                
                for brand in brands:
                    if brand in text_lower and brand not in actual_domain:
                        masked.append({
                            "displayed": text[:100],
                            "actual": href,
                            "severity": "medium",
                            "warning": f"Text mentions '{brand}' but links to '{actual_domain}'"
                        })
                        break
        
        return masked
    
    def _analyze_authentication(self, headers: Dict, raw: str) -> Dict:
        """Analyze email authentication (SPF, DKIM, DMARC)"""
        auth = {
            "spf": "not_checked",
            "dkim": "not_checked",
            "dmarc": "not_checked",
            "overall": "unknown"
        }
        
        # Check SPF
        spf = headers.get("received-spf", "").lower()
        if "pass" in spf:
            auth["spf"] = "pass"
        elif "fail" in spf:
            auth["spf"] = "fail"
        elif "softfail" in spf:
            auth["spf"] = "softfail"
        
        # Check DKIM
        if "dkim-signature" in headers:
            auth["dkim"] = "signed"
        
        # Check authentication results (Gmail format)
        auth_results = headers.get("authentication-results", "").lower()
        if auth_results:
            if "spf=pass" in auth_results:
                auth["spf"] = "pass"
            elif "spf=fail" in auth_results:
                auth["spf"] = "fail"
            
            if "dkim=pass" in auth_results:
                auth["dkim"] = "pass"
            elif "dkim=fail" in auth_results:
                auth["dkim"] = "fail"
            
            if "dmarc=pass" in auth_results:
                auth["dmarc"] = "pass"
            elif "dmarc=fail" in auth_results:
                auth["dmarc"] = "fail"
        
        # Determine overall status
        if auth["spf"] == "pass" and auth["dkim"] in ["pass", "signed"] and auth["dmarc"] == "pass":
            auth["overall"] = "excellent"
        elif auth["spf"] == "pass" and auth["dkim"] in ["pass", "signed"]:
            auth["overall"] = "good"
        elif auth["spf"] in ["fail", "softfail"] or auth["dkim"] == "fail":
            auth["overall"] = "failed"
        else:
            auth["overall"] = "unknown"
        
        return auth
    
    def _detect_suspicious_patterns(
        self, 
        text: str, 
        html: str, 
        headers: Dict,
        urls: List[str]
    ) -> List[str]:
        """Detect suspicious patterns in email"""
        patterns = []
        
        combined_text = (text + " " + html).lower()
        
        # Check for suspicious sender
        sender = headers.get("from", "").lower()
        if "noreply" in sender or "no-reply" in sender:
            patterns.append("Sender uses 'noreply' address (common in phishing)")
        
        # Check for reply-to mismatch
        reply_to = headers.get("reply-to", "").lower()
        if reply_to and reply_to != sender:
            patterns.append(f"Reply-To address differs from sender")
        
        # Check for URL count
        if len(urls) > 10:
            patterns.append(f"Unusually high number of URLs ({len(urls)})")
        
        # Check for URL shorteners
        shorteners = ['bit.ly', 'tinyurl', 't.co', 'goo.gl', 'ow.ly']
        for url in urls:
            if any(shortener in url.lower() for shortener in shorteners):
                patterns.append("Contains URL shortener (hides real destination)")
                break
        
        # Check for suspicious keywords
        suspicious_keywords = {
            'urgent': 'Uses urgency tactics',
            'suspended': 'Mentions account suspension',
            'verify': 'Requests account verification',
            'confirm': 'Requests confirmation',
            'unusual activity': 'Claims unusual activity',
            'limited time': 'Uses time pressure',
            'act now': 'Demands immediate action',
            'click here': 'Generic "click here" link',
            'reset password': 'Password reset request',
            'update payment': 'Payment update request',
            'gift card': 'Mentions gift cards (common scam)',
            'congratulations': 'Prize/reward notification',
        }
        
        for keyword, description in suspicious_keywords.items():
            if keyword in combined_text:
                patterns.append(description)
        
        # Check for hidden text (HTML only)
        if html:
            soup = BeautifulSoup(html, 'html.parser')
            
            # Hidden divs
            hidden = soup.find_all(style=re.compile(r'display\s*:\s*none', re.I))
            if len(hidden) > 3:
                patterns.append(f"Contains {len(hidden)} hidden elements")
            
            # Tiny/invisible text
            tiny_text = soup.find_all(style=re.compile(r'font-size\s*:\s*[0-2]px', re.I))
            if tiny_text:
                patterns.append("Contains invisible text (font-size: 0-2px)")
        
        return patterns
