import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield,
  Mail,
  AlertTriangle,
  Link as LinkIcon,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
} from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import ThreatMeter from '../components/ThreatMeter';
import RiskBadge from '../components/RiskBadge';
import { getAnalysis, batchAnalyzeSandbox } from '../services/api';

const ResultsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [analyzingUrls, setAnalyzingUrls] = useState(false);
  const [urlReports, setUrlReports] = useState([]);

  useEffect(() => {
    loadAnalysis();
  }, [id]);

  const loadAnalysis = async () => {
    try {
      const data = await getAnalysis(id);
      setAnalysis(data);
    } catch (error) {
      console.error('Error loading analysis:', error);
      toast.error('Failed to load analysis results');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeUrls = async () => {
    if (!analysis.extracted_urls || analysis.extracted_urls.length === 0) {
      toast.error('No URLs found in this email');
      return;
    }

    setAnalyzingUrls(true);
    toast.loading('Analyzing URLs in sandbox...', { id: 'sandbox-analysis' });

    try {
      const result = await batchAnalyzeSandbox(analysis.extracted_urls, parseInt(id));
      setUrlReports(result.report_ids);
      toast.success(`${result.analyzed_count} URLs analyzed!`, { id: 'sandbox-analysis' });
    } catch (error) {
      console.error('Error analyzing URLs:', error);
      toast.error('Failed to analyze URLs', { id: 'sandbox-analysis' });
    } finally {
      setAnalyzingUrls(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Loading analysis results..." />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Analysis Not Found</h2>
          <button onClick={() => navigate('/analyze')} className="cyber-button mt-4">
            Analyze New Email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-cyber-blue to-cyber-purple">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Analysis Results</h1>
          <p className="text-gray-400">Comprehensive email security assessment</p>
        </motion.div>

        {/* Safety Recommendation - First Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-2 border-yellow-500/50 rounded-lg p-6 mb-8"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-8 h-8 text-yellow-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-yellow-400 mb-3">🛡️ Safety Recommendations</h3>
              <div className="space-y-2 text-gray-300">
                <p className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-1">⚠️</span>
                  <span><strong>Do not click</strong> on any suspicious links or download attachments from untrusted sources</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-1">🚫</span>
                  <span><strong>Never provide</strong> personal information, passwords, or financial details via email</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-1">✓</span>
                  <span><strong>Always verify</strong> the sender's identity by contacting them through official channels</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-1">📧</span>
                  <span><strong>Report suspicious emails</strong> to your IT department or email provider immediately</span>
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Risk Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="cyber-card mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Risk Assessment</h2>
            <RiskBadge riskLevel={analysis.risk_level} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ThreatMeter score={analysis.spam_score} label="Spam Score" />
            <ThreatMeter score={analysis.phishing_probability} label="Phishing Probability" />
            <ThreatMeter
              score={analysis.malicious_intent_score}
              label="Malicious Intent"
            />
          </div>
        </motion.div>

        {/* Email Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="cyber-card"
          >
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Mail className="w-5 h-5 mr-2 text-gray-900" />
              Email Information
            </h3>
            <div className="space-y-3">
              <InfoRow label="From" value={analysis.sender_email} />
              <InfoRow label="Subject" value={analysis.subject} />
              <InfoRow label="Analyzed At" value={new Date(analysis.analyzed_at).toLocaleString()} />
              <InfoRow
                label="Duration"
                value={`${analysis.analysis_duration.toFixed(2)}s`}
                icon={Clock}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="cyber-card"
          >
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-gray-900" />
              Detected Indicators
            </h3>
            <div className="space-y-3">
              <InfoRow
                label="Credential Requests"
                value={analysis.credential_requests ? 'Detected' : 'None'}
                icon={analysis.credential_requests ? XCircle : CheckCircle}
                valueColor={analysis.credential_requests ? 'text-red-600' : 'text-green-600'}
              />
              <InfoRow
                label="Urgency Patterns"
                value={analysis.urgency_indicators.length}
                icon={AlertTriangle}
              />
              <InfoRow
                label="Spam Keywords"
                value={analysis.detected_keywords.spam?.length || 0}
              />
              <InfoRow
                label="Phishing Keywords"
                value={analysis.detected_keywords.phishing?.length || 0}
              />
            </div>
          </motion.div>
        </div>

        {/* Detected Keywords */}
        {(analysis.detected_keywords.spam?.length > 0 ||
          analysis.detected_keywords.phishing?.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="cyber-card mb-8"
          >
            <h3 className="text-xl font-bold mb-4">Detected Keywords</h3>
            <div className="space-y-4">
              {analysis.detected_keywords.spam?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Spam Keywords:</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.detected_keywords.spam.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm border border-yellow-500/30"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {analysis.detected_keywords.phishing?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-red-600 mb-2">
                    Phishing Keywords:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.detected_keywords.phishing.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm border border-red-300"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* URLs Section */}
        {analysis.extracted_urls && analysis.extracted_urls.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="cyber-card mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center">
                <LinkIcon className="w-5 h-5 mr-2 text-gray-900" />
                Extracted URLs ({analysis.extracted_urls.length})
              </h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAnalyzeUrls}
                disabled={analyzingUrls}
                className="cyber-button text-sm"
              >
                {analyzingUrls ? 'Analyzing...' : 'Analyze in Sandbox'}
              </motion.button>
            </div>

            <div className="space-y-2">
              {analysis.extracted_urls.map((url, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between group hover:border-gray-300 transition-colors"
                >
                  <span className="text-sm font-mono text-gray-700 break-all">{url}</span>
                  {urlReports[index] && (
                    <button
                      onClick={() => navigate(`/sandbox-report/${urlReports[index]}`)}
                      className="ml-4 text-gray-900 hover:text-gray-700 text-sm font-medium whitespace-nowrap"
                    >
                      View Report →
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center"
        >
          <button onClick={() => navigate('/analyze')} className="cyber-button">
            Analyze Another Email
          </button>
        </motion.div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value, icon: Icon, valueColor = 'text-gray-700' }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-200">
    <span className="text-gray-600 text-sm flex items-center">
      {Icon && <Icon className="w-4 h-4 mr-2" />}
      {label}
    </span>
    <span className={`font-medium ${valueColor}`}>{value}</span>
  </div>
);

export default ResultsPage;
