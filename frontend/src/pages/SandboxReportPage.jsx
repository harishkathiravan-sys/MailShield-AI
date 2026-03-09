import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield,
  Lock,
  Globe,
  Link as LinkIcon,
  AlertTriangle,
  Cookie,
  Code,
  FileText,
  CheckCircle,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import ThreatMeter from '../components/ThreatMeter';
import RiskBadge from '../components/RiskBadge';
import { getSandboxReport } from '../services/api';

const SandboxReportPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);

  useEffect(() => {
    loadReport();
  }, [id]);

  const loadReport = async () => {
    try {
      const data = await getSandboxReport(id);
      setReport(data);
    } catch (error) {
      console.error('Error loading sandbox report:', error);
      toast.error('Failed to load sandbox report');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Loading sandbox report..." />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Report Not Found</h2>
          <button onClick={() => navigate('/analyze')} className="cyber-button mt-4">
            Start New Analysis
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
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-gray-800 to-gray-600">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Sandbox Analysis Report</h1>
          <p className="text-gray-400">Detailed URL security assessment</p>
        </motion.div>

        {/* Safety Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="cyber-card mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Security Assessment</h2>
            <RiskBadge riskLevel={report.verdict} />
          </div>

          <div className="mb-6">
            <ThreatMeter score={report.safety_score} label="Overall Safety Score" />
          </div>

          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Analyzed URL:</div>
            <div className="font-mono text-gray-900 break-all flex items-center">
              <LinkIcon className="w-4 h-4 mr-2 flex-shrink-0" />
              {report.url}
            </div>
          </div>
        </motion.div>

        {/* SSL Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="cyber-card mb-8"
        >
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <Lock className="w-5 h-5 mr-2 text-gray-900" />
            SSL Certificate Analysis
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard
              label="Certificate Valid"
              value={report.ssl_analysis.valid ? 'Yes' : 'No'}
              icon={report.ssl_analysis.valid ? CheckCircle : XCircle}
              valueColor={report.ssl_analysis.valid ? 'text-green-600' : 'text-red-600'}
            />
            <InfoCard
              label="Issuer"
              value={report.ssl_analysis.issuer || 'N/A'}
            />
            <InfoCard
              label="Security Level"
              value={report.ssl_analysis.security_level || 'N/A'}
            />
            <InfoCard
              label="Expiration"
              value={
                report.ssl_analysis.expiration
                  ? new Date(report.ssl_analysis.expiration).toLocaleDateString()
                  : 'N/A'
              }
            />
          </div>
        </motion.div>

        {/* Domain Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="cyber-card mb-8"
        >
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <Globe className="w-5 h-5 mr-2 text-gray-900" />
            Domain Reputation
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard
              label="Domain Age"
              value={
                report.domain_analysis.age_days
                  ? `${report.domain_analysis.age_days} days`
                  : 'Unknown'
              }
              alert={report.domain_analysis.age_days && report.domain_analysis.age_days < 30}
            />
            <InfoCard
              label="Registrar"
              value={report.domain_analysis.registrar || 'Unknown'}
            />
            <InfoCard
              label="Country"
              value={report.domain_analysis.country || 'Unknown'}
            />
            <InfoCard
              label="Creation Date"
              value={
                report.domain_analysis.creation_date
                  ? new Date(report.domain_analysis.creation_date).toLocaleDateString()
                  : 'Unknown'
              }
            />
          </div>

          {report.domain_analysis.age_days && report.domain_analysis.age_days < 30 && (
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-400">
                <strong>Warning:</strong> This domain is very new (less than 30 days old), which is
                often associated with phishing sites.
              </div>
            </div>
          )}
        </motion.div>

        {/* Redirect Analysis */}
        {report.redirect_analysis.count > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="cyber-card mb-8"
          >
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <ExternalLink className="w-5 h-5 mr-2 text-gray-900" />
              Redirect Chain ({report.redirect_analysis.count})
            </h3>

            <div className="space-y-2">
              {report.redirect_analysis.chain.map((redirect, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-bold text-gray-900">
                      Step {index + 1}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-800 rounded">
                      {redirect.status}
                    </span>
                  </div>
                  <div className="text-sm font-mono text-gray-300 break-all">
                    {redirect.from} → {redirect.to}
                  </div>
                </div>
              ))}
            </div>

            {report.redirect_analysis.final_url !== report.url && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Final destination:</div>
                <div className="font-mono text-gray-900 text-sm break-all">
                  {report.redirect_analysis.final_url}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Form Analysis */}
        {report.form_analysis.login_forms_detected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="cyber-card mb-8 border-red-200"
          >
            <h3 className="text-xl font-bold mb-4 flex items-center text-red-600">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Login Forms Detected (PHISHING RISK)
            </h3>

            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
              <p className="text-sm text-red-700">
                <strong>Warning:</strong> This page contains login forms that may be attempting to
                harvest credentials. Do not enter any sensitive information.
              </p>
            </div>

            {report.form_analysis.form_fields && report.form_analysis.form_fields.length > 0 && (
              <div className="space-y-3">
                {report.form_analysis.form_fields.map((form, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 border border-gray-200 rounded-lg"
                  >
                    <div className="text-sm text-gray-600 mb-2">Form {index + 1}</div>
                    <div className="text-xs font-mono text-gray-500 mb-2">
                      Action: {form.action || 'Not specified'}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {form.fields.map(([name, type], fieldIndex) => (
                        <span
                          key={fieldIndex}
                          className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs"
                        >
                          {name || 'unnamed'} ({type})
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Script Analysis */}
        {(report.page_analysis.scripts?.length > 0 ||
          report.page_analysis.script_threats?.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="cyber-card mb-8"
          >
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Code className="w-5 h-5 mr-2 text-gray-900" />
              Script Analysis
            </h3>

            {report.page_analysis.script_threats?.length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                <h4 className="font-semibold text-red-700 mb-2">⚠️ Threats Detected:</h4>
                <ul className="space-y-1">
                  {report.page_analysis.script_threats.map((threat, index) => (
                    <li key={index} className="text-sm text-red-700">
                      • {threat}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-2">
                Loaded Scripts ({report.page_analysis.scripts.length}):
              </h4>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {report.page_analysis.scripts.map((script, index) => (
                  <div
                    key={index}
                    className="text-xs font-mono text-gray-700 p-2 bg-gray-50 rounded border border-gray-200"
                  >
                    {script}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Cookie & Tracking Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="cyber-card mb-8"
        >
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <Cookie className="w-5 h-5 mr-2 text-gray-900" />
            Cookie & Tracking Analysis
          </h3>

          {/* Cookie Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <InfoCard
              label="Total Cookies"
              value={report.tracking_analysis.total_cookies || 0}
            />
            <InfoCard
              label="Tracking Cookies"
              value={report.tracking_analysis.tracking_cookies || 0}
              alert={report.tracking_analysis.tracking_cookies > 5}
            />
            <InfoCard
              label="Advertising Cookies"
              value={report.tracking_analysis.advertising_cookies || 0}
              alert={report.tracking_analysis.advertising_cookies > 3}
            />
            <InfoCard
              label="Analytics Cookies"
              value={report.tracking_analysis.analytics_cookies || 0}
            />
          </div>

          {/* Cookie Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="text-xs text-gray-600">Functional</div>
              <div className="text-lg font-semibold text-green-600">
                {report.tracking_analysis.functional_cookies || 0}
              </div>
            </div>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="text-xs text-gray-600">Session</div>
              <div className="text-lg font-semibold text-blue-600">
                {report.tracking_analysis.session_cookies || 0}
              </div>
            </div>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="text-xs text-gray-600">Persistent</div>
              <div className="text-lg font-semibold text-purple-600">
                {report.tracking_analysis.persistent_cookies || 0}
              </div>
            </div>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="text-xs text-gray-600">Third-Party</div>
              <div className="text-lg font-semibold text-yellow-600">
                {report.tracking_analysis.third_party_cookies || 0}
              </div>
            </div>
          </div>

          {/* Tracking Technologies */}
          {(report.tracking_analysis.analytics_services?.length > 0 || 
            report.tracking_analysis.ad_networks?.length > 0 ||
            report.tracking_analysis.social_trackers?.length > 0) && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-300 mb-3">
                Tracking Technologies Detected:
              </h4>
              <div className="space-y-3">
                {report.tracking_analysis.analytics_services?.length > 0 && (
                  <div>
                    <div className="text-xs text-gray-400 mb-2">Analytics Services:</div>
                    <div className="flex flex-wrap gap-2">
                      {report.tracking_analysis.analytics_services.map((service, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs border border-blue-500/30"
                        >
                          📊 {service}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {report.tracking_analysis.ad_networks?.length > 0 && (
                  <div>
                    <div className="text-xs text-gray-400 mb-2">Ad Networks:</div>
                    <div className="flex flex-wrap gap-2">
                      {report.tracking_analysis.ad_networks.map((network, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs border border-orange-500/30"
                        >
                          📢 {network}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {report.tracking_analysis.social_trackers?.length > 0 && (
                  <div>
                    <div className="text-xs text-gray-400 mb-2">Social Media Trackers:</div>
                    <div className="flex flex-wrap gap-2">
                      {report.tracking_analysis.social_trackers.map((tracker, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs border border-purple-500/30"
                        >
                          👥 {tracker}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Third-Party Trackers */}
          {report.tracking_analysis.third_party_trackers?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-2">
                Third-Party Tracking Domains ({report.tracking_analysis.third_party_trackers.length}):
              </h4>
              <div className="flex flex-wrap gap-2">
                {report.tracking_analysis.third_party_trackers.slice(0, 10).map((tracker, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs border border-yellow-500/30"
                  >
                    {tracker}
                  </span>
                ))}
                {report.tracking_analysis.third_party_trackers.length > 10 && (
                  <span className="px-3 py-1 text-gray-400 text-xs">
                    +{report.tracking_analysis.third_party_trackers.length - 10} more
                  </span>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Page Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="cyber-card mb-8"
        >
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-gray-900" />
            Page Information
          </h3>

          <div className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-400 mb-1">Page Title:</div>
                <div className="text-gray-300 font-medium">
                  {report.page_information?.title || report.page_analysis?.title || 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Analysis Time:</div>
                <div className="text-gray-300 font-medium">{report.execution_time.toFixed(2)}s</div>
              </div>
            </div>

            {/* HTTP Response Information */}
            {report.page_information?.metadata && (
              <div>
                <div className="text-sm text-gray-400 mb-2">Server Response:</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {report.page_information.metadata.http_status && report.page_information.metadata.http_status !== 'Unknown' && (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="text-xs text-gray-600">HTTP Status</div>
                      <div className={`text-lg font-semibold ${
                        report.page_information.metadata.http_status < 300 ? 'text-green-400' : 
                        report.page_information.metadata.http_status < 400 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {report.page_information.metadata.http_status}
                      </div>
                    </div>
                  )}
                  {report.page_information.metadata.server && report.page_information.metadata.server !== 'Unknown' && (
                    <div className="p-3 bg-cyber-bg border border-cyber-blue/20 rounded-lg">
                      <div className="text-xs text-gray-400">Server</div>
                      <div className="text-sm font-semibold text-cyan-400 truncate">
                        {report.page_information.metadata.server}
                      </div>
                    </div>
                  )}
                  {report.page_information.metadata.url_scheme && (
                    <div className="p-3 bg-cyber-bg border border-cyber-blue/20 rounded-lg">
                      <div className="text-xs text-gray-400">Protocol</div>
                      <div className={`text-lg font-semibold ${
                        report.page_information.metadata.url_scheme === 'HTTPS' ? 'text-green-400' : 'text-yellow-400'
                      }`}>
                        {report.page_information.metadata.url_scheme}
                      </div>
                    </div>
                  )}
                  {report.page_information.metadata.content_type && report.page_information.metadata.content_type !== 'Unknown' && (
                    <div className="p-3 bg-cyber-bg border border-cyber-blue/20 rounded-lg">
                      <div className="text-xs text-gray-400">Content Type</div>
                      <div className="text-xs font-semibold text-purple-400 truncate" title={report.page_information.metadata.content_type}>
                        {report.page_information.metadata.content_type.split(';')[0]}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* URL Information */}
            {report.page_information?.metadata?.final_url && (
              <div>
                <div className="text-sm text-gray-400 mb-1">Final URL:</div>
                <div className="text-sm text-cyan-400 p-2 bg-cyber-bg border border-cyber-blue/20 rounded-lg break-all font-mono">
                  {report.page_information.metadata.final_url}
                </div>
              </div>
            )}

            {/* Metadata */}
            {report.page_information?.metadata && (
              <div className="space-y-3">
                {report.page_information.metadata.description && report.page_information.metadata.description !== 'N/A' && (
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Description:</div>
                    <div className="text-sm text-gray-300 p-3 bg-cyber-bg border border-cyber-blue/20 rounded-lg">
                      {report.page_information.metadata.description}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {report.page_information.metadata.language && report.page_information.metadata.language !== 'N/A' && (
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Language:</div>
                      <div className="text-gray-300">{report.page_information.metadata.language}</div>
                    </div>
                  )}
                  {report.page_information.metadata.charset && report.page_information.metadata.charset !== 'N/A' && (
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Character Encoding:</div>
                      <div className="text-gray-300">{report.page_information.metadata.charset}</div>
                    </div>
                  )}
                  {report.page_information.metadata.author && report.page_information.metadata.author !== 'N/A' && (
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Author:</div>
                      <div className="text-gray-300">{report.page_information.metadata.author}</div>
                    </div>
                  )}
                  {report.page_information.metadata.viewport && report.page_information.metadata.viewport !== 'N/A' && (
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Viewport:</div>
                      <div className="text-gray-300 text-xs">{report.page_information.metadata.viewport}</div>
                    </div>
                  )}
                </div>

                {/* Resource Counts */}
                {(report.page_information.metadata.image_count >= 0 || 
                  report.page_information.metadata.script_count >= 0 ||
                  report.page_information.metadata.stylesheet_count >= 0) && (
                  <div>
                    <div className="text-sm text-gray-400 mb-2">Page Resources:</div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 bg-cyber-bg border border-cyber-blue/20 rounded-lg text-center">
                        <div className="text-xs text-gray-400">Images</div>
                        <div className="text-lg font-semibold text-cyan-400">
                          {report.page_information.metadata.image_count || 0}
                        </div>
                      </div>
                      <div className="p-3 bg-cyber-bg border border-cyber-blue/20 rounded-lg text-center">
                        <div className="text-xs text-gray-400">Scripts</div>
                        <div className="text-lg font-semibold text-purple-400">
                          {report.page_information.metadata.script_count || 0}
                        </div>
                      </div>
                      <div className="p-3 bg-cyber-bg border border-cyber-blue/20 rounded-lg text-center">
                        <div className="text-xs text-gray-400">Stylesheets</div>
                        <div className="text-lg font-semibold text-pink-400">
                          {report.page_information.metadata.stylesheet_count || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Technologies Detected */}
                {report.page_information.metadata.technologies?.length > 0 && 
                 report.page_information.metadata.technologies[0] !== 'None detected' && (
                  <div>
                    <div className="text-sm text-gray-400 mb-2">Technologies Detected:</div>
                    <div className="flex flex-wrap gap-2">
                      {report.page_information.metadata.technologies.map((tech, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs border border-green-500/30"
                        >
                          ⚡ {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Content Preview */}
            <div>
              <div className="text-sm text-gray-400 mb-1">Content Preview:</div>
              <div className="text-sm text-gray-300 p-3 bg-cyber-bg border border-cyber-blue/20 rounded-lg max-h-32 overflow-y-auto">
                {report.page_information?.content_preview || 
                 report.page_analysis?.content_snippet || 
                 'No content available'}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
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

const InfoCard = ({ label, value, icon: Icon, valueColor = 'text-gray-300', alert = false }) => (
  <div className={`p-4 bg-cyber-bg border rounded-lg ${alert ? 'border-yellow-500/50' : 'border-cyber-blue/20'}`}>
    <div className="text-sm text-gray-400 mb-1">{label}</div>
    <div className={`font-medium flex items-center ${valueColor}`}>
      {Icon && <Icon className="w-4 h-4 mr-2" />}
      {value}
    </div>
  </div>
);

export default SandboxReportPage;
