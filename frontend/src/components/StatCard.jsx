import { motion } from 'framer-motion';

const StatCard = ({ icon: Icon, label, value, color = 'blue' }) => {
  const colorClasses = {
    blue: 'from-cyber-blue to-blue-600',
    purple: 'from-cyber-purple to-purple-600',
    green: 'from-cyber-green to-green-600',
    red: 'from-cyber-red to-red-600',
    yellow: 'from-yellow-400 to-yellow-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03, y: -5 }}
      className="cyber-card relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 opacity-10">
        <Icon className="w-full h-full" />
      </div>
      
      <div className="relative z-10">
        <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${colorClasses[color]} mb-4`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        
        <p className="text-gray-400 text-sm mb-1">{label}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
      
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r"
        style={{ background: `linear-gradient(to right, ${colorClasses[color]})` }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      />
    </motion.div>
  );
};

export default StatCard;
