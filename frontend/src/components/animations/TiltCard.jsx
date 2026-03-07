import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function TiltCard({ children, className = '', intensity = 15 }) {
  const cardRef = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    const rotateXValue = (mouseY / (rect.height / 2)) * -intensity;
    const rotateYValue = (mouseX / (rect.width / 2)) * intensity;

    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsHovering(false);
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  return (
    <motion.div
      ref={cardRef}
      className={`relative ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      animate={{
        rotateX: rotateX,
        rotateY: rotateY,
        scale: isHovering ? 1.05 : 1,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
    >
      <div
        style={{
          transform: 'translateZ(50px)',
          transformStyle: 'preserve-3d',
        }}
      >
        {children}
      </div>
      
      {/* Shine effect */}
      {isHovering && (
        <div
          className="absolute inset-0 pointer-events-none opacity-30 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${((rotateY / intensity) * 50) + 50}% ${((rotateX / -intensity) * 50) + 50}%, rgba(0, 212, 255, 0.3), transparent 50%)`,
          }}
        />
      )}
    </motion.div>
  );
}
