import { Link, useLocation } from 'react-router-dom';
import { Shield, Activity, BarChart3, Home, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-cyber-dark border-b border-cyber-blue/30 sticky top-0 z-50 backdrop-blur-sm bg-opacity-90"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <Shield className="w-8 h-8 text-cyber-blue group-hover:text-cyber-purple transition-colors duration-300" />
              <div className="absolute inset-0 bg-cyber-blue/20 blur-xl group-hover:bg-cyber-purple/20 transition-all duration-300" />
            </div>
            <span className="text-2xl font-bold gradient-text">
              MailShield AI
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            <NavLink to="/" icon={Home} label="Home" active={isActive('/')} />
            <NavLink
              to="/analyze"
              icon={Activity}
              label="Analyze"
              active={isActive('/analyze')}
            />
            <NavLink
              to="/email-source"
              icon={FileText}
              label="Email Source"
              active={isActive('/email-source')}
            />
            <NavLink
              to="/dashboard"
              icon={BarChart3}
              label="Dashboard"
              active={isActive('/dashboard')}
            />
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

const NavLink = ({ to, icon: Icon, label, active }) => (
  <Link to={to}>
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
        active
          ? 'bg-cyber-blue/20 text-cyber-blue border border-cyber-blue/50'
          : 'text-gray-400 hover:text-cyber-blue hover:bg-cyber-blue/10'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </motion.div>
  </Link>
);

export default Navbar;
