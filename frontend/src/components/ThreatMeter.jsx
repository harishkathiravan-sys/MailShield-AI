import { motion } from 'framer-motion';

const ThreatMeter = ({ score, label }) => {
  // score should be 0-1
  const percentage = Math.round(score * 100);
  
  // Determine color based on score
  const getColor = () => {
    if (score >= 0.8) return { from: '#ff3366', to: '#ff006e' };
    if (score >= 0.6) return { from: '#ff9500', to: '#ff6b00' };
    if (score >= 0.4) return { from: '#ffcc00', to: '#ffaa00' };
    return { from: '#00ff88', to: '#00d4ff' };
  };

  const colors = getColor();

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-300">{label}</span>
        <span className="text-sm font-bold text-cyber-blue">{percentage}%</span>
      </div>
      
      <div className="relative w-full h-3 bg-cyber-dark rounded-full overflow-hidden border border-cyber-blue/30">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full relative"
          style={{
            background: `linear-gradient(to right, ${colors.from}, ${colors.to})`,
          }}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse" />
        </motion.div>
      </div>
    </div>
  );
};

export default ThreatMeter;
