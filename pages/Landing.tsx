
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MorphingText } from '../components/MorphingText';
import { PulsingDotsBackground } from '../components/ui/pulsing-dots-background';
import { Globe, ChevronDown, CheckCircle, ArrowRight, Download } from 'lucide-react';
import { Footer } from '../components/layout/Footer';

const BRAND = '#0093D5';
const BG = '#0b0f14';

const FeaturesSection: React.FC = () => {
  const modules = [
    {
      id: 'budgeting',
      title: 'Budgeting',
      color: '#0093D5', // Brand Blue
      mediaSrc: 'https://i.ibb.co/tp0B8GWh/Cash-Flow.png',
      features: [
        { title: 'Template-Driven Budgets', desc: 'Start in minutes with proven top‑sheet structures.' },
        { title: 'Line-Item Precision', desc: 'Edit rates, fringes, and markups without spreadsheet errors.' },
        { title: 'Globals & Formulas', desc: 'Change once, update everywhere.' },
        { title: 'Scenario Versions', desc: 'Compare alternatives in seconds.' }
      ]
    },
    {
      id: 'financing',
      title: 'Financing',
      color: '#305583', // Blue Dark
      mediaSrc: 'https://i.ibb.co/tp0B8GWh/Cash-Flow.png',
      features: [
        { title: 'Funding Sources', desc: 'Manage sources and assign to producers instantly.' },
        { title: 'Funding Logic', desc: 'Connect lines to effects to calculate funding automatically.' },
        { title: 'Co-Production Splits', desc: 'Track cost shares across partners in one view.' },
        { title: 'Print-Ready Financing', desc: 'Generate shareable reports without formatting pain.' }
      ]
    },
    {
      id: 'cashflow',
      title: 'Cash Flow',
      color: '#FD7A36', // Cashflow Orange
      mediaSrc: 'https://i.ibb.co/tp0B8GWh/Cash-Flow.png',
      features: [
        { title: 'Milestones & Phases', desc: 'Automate logic based on production schedule.' },
        { title: 'Payment Rules', desc: 'Apply rules by date or milestone effortlessly.' },
        { title: 'Dynamic Forecasting', desc: 'Instant updates when budget changes.' },
        { title: 'Producer Views', desc: 'Separate views for different funding entities.' }
      ]
    },
    {
      id: 'cost-control',
      title: 'Cost Control',
      color: '#7A62D2', // Extra Costs Purple
      mediaSrc: 'https://i.ibb.co/tp0B8GWh/Cash-Flow.png',
      features: [
        { title: 'Planned vs Actual', desc: 'Compare real-time data against your budget.' },
        { title: 'Forecast Updates', desc: 'Track deviations immediately per account.' },
        { title: 'Accounting Imports', desc: 'Map accounting data directly to KOSMA.' },
        { title: 'Variance Tracking', desc: 'Spot overruns before they become problems.' }
      ]
    }
  ];

  const [activeId, setActiveId] = useState(modules[0].id);
  const active = modules.find(m => m.id === activeId) ?? modules[0];

  return (
    <section id="features" className="relative z-10 py-24 md:py-32 px-6">
      <div className="mx-auto max-w-6xl space-y-12">

        {/* 1) New Headline + Pain-Point Subline */}
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-4xl font-black lg:text-6xl text-gray-900 tracking-tight leading-[1.1]">
            Stop budget chaos <br className="hidden md:block" /> in production.
          </h2>
          <p className="text-xl md:text-2xl text-gray-500 font-medium leading-relaxed max-w-3xl mx-auto">
            Fix version chaos, avoid late cost surprises, and keep financiers aligned — in one system.
          </p>
        </div>

        {/* 2) Feature-Tabs (Module Switcher) - Centered */}
        <div className="flex flex-wrap justify-center gap-3 pt-4">
          {modules.map(m => (
            <button
              key={m.id}
              onClick={() => setActiveId(m.id)}
              className={`px-6 py-3 rounded-full text-sm font-bold transition-all border ${
                activeId === m.id
                  ? 'bg-brand-500 text-white border-brand-500 shadow-lg shadow-brand-500/25 scale-105'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-900'
              }`}
            >
              {m.title}
            </button>
          ))}
        </div>

        {/* MEDIA AREA */}
        <div className="relative rounded-3xl overflow-hidden border border-gray-200 bg-gray-100 aspect-[88/36] shadow-2xl shadow-gray-200/50">
          <img
            key={active.id}
            src={active.mediaSrc}
            alt={`${active.title} preview`}
            className="absolute inset-0 w-full h-full object-cover animate-in fade-in duration-500"
          />
        </div>

        {/* 3) Feature Cards (Benefit Focused) - UNIFIED PRICING STYLE */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {active.features.map((f, i) => (
            <div 
              key={i} 
              className="bg-white rounded-[2rem] p-8 border border-gray-100 border-t-[8px] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col justify-start shadow-sm"
              style={{ borderTopColor: active.color }}
            >
              <h3 
                className="font-black text-lg mb-3 tracking-tight"
                style={{ color: active.color }}
              >
                {f.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed font-medium">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* 4) "Why KOSMA" Bar */}
        <div className="pt-12 pb-4">
          <div className="bg-gray-50 rounded-3xl border border-gray-100 p-8 md:px-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
               {[
                 "Version chaos ends",
                 "Deviations found earlier",
                 "Offline-first, always",
                 "Shareable reports"
               ].map((item, idx) => (
                 <div key={idx} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center shrink-0">
                       <CheckCircle className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-sm font-bold text-gray-900 tracking-tight">{item}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* 5) Final CTA */}
        <div className="text-center pt-8">
            <Link 
              to="/download"
              className="inline-flex items-center gap-3 bg-gray-900 text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-brand-500 transition-all shadow-xl shadow-gray-900/10 hover:shadow-brand-500/20 hover:-translate-y-1"
            >
               <Download className="w-5 h-5" />
               Get the desktop app
            </Link>
            <p className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
               14-day full feature trial
            </p>
        </div>

      </div>
    </section>
  );
};

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
    const rand = (n: number) => `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
    const randN = (n: number) => Array.from({ length: n }, () => rand(n));
    try {
      appRef.current?.tubes?.setColors?.(randN(3));
      appRef.current?.tubes?.setLightsColors?.(randN(4));
    } catch {
      // no-op
    }
  };

  const scrollToFeatures = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('features');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
      <div className="flex flex-col w-full font-sans bg-white">
          {/* HERO SECTION - OUTSIDE PulsingDotsBackground */}
          <div
            className="relative w-full h-screen min-h-[600px] overflow-hidden text-white z-20"
            style={{ background: BG }}
          >
            {/* HEADER OVERLAY */}
            <div className="absolute top-0 left-0 w-full z-20 flex justify-between items-center p-6 md:px-12 pointer-events-none">
                <div className="pointer-events-auto">
                  <Link to="/" className="text-2xl font-black text-white tracking-tighter hover:opacity-80 transition-opacity">KOSMA</Link>
                </div>
                <div className="pointer-events-auto flex items-center gap-6 text-sm font-bold text-white/90">
                  {/* Language Picker (Visual only) */}
                  <div className="hidden md:flex items-center gap-1.5 hover:text-white cursor-pointer transition-colors opacity-80 hover:opacity-100 border-r border-white/20 pr-4">
                    <Globe className="w-4 h-4" />
                    <span className="text-xs uppercase">EN</span>
                    <ChevronDown className="w-3 h-3 opacity-70" />
                  </div>
                  
                  <Link to="/pricing" className="hover:text-white transition-colors hidden sm:block">Pricing</Link>
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
                    onClick={scrollToFeatures}
                    className="rounded-xl px-6 py-4 text-sm font-bold border border-white/15 bg-white/10 text-white/90 backdrop-blur hover:bg-white/20 transition-all cursor-pointer"
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

          {/* CONTENT SECTION - WRAPPED IN DOTS */}
          <PulsingDotsBackground>
              {/* FEATURES SECTION */}
              <FeaturesSection />

              {/* FOOTER */}
              <Footer />
          </PulsingDotsBackground>
      </div>
  );
};
