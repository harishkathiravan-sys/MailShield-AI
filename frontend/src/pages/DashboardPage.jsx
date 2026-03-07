import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Mail, Shield, AlertTriangle, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import StatCard from '../components/StatCard';
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
  const riskDistributionData = [
    { name: 'Safe', value: stats.risk_distribution.safe, color: '#00ff88' },
    { name: 'Suspicious', value: stats.risk_distribution.suspicious, color: '#ffcc00' },
    { name: 'Phishing', value: stats.risk_distribution.phishing, color: '#ff9500' },
    { name: 'Malicious', value: stats.risk_distribution.malicious, color: '#ff3366' },
  ];

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Security Dashboard</h1>
          <p className="text-xl text-gray-400">
            Real-time threat analysis and security metrics
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            icon={Mail}
            label="Emails Analyzed"
            value={stats.total_emails_analyzed.toLocaleString()}
            color="blue"
          />
          <StatCard
            icon={Shield}
            label="Links Analyzed"
            value={stats.total_links_analyzed.toLocaleString()}
            color="purple"
          />
          <StatCard
            icon={AlertTriangle}
            label="Threats Detected"
            value={stats.threats_detected.toLocaleString()}
            color="red"
          />
          <StatCard
            icon={TrendingUp}
            label="Phishing Blocked"
            value={stats.phishing_attempts_blocked.toLocaleString()}
            color="yellow"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Weekly Activity Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="cyber-card"
          >
            <h3 className="text-xl font-bold mb-6">Weekly Threat Activity</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#00d4ff20" />
                <XAxis
                  dataKey="day_name"
                  stroke="#888"
                  tick={{ fill: '#888', fontSize: 12 }}
                />
                <YAxis stroke="#888" tick={{ fill: '#888', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0d1117',
                    border: '1px solid #00d4ff',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#00d4ff' }}
                />
                <Legend
                  wrapperStyle={{ color: '#888' }}
                  iconType="circle"
                />
                <Bar dataKey="total_analyzed" fill="#00d4ff" name="Total Analyzed" radius={[8, 8, 0, 0]} />
                <Bar dataKey="threats_detected" fill="#ff3366" name="Threats" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Risk Distribution Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="cyber-card"
          >
            <h3 className="text-xl font-bold mb-6">Risk Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {riskDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0d1117',
                    border: '1px solid #00d4ff',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Threat Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="cyber-card mb-12"
        >
          <h3 className="text-xl font-bold mb-6">Threat Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ThreatCategoryCard
              label="Safe"
              count={stats.threat_categories.safe}
              color="green"
              percentage={
                stats.total_emails_analyzed > 0
                  ? ((stats.threat_categories.safe / stats.total_emails_analyzed) * 100).toFixed(1)
                  : 0
              }
            />
            <ThreatCategoryCard
              label="Suspicious"
              count={stats.threat_categories.suspicious}
              color="yellow"
              percentage={
                stats.total_emails_analyzed > 0
                  ? ((stats.threat_categories.suspicious / stats.total_emails_analyzed) * 100).toFixed(1)
                  : 0
              }
            />
            <ThreatCategoryCard
              label="Phishing"
              count={stats.threat_categories.phishing}
              color="orange"
              percentage={
                stats.total_emails_analyzed > 0
                  ? ((stats.threat_categories.phishing / stats.total_emails_analyzed) * 100).toFixed(1)
                  : 0
              }
            />
            <ThreatCategoryCard
              label="Malicious"
              count={stats.threat_categories.malicious}
              color="red"
              percentage={
                stats.total_emails_analyzed > 0
                  ? ((stats.threat_categories.malicious / stats.total_emails_analyzed) * 100).toFixed(1)
                  : 0
              }
            />
          </div>
        </motion.div>

        {/* Recent Threats */}
        {recentThreats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="cyber-card"
          >
            <h3 className="text-xl font-bold mb-6">Recent Threats Detected</h3>
            <div className="space-y-3">
              {recentThreats.map((threat, index) => (
                <ThreatItem key={threat.id} threat={threat} index={index} />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

const ThreatCategoryCard = ({ label, count, color, percentage }) => {
  const colorClasses = {
    green: 'from-cyber-green to-green-600',
    yellow: 'from-yellow-400 to-yellow-600',
    orange: 'from-orange-400 to-orange-600',
    red: 'from-cyber-red to-red-600',
  };

  const textColors = {
    green: 'text-cyber-green',
    yellow: 'text-yellow-400',
    orange: 'text-orange-400',
    red: 'text-cyber-red',
  };

  return (
    <div className="p-4 bg-cyber-bg border border-cyber-blue/20 rounded-lg hover:border-cyber-blue/50 transition-colors">
      <div className="text-sm text-gray-400 mb-2">{label}</div>
      <div className={`text-3xl font-bold ${textColors[color]} mb-1`}>{count}</div>
      <div className="w-full h-2 bg-cyber-dark rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-xs text-gray-500 mt-1">{percentage}%</div>
    </div>
  );
};

const ThreatItem = ({ threat, index }) => {
  const getRiskColor = (level) => {
    const colors = {
      safe: 'text-cyber-green border-cyber-green/30 bg-cyber-green/10',
      suspicious: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
      phishing: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
      malicious: 'text-cyber-red border-cyber-red/30 bg-cyber-red/10',
    };
    return colors[level] || colors.suspicious;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="p-4 bg-cyber-bg border border-cyber-blue/20 rounded-lg hover:border-cyber-blue/50 transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase border ${getRiskColor(threat.risk_level)}`}>
              {threat.risk_level}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(threat.analyzed_at).toLocaleString()}
            </span>
          </div>
          <div className="text-gray-400 text-sm mb-1">
            From: <span className="text-gray-300">{threat.sender_email}</span>
          </div>
          <div className="text-white font-medium">{threat.subject}</div>
          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
            <span>Spam: {(threat.spam_score * 100).toFixed(0)}%</span>
            <span>Phishing: {(threat.phishing_probability * 100).toFixed(0)}%</span>
          </div>
        </div>
        <AlertTriangle className="w-5 h-5 text-cyber-red flex-shrink-0" />
      </div>
    </motion.div>
  );
};

export default DashboardPage;
