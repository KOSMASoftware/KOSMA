
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MorphingText } from '../components/MorphingText';
import { PulsingDotsBackground } from '../components/ui/pulsing-dots-background';
import { Globe, ChevronDown, CheckCircle, Download, AlertTriangle, Lightbulb, TrendingUp } from 'lucide-react';
import { Footer } from '../components/layout/Footer';
import { Card } from '../components/ui/Card';

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
        { 
          title: 'Split costs between producers', 
          desc: 'Clear cost ownership and faster co‑production reporting.',
          pain: 'Costs are split manually across partners, making co‑production budgets messy.',
          solution: 'KOSMA lets you assign costs to multiple producers directly in settings.',
          impact: 'Clear cost ownership and faster co‑production reporting.'
        },
        { 
          title: 'Define fringes & supplements', 
          desc: 'Consistent, compliant cost calculations across all accounts.',
          pain: 'Fringes and wage supplements are calculated differently across projects.',
          solution: 'Define standard fringes and wage supplements once in settings.',
          impact: 'Consistent, compliant cost calculations across all accounts.'
        },
        { 
          title: 'Assign fringes to accounts', 
          desc: 'Accurate labor costs with fewer manual corrections.',
          pain: 'Applying fringes per account is slow and error‑prone.',
          solution: 'Assign fringes and supplements directly to specific accounts.',
          impact: 'Accurate labor costs with fewer manual corrections.'
        },
        { 
          title: 'Define extra costs', 
          desc: 'Full visibility of true personnel costs in one place.',
          pain: 'Extra personnel costs are tracked outside the budget.',
          solution: 'Define extra cost types (travel, catering, hotels) in KOSMA.',
          impact: 'Full visibility of true personnel costs in one place.'
        }
      ]
    },
    {
      id: 'financing',
      title: 'Financing',
      color: '#305583', // Blue Dark
      mediaSrc: 'https://i.ibb.co/tp0B8GWh/Cash-Flow.png',
      features: [
        { 
          title: 'Financing plan templates', 
          desc: 'Faster setup with consistent financing structure.',
          pain: 'Each financing plan starts from scratch.',
          solution: 'Load a financing plan template and adapt it quickly.',
          impact: 'Faster setup with consistent financing structure.'
        },
        { 
          title: 'Manage financing sources', 
          desc: 'Clear funding ownership and easier partner reporting.',
          pain: 'Financing sources and producer shares are scattered across files.',
          solution: 'Edit financing sources and assign them to producers directly.',
          impact: 'Clear funding ownership and easier partner reporting.'
        },
        { 
          title: 'Funding effects as variables', 
          desc: 'Accurate funding calculations tied to real budget data.',
          pain: 'Funding logic is hard to integrate with budget effects.',
          solution: 'Use funding effects as variables in the financing plan.',
          impact: 'Accurate funding calculations tied to real budget data.'
        },
        { 
          title: 'Link expenses to sources', 
          desc: 'Transparent funding allocation and stronger auditability.',
          pain: 'It’s unclear which funding source covers which expense effect.',
          solution: 'Connect expense effects to specific financing sources.',
          impact: 'Transparent funding allocation and stronger auditability.'
        }
      ]
    },
    {
      id: 'cashflow',
      title: 'Cash Flow',
      color: '#FD7A36', // Cashflow Orange
      mediaSrc: 'https://i.ibb.co/tp0B8GWh/Cash-Flow.png',
      features: [
        { 
          title: 'Define milestones & phases', 
          desc: 'Cash‑flow stays aligned with production timelines.',
          pain: 'Cash‑flow rules have to be updated manually whenever schedules change.',
          solution: 'Define milestones and phases to automate cash‑flow logic.',
          impact: 'Cash‑flow stays aligned with production timelines.'
        },
        { 
          title: 'Create cash‑flow rules', 
          desc: 'Consistent payment schedules with less manual work.',
          pain: 'Payment timing is handled in separate spreadsheets.',
          solution: 'Create cash‑flow rules directly inside KOSMA.',
          impact: 'Consistent payment schedules with less manual work.'
        },
        { 
          title: 'Build a cash‑flow plan', 
          desc: 'Immediate financial visibility for production planning.',
          pain: 'Budget and financing data don’t automatically translate into cash‑flow.',
          solution: 'Generate a cash‑flow plan from budget + financing.',
          impact: 'Immediate financial visibility for production planning.'
        },
        { 
          title: 'Add loans/transfers', 
          desc: 'Complete cash‑flow picture without external tools.',
          pain: 'Inter‑producer transfers and loans are tracked separately.',
          solution: 'Add loans or transfers directly into the cash‑flow plan.',
          impact: 'Complete cash‑flow picture without external tools.'
        }
      ]
    },
    {
      id: 'cost-control',
      title: 'Cost Control',
      color: '#7A62D2', // Extra Costs Purple
      mediaSrc: 'https://i.ibb.co/tp0B8GWh/Cash-Flow.png',
      features: [
        { 
          title: 'Compare plan vs actuals', 
          desc: 'Immediate visibility of overruns and deviations.',
          pain: 'Actual costs live outside the budget and are hard to reconcile.',
          solution: 'Match actual costs against the budget in Cost Control.',
          impact: 'Immediate visibility of overruns and deviations.'
        },
        { 
          title: 'Import accounting data', 
          desc: 'Less manual work and fewer reconciliation errors.',
          pain: 'Accounting data must be re‑entered manually.',
          solution: 'Import accounting data directly into Cost Control.',
          impact: 'Less manual work and fewer reconciliation errors.'
        },
        { 
          title: 'Recalculate forecasts', 
          desc: 'Up‑to‑date cost outlooks at any time.',
          pain: 'Forecasts are outdated as soon as costs change.',
          solution: 'Recalculate forecasts per account instantly.',
          impact: 'Up‑to‑date cost outlooks at any time.'
        },
        { 
          title: 'Generate cost reports', 
          desc: 'Fast reporting for producers and financiers.',
          pain: 'Reporting requires extra spreadsheets and formatting.',
          solution: 'Show and print cost reports from Cost Control.',
          impact: 'Fast reporting for producers and financiers.'
        }
      ]
    }
  ];

  const [activeId, setActiveId] = useState(modules[0].id);
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);

  const activeModule = modules.find(m => m.id === activeId) ?? modules[0];
  const activeFeature = activeModule.features[activeFeatureIndex];

  // Reset feature index when changing modules
  useEffect(() => {
    setActiveFeatureIndex(0);
  }, [activeId]);

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

        {/* IMAGE AREA */}
        <div className="relative rounded-3xl overflow-hidden border border-gray-200 bg-gray-100 aspect-[88/36] shadow-2xl shadow-gray-200/50">
          <img
            key={activeModule.id}
            src={activeModule.mediaSrc}
            alt={`${activeModule.title} preview`}
            className="absolute inset-0 w-full h-full object-cover animate-in fade-in duration-500"
          />
        </div>

        {/* 3) Pain / Solution / Impact Block (Active Feature Detail) */}
        <div className="bg-gray-50 rounded-[2rem] border border-gray-200 p-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <div className="space-y-2">
                     <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-red-500">
                        <AlertTriangle className="w-4 h-4" /> Pain
                     </h4>
                     <p className="text-gray-700 font-medium leading-relaxed">
                        {activeFeature.pain}
                     </p>
                 </div>
                 <div className="space-y-2 relative">
                     <div className="hidden md:block absolute left-0 top-0 bottom-0 w-px bg-gray-200 -ml-4"></div>
                     <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-500">
                        <Lightbulb className="w-4 h-4" /> Solution
                     </h4>
                     <p className="text-gray-700 font-medium leading-relaxed">
                        {activeFeature.solution}
                     </p>
                 </div>
                 <div className="space-y-2 relative">
                     <div className="hidden md:block absolute left-0 top-0 bottom-0 w-px bg-gray-200 -ml-4"></div>
                     <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-green-600">
                        <TrendingUp className="w-4 h-4" /> Impact
                     </h4>
                     <p className="text-gray-900 font-bold leading-relaxed">
                        {activeFeature.impact}
                     </p>
                 </div>
             </div>
        </div>

        {/* 4) Feature Cards (Benefit Focused Selector) - UNIFIED PRICING STYLE */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {activeModule.features.map((f, i) => {
            const isActive = i === activeFeatureIndex;
            return (
                <Card 
                  key={i} 
                  onClick={() => setActiveFeatureIndex(i)}
                  color={activeModule.color}
                  interactive
                  enableLedEffect={true}
                  className={`group text-left justify-start ${isActive ? 'ring-1 ring-gray-100' : ''}`}
                >
                  <h3 
                      className={`font-black text-lg mb-3 tracking-tight transition-colors ${isActive ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-700'}`}
                  >
                      {f.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed font-medium">{f.desc}</p>
                  
                  {/* Visual Indicator for Active Selection */}
                  {isActive && (
                      <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-brand-500 animate-pulse"></div>
                  )}
                </Card>
            );
          })}
        </div>

        {/* 6) Final CTA */}
        <div className="text-center pt-8">
            <Link 
              to="/download"
              className="inline-flex items-center gap-3 bg-gray-900 text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-brand-500 transition-all shadow-xl shadow-gray-900/10 hover:shadow-brand-500/20 hover:-translate-y-1"
            >
               <Download className="w-5 h-5" />
               Get KOSMA
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
                  <Link to="/learning" className="hover:text-white transition-colors hidden sm:block">Learning</Link>
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
