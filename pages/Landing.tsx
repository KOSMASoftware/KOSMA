
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MorphingText } from '../components/MorphingText';
import { PulsingDotsBackground } from '../components/ui/pulsing-dots-background';
import { Logo } from '../components/ui/Logo';
import { Globe, ChevronDown, CheckCircle, Download, AlertTriangle, Lightbulb, TrendingUp, Menu, X, Check, ArrowRight, AlertCircle, Zap } from 'lucide-react';
import { Footer } from '../components/layout/Footer';
import { Card } from '../components/ui/Card';

const BRAND = '#0093D5';
const BG = '#0b0f14';

// --- DATA STRUCTURE ---

type FeatureItem = {
  title: string;
  desc: string;
  pain: string;
  solution: string;
  impact: string;
  image: string; // Placeholder for specific UI screens per feature
};

type ModuleData = {
  id: string;
  label: string;
  color: string;
  features: FeatureItem[];
};

const MODULES: ModuleData[] = [
  {
    id: 'budgeting',
    label: 'Budgeting',
    color: 'bg-brand-500',
    features: [
      {
        title: 'Split costs between producers',
        desc: 'Clear cost ownership and faster co‑production reporting.',
        pain: 'Costs are split manually across partners, making co‑production budgets messy.',
        solution: 'KOSMA lets you assign costs to multiple producers directly in settings.',
        impact: 'Clear cost ownership and faster co‑production reporting.',
        image: 'https://i.ibb.co/tp0B8GWh/Cash-Flow.png'
      },
      {
        title: 'Define fringes & supplements',
        desc: 'Consistent, compliant cost calculations across all accounts.',
        pain: 'Fringes and wage supplements are calculated differently across projects.',
        solution: 'Define standard fringes and wage supplements once in settings.',
        impact: 'Consistent, compliant cost calculations across all accounts.',
        image: 'https://i.ibb.co/tp0B8GWh/Cash-Flow.png'
      },
      {
        title: 'Assign fringes to accounts',
        desc: 'Accurate labor costs with fewer manual corrections.',
        pain: 'Applying fringes per account is slow and error‑prone.',
        solution: 'Assign fringes and supplements directly to specific accounts.',
        impact: 'Accurate labor costs with fewer manual corrections.',
        image: 'https://i.ibb.co/tp0B8GWh/Cash-Flow.png'
      },
      {
        title: 'Define extra costs',
        desc: 'Full visibility of true personnel costs in one place.',
        pain: 'Extra personnel costs are tracked outside the budget.',
        solution: 'Define extra cost types (travel, catering, hotels) in KOSMA.',
        impact: 'Full visibility of true personnel costs in one place.',
        image: 'https://i.ibb.co/tp0B8GWh/Cash-Flow.png'
      }
    ]
  },
  {
    id: 'financing',
    label: 'Financing',
    color: 'bg-blue-700',
    features: [
      {
        title: 'Financing plan templates',
        desc: 'Faster setup with consistent financing structure.',
        pain: 'Each financing plan starts from scratch.',
        solution: 'Load a financing plan template and adapt it quickly.',
        impact: 'Faster setup with consistent financing structure.',
        image: 'https://i.ibb.co/tp0B8GWh/Cash-Flow.png'
      },
      {
        title: 'Manage financing sources',
        desc: 'Clear funding ownership and easier partner reporting.',
        pain: 'Financing sources and producer shares are scattered across files.',
        solution: 'Edit financing sources and assign them to producers directly.',
        impact: 'Clear funding ownership and easier partner reporting.',
        image: 'https://i.ibb.co/tp0B8GWh/Cash-Flow.png'
      },
      {
        title: 'Funding effects as variables',
        desc: 'Accurate funding calculations tied to real budget data.',
        pain: 'Funding logic is hard to integrate with budget effects.',
        solution: 'Use funding effects as variables in the financing plan.',
        impact: 'Accurate funding calculations tied to real budget data.',
        image: 'https://i.ibb.co/tp0B8GWh/Cash-Flow.png'
      },
      {
        title: 'Link expenses to sources',
        desc: 'Transparent funding allocation and stronger auditability.',
        pain: 'It’s unclear which funding source covers which expense effect.',
        solution: 'Connect expense effects to specific financing sources.',
        impact: 'Transparent funding allocation and stronger auditability.',
        image: 'https://i.ibb.co/tp0B8GWh/Cash-Flow.png'
      }
    ]
  },
  {
    id: 'cashflow',
    label: 'Cash Flow',
    color: 'bg-orange-500',
    features: [
      {
        title: 'Define milestones & phases',
        desc: 'Cash‑flow stays aligned with production timelines.',
        pain: 'Cash‑flow rules have to be updated manually whenever schedules change.',
        solution: 'Define milestones and phases to automate cash‑flow logic.',
        impact: 'Cash‑flow stays aligned with production timelines.',
        image: 'https://i.ibb.co/tp0B8GWh/Cash-Flow.png'
      },
      {
        title: 'Create cash‑flow rules',
        desc: 'Consistent payment schedules with less manual work.',
        pain: 'Payment timing is handled in separate spreadsheets.',
        solution: 'Create cash‑flow rules directly inside KOSMA.',
        impact: 'Consistent payment schedules with less manual work.',
        image: 'https://i.ibb.co/tp0B8GWh/Cash-Flow.png'
      },
      {
        title: 'Build a cash‑flow plan',
        desc: 'Immediate financial visibility for production planning.',
        pain: 'Budget and financing data don’t automatically translate into cash‑flow.',
        solution: 'Generate a cash‑flow plan from budget + financing.',
        impact: 'Immediate financial visibility for production planning.',
        image: 'https://i.ibb.co/tp0B8GWh/Cash-Flow.png'
      },
      {
        title: 'Add loans/transfers',
        desc: 'Complete cash‑flow picture without external tools.',
        pain: 'Inter‑producer transfers and loans are tracked separately.',
        solution: 'Add loans or transfers directly into the cash‑flow plan.',
        impact: 'Complete cash‑flow picture without external tools.',
        image: 'https://i.ibb.co/tp0B8GWh/Cash-Flow.png'
      }
    ]
  },
  {
    id: 'costcontrol',
    label: 'Cost Control',
    color: 'bg-purple-600',
    features: [
      {
        title: 'Compare plan vs actuals',
        desc: 'Immediate visibility of overruns and deviations.',
        pain: 'Actual costs live outside the budget and are hard to reconcile.',
        solution: 'Match actual costs against the budget in Cost Control.',
        impact: 'Immediate visibility of overruns and deviations.',
        image: 'https://i.ibb.co/tp0B8GWh/Cash-Flow.png'
      },
      {
        title: 'Import accounting data',
        desc: 'Less manual work and fewer reconciliation errors.',
        pain: 'Accounting data must be re‑entered manually.',
        solution: 'Import accounting data directly into Cost Control.',
        impact: 'Less manual work and fewer reconciliation errors.',
        image: 'https://i.ibb.co/tp0B8GWh/Cash-Flow.png'
      },
      {
        title: 'Recalculate forecasts',
        desc: 'Up‑to‑date cost outlooks at any time.',
        pain: 'Forecasts are outdated as soon as costs change.',
        solution: 'Recalculate forecasts per account instantly.',
        impact: 'Up‑to‑date cost outlooks at any time.',
        image: 'https://i.ibb.co/tp0B8GWh/Cash-Flow.png'
      },
      {
        title: 'Generate cost reports',
        desc: 'Fast reporting for producers and financiers.',
        pain: 'Reporting requires extra spreadsheets and formatting.',
        solution: 'Show and print cost reports from Cost Control.',
        impact: 'Fast reporting for producers and financiers.',
        image: 'https://i.ibb.co/tp0B8GWh/Cash-Flow.png'
      }
    ]
  }
];

// --- COMPONENTS ---

const FeatureScrollytelling = () => {
  const [activeModuleId, setActiveModuleId] = useState('budgeting');
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  
  const activeModule = MODULES.find(m => m.id === activeModuleId) || MODULES[0];

  // Reset scroll state when tab changes
  useEffect(() => {
    setActiveFeatureIndex(0);
  }, [activeModuleId]);

  // Scroll Progress Logic - Based on provided Example
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      
      const { top, height } = sectionRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Calculate how far we scrolled through the section (0 to 1)
      const startOffset = viewportHeight * 0.2;
      const endOffset = viewportHeight * 0.2;
      const scrolled = -top + startOffset;
      const scrollableHeight = height - viewportHeight + endOffset;
      
      let progress = scrolled / scrollableHeight;
      
      // Clamp 0-1
      if (progress < 0) progress = 0;
      if (progress > 1) progress = 1;

      const count = activeModule.features.length;
      
      // Map progress to steps
      const idx = Math.min(count - 1, Math.floor(progress * count));
      setActiveFeatureIndex(idx);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Init
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeModule]);

  return (
    // Outer Container
    <section id="features" className="relative w-full py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Intro */}
        <div className="text-center max-w-3xl mx-auto mb-16">
           <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight mb-6">
             One System.<br/>Complete Control.
           </h2>
           <p className="text-xl text-gray-500 font-medium leading-relaxed">
             Stop switching between spreadsheets. KOSMA unifies your production finance workflow.
           </p>
        </div>

        {/* TABS - Sticky outside the scroll container with reduced margin */}
        <div className="sticky top-[80px] z-30 flex justify-center mb-8 md:mb-12">
           <div className="inline-flex flex-wrap justify-center p-1.5 bg-gray-100/80 backdrop-blur-md rounded-2xl border border-gray-200 shadow-sm transition-all duration-300">
              {MODULES.map(module => (
                <button
                  key={module.id}
                  onClick={() => setActiveModuleId(module.id)}
                  className={`px-6 py-3 rounded-xl text-sm font-black transition-all ${
                    activeModuleId === module.id
                      ? 'bg-white text-gray-900 shadow-md transform scale-105'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                  }`}
                >
                  {module.label}
                </button>
              ))}
           </div>
        </div>

        {/* DESKTOP STAGE VIEW */}
        {/* Height Definition: Very tall so we have room to scroll while content stays fixed */}
        <div 
            ref={sectionRef}
            className="hidden lg:block relative h-[350vh]"
        >
           {/* The Sticky Stage - Fixed in Viewport */}
           {/* We use top-[180px] to ensure it clears the sticky tabs above */}
           <div className="sticky top-[180px] flex items-start justify-center">
              <div className="w-full max-w-7xl grid grid-cols-2 gap-16 xl:gap-24 items-start">
                 
                 {/* LEFT: Text Stage */}
                 <div className="relative h-[500px]">
                    {activeModule.features.map((feature, idx) => (
                       <div 
                          key={`${activeModuleId}-text-${idx}`}
                          className={`absolute top-0 left-0 w-full transition-all duration-700 ease-out ${
                             activeFeatureIndex === idx 
                               ? 'opacity-100 translate-y-0 pointer-events-auto delay-100' 
                               : 'opacity-0 translate-y-8 pointer-events-none'
                          }`}
                       >
                           {/* Header */}
                           <div className={`text-sm font-black uppercase tracking-widest mb-4 transition-colors duration-500 ${
                              activeFeatureIndex === idx ? 'text-brand-500' : 'text-gray-300'
                           }`}>
                              0{idx + 1} — {activeModule.label}
                           </div>
                           
                           <h3 className="text-3xl md:text-4xl font-black text-gray-900 mb-2 leading-tight">
                             {feature.title}
                           </h3>
                           <p className="text-lg font-bold text-gray-400 mb-10">
                             {feature.desc}
                           </p>

                           {/* Pain / Solution / Impact Cards */}
                           <div className="space-y-4">
                              {/* PAIN */}
                              <div className="bg-red-50/80 backdrop-blur-sm border border-red-100 p-6 rounded-2xl flex gap-4 items-start transition-all hover:border-red-200 hover:shadow-sm">
                                 <div className="mt-1 bg-red-100 text-red-600 p-1.5 rounded-lg shrink-0">
                                    <AlertCircle className="w-4 h-4" />
                                 </div>
                                 <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-red-400 block mb-1">The Pain</span>
                                    <p className="text-gray-700 font-medium text-sm leading-relaxed">{feature.pain}</p>
                                 </div>
                              </div>

                              {/* SOLUTION */}
                              <div className="bg-brand-50/80 backdrop-blur-sm border border-brand-100 p-6 rounded-2xl flex gap-4 items-start transition-all hover:border-brand-200 hover:shadow-sm">
                                 <div className="mt-1 bg-brand-100 text-brand-600 p-1.5 rounded-lg shrink-0">
                                    <Zap className="w-4 h-4" />
                                 </div>
                                 <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-400 block mb-1">The Solution</span>
                                    <p className="text-gray-700 font-medium text-sm leading-relaxed">{feature.solution}</p>
                                 </div>
                              </div>

                              {/* IMPACT */}
                              <div className="bg-green-50/80 backdrop-blur-sm border border-green-100 p-6 rounded-2xl flex gap-4 items-start transition-all hover:border-green-200 hover:shadow-sm">
                                 <div className="mt-1 bg-green-100 text-green-600 p-1.5 rounded-lg shrink-0">
                                    <TrendingUp className="w-4 h-4" />
                                 </div>
                                 <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-green-500 block mb-1">The Impact</span>
                                    <p className="text-gray-900 font-bold text-sm leading-relaxed">{feature.impact}</p>
                                 </div>
                              </div>
                           </div>
                       </div>
                    ))}
                 </div>

                 {/* RIGHT: Image Stage */}
                 <div className="relative w-full aspect-[16/10] bg-gray-50 rounded-2xl border border-gray-200 shadow-2xl overflow-hidden">
                    {/* Fake Browser Header */}
                    <div className="absolute top-0 left-0 right-0 h-8 bg-white border-b border-gray-100 flex items-center px-4 gap-2 z-20">
                       <div className="w-2.5 h-2.5 rounded-full bg-red-400/20"></div>
                       <div className="w-2.5 h-2.5 rounded-full bg-amber-400/20"></div>
                       <div className="w-2.5 h-2.5 rounded-full bg-green-400/20"></div>
                    </div>

                    {activeModule.features.map((feature, idx) => (
                       <div
                          key={`${activeModuleId}-img-${idx}`}
                          className="absolute inset-0 top-8 bg-white transition-all duration-700 ease-out"
                          style={{
                             opacity: activeFeatureIndex === idx ? 1 : 0,
                             transform: activeFeatureIndex === idx ? 'scale(1)' : 'scale(0.98)',
                             zIndex: 10
                          }}
                       >
                          <img 
                            src={feature.image} 
                            alt={feature.title} 
                            className="w-full h-full object-cover object-top"
                          />
                          
                          <div className="absolute bottom-6 right-6 px-4 py-2 bg-white/90 backdrop-blur rounded-lg shadow-lg border border-gray-100 pointer-events-none">
                             <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">View</div>
                             <div className="text-sm font-bold text-gray-900">{feature.title}</div>
                          </div>
                       </div>
                    ))}
                 </div>

              </div>
           </div>
        </div>

        {/* MOBILE STACKED VIEW (Fallback) */}
        <div className="lg:hidden flex flex-col gap-24 pb-24">
           {activeModule.features.map((feature, idx) => (
             <div key={`${activeModuleId}-mob-${idx}`} className="flex flex-col gap-8">
                <div className="px-2">
                   <div className="text-sm font-black uppercase tracking-widest mb-4 text-brand-500">
                      0{idx + 1} — {activeModule.label}
                   </div>
                   <h3 className="text-3xl font-black text-gray-900 mb-2">{feature.title}</h3>
                   <p className="text-lg font-bold text-gray-400 mb-6">{feature.desc}</p>

                   {/* Pain/Solution Mobile */}
                   <div className="space-y-4 mb-8">
                      <div className="bg-red-50 p-4 rounded-xl text-sm border border-red-100">
                         <span className="font-black text-red-400 uppercase text-[10px] block mb-1">Pain</span>
                         {feature.pain}
                      </div>
                      <div className="bg-brand-50 p-4 rounded-xl text-sm border border-brand-100">
                         <span className="font-black text-brand-400 uppercase text-[10px] block mb-1">Solution</span>
                         {feature.solution}
                      </div>
                   </div>
                </div>
                
                {/* Visual */}
                <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-200 bg-gray-100">
                   <img src={feature.image} alt={feature.title} className="w-full h-auto" />
                </div>
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
                  <Link to="/" className="hover:opacity-80 transition-opacity">
                    <Logo className="h-8 w-auto text-white" />
                  </Link>
                </div>
                
                {/* Desktop Nav */}
                <div className="pointer-events-auto hidden md:flex items-center gap-6 text-sm font-bold text-white/90">
                  {/* Language Picker (Visual only) */}
                  <div className="flex items-center gap-1.5 hover:text-white cursor-pointer transition-colors opacity-80 hover:opacity-100 border-r border-white/20 pr-4">
                    <Globe className="w-4 h-4" />
                    <span className="text-xs uppercase">EN</span>
                    <ChevronDown className="w-3 h-3 opacity-70" />
                  </div>
                  
                  <Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link>
                  <Link to="/learning" className="hover:text-white transition-colors">Learning</Link>
                  <Link to="/login" className="hover:text-white transition-colors">Login</Link>
                </div>

                {/* Mobile Nav Toggle */}
                <div className="pointer-events-auto md:hidden">
                   <button 
                     onClick={() => setIsMobileMenuOpen(true)}
                     className="p-2 text-white hover:bg-white/10 rounded-xl transition-colors"
                   >
                     <Menu className="w-6 h-6" />
                   </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
              <div className="absolute inset-0 z-50 bg-gray-900/95 backdrop-blur-xl p-6 flex flex-col pointer-events-auto animate-in fade-in slide-in-from-top-5 duration-200">
                 <div className="flex justify-between items-center mb-12">
                     <div className="text-white">
                        <Logo className="h-8 w-auto" />
                     </div>
                     <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-colors">
                         <X className="w-6 h-6" />
                     </button>
                 </div>
                 <div className="flex flex-col gap-8 items-start px-2">
                     <Link to="/pricing" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-black text-white hover:text-brand-500 transition-colors">Pricing</Link>
                     <Link to="/learning" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-black text-white hover:text-brand-500 transition-colors">Learning Campus</Link>
                     <Link to="/help" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-black text-white hover:text-brand-500 transition-colors">Knowledge Base</Link>
                     <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-black text-white hover:text-brand-500 transition-colors">Contact</Link>
                 </div>
                 
                 <div className="mt-auto pb-8 flex flex-col gap-4 w-full">
                    <Link to="/login" className="text-center py-4 font-bold text-gray-900 bg-white rounded-2xl">Login</Link>
                    <Link to="/download" className="text-center py-4 font-bold text-white bg-brand-500 rounded-2xl">Get Started</Link>
                 </div>
              </div>
            )}

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

            <div className="absolute bottom-8 left-0 w-full z-10 text-[10px] tracking-[0.2em] uppercase text-white/40 flex justify-center gap-6 pointer-events-none px-4">
                <span>Move cursor</span>
                <span>Click to randomize</span>
            </div>

            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(80% 60% at 50% 10%, rgba(0,147,213,0.10), transparent)' }} />
          </div>

          {/* CONTENT SECTION - WRAPPED IN DOTS */}
          <PulsingDotsBackground>
              {/* FEATURES SCROLLYTELLING */}
              <FeatureScrollytelling />

              {/* FOOTER */}
              <Footer />
          </PulsingDotsBackground>
      </div>
  );
};
