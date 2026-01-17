
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Shield, Layout, Globe, Cpu, Layers } from 'lucide-react';
import { MorphingText } from '../components/MorphingText';

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
    <div className="flex flex-col w-full font-sans">
        {/* HERO SECTION */}
        <div
        className="relative w-full h-screen min-h-[600px] overflow-hidden text-white"
        style={{ background: BG }}
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
                Simply the most advanced{' '}
                <MorphingText
                  words={[
                    'Budgeting',
                    'Financing',
                    'Cash Flow',
                    'Cost Control'
                  ]}
                />{' '}
                Software
            </p>

            <div className="mt-8 flex flex-wrap gap-4 justify-center pointer-events-auto">
                <Link
                to="/download"
                className="rounded-xl px-6 py-4 text-sm font-bold border border-white/10 transition-transform hover:scale-105 active:scale-95 shadow-xl shadow-brand-500/20"
                style={{ background: BRAND, color: '#061018' }}
                >
                Get started
                </Link>
                <a
                href="#features"
                className="rounded-xl px-6 py-4 text-sm font-bold border border-white/15 bg-white/10 text-white/90 backdrop-blur hover:bg-white/20 transition-all"
                >
                See it in action
                </a>
            </div>
            </div>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 bottom-8 z-10 text-[10px] tracking-[0.2em] uppercase text-white/40 flex gap-6 pointer-events-none">
            <span>Move cursor</span>
            <span>Click to randomize</span>
        </div>

        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(80% 60% at 50% 10%, rgba(0,147,213,0.10), transparent)' }} />
        </div>

        {/* FEATURES SECTION */}
        <section id="features" className="bg-white py-32 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-24">
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-6">Production Intelligence</h2>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                        Powerful tools designed for the complexities of modern film production.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { icon: Zap, title: "Real-time Calculation", desc: "Instant updates across all budget lines and summaries." },
                        { icon: Shield, title: "Secure & Local", desc: "Your data stays on your machine, synced only when you say so." },
                        { icon: Layout, title: "Intuitive Interface", desc: "Designed for speed and clarity in high-pressure environments." },
                        { icon: Globe, title: "Multi-Currency", desc: "Handle international productions with dynamic exchange rates." },
                        { icon: Cpu, title: "AI Forecasting", desc: "Predict cost overruns before they impact your bottom line." },
                        { icon: Layers, title: "Scenario Planning", desc: "Create unlimited budget versions and compare them instantly." }
                    ].map((feature, i) => (
                        <div key={i} className="p-8 rounded-[2rem] border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                            <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center mb-6 text-brand-500 group-hover:bg-brand-500 group-hover:text-white transition-colors shadow-sm">
                                <feature.icon className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                            <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    </div>
  );
};
