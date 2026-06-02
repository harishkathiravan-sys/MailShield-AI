import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Send, AlertCircle, ShieldCheck, Search, Cpu, Monitor, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { analyzeEmail } from '../services/api';

const AnalyzerPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sender, setSender] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!sender || !subject || !body) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const result = await analyzeEmail({
        sender_email: sender,
        subject: subject,
        body: body,
      });
      toast.success('Analysis complete!');
      navigate(`/results/${result.id}`);
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadDemo = () => {
    setSender('security-alert@bank-verify-secure.com');
    setSubject('URGENT: Suspicious activity detected on your account');
    setBody('Dear Valued Customer,\n\nWe have detected unusual login attempts from an unrecognized device in Moscow, Russia. To protect your account, we have temporarily restricted access.\n\nPlease click the link below to verify your identity and restore access immediately:\n\nhttp://verify-account-security-portal.net/login?id=92834\n\nFailure to verify within 24 hours will lead to permanent account suspension.\n\nThank you,\nSecurity Team');
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto py-16 px-4"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <div className="mb-10">
            <h1 className="text-4xl font-serif font-medium text-slate-900 mb-3">Email Security Analyzer</h1>
            <p className="text-lg text-slate-500">Paste the suspicious email below for comprehensive threat analysis</p>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 md:p-10">
            <div className="mb-8 p-5 bg-blue-50/50 border border-blue-100 rounded-2xl flex gap-4 items-start">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <p className="text-sm text-blue-800 leading-relaxed">
                <span className="font-bold">Privacy Note:</span> Your email data is analyzed securely and not stored permanently. We only keep anonymized threat patterns for improving detection.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2.5">Sender Email Address *</label>
                  <input
                    type="email"
                    value={sender}
                    onChange={(e) => setSender(e.target.value)}
                    placeholder="suspicious@example.com"
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-slate-50/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2.5">Email Subject *</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter email subject"
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-slate-50/50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2.5">Email Body *</label>
                <textarea
                  rows={10}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Paste the full email content here..."
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-slate-50/50 resize-none"
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-[2] bg-slate-900 text-white py-5 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 group"
                >
                  <Zap className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                  Analyze Email
                </button>
                <button
                  type="button"
                  onClick={loadDemo}
                  className="flex-1 bg-white border border-slate-200 text-slate-700 py-5 rounded-2xl font-bold hover:bg-slate-50 transition-all"
                >
                  Load Demo Email
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-50 rounded-[2rem] p-10 border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 mb-8">Analysis Features</h3>
            <div className="space-y-10">
              <FeatureItem icon={Search} title="Spam Detection" desc="AI-powered keyword analysis" color="text-blue-600" />
              <FeatureItem icon={Cpu} title="Phishing Detection" desc="Pattern recognition engine" color="text-amber-600" />
              <FeatureItem icon={Monitor} title="Link Analysis" desc="Sandbox URL testing" color="text-indigo-600" />
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2rem] p-10 text-white relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
              <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] bg-blue-500 rounded-full blur-[80px] group-hover:scale-110 transition-transform duration-700" />
            </div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-3">Enterprise Protection</h3>
              <p className="text-slate-400 mb-8 leading-relaxed">Get real-time protection for your entire organization's inbox.</p>
              <button className="w-full bg-white text-slate-900 py-4 rounded-xl font-bold hover:bg-slate-100 transition-colors">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const FeatureItem = ({ icon: Icon, title, desc, color }) => (
  <div className="flex gap-4">
    <div className={`${color} flex-shrink-0`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <div className="font-semibold text-slate-900">{title}</div>
      <div className="text-sm text-slate-500">{desc}</div>
    </div>
  </div>
);

export default AnalyzerPage;
