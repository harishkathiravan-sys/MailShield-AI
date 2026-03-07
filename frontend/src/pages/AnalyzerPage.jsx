import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Send, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { analyzeEmail } from '../services/api';

const AnalyzerPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    sender_email: '',
    subject: '',
    body: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.sender_email || !formData.subject || !formData.body) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const result = await analyzeEmail(formData);
      toast.success('Analysis complete!');
      navigate(`/results/${result.id}`);
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadDemoEmail = () => {
    setFormData({
      sender_email: 'support@secure-paypal-verify.xyz',
      subject: 'URGENT: Verify Your Account Immediately',
      body: `Dear Valued Customer,

Your PayPal account has been temporarily suspended due to unusual activity detected on your account.

We need you to verify your identity immediately to restore full access to your account. If you do not verify within 24 hours, your account will be permanently closed and all funds will be frozen.

Click here to verify now: http://verify-paypal-secure-login.xyz/account/verify

This is an automated security measure for your protection. Please act immediately to avoid losing access to your funds.

For security reasons, this link will expire in 24 hours.

Thank you for your cooperation.
PayPal Security Team`,
    });
    toast.success('Demo email loaded');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Analyzing email for threats..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-cyber-blue to-cyber-purple">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Email Security Analyzer
          </h1>
          <p className="text-xl text-gray-400">
            Paste the suspicious email below for comprehensive threat analysis
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="cyber-card"
        >
          {/* Info Banner */}
          <div className="mb-6 p-4 bg-cyber-blue/10 border border-cyber-blue/30 rounded-lg flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-cyber-blue flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-300">
              <strong className="text-cyber-blue">Privacy Note:</strong> Your email data is
              analyzed securely and not stored permanently. We only keep anonymized threat
              patterns for improving detection.
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sender Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sender Email Address *
              </label>
              <input
                type="email"
                name="sender_email"
                value={formData.sender_email}
                onChange={handleChange}
                placeholder="suspicious@example.com"
                className="cyber-input"
                required
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Subject *
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Enter email subject"
                className="cyber-input"
                required
              />
            </div>

            {/* Body */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Body *
              </label>
              <textarea
                name="body"
                value={formData.body}
                onChange={handleChange}
                placeholder="Paste the full email content here..."
                rows={12}
                className="cyber-input resize-none"
                required
              />
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="cyber-button flex-1 flex items-center justify-center space-x-2"
              >
                <Send className="w-5 h-5" />
                <span>Analyze Email</span>
              </motion.button>

              <motion.button
                type="button"
                onClick={loadDemoEmail}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="cyber-button-secondary flex-1"
              >
                Load Demo Email
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* Features Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {[
            { title: 'Spam Detection', desc: 'AI-powered keyword analysis' },
            { title: 'Phishing Detection', desc: 'Pattern recognition engine' },
            { title: 'Link Analysis', desc: 'Sandbox URL testing' },
          ].map((item, index) => (
            <div
              key={index}
              className="p-4 bg-cyber-dark/50 border border-cyber-blue/20 rounded-lg text-center"
            >
              <div className="font-semibold text-cyber-blue mb-1">{item.title}</div>
              <div className="text-sm text-gray-400">{item.desc}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyzerPage;
