import { motion } from 'framer-motion';

const LoadingSpinner = ({ message = 'Analyzing...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative w-24 h-24 mb-6">
        {/* Outer ring */}
        <motion.div
          className="absolute inset-0 border-4 border-cyber-blue/30 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
        
        {/* Inner ring */}
        <motion.div
          className="absolute inset-2 border-4 border-cyber-purple/50 rounded-full border-t-transparent"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
        
        {/* Center dot */}
        <motion.div
          className="absolute inset-0 m-auto w-4 h-4 bg-cyber-blue rounded-full"
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [1, 0.5, 1]
          }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      </div>

      <motion.p
        className="text-cyber-blue font-medium text-lg"
        animate={{ opacity: [1, 0.5, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {message}
      </motion.p>

      {/* Scanning effect */}
      <div className="mt-4 w-64 h-1 bg-cyber-dark rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-transparent via-cyber-blue to-transparent"
          animate={{ x: [-256, 256] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    </div>
  );
};

export default LoadingSpinner;
