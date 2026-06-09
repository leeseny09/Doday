import { useEffect, useState } from 'react';

interface Props {
  onDone: () => void;
}

export function SplashScreen({ onDone }: Props) {
  const [phase, setPhase] = useState<'enter' | 'visible' | 'exit'>('enter');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('visible'), 100);
    const t2 = setTimeout(() => setPhase('exit'), 1800);
    const t3 = setTimeout(onDone, 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  const opacity = phase === 'enter' ? 0 : phase === 'visible' ? 1 : 0;
  const scale   = phase === 'enter' ? 0.85 : phase === 'visible' ? 1 : 1.05;

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: '#005AE0',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 999,
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
    }}>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        opacity, transform: `scale(${scale})`,
        transition: 'opacity 0.4s ease, transform 0.4s ease',
      }}>
        {/* Logo mark */}
        <div style={{
          width: 80, height: 80, borderRadius: 24,
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        }}>
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            <circle cx="22" cy="22" r="18" stroke="white" strokeWidth="2.5" fill="none" opacity="0.4" />
            <circle
              cx="22" cy="22" r="18"
              stroke="white" strokeWidth="2.5" fill="none"
              strokeDasharray={`${2 * Math.PI * 18 * 0.73} ${2 * Math.PI * 18}`}
              strokeLinecap="round"
              transform="rotate(-90 22 22)"
            />
            <circle cx="22" cy="22" r="5" fill="white" />
          </svg>
        </div>

        {/* Wordmark */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 800, color: '#FFFFFF', letterSpacing: '-1.5px', lineHeight: 1 }}>
            doday
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 6, letterSpacing: '0.02em' }}>
            오늘을 완성하는 스마트 플래너
          </div>
        </div>
      </div>

      {/* Bottom dots */}
      <div style={{
        position: 'absolute', bottom: 48,
        display: 'flex', gap: 6,
        opacity, transition: 'opacity 0.4s ease',
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: 3,
            background: i === 0 ? '#FFFFFF' : 'rgba(255,255,255,0.35)',
          }} />
        ))}
      </div>
    </div>
  );
}
