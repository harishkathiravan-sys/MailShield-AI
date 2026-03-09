import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, AlertTriangle, CheckCircle, XCircle, Mail, ExternalLink, Shield, Link as LinkIcon, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import axios from 'axios';

const API_URL = 'http://localhost:8000';

const EmailSourceAnalyzer = () => {
  const [loading, setLoading] = useState(false);
  const [emailSource, setEmailSource] = useState('');
  const [results, setResults] = useState(null);

  const handleAnalyze = async () => {
    if (!emailSource.trim()) {
      toast.error('Please paste email source');
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      const response = await axios.post(`${API_URL}/api/analysis/analyze-source`, {
        raw_email_source: emailSource
      });

      setResults(response.data);
      toast.success('Analysis complete!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(error.response?.data?.detail || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadDemo = () => {
    setEmailSource(`Delivered-To: user@example.com
Received: by 2002:a05:6000:7094:b0:436:2fb3:224e with SMTP id bo9csp1850730wrb;
        Tue, 10 Feb 2026 07:50:13 -0800 (PST)
From: PayPal Security <security@paypal-verify-account.xyz>
To: user@example.com
Subject: URGENT: Verify Your Account Now
Date: Tue, 10 Feb 2026 07:50:00 -0800
Message-ID: <urgent-verify@paypal-verify-account.xyz>
Content-Type: text/html; charset="UTF-8"

<html>
<body>
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #003087;">Account Verification Required</h2>
  
  <p>Dear Valued Customer,</p>
  
  <p>Your PayPal account has been temporarily limited due to unusual activity. To restore full access, please verify your identity immediately.</p>
  
  <p><strong>What you need to do:</strong></p>
  <ul>
    <li>Click the link below to verify</li>
    <li>Log in with your credentials</li>
    <li>Confirm your identity</li>
  </ul>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="https://paypal-secure-login-verify.xyz/restore-account" 
       style="background: #0070ba; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
      Verify Account Now
    </a>
  </div>
  
  <p style="color: #cc0000;">⚠️ If you don't verify within 24 hours, your account will be permanently suspended.</p>
  
  <p>This is a real link: <a href="https://evil-phishing-site.xyz/steal-credentials">https://www.paypal.com/security/verify</a></p>
  
  <p style="color: #666; font-size: 12px;">
    PayPal Security Team<br>
    Do not reply to this email.
  </p>
</div>
</body>
</html>`);
    toast.success('Demo email source loaded');
  };

  const getVerdictColor = (verdict) => {
    const colors = {
      'SAFE': 'text-green-500',
      'SUSPICIOUS': 'text-yellow-500',
      'HIGH_RISK': 'text-orange-500',
      'DANGEROUS': 'text-red-500'
    };
    return colors[verdict] || 'text-gray-400';
  };

  const getVerdictIcon = (verdict) => {
    if (verdict === 'SAFE') return <CheckCircle className="w-8 h-8 text-green-500" />;
    if (verdict === 'SUSPICIOUS') return <AlertTriangle className="w-8 h-8 text-yellow-500" />;
    if (verdict === 'HIGH_RISK') return <AlertTriangle className="w-8 h-8 text-orange-500" />;
    return <XCircle className="w-8 h-8 text-red-500" />;
  };

  const getRiskColor = (score) => {
    if (score >= 75) return 'bg-red-500';
    if (score >= 50) return 'bg-orange-500';
    if (score >= 25) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Analyzing email source and extracting URLs..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-gray-800 to-gray-600">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Email Source Analyzer
          </h1>
          <p className="text-xl text-gray-400 mb-4">
            Paste the complete email source to extract hidden URLs and detect phishing
          </p>
          
          {/* Instructions */}
          <div className="cyber-card max-w-3xl mx-auto mb-8 text-left">
            <h3 className="text-lg font-bold mb-3 flex items-center">
              <Mail className="w-5 h-5 mr-2 text-gray-900" />
              How to get email source:
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-100 p-3 rounded-lg">
                <p className="font-semibold mb-1 text-gray-900">Gmail</p>
                <p className="text-gray-600">Open email → ⋮ (three dots) → "Show original" → Copy to clipboard</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-lg">
                <p className="font-semibold mb-1 text-gray-900">Outlook</p>
                <p className="text-gray-600">Open email → ⋯ (More actions) → "View message source"</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-lg">
                <p className="font-semibold mb-1 text-gray-900">Yahoo</p>
                <p className="text-gray-600">Open email → More → "View raw message"</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Input Area */}
        {!results && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="cyber-card mb-8"
          >
            <label className="block text-sm font-medium mb-2">Email Source</label>
            <textarea
              value={emailSource}
              onChange={(e) => setEmailSource(e.target.value)}
              placeholder="Paste complete email source here (including headers)...

Example:
From: sender@example.com
To: recipient@example.com
Subject: Email Subject
Date: Mon, 1 Jan 2026 10:00:00
...
"
              className="w-full h-96 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-mono text-sm focus:border-gray-600 focus:ring-1 focus:ring-gray-400 outline-none resize-none"
            />

            <div className="flex gap-4 mt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAnalyze}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gray-900 rounded-lg text-white font-semibold hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Analyze Email Source
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={loadDemo}
                className="px-6 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white hover:bg-gray-800 transition-colors"
              >
                Load Demo
              </motion.button>

              {results && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setResults(null); setEmailSource(''); }}
                  className="px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  Clear
                </motion.button>
              )}
            </div>
          </motion.div>
        )}

        {/* Results */}
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Safety Recommendation - First Box */}
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-2 border-yellow-500/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-yellow-400 mb-2">🛡️ Safety Tips</h3>
                  <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-300">
                    <p>⚠️ Don't click suspicious links</p>
                    <p>🚫 Never share passwords via email</p>
                    <p>✓ Verify sender through official channels</p>
                    <p>📧 Report suspicious emails immediately</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Overall Verdict */}
            <div className="cyber-card">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  {getVerdictIcon(results.overall_verdict)}
                  <div>
                    <h2 className={`text-3xl font-bold ${getVerdictColor(results.overall_verdict)}`}>
                      {results.overall_verdict.replace('_', ' ')}
                    </h2>
                    <p className="text-gray-400">Overall Risk Assessment</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold">{results.overall_risk_score}/100</div>
                  <div className="text-sm text-gray-400">Risk Score</div>
                </div>
              </div>

              {/* Risk Score Bar */}
              <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden mb-6">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${results.overall_risk_score}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full ${getRiskColor(results.overall_risk_score)}`}
                />
              </div>

              {/* One-Word Safety Verdict */}
              <div className="border-t border-gray-300 pt-4">
                <div className="text-center">
                  <div className="text-sm text-gray-400 mb-2">Safety Verdict</div>
                  <div className={`text-5xl font-black ${results.overall_risk_score < 30 ? 'text-green-400' : results.overall_risk_score < 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {results.overall_risk_score < 30 ? 'SAFE' : results.overall_risk_score < 60 ? 'CAUTION' : 'UNSAFE'}
                  </div>
                </div>
              </div>
            </div>

            {/* Email Info & Authentication Combined */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Email Basic Info */}
              <div className="cyber-card">
                <h3 className="text-lg font-bold mb-3">Email Details</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-400">From: </span>
                    <span className="font-mono">{results.sender}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Subject: </span>
                    <span className="font-semibold">{results.subject}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Date: </span>
                    <span>{results.date}</span>
                  </div>
                </div>
              </div>

              {/* Authentication */}
              <div className="cyber-card">
                <h3 className="text-lg font-bold mb-3 flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-gray-900" />
                  Authentication
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  <div className="bg-gray-100 p-2 rounded text-center">
                    <div className="text-xs text-gray-600 mb-1">SPF</div>
                    <div className={`font-bold text-xs uppercase ${results.authentication.spf === 'pass' ? 'text-green-600' : 'text-red-600'}`}>
                      {results.authentication.spf === 'pass' ? '✓' : '✗'}
                    </div>
                  </div>
                  <div className="bg-gray-100 p-2 rounded text-center">
                    <div className="text-xs text-gray-600 mb-1">DKIM</div>
                    <div className={`font-bold text-xs uppercase ${results.authentication.dkim === 'pass' ? 'text-green-600' : 'text-red-600'}`}>
                      {results.authentication.dkim === 'pass' ? '✓' : '✗'}
                    </div>
                  </div>
                  <div className="bg-gray-100 p-2 rounded text-center">
                    <div className="text-xs text-gray-600 mb-1">DMARC</div>
                    <div className={`font-bold text-xs uppercase ${results.authentication.dmarc === 'pass' ? 'text-green-600' : 'text-red-600'}`}>
                      {results.authentication.dmarc === 'pass' ? '✓' : '✗'}
                    </div>
                  </div>
                  <div className="bg-gray-100 p-2 rounded text-center">
                    <div className="text-xs text-gray-600 mb-1">Status</div>
                    <div className={`font-bold text-xs uppercase ${results.authentication.overall === 'excellent' || results.authentication.overall === 'good' ? 'text-green-600' : 'text-red-600'}`}>
                      {results.authentication.overall === 'excellent' || results.authentication.overall === 'good' ? '✓' : '✗'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* URL Location Details - Separate Column */}
            {results.url_analyses && results.url_analyses.length > 0 && results.url_analyses.some(a => a.ip_reputation?.ip_address) && (
              <div className="cyber-card">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-gray-900" />
                  URL Location Details
                </h3>
                <div className="space-y-3">
                  {results.url_analyses.filter(a => a.ip_reputation?.ip_address).map((analysis, idx) => (
                    <div key={idx} className="bg-gray-100 p-4 rounded-lg">
                      <div className="mb-2">
                        <div className="text-xs text-gray-500 mb-1">URL</div>
                        <div className="font-mono text-xs text-gray-700 truncate" title={analysis.url}>{analysis.url}</div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">IP:</span>
                          <div className="text-blue-600 font-mono text-xs">{analysis.ip_reputation.ip_address}</div>
                        </div>
                        {analysis.ip_reputation.geolocation?.country && (
                          <div>
                            <span className="text-gray-600">Country:</span>
                            <div className="text-purple-600">{analysis.ip_reputation.geolocation.country}</div>
                          </div>
                        )}
                        {analysis.ip_reputation.geolocation?.city && analysis.ip_reputation.geolocation.city !== 'Unknown' && (
                          <div>
                            <span className="text-gray-600">City:</span>
                            <div className="text-blue-600">{analysis.ip_reputation.geolocation.city}</div>
                          </div>
                        )}
                        {analysis.ip_reputation.geolocation?.isp && analysis.ip_reputation.geolocation.isp !== 'Unknown' && (
                          <div>
                            <span className="text-gray-600">ISP:</span>
                            <div className="text-green-600 truncate" title={analysis.ip_reputation.geolocation.isp}>
                              {analysis.ip_reputation.geolocation.isp.split(',')[0]}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Masked URLs Warning */}
            {results.masked_urls && results.masked_urls.length > 0 && (
              <div className="cyber-card border-2 border-red-500/50 bg-red-500/10">
                <h3 className="text-xl font-bold mb-4 flex items-center text-red-500">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  ⚠️ MASKED URLS DETECTED
                </h3>
                <p className="text-gray-300 mb-4">
                  The following links display one URL but actually go to a different destination. This is a common phishing technique!
                </p>
                {results.masked_urls.map((masked, idx) => (
                  <div key={idx} className="bg-gray-100 p-4 rounded-lg mb-3">
                    <div className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <div className="mb-2">
                          <span className="text-sm text-gray-400">Displays:</span>
                          <div className="font-mono text-sm text-yellow-400 break-all">{masked.displayed}</div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-400">Actually goes to:</span>
                          <div className="font-mono text-sm text-red-400 break-all">{masked.actual}</div>
                        </div>
                        <div className="mt-2 text-xs text-red-400">{masked.warning}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* URL Sandbox Analysis Reports */}
            {results.url_analyses && results.url_analyses.length > 0 && (
              <div className="cyber-card">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-gray-900" />
                  URL Security Analysis ({results.url_analyses.length})
                </h3>
                
                <div className="space-y-4">
                  {results.url_analyses.map((analysis, idx) => (
                    <div key={idx} className={`bg-gray-100 border-2 rounded-lg p-4 ${
                      analysis.verdict === 'malicious' ? 'border-red-500/50' :
                      analysis.verdict === 'suspicious' ? 'border-yellow-500/50' :
                      'border-green-500/50'
                    }`}>
                      
                      {/* URL Header with Verdict */}
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-500 mb-1">URL #{idx + 1}</div>
                          <div className="font-mono text-sm break-all text-gray-700">{analysis.url}</div>
                        </div>
                        <div className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          analysis.verdict === 'malicious' ? 'bg-red-500 text-white' :
                          analysis.verdict === 'suspicious' ? 'bg-yellow-500 text-black' :
                          'bg-green-500 text-white'
                        }`}>
                          {analysis.verdict}
                        </div>
                      </div>

                      {/* Key Metrics - Compact Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        
                        {/* Safety Score */}
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="text-xs text-gray-600 mb-1">Safety</div>
                          <div className={`text-xl font-bold ${
                            analysis.safety_score >= 0.7 ? 'text-green-600' :
                            analysis.safety_score >= 0.4 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {(analysis.safety_score * 100).toFixed(0)}%
                          </div>
                        </div>

                        {/* Domain Age */}
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="text-xs text-gray-600 mb-1">Domain Age</div>
                          <div className="text-sm font-bold text-blue-600">
                            {analysis.domain_reputation?.domain_age && analysis.domain_reputation.domain_age !== 'Data Unavailable' 
                              ? analysis.domain_reputation.domain_age 
                              : 'Unknown'}
                          </div>
                        </div>

                        {/* SSL Status */}
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="text-xs text-gray-600 mb-1">SSL</div>
                          <div className={`text-sm font-bold ${analysis.ssl_valid ? 'text-green-600' : 'text-red-600'}`}>
                            {analysis.ssl_valid ? '✓ Valid' : '✗ Invalid'}
                          </div>
                        </div>

                        {/* Login Forms */}
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="text-xs text-gray-600 mb-1">Login Form</div>
                          <div className={`text-sm font-bold ${analysis.login_forms_detected ? 'text-yellow-600' : 'text-gray-600'}`}>
                            {analysis.login_forms_detected ? '⚠ Detected' : '○ None'}
                          </div>
                        </div>
                      </div>

                      {/* Typosquatting Warning */}
                      {analysis.typosquatting?.is_typosquatting && (
                        <div className="bg-red-500/10 border border-red-500/30 p-3 rounded mb-3">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="font-bold text-red-400 text-sm mb-1">⚠️ Possible Brand Impersonation</div>
                              <div className="text-xs text-gray-300">{analysis.typosquatting.warning}</div>
                            </div>
                          </div>
                        </div>
                      )}



                      {/* Warnings - Only if present */}
                      {analysis.warnings && analysis.warnings.length > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                          <div className="text-xs text-yellow-800 font-bold mb-2">⚠️ Security Warnings</div>
                          <ul className="space-y-1">
                            {analysis.warnings.slice(0, 3).map((warning, i) => (
                              <li key={i} className="text-xs text-gray-700">• {warning}</li>
                            ))}
                            {analysis.warnings.length > 3 && (
                              <li className="text-xs text-gray-600 italic">+ {analysis.warnings.length - 3} more warnings</li>
                            )}
                          </ul>
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setResults(null); }}
                className="flex-1 px-6 py-3 bg-gray-900 rounded-lg text-white font-semibold hover:bg-gray-800 transition-all"
              >
                Analyze Another Email
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default EmailSourceAnalyzer;
