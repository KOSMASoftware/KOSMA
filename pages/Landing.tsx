
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const BRAND = '#0093D5';
const BG = '#0b0f14';

export const Landing: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const appRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const mod = await import(
          /* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js'
        );
        if (!mounted || !canvasRef.current) return;
        const TubesCursor = (mod as any).default ?? mod;
        appRef.current = TubesCursor(canvasRef.current, {
          tubes: {
            colors: ['#0093D5', '#306583', '#C2DFEC'],
            lights: {
              intensity: 180,
              colors: ['#0093D5', '#60aed5', '#fe8a2e', '#ff008a']
            }
          }
        });
      } catch (err) {
        console.warn('TubesCursor load failed', err);
      }
    };

    init();

    return () => {
      mounted = false;
      try {
        appRef.current?.destroy?.();
      } catch {
        // no-op
      }
    };
  }, []);

  const randomize = () => {
    const rand = () => `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
    const randN = (n: number) => Array.from({ length: n }, rand);
    try {
      appRef.current?.tubes?.setColors?.(randN(3));
      appRef.current?.tubes?.setLightsColors?.(randN(4));
    } catch {
      // no-op
    }
  };

  return (
    <div
      className="relative w-full h-screen min-h-[520px] overflow-hidden text-white"
      style={{ background: BG, fontFamily: "'Space Grotesk', sans-serif" }}
    >
      {/* HEADER OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-20 flex justify-between items-center p-6 md:px-12 pointer-events-none">
        <div className="pointer-events-auto">
          <Link to="/" className="text-2xl font-black text-white tracking-tighter hover:opacity-80 transition-opacity">KOSMA</Link>
        </div>
        <div className="pointer-events-auto flex gap-6 text-sm font-bold text-white/90">
          <Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link to="/login" className="hover:text-white transition-colors">Login</Link>
        </div>
      </div>

      {/* Subtle circles motif */}
      <div
        className="absolute inset-0 opacity-[0.22] pointer-events-none"
        style={{
          filter: 'blur(0.2px)',
          background:
            'radial-gradient(circle at 85% 50%, rgba(255,255,255,0.22) 0 14px, transparent 15px),\n' +
            'radial-gradient(circle at 90% 35%, rgba(255,255,255,0.18) 0 14px, transparent 15px),\n' +
            'radial-gradient(circle at 95% 55%, rgba(255,255,255,0.20) 0 14px, transparent 15px),\n' +
            'radial-gradient(circle at 80% 70%, rgba(255,255,255,0.16) 0 14px, transparent 15px),\n' +
            'radial-gradient(circle at 88% 82%, rgba(255,255,255,0.12) 0 14px, transparent 15px)'
        }}
      />

      <div className="absolute inset-0 cursor-crosshair" onClick={randomize} />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      <div className="relative z-10 w-full h-full flex items-center justify-center px-6 text-center pointer-events-none">
        <div className="max-w-4xl w-full">
          <h1
            className="m-0 font-black tracking-[-0.04em] leading-[0.95] text-[clamp(38px,6vw,86px)]"
            style={{ textShadow: '0 0 24px rgba(0,0,0,0.65)' }}
          >
            Bring AI to your budget
          </h1>
          <p className="mt-4 mx-auto max-w-2xl text-[clamp(14px,1.6vw,18px)] leading-[1.45] text-white/80">
            Detect deviations earlier. Bring order to costs, cash flow, and forecasts.
          </p>

          <div className="mt-6 flex flex-wrap gap-3 justify-center pointer-events-auto">
            <Link
              to="/signup"
              className="rounded-xl px-4 py-3 text-sm font-bold border border-white/10 transition-transform hover:scale-105 active:scale-95"
              style={{ background: BRAND, color: '#061018', boxShadow: '0 10px 30px rgba(0,147,213,0.35)' }}
            >
              Get started
            </Link>
            <Link
              to="/learning"
              className="rounded-xl px-4 py-3 text-sm font-bold border border-white/15 bg-white/10 text-white/90 backdrop-blur hover:bg-white/20 transition-all"
            >
              See it in action
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 bottom-4 z-10 text-[11px] tracking-[0.18em] uppercase text-white/50 flex gap-4 pointer-events-none">
        <span>Move cursor</span>
        <span>Click to randomize</span>
      </div>

      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(80% 60% at 50% 10%, rgba(0,147,213,0.10), transparent)' }} />
    </div>
  );
};
