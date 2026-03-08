import { motion } from 'framer-motion';
import { Shield, Lock, Search, Zap } from 'lucide-react';

const LoadingSpinner = ({ message = 'Analyzing...' }) => {
  // Particle animation variants
  const particleVariants = {
    animate: (i) => ({
      y: [0, -30, 0],
      x: [0, Math.sin(i) * 20, 0],
      opacity: [0, 1, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        delay: i * 0.2,
        ease: "easeInOut"
      }
    })
  };

  // Icon rotation animation
  const iconVariants = {
    animate: (i) => ({
      rotate: 360,
      scale: [1, 1.2, 1],
      transition: {
        rotate: { duration: 3 + i, repeat: Infinity, ease: "linear" },
        scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
      }
    })
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 relative overflow-hidden">
      
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            custom={i}
            variants={particleVariants}
            animate="animate"
            className="absolute w-1 h-1 bg-cyber-blue rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Main spinner container */}
      <div className="relative z-10">
        
        {/* Outer glow ring */}
        <motion.div
          className="absolute inset-0 w-32 h-32 -m-4"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-full h-full rounded-full bg-gradient-to-r from-cyber-blue to-cyber-purple blur-xl opacity-50" />
        </motion.div>

        {/* Multiple rotating rings */}
        <div className="relative w-24 h-24 mb-8">
          
          {/* Outer ring 1 */}
          <motion.div
            className="absolute inset-0 border-4 border-transparent rounded-full"
            style={{
              borderTopColor: '#3b82f6',
              borderRightColor: '#8b5cf6',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <motion.div
              className="absolute -top-2 left-1/2 w-4 h-4 bg-cyber-blue rounded-full shadow-lg shadow-cyber-blue"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </motion.div>
          
          {/* Middle ring */}
          <motion.div
            className="absolute inset-3 border-4 border-transparent rounded-full"
            style={{
              borderBottomColor: '#a855f7',
              borderLeftColor: '#06b6d4',
            }}
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
          
          {/* Inner ring */}
          <motion.div
            className="absolute inset-6 border-4 border-transparent rounded-full"
            style={{
              borderTopColor: '#06b6d4',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          
          {/* Center pulsing core */}
          <motion.div
            className="absolute inset-0 m-auto w-6 h-6 rounded-full bg-gradient-to-br from-cyber-blue via-cyber-purple to-cyan-400"
            animate={{ 
              scale: [1, 1.5, 1],
              rotate: [0, 180, 360],
              boxShadow: [
                '0 0 20px rgba(59, 130, 246, 0.5)',
                '0 0 40px rgba(139, 92, 246, 0.8)',
                '0 0 20px rgba(59, 130, 246, 0.5)',
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>

        {/* Floating icons */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            custom={0}
            variants={iconVariants}
            animate="animate"
            className="absolute -top-12 -left-12 text-cyber-blue opacity-30"
          >
            <Shield className="w-8 h-8" />
          </motion.div>
          
          <motion.div
            custom={1}
            variants={iconVariants}
            animate="animate"
            className="absolute -top-12 -right-12 text-cyber-purple opacity-30"
          >
            <Lock className="w-8 h-8" />
          </motion.div>
          
          <motion.div
            custom={2}
            variants={iconVariants}
            animate="animate"
            className="absolute -bottom-12 -left-12 text-cyan-400 opacity-30"
          >
            <Search className="w-8 h-8" />
          </motion.div>
          
          <motion.div
            custom={3}
            variants={iconVariants}
            animate="animate"
            className="absolute -bottom-12 -right-12 text-purple-400 opacity-30"
          >
            <Zap className="w-8 h-8" />
          </motion.div>
        </div>
      </div>

      {/* Animated message */}
      <motion.div
        className="text-center z-10 mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.p
          className="text-xl font-bold bg-gradient-to-r from-cyber-blue via-cyan-400 to-cyber-purple bg-clip-text text-transparent mb-2"
          animate={{ 
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          style={{ backgroundSize: '200% 200%' }}
        >
          {message}
        </motion.p>
        
        {/* Typing dots animation */}
        <div className="flex items-center justify-center gap-1 h-6">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-cyber-blue rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Progress bar with gradient */}
      <div className="relative w-80 h-2 bg-cyber-dark rounded-full overflow-hidden z-10 shadow-inner">
        <motion.div
          className="absolute h-full w-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4, #3b82f6)',
            backgroundSize: '200% 100%',
          }}
          animate={{
            backgroundPosition: ['0% 0%', '200% 0%'],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            backgroundPosition: { duration: 2, repeat: Infinity, ease: 'linear' },
            opacity: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
          }}
        />
        
        {/* Shimmer effect */}
        <motion.div
          className="absolute h-full w-1/3 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
          animate={{ x: ['-100%', '300%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Status indicators */}
      <motion.div
        className="mt-8 flex gap-6 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {[
          { label: 'Scanning', color: 'text-cyan-400' },
          { label: 'Analyzing', color: 'text-cyber-blue' },
          { label: 'Processing', color: 'text-purple-400' },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            className="flex items-center gap-2"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
          >
            <motion.div
              className={`w-2 h-2 rounded-full ${item.color.replace('text', 'bg')}`}
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.5 }}
            />
            <span className={`text-sm ${item.color}`}>{item.label}</span>
          </motion.div>
        ))}
      </motion.div>

    </div>
  );
};

export default LoadingSpinner;
