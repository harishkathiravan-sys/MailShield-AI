import { useEffect, useRef } from 'react';

export default function CyberBackground() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const scrollRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    
    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle system
    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 2 + 1;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.pulse = Math.random() * Math.PI * 2;
      }

      update(mouseX, mouseY, scroll) {
        // Mouse interaction
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 150) {
          const force = (150 - dist) / 150;
          this.vx -= (dx / dist) * force * 0.5;
          this.vy -= (dy / dist) * force * 0.5;
        }

        // Scroll effect
        this.vy += scroll * 0.01;

        // Natural movement
        this.x += this.vx;
        this.y += this.vy;

        // Damping
        this.vx *= 0.98;
        this.vy *= 0.98;

        // Pulse animation
        this.pulse += 0.02;

        // Wrap around edges
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + Math.sin(this.pulse) * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100, 100, 100, ${this.opacity + Math.sin(this.pulse) * 0.1})`;
        ctx.fill();
      }
    }

    // Grid lines
    class GridLine {
      constructor(vertical = false) {
        this.vertical = vertical;
        this.offset = Math.random() * (vertical ? canvas.width : canvas.height);
        this.speed = Math.random() * 0.5 + 0.2;
        this.opacity = Math.random() * 0.1 + 0.05;
      }

      update(scroll) {
        this.offset += this.speed + scroll * 0.02;
        const max = this.vertical ? canvas.width : canvas.height;
        if (this.offset > max) this.offset = 0;
      }

      draw() {
        ctx.strokeStyle = `rgba(150, 150, 150, ${this.opacity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (this.vertical) {
          ctx.moveTo(this.offset, 0);
          ctx.lineTo(this.offset, canvas.height);
        } else {
          ctx.moveTo(0, this.offset);
          ctx.lineTo(canvas.width, this.offset);
        }
        ctx.stroke();
      }
    }

    // Create particles and grid
    const particles = Array.from({ length: 100 }, () => new Particle());
    const gridLines = [
      ...Array.from({ length: 15 }, () => new GridLine(false)),
      ...Array.from({ length: 15 }, () => new GridLine(true))
    ];

    // Connection lines between close particles
    const drawConnections = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 120) {
            ctx.strokeStyle = `rgba(150, 150, 150, ${0.15 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    // Mouse move handler
    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    // Scroll handler
    const handleScroll = () => {
      const newScroll = window.scrollY;
      scrollRef.current = newScroll - scrollRef.current;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    // Animation loop
    const animate = () => {
      // Light gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(0.5, '#f8f8f8');
      gradient.addColorStop(1, '#ffffff');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      gridLines.forEach(line => {
        line.update(scrollRef.current);
        line.draw();
      });

      // Update and draw particles
      particles.forEach(particle => {
        particle.update(mouseRef.current.x, mouseRef.current.y, scrollRef.current);
        particle.draw();
      });

      // Draw connections
      drawConnections();

      // Glow effects
      ctx.shadowBlur = 20;
      ctx.shadowColor = 'rgba(150, 150, 150, 0.1)';
      
      // Reset scroll delta
      scrollRef.current *= 0.95;

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-white">
      <canvas ref={canvasRef} className="absolute inset-0" />
      
      {/* Additional overlay effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(200,200,200,0.1)_70%,rgba(200,200,200,0.2)_100%)] pointer-events-none" />
      
      {/* Glowing orbs */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-gray-300/10 rounded-full blur-[100px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-gray-400/10 rounded-full blur-[120px] animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />
      
      {/* Bottom fade for content readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/40 pointer-events-none" />
    </div>
  );
}
