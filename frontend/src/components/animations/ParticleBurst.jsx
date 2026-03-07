import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ParticleBurst({ children, particleCount = 12, className = '' }) {
  const [particles, setParticles] = useState([]);

  const createBurst = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: Date.now() + i,
      x,
      y,
      angle: (Math.PI * 2 * i) / particleCount,
    }));

    setParticles(newParticles);

    setTimeout(() => {
      setParticles([]);
    }, 1000);
  }, [particleCount]);

  return (
    <div className={`relative ${className}`} onClick={createBurst}>
      {children}
      
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-2 h-2 rounded-full bg-cyber-blue pointer-events-none"
            initial={{
              x: particle.x,
              y: particle.y,
              scale: 0,
              opacity: 1,
            }}
            animate={{
              x: particle.x + Math.cos(particle.angle) * 100,
              y: particle.y + Math.sin(particle.angle) * 100,
              scale: 1,
              opacity: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
