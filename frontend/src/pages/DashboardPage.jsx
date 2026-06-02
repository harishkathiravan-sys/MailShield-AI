import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Mail, Globe, AlertTriangle, ShieldCheck, Shield, Activity as ActivityIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { getDashboardStats, getWeeklyActivity, getRecentThreats } from '../services/api';

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [weeklyActivity, setWeeklyActivity] = useState([]);
  const [recentThreats, setRecentThreats] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsData, weeklyData, threatsData] = await Promise.all([
        getDashboardStats(),
        getWeeklyActivity(),
        getRecentThreats(5),
      ]);

      setStats(statsData);
      setWeeklyActivity(weeklyData.weekly_activity);
      setRecentThreats(threatsData.recent_threats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Loading dashboard..." />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">No dashboard data available</p>
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const riskData = [
    { name: 'Safe', value: stats.risk_distribution.safe, color: '#10b981' },
    { name: 'Suspicious', value: stats.risk_distribution.suspicious, color: '#f59e0b' },
    { name: 'Phishing', value: stats.risk_distribution.phishing, color: '#f43f5e' },
    { name: 'Malicious', value: stats.risk_distribution.malicious, color: '#7c3aed' },
  ];

  // Transform weekly activity for area chart
  const chartData = weeklyActivity.map(item => ({
    name: item.day_name?.substring(0, 3) || 'N/A',
    analyzed: item.total_analyzed || 0,
    threats: item.threats_detected || 0,
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">System Status: Operational</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Security Command Center</h1>
          <p className="text-slate-500 mt-1 font-medium">Monitoring real-time threat vectors and email integrity</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button className="px-4 py-2 bg-white text-slate-900 rounded-xl text-xs font-bold shadow-sm border border-slate-200/50">Real-time</button>
          <button className="px-4 py-2 text-slate-500 rounded-xl text-xs font-bold hover:bg-white/50 transition-colors">Historical</button>
        </div>
      </div>

      {/* Stats Grid - Bento Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardStatCard
          label="Emails Analyzed"
          value={stats.total_emails_analyzed.toString()}
          trend="+100%"
          icon={Mail}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <DashboardStatCard
          label="Links Analyzed"
          value={stats.total_links_analyzed.toString()}
          trend="0%"
          icon={Globe}
          color="text-indigo-600"
          bg="bg-indigo-50"
        />
        <DashboardStatCard
          label="Threats Detected"
          value={stats.threats_detected.toString()}
          trend="+50%"
          icon={AlertTriangle}
          color="text-amber-600"
          bg="bg-amber-50"
        />
        <DashboardStatCard
          label="Phishing Blocked"
          value={stats.phishing_attempts_blocked.toString()}
          trend="0%"
          icon={ShieldCheck}
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-8 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <ActivityIcon className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Threat Activity Analysis</h3>
                <p className="text-sm text-slate-500">Daily volume of analyzed emails vs detected threats</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-xs font-bold text-slate-600">Analyzed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span className="text-xs font-bold text-slate-600">Threats</span>
                </div>
              </div>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorAnalyzed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} dy={15} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} />
                  <RechartsTooltip contentStyle={{ borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px 16px' }} />
                  <Area type="monotone" dataKey="analyzed" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorAnalyzed)" />
                  <Area type="monotone" dataKey="threats" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorThreats)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Risk Distribution - Circular */}
        <div className="lg:col-span-4 bg-slate-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-20">
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500 rounded-full blur-[100px]" />
          </div>
          <div className="relative z-10 h-full flex flex-col">
            <h3 className="text-xl font-bold mb-2">Risk Distribution</h3>
            <p className="text-slate-400 text-sm mb-8">Global threat landscape breakdown</p>
            <div className="flex-1 flex flex-col justify-center">
              <div className="h-[220px] w-full relative mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={90}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {riskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <span className="block text-3xl font-bold">74%</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Secure</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {riskData.map((item) => (
                  <div key={item.name} className="bg-white/5 p-3 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.name}</span>
                    </div>
                    <span className="text-lg font-bold">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Threat Categories - List */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Threat Categories</h3>
          <div className="space-y-5">
            <CategoryRow label="Safe" count={stats.threat_categories.safe} percent={Math.round((stats.threat_categories.safe / stats.total_emails_analyzed) * 100)} color="bg-emerald-500" />
            <CategoryRow label="Suspicious" count={stats.threat_categories.suspicious} percent={Math.round((stats.threat_categories.suspicious / stats.total_emails_analyzed) * 100)} color="bg-amber-500" />
            <CategoryRow label="Phishing" count={stats.threat_categories.phishing} percent={Math.round((stats.threat_categories.phishing / stats.total_emails_analyzed) * 100)} color="bg-rose-500" />
            <CategoryRow label="Malicious" count={stats.threat_categories.malicious} percent={Math.round((stats.threat_categories.malicious / stats.total_emails_analyzed) * 100)} color="bg-purple-600" />
          </div>
          <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3 text-slate-600">
              <Shield className="w-5 h-5" />
              <p className="text-xs font-medium leading-relaxed">AI models are currently prioritizing <span className="font-bold text-slate-900">Phishing Detection</span> based on recent global trends.</p>
            </div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-900">Live Security Feed</h3>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              Live Updates
            </div>
          </div>
          <div className="space-y-4">
            {recentThreats.length > 0 ? (
              recentThreats.map((threat, index) => (
                <ActivityFeedItem
                  key={threat.id}
                  type={threat.risk_level}
                  title={threat.subject}
                  sender={threat.sender_email}
                  time={new Date(threat.analyzed_at).toLocaleString()}
                  score={Math.round((threat.spam_score + threat.phishing_probability) / 2 * 100)}
                />
              ))
            ) : (
              <p className="text-slate-500 text-sm">No recent threats detected</p>
            )}
          </div>
          <button className="w-full mt-6 py-4 text-sm font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-2xl transition-all border border-dashed border-slate-200">
            View Full Security Logs
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const DashboardStatCard = ({ label, value, trend, icon: Icon, color, bg }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`${bg} p-6 rounded-2xl border border-slate-200 shadow-sm`}
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-xl ${bg} border border-slate-200`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">{trend}</span>
    </div>
    <div className="text-2xl font-bold text-slate-900 mb-1">{value}</div>
    <div className="text-xs font-medium text-slate-500">{label}</div>
  </motion.div>
);

const CategoryRow = ({ label, count, percent, color }) => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-semibold text-slate-900">{label}</span>
      <span className="text-sm font-bold text-slate-600">{count}</span>
    </div>
    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className={`h-full ${color}`}
      />
    </div>
    <div className="text-xs text-slate-500 mt-1">{percent}%</div>
  </div>
);

const ActivityFeedItem = ({ type, title, sender, time, score }) => {
  const typeColors = {
    safe: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    suspicious: 'bg-amber-50 text-amber-700 border-amber-200',
    phishing: 'bg-rose-50 text-rose-700 border-rose-200',
    malicious: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1">
          <div className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold border mb-2 ${typeColors[type] || typeColors.suspicious}`}>
            {type.toUpperCase()}
          </div>
          <div className="font-semibold text-slate-900 text-sm">{title}</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-slate-900">{score}%</div>
          <div className="text-xs text-slate-500">Risk</div>
        </div>
      </div>
      <div className="text-xs text-slate-600 mb-1">From: {sender}</div>
      <div className="text-xs text-slate-500">{time}</div>
    </motion.div>
  );
};

export default DashboardPage;
