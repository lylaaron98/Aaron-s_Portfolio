import { useEffect, useRef, useState } from 'react';

const TRAIL_LENGTH = 8;
const TRAIL_FADE = 0.13;

export default function CursorOverlay() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [trail, setTrail] = useState<Array<{x: number, y: number}>>(Array(TRAIL_LENGTH).fill({x: -100, y: -100}));

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setTrail(prev => [{x: e.clientX, y: e.clientY}, ...prev.slice(0, TRAIL_LENGTH - 1)]);
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };
    document.addEventListener('mousemove', handleMove);
    return () => document.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <>
      {trail.map((pos, idx) => (
        <div
          key={idx}
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: `${32 - idx * 2}px`,
            height: `${32 - idx * 2}px`,
            pointerEvents: 'none',
            zIndex: 9999,
            borderRadius: '50%',
            background: `rgba(192,192,200,${0.10 - idx * (TRAIL_FADE * 0.7)})`,
            boxShadow:
              '0 0 16px 4px rgba(192,192,200,0.18), 0 0 4px 1px rgba(255,255,255,0.10), 0 1px 4px rgba(120,120,140,0.08)',
            border: '1px solid rgba(255,255,255,0.10)',
            transition: 'background 0.2s, box-shadow 0.2s',
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)',
            mixBlendMode: 'lighten',
            transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
            opacity: 1 - idx * 0.13,
          }}
        />
      ))}
      <div
        ref={cursorRef}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: '32px',
          height: '32px',
          pointerEvents: 'none',
          zIndex: 9999,
          borderRadius: '50%',
          background: 'rgba(192,192,200,0.10)',
          boxShadow:
            '0 0 16px 4px rgba(192,192,200,0.18), 0 0 4px 1px rgba(255,255,255,0.10), 0 1px 4px rgba(120,120,140,0.08)',
          border: '1px solid rgba(255,255,255,0.10)',
          transition: 'background 0.2s, box-shadow 0.2s',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
          mixBlendMode: 'lighten',
        }}
      />
    </>
  );
}
