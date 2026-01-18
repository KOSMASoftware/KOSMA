
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MorphingText } from '../components/MorphingText';
import { PulsingDotsBackground } from '../components/ui/pulsing-dots-background';
import { Logo } from '../components/ui/Logo';
import { Globe, ChevronDown, CheckCircle, Download, AlertTriangle, Lightbulb, TrendingUp, Menu, X, Check, ArrowRight } from 'lucide-react';
import { Footer } from '../components/layout/Footer';
import { Card } from '../components/ui/Card';

const BRAND = '#0093D5';
const BG = '#0b0f14';

// Define Feature Data
const FEATURES = [
  {
    id: 'budgeting',
    title: 'Budgeting',
    subtitle: 'Cost splitting made simple.',
    description: 'Split costs between producers directly in settings. Define standard fringes and wage supplements once, and assign them to specific accounts automatically. No more manual spreadsheet chaos.',
    color: 'bg-brand-500',
    textColor: 'text-brand-500',
    image: 'https://i.ibb.co/tp0B8GWh/Cash-Flow.png', 
    details: ['Split costs between producers', 'Define fringes & supplements', 'Assign fringes to accounts', 'Define extra costs']
  },
  {
    id: 'financing',
    title: 'Financing',
    subtitle: 'Structure your funding.',
    description: 'Load financing plan templates and adapt them quickly. Edit financing sources and assign them to producers. Use funding effects as variables to keep calculations accurate and live.',
    color: 'bg-blue-700',
    textColor: 'text-blue-700',
    image: 'https://i.ibb.co/tp0B8GWh/Cash-Flow.png',
    details: ['Financing plan templates', 'Manage financing sources', 'Funding effects as variables', 'Link expenses to sources']
  },
  {
    id: 'cashflow',
    title: 'Cash Flow',
    subtitle: 'Liquidity at a glance.',
    description: 'Define milestones and phases to automate cash-flow logic. Generate a cash-flow plan directly from your budget and financing data without external tools or complex excel formulas.',
    color: 'bg-orange-500',
    textColor: 'text-orange-500',
    image: 'https://i.ibb.co/tp0B8GWh/Cash-Flow.png',
    details: ['Define milestones & phases', 'Create cash-flow rules', 'Build a cash-flow plan', 'Add loans/transfers']
  },
  {
    id: 'costcontrol',
    title: 'Cost Control',
    subtitle: 'Stay on budget.',
    description: 'Match actual costs against the budget immediately. Import accounting data, recalculate forecasts per account, and generate professional cost reports for financiers in seconds.',
    color: 'bg-purple-600',
    textColor: 'text-purple-600',
    image: 'https://i.ibb.co/tp0B8GWh/Cash-Flow.png',
    details: ['Compare plan vs actuals', 'Import accounting data', 'Recalculate forecasts', 'Generate cost reports']
  }
];

const LaptopFrame = ({ activeIndex }: { activeIndex: number }) => {
  return (
    <div className="relative mx-auto w-full max-w-[800px]">
      {/* Lid / Screen Frame */}
      <div className="relative bg-gray-800 rounded-t-[1.5rem] p-[2%] shadow-2xl border-t border-l border-r border-gray-700">
        {/* Camera Dot */}
        <div className="absolute top-[3%] left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-gray-900 rounded-full ring-1 ring-gray-700/50"></div>
        
        {/* Screen Content Container */}
        <div className="relative aspect-[16/10] bg-gray-900 rounded-lg overflow-hidden shadow-inner ring-1 ring-black">
           {FEATURES.map((feature, idx) => (
             <div 
                key={feature.id}
                className={`absolute inset-0 w-full h-full transition-all duration-700 ease-in-out bg-white`}
                style={{
                  opacity: activeIndex === idx ? 1 : 0,
                  transform: activeIndex === idx ? 'scale(1)' : 'scale(0.98)',
                  zIndex: activeIndex === idx ? 10 : 0,
                }}
             >
                {/* Image */}
                <img 
                  src={feature.image} 
                  alt={feature.title} 
                  className="w-full h-full object-cover object-top"
                />
                
                {/* Overlay Tag to distinguish sections in this prototype since images are same */}
                <div className="absolute top-6 left-6 px-4 py-2 bg-white/90 backdrop-blur rounded-lg shadow-sm border border-gray-100">
                   <span className={`text-xs font-black uppercase tracking-widest ${feature.textColor}`}>{feature.title} View</span>
                </div>
             </div>
           ))}
        </div>
      </div>
      
      {/* Base / Keyboard Area */}
      <div className="relative bg-gray-800 h-[12px] sm:h-[16px] w-[102%] -left-[1%] rounded-b-xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] flex items-center justify-center border-t border-gray-900">
         <div className="w-[15%] h-[2px] bg-gray-600/50 rounded-full"></div>
      </div>
    </div>
  );
};

const FeaturesSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Config for "reading zone" trigger
    const options = {
      root: null,
      rootMargin: "-20% 0px -40% 0px", // Trigger when element is in the center-ish band
      threshold: 0
    };

    const callback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = Number(entry.target.getAttribute('data-index'));
          setActiveIndex(index);
        }
      });
    };

    const observer = new IntersectionObserver(callback, options);

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section id="features" className="relative w-full bg-white">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Intro */}
        <div className="text-center py-24 md:py-32 max-w-3xl mx-auto">
           <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight mb-6">
             One System.<br/>Complete Control.
           </h2>
           <p className="text-xl text-gray-500 font-medium leading-relaxed">
             Stop switching between spreadsheets. KOSMA unifies your production finance workflow into a single, reliable source of truth.
           </p>
        </div>

        {/* Desktop Scrollytelling Layout */}
        <div className="hidden lg:grid grid-cols-2 gap-20 pb-40">
           
           {/* Left: Scrollable Text Blocks */}
           <div className="relative">
              {/* Vertical Progress Line */}
              <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-100"></div>

              <div className="space-y-[10vh]">
                {FEATURES.map((feature, idx) => (
                  <div 
                    key={feature.id}
                    ref={el => { sectionRefs.current[idx] = el }}
                    data-index={idx}
                    className={`min-h-[60vh] flex flex-col justify-center pl-20 transition-all duration-500 ${activeIndex === idx ? 'opacity-100 translate-x-0' : 'opacity-30 -translate-x-4'}`}
                  >
                     <div className={`absolute left-0 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-lg transition-all duration-500 ${activeIndex === idx ? `${feature.color} text-white scale-110` : 'bg-gray-50 text-gray-300 scale-100'}`}>
                        {idx + 1}
                     </div>
                     <h3 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">{feature.title}</h3>
                     <p className={`text-lg font-bold mb-6 ${feature.textColor}`}>{feature.subtitle}</p>
                     <p className="text-lg text-gray-600 leading-relaxed mb-8">{feature.description}</p>
                     
                     <ul className="space-y-3">
                       {feature.details.map((detail, dIdx) => (
                         <li key={dIdx} className="flex items-center gap-3 text-sm font-bold text-gray-700">
                            <div className={`w-1.5 h-1.5 rounded-full ${feature.color}`}></div>
                            {detail}
                         </li>
                       ))}
                     </ul>
                  </div>
                ))}
              </div>
           </div>

           {/* Right: Sticky Visual */}
           <div className="relative">
              <div className="sticky top-[120px] transition-all duration-700">
                 <LaptopFrame activeIndex={activeIndex} />
              </div>
           </div>
        </div>

        {/* Mobile Stacked Layout */}
        <div className="lg:hidden flex flex-col gap-24 pb-24">
           {FEATURES.map((feature, idx) => (
             <div key={feature.id} className="flex flex-col gap-8">
                {/* Visual */}
                <div className="bg-gray-100 rounded-3xl p-4 sm:p-8">
                   <img src={feature.image} alt={feature.title} className="w-full h-auto rounded-xl shadow-lg border border-gray-200" />
                </div>
                
                {/* Text */}
                <div className="px-2">
                   <span className={`inline-block px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest mb-4 bg-gray-100 ${feature.textColor}`}>
                      0{idx + 1} — {feature.title}
                   </span>
                   <h3 className="text-3xl font-black text-gray-900 mb-2">{feature.title}</h3>
                   <p className="text-lg font-bold text-gray-400 mb-4">{feature.subtitle}</p>
                   <p className="text-gray-600 leading-relaxed mb-6">{feature.description}</p>
                   <ul className="space-y-3 border-t border-gray-100 pt-6">
                       {feature.details.map((detail, dIdx) => (
                         <li key={dIdx} className="flex items-center gap-3 text-sm font-bold text-gray-700">
                            <Check className={`w-4 h-4 ${feature.textColor}`} />
                            {detail}
                         </li>
                       ))}
                   </ul>
                </div>
             </div>
           ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center pb-32">
            <Link 
              to="/download"
              className="inline-flex items-center gap-3 bg-gray-900 text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-brand-500 transition-all shadow-xl shadow-gray-900/10 hover:shadow-brand-500/20 hover:-translate-y-1"
            >
               <Download className="w-5 h-5" />
               Start Free Trial
            </Link>
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
              {/* FEATURES SECTION */}
              <FeaturesSection />

              {/* FOOTER */}
              <Footer />
          </PulsingDotsBackground>
      </div>
  );
};
