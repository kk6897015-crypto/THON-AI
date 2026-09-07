import React, { useEffect, useRef } from 'react';

/**
 * BatmanIntro — Full-screen cinematic intro overlay with bat-signal animation.
 * Calls onComplete() after the animation finishes (or on user click/tap).
 */
export function BatmanIntro({ onComplete }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    // Auto-dismiss after 3.5 seconds
    const timer = setTimeout(() => {
      handleDismiss();
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    const el = overlayRef.current;
    if (!el) return;
    el.style.transition = 'opacity 0.6s ease';
    el.style.opacity = '0';
    setTimeout(() => {
      onComplete?.();
    }, 600);
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleDismiss}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'radial-gradient(ellipse at center, #1a0a00 0%, #0E0A09 60%, #000 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        animation: 'batFadeIn 0.5s ease forwards',
      }}
    >
      <style>{`
        @keyframes batFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes batSignalPulse {
          0%, 100% { transform: scale(1); opacity: 0.9; filter: drop-shadow(0 0 30px #DE3C25) drop-shadow(0 0 60px #DE3C2566); }
          50% { transform: scale(1.07); opacity: 1; filter: drop-shadow(0 0 60px #DE3C25) drop-shadow(0 0 120px #DE3C2588); }
        }
        @keyframes batTextReveal {
          from { opacity: 0; letter-spacing: 0.5em; }
          to { opacity: 1; letter-spacing: 0.25em; }
        }
        @keyframes batBeamSweep {
          0% { transform: rotate(-20deg); opacity: 0.15; }
          50% { transform: rotate(20deg); opacity: 0.3; }
          100% { transform: rotate(-20deg); opacity: 0.15; }
        }
      `}</style>

      {/* Bat-signal beam */}
      <div style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}>
        <div style={{
          position: 'absolute',
          bottom: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '300px',
          height: '600px',
          background: 'conic-gradient(from -10deg at 50% 100%, transparent 0deg, #DE3C2520 15deg, transparent 30deg)',
          animation: 'batBeamSweep 3s ease-in-out infinite',
          transformOrigin: 'bottom center',
        }} />
      </div>

      {/* Bat Logo SVG */}
      <svg
        viewBox="0 0 200 120"
        style={{
          width: 'clamp(120px, 25vw, 220px)',
          fill: '#DE3C25',
          animation: 'batSignalPulse 1.8s ease-in-out infinite',
          marginBottom: '32px',
        }}
      >
        <path d="M100 10 C60 10, 20 35, 5 65 C20 55, 40 58, 55 70 C45 58, 50 40, 65 35 C60 50, 62 65, 70 75 L100 55 L130 75 C138 65, 140 50, 135 35 C150 40, 155 58, 145 70 C160 58, 180 55, 195 65 C180 35, 140 10, 100 10 Z" />
      </svg>

      {/* Title */}
      <p style={{
        fontFamily: "'Outfit', sans-serif",
        color: '#F5E8E2',
        fontSize: 'clamp(18px, 4vw, 28px)',
        fontWeight: 700,
        letterSpacing: '0.25em',
        textTransform: 'uppercase',
        animation: 'batTextReveal 1s ease 0.3s both',
        marginBottom: '8px',
      }}>
        THON-AI
      </p>

      <p style={{
        fontFamily: "'Geist Mono', monospace",
        color: '#A89892',
        fontSize: 'clamp(10px, 2vw, 14px)',
        letterSpacing: '0.2em',
        animation: 'batTextReveal 1s ease 0.7s both',
      }}>
        YOUR HACKATHON COMMAND CENTER
      </p>

      {/* Skip hint */}
      <p style={{
        position: 'absolute',
        bottom: '24px',
        fontFamily: "'Geist Mono', monospace",
        color: '#A89892',
        fontSize: '11px',
        opacity: 0.6,
        letterSpacing: '0.1em',
      }}>
        tap anywhere to continue →
      </p>
    </div>
  );
}
