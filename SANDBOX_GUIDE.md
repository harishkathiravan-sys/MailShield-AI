# 🛡️ Sandbox URL Analysis Guide

## Where is the Sandbox Feature?

The **Sandbox Environment** that checks URLs, SSL certificates, and safety is fully integrated into the application. Here's how to use it:

---

## 📍 Step-by-Step Guide

### Step 1: Analyze an Email
1. Go to **http://localhost:5173/analyze**
2. Click **"Load Demo Email"** (or paste your own suspicious email)
3. Click **"Analyze Email"**

### Step 2: Find Extracted URLs
On the results page, scroll down to the **"Extracted URLs"** section.

You'll see:
- A list of all URLs found in the email
- An **"Analyze in Sandbox"** button at the top

### Step 3: Click "Analyze in Sandbox"
When you click this button, the system will:
- ✅ Open each URL in an **isolated headless browser** (Playwright/Chromium)
- ✅ Check **SSL certificates** (validity, issuer, expiration)
- ✅ Perform **WHOIS domain lookup** (age, registrar, country)
- ✅ Track **redirect chains** (HTTP 301/302/307/308)
- ✅ Detect **login forms** (phishing indicator)
- ✅ Analyze **JavaScript** threats
- ✅ Monitor **cookies and trackers**
- ✅ Capture **screenshots**
- ✅ Generate a **safety score** (0-1)

**Note:** This takes 5-15 seconds per URL as it's doing REAL browser automation!

### Step 4: View Sandbox Reports
After analysis completes:
- Each URL will have a **"View Report →"** button
- Click it to see the **detailed sandbox report**

---

## 🔍 What You'll See in the Sandbox Report

### 1. **Security Assessment**
- Overall Safety Score (0-100%)
- Final Verdict: Safe / Suspicious / Phishing / Malicious
- Risk badge with color coding

### 2. **SSL Certificate Analysis**
- ✅ Certificate Valid: Yes/No
- Issuer (e.g., "Let's Encrypt", "DigiCert")
- Security Level (high/medium/low)
- Expiration Date

### 3. **Domain Reputation**
- Domain Age in days
- ⚠️ Warning if domain is < 30 days old (phishing indicator!)
- Registrar information
- Country of registration
- Creation date

### 4. **Redirect Chain Analysis** (if any)
- Shows each redirect step
- HTTP status codes (301, 302, etc.)
- From → To URLs
- Final destination URL

### 5. **Login Forms Detected** (CRITICAL for Phishing!)
- ⚠️ Red warning if login forms found
- Form fields (username, password, email)
- Form action URLs
- "Do not enter sensitive information" warning

### 6. **Script Analysis**
- List of all scripts loaded
- ⚠️ Threats detected:
  - Crypto miners
  - Obfuscated JavaScript
  - Keyloggers

### 7. **Cookie & Tracking Analysis**
- Total cookies set
- Tracking cookies count
- Third-party trackers (Google Analytics, Facebook Pixel, etc.)

### 8. **Suspicious Behaviors**
- Auto-download attempts
- Suspicious redirects
- Credential harvesting scripts

### 9. **Page Information**
- Page title
- Content preview
- Analysis execution time

---

## 🎯 Example: Demo Email Analysis

The pre-loaded demo email contains the URL:
```
http://verify-paypal-secure-login.xyz/account/verify
```

When you run sandbox analysis, you'll see:

**Expected Results:**
- ✅ **SSL**: Invalid (no HTTPS)
- ✅ **Domain Age**: Very new (< 30 days) - RED FLAG! 🚩
- ✅ **Verdict**: Phishing/Malicious
- ✅ **Login Forms**: Detected (credential harvesting attempt)
- ✅ **Safety Score**: < 30% (DANGEROUS)

---

## 🖥️ UI Location Reference

```
Homepage (/)
    ↓
Analyze Page (/analyze)
    ↓ [Click "Analyze Email"]
Results Page (/results/:id)
    ↓ [Scroll to "Extracted URLs" section]
    ↓ [Click "Analyze in Sandbox" button]
    ↓ [Wait for analysis...]
    ↓ [Click "View Report →" on any URL]
Sandbox Report Page (/sandbox-report/:id)
    ↓ [See complete security analysis]
```

---

## 💡 Tips

1. **Be Patient**: Sandbox analysis takes 5-15 seconds per URL because it's running a REAL headless browser
2. **Multiple URLs**: The system analyzes all URLs in parallel for efficiency
3. **Fresh Container**: Each URL is analyzed in an isolated environment
4. **No Risk**: URLs are never executed on your machine - only in the sandbox

---

## 🔧 Behind the Scenes

When you click "Analyze in Sandbox", here's what happens:

1. **Backend receives URLs** via `/api/sandbox/batch-analyze` endpoint
2. **Playwright launches** Chromium in headless mode
3. **Browser navigates** to the URL (with 30-second timeout)
4. **System monitors**:
   - Network requests
   - Redirects
   - Form submissions
   - Scripts loading
   - Cookies being set
5. **SSL check** runs via Python's `ssl` library
6. **WHOIS lookup** queries domain information
7. **Screenshot captured** for visual reference
8. **Safety score calculated** based on all factors
9. **Report saved** to database
10. **Results returned** to frontend

---

## ✅ Verification

To verify the sandbox is working:

1. **Check Backend Logs**: You should see Playwright messages like:
   ```
   Chromium 121.0.6167.57 downloaded
   ```

2. **API Response**: The `/api/sandbox/analyze` endpoint returns full analysis data

3. **Database**: Sandbox reports are stored in `mailshield.db`

---

## 🚨 Common Questions

**Q: I don't see the "Analyze in Sandbox" button**
- Make sure your email contains URLs
- Check that the email has been analyzed first

**Q: The analysis is taking a long time**
- This is normal! Real browser automation takes 10-30 seconds
- The system is actually opening the URL and analyzing behavior

**Q: Can I analyze URLs without an email?**
- Currently, URLs must be extracted from an email first
- You can paste an email with just a URL in the body

**Q: Is it safe to analyze malicious URLs?**
- Yes! The sandbox runs in an isolated headless browser
- No actual execution happens on your machine
- It's designed specifically for safe malicious URL analysis

---

## 🎉 You're All Set!

The sandbox feature is **fully functional** and ready to use at:
👉 **http://localhost:5173**

Start with the demo email to see it in action!
