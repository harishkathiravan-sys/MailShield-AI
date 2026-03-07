import { motion } from 'framer-motion';

export default function ScanLine({ duration = 2, delay = 0 }) {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      initial={{ opacity: 0 }}
      whileHover={{ opacity: 1 }}
    >
      <motion.div
        className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-cyber-blue to-transparent shadow-[0_0_10px_rgba(0,212,255,0.8)]"
        initial={{ top: '-2px' }}
        animate={{ top: '100%' }}
        transition={{
          duration,
          delay,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </motion.div>
  );
}
