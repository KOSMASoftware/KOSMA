
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MorphingText } from '../components/MorphingText';

const BRAND = '#0093D5';
const BG = '#0b0f14';

const FeaturesSection: React.FC = () => {
  const modules = [
    {
      id: 'budgeting',
      title: 'Budgeting',
      mediaSrc: 'https://i.ibb.co/tp0B8GWh/Cash-Flow.png',
      features: [
        { title: 'Budget Structure & Templates', desc: 'Build budgets from proven templates and keep a consistent top‑sheet structure.' },
        { title: 'Line Item Details', desc: 'Edit units, rates, fringes, and markups directly inside each account line.' },
        { title: 'Formula & Variables', desc: 'Use formulas and globals to automate calculations across the entire budget.' },
        { title: 'Scenario Versions', desc: 'Create alternate budget versions and compare totals instantly.' }
      ]
    },
    {
      id: 'financing',
      title: 'Financing',
      mediaSrc: 'https://i.ibb.co/tp0B8GWh/Cash-Flow.png',
      features: [
        { title: 'Funding Sources', desc: 'Define and manage financing sources and assign them to producers.' },
        { title: 'Funding Logic', desc: 'Connect financing lines to budget effects and calculate funding amounts.' },
        { title: 'Co‑Production Splits', desc: 'Track cost shares across partners and countries in one financing view.' },
        { title: 'Print‑Ready Financing', desc: 'Generate clean, shareable financing reports at any time.' }
      ]
    },
    {
      id: 'cashflow',
      title: 'Cash Flow',
      mediaSrc: 'https://i.ibb.co/tp0B8GWh/Cash-Flow.png',
      features: [
        { title: 'Milestones & Phases', desc: 'Set milestones and phases to automate cash‑flow logic.' },
        { title: 'Payment Rules', desc: 'Apply cash‑flow rules by date, milestone, or cycle.' },
        { title: 'Dynamic Forecasting', desc: 'See how changes in the budget instantly affect cash‑flow.' },
        { title: 'Producer Views', desc: 'Separate cash‑flow views by producer or funding entity.' }
      ]
    },
    {
      id: 'cost-control',
      title: 'Cost Control',
      mediaSrc: 'https://i.ibb.co/tp0B8GWh/Cash-Flow.png',
      features: [
        { title: 'Planned vs Actual', desc: 'Compare budgeted values against actuals in real time.' },
        { title: 'Forecast Updates', desc: 'Update forecasts per account and track deviations immediately.' },
        { title: 'Accounting Imports', desc: 'Import accounting data and map it directly to KOSMA accounts.' },
        { title: 'Variance Tracking', desc: 'Highlight overruns and cost drivers with clear variance indicators.' }
      ]
    }
  ];

  const [activeId, setActiveId] = useState(modules[0].id);
  const active = modules.find(m => m.id === activeId) ?? modules[0];

  return (
    <section id="features" className="bg-white py-24 md:py-32 px-6">
      <div className="mx-auto max-w-6xl space-y-10">

        {/* Headline */}
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-semibold lg:text-5xl text-gray-900">Built for production teams</h2>
          <p className="mt-6 text-lg text-gray-600">
            Focused tools for budgeting, financing, cash flow, and cost control.
            <br className="hidden md:block" />
            Discover the latest features designed to optimize your workflow.
          </p>
        </div>

        {/* TOP TABS (Module Switcher) - Centered */}
        <div className="flex flex-wrap justify-center gap-3">
          {modules.map(m => (
            <button
              key={m.id}
              onClick={() => setActiveId(m.id)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all border ${
                activeId === m.id
                  ? 'bg-brand-500 text-white border-brand-500 shadow'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
              }`}
            >
              {m.title}
            </button>
          ))}
        </div>

        {/* MEDIA AREA */}
        <div className="relative rounded-3xl overflow-hidden border border-gray-200 bg-gray-50 aspect-[88/36]">
          <img
            key={active.id}
            src={active.mediaSrc}
            alt={`${active.title} preview`}
            className="absolute inset-0 w-full h-full object-cover animate-in fade-in duration-500"
          />
        </div>

        {/* BOTTOM FEATURES (4 Items per Module) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {active.features.map((f, i) => (
            <div key={i} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:border-gray-200 transition-colors">
              <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
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
    const rand = () => `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
    const randN = (n: number) => Array.from({ length: n }, rand);
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

        {/* FEATURES SECTION */}
        <FeaturesSection />
    </div>
  );
};
