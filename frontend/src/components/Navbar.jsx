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
      className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-opacity-95"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <Shield className="w-8 h-8 text-gray-900 group-hover:text-gray-700 transition-colors duration-300" />
              <div className="absolute inset-0 bg-gray-900/10 blur-xl group-hover:bg-gray-700/10 transition-all duration-300" />
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
          ? 'bg-gray-100 text-gray-900 border border-gray-300'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </motion.div>
  </Link>
);

export default Navbar;
