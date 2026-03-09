import { useState, useEffect } from 'react';

export default function GlitchText({ text, className = '' }) {
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 200);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <span className={`relative inline-block ${className}`}>
      <span className={`relative z-10 ${isGlitching ? 'animate-glitch' : ''}`}>
        {text}
      </span>
      {isGlitching && (
        <>
          <span
            className="absolute top-0 left-0 text-gray-800 opacity-70 animate-glitch-1"
            aria-hidden="true"
          >
            {text}
          </span>
          <span
            className="absolute top-0 left-0 text-red-600 opacity-70 animate-glitch-2"
            aria-hidden="true"
          >
            {text}
          </span>
        </>
      )}
    </span>
  );
}
