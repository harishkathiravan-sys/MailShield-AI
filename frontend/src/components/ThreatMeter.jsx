import { motion } from 'framer-motion';

const ThreatMeter = ({ score, label }) => {
  // score should be 0-1
  const percentage = Math.round(score * 100);
  
  // Determine color based on score
  const getColor = () => {
    if (score >= 0.8) return { from: '#dc2626', to: '#991b1b' };
    if (score >= 0.6) return { from: '#f97316', to: '#c2410c' };
    if (score >= 0.4) return { from: '#eab308', to: '#ca8a04' };
    return { from: '#22c55e', to: '#16a34a' };
  };

  const colors = getColor();

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-bold text-gray-900">{percentage}%</span>
      </div>
      
      <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden border border-gray-300">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full relative"
          style={{
            background: `linear-gradient(to right, ${colors.from}, ${colors.to})`,
          }}
        >
          <div className="absolute inset-0 bg-white/30 animate-pulse" />
        </motion.div>
      </div>
    </div>
  );
};

export default ThreatMeter;
