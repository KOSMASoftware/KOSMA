
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MorphingText } from '../components/MorphingText';
import { PulsingDotsBackground } from '../components/ui/pulsing-dots-background';
import { Logo } from '../components/ui/Logo';
import { Globe, ChevronDown, CheckCircle, Download, AlertTriangle, Lightbulb, TrendingUp, Menu, X, Check, ArrowRight, AlertCircle, Zap, Quote } from 'lucide-react';
import { Footer } from '../components/layout/Footer';
import { Card } from '../components/ui/Card';

const BRAND = '#0093D5';
const BG = '#0b0f14';

// --- DATA STRUCTURE ---

type ModuleTheme = {
  activeTab: string;
  dotActive: string;
  ring: string;
  label: string;
  pill: string;
  mobileNumber: string;
};

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
  theme: ModuleTheme;
  features: FeatureItem[];
};

const MODULES: ModuleData[] = [
  {
    id: 'budgeting',
    label: 'Budgeting',
    theme: {
      activeTab: 'text-amber-600 bg-amber-50 shadow-amber-500/10 ring-1 ring-amber-100',
      dotActive: 'bg-amber-500 border-amber-100',
      ring: 'ring-amber-500',
      label: 'text-amber-600',
      pill: 'bg-amber-50 border-amber-200 text-amber-700',
      mobileNumber: 'bg-amber-50 text-amber-600 border-amber-100'
    },
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
    theme: {
      activeTab: 'text-purple-600 bg-purple-50 shadow-purple-500/10 ring-1 ring-purple-100',
      dotActive: 'bg-purple-600 border-purple-100',
      ring: 'ring-purple-600',
      label: 'text-purple-600',
      pill: 'bg-purple-50 border-purple-200 text-purple-700',
      mobileNumber: 'bg-purple-50 text-purple-600 border-purple-100'
    },
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
    theme: {
      activeTab: 'text-green-600 bg-green-50 shadow-green-500/10 ring-1 ring-green-100',
      dotActive: 'bg-green-600 border-green-100',
      ring: 'ring-green-600',
      label: 'text-green-600',
      pill: 'bg-green-50 border-green-200 text-green-700',
      mobileNumber: 'bg-green-50 text-green-600 border-green-100'
    },
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
    theme: {
      activeTab: 'text-gray-900 bg-gray-100 shadow-gray-500/10 ring-1 ring-gray-200',
      dotActive: 'bg-gray-800 border-gray-200',
      ring: 'ring-gray-800',
      label: 'text-gray-800',
      pill: 'bg-gray-100 border-gray-300 text-gray-900',
      mobileNumber: 'bg-gray-100 text-gray-900 border-gray-300'
    },
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

// Fake Logo Component using SVG
const FakeLogo = ({ type }: { type: '1'|'2'|'3'|'4'|'5'|'6' }) => {
  const shapes: Record<string, React.ReactNode> = {
    '1': <path d="M12 2L2 19.7778H22L12 2Z" stroke="currentColor" strokeWidth="3" fill="none"/>, // Triangle
    '2': <rect x="2" y="2" width="20" height="20" rx="4" stroke="currentColor" strokeWidth="3" fill="none"/>, // Rounded Square
    '3': <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none"/>, // Circle
    '4': <path d="M2 12L12 2L22 12L12 22L2 12Z" stroke="currentColor" strokeWidth="3" fill="none"/>, // Diamond
    '5': <path d="M2 2H10V10H2V2ZM14 14H22V22H14V14Z" fill="currentColor"/>, // Two Blocks
    '6': <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round"/> // Open Circle
  };

  return (
    <div className="h-10 w-auto opacity-40 hover:opacity-100 transition-opacity duration-300 text-gray-900 flex items-center justify-center">
       <svg width="40" height="40" viewBox="0 0 24 24" className="w-8 h-8 md:w-10 md:h-10">
          {shapes[type]}
       </svg>
    </div>
  );
};

const TrustSection = () => {
  return (
    <section className="py-24 relative z-10">
       <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
               Trusted by production teams who need budget certainty.
             </h2>
             <p className="text-lg text-gray-500 font-medium leading-relaxed">
               From budgeting to cash flow and cost control — KOSMA keeps every project financially aligned.
             </p>
          </div>

          {/* Logo Row */}
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 mb-24 px-4">
             <FakeLogo type="1" />
             <FakeLogo type="2" />
             <FakeLogo type="3" />
             <FakeLogo type="4" />
             <FakeLogo type="5" />
             <FakeLogo type="6" />
          </div>

          {/* Testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {/* Card 1 */}
             <div className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 hover:-translate-y-1 transition-transform duration-300 relative group">
                <Quote className="absolute top-8 right-8 w-8 h-8 text-gray-100 group-hover:text-brand-100 transition-colors" />
                <p className="text-lg md:text-xl font-medium text-gray-700 italic mb-8 leading-relaxed">
                  “KOSMA keeps our budget and cash flow in sync — no more spreadsheet chaos.”
                </p>
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 font-black shadow-sm">
                      HP
                   </div>
                   <div>
                      <div className="font-bold text-gray-900 text-sm">Head of Production</div>
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Berlin</div>
                   </div>
                </div>
             </div>

             {/* Card 2 */}
             <div className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 hover:-translate-y-1 transition-transform duration-300 relative group">
                <Quote className="absolute top-8 right-8 w-8 h-8 text-gray-100 group-hover:text-brand-100 transition-colors" />
                <p className="text-lg md:text-xl font-medium text-gray-700 italic mb-8 leading-relaxed">
                  “We finally have a single source of truth for costs and financing.”
                </p>
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 font-black shadow-sm">
                      LP
                   </div>
                   <div>
                      <div className="font-bold text-gray-900 text-sm">Line Producer</div>
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Zurich</div>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </section>
  );
};

// --- NEW USP COMPONENT ---
const USPBlock = () => {
  return (
    <div className="relative py-12 md:py-20 text-center px-4">
       <style>{`
         @keyframes converge-tl {
           0%, 100% { transform: translate(0, 0); }
           50% { transform: translate(24px, 24px); }
         }
         @keyframes converge-tr {
           0%, 100% { transform: translate(0, 0); }
           50% { transform: translate(-24px, 24px); }
         }
         @keyframes converge-br {
           0%, 100% { transform: translate(0, 0); }
           50% { transform: translate(-24px, -24px); }
         }
         @keyframes converge-bl {
           0%, 100% { transform: translate(0, 0); }
           50% { transform: translate(24px, -24px); }
         }
         
         .anim-dot {
           animation-duration: 4s;
           animation-timing-function: ease-in-out;
           animation-iteration-count: infinite;
         }
       `}</style>

       {/* Animation Canvas */}
       <div className="h-32 w-full flex items-center justify-center mb-8 relative">
          <div className="relative w-20 h-20">
             {/* Center Core */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-gray-900 rounded-xl rotate-45 z-10 shadow-lg border-2 border-white"></div>
             
             {/* 4 Modules - Animated */}
             {/* Top Left - Amber */}
             <div className="absolute top-0 left-0 w-5 h-5 bg-amber-500 rounded-full anim-dot shadow-sm" style={{ animationName: 'converge-tl' }}></div>
             {/* Top Right - Purple */}
             <div className="absolute top-0 right-0 w-5 h-5 bg-purple-600 rounded-full anim-dot shadow-sm" style={{ animationName: 'converge-tr' }}></div>
             {/* Bottom Right - Green */}
             <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-600 rounded-full anim-dot shadow-sm" style={{ animationName: 'converge-br' }}></div>
             {/* Bottom Left - Gray */}
             <div className="absolute bottom-0 left-0 w-5 h-5 bg-gray-500 rounded-full anim-dot shadow-sm" style={{ animationName: 'converge-bl' }}></div>
          </div>
       </div>

       <h2 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter mb-6 leading-[0.9]">
         Four Modules.<br/>One System.
       </h2>
       
       <p className="text-lg md:text-2xl text-gray-500 font-medium max-w-3xl mx-auto leading-relaxed mb-10">
         Most tools split budgeting, financing, cash flow, and cost control into separate products.<br className="hidden md:block" />
         <span className="text-gray-900 font-bold">KOSMA keeps everything connected — in one system.</span>
       </p>

       {/* Module List */}
       <div className="flex flex-wrap justify-center gap-3 mb-12 opacity-90">
          <span className="px-4 py-1.5 rounded-full bg-amber-50 text-amber-700 text-[10px] md:text-xs font-black uppercase tracking-widest border border-amber-100">Budgeting</span>
          <span className="px-4 py-1.5 rounded-full bg-purple-50 text-purple-700 text-[10px] md:text-xs font-black uppercase tracking-widest border border-purple-100">Financing</span>
          <span className="px-4 py-1.5 rounded-full bg-green-50 text-green-700 text-[10px] md:text-xs font-black uppercase tracking-widest border border-green-100">Cash Flow</span>
          <span className="px-4 py-1.5 rounded-full bg-gray-100 text-gray-700 text-[10px] md:text-xs font-black uppercase tracking-widest border border-gray-200">Cost Control</span>
       </div>
    </div>
  );
};

const FeatureScrollytelling = () => {
  const [activeModuleId, setActiveModuleId] = useState('budgeting');
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 1024 : false);
  const sectionRef = useRef<HTMLDivElement>(null);
  
  const activeModule = MODULES.find(m => m.id === activeModuleId) || MODULES[0];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset scroll state when tab changes
  useEffect(() => {
    setActiveFeatureIndex(0);
  }, [activeModuleId]);

  // Scroll Progress Logic - Throttled with rAF and Index Guard
  useEffect(() => {
    if (isMobile) return;

    let ticking = false;
    let lastIndex = -1;

    const handleScroll = () => {
      if (!sectionRef.current) return;
      if (ticking) return; // Throttle

      ticking = true;
      window.requestAnimationFrame(() => {
        if (!sectionRef.current) {
            ticking = false;
            return;
        }
        
        const rect = sectionRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const height = rect.height;
        const stickyOffset = 180; // Matches top-[180px]
        
        const scrolled = -rect.top + stickyOffset;
        const scrollableHeight = height - viewportHeight + stickyOffset;
        
        let progress = scrolled / scrollableHeight;
        progress = Math.max(0, Math.min(1, progress));

        const count = activeModule.features.length;
        const idx = Math.min(count - 1, Math.floor(progress * count));
        
        if (idx !== lastIndex) {
          lastIndex = idx;
          setActiveFeatureIndex(idx);
        }
        
        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Init
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeModule, isMobile]);

  return (
    // Outer Container
    <section id="features" className="relative w-full py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* NEW USP BLOCK REPLACES OLD INTRO */}
        <USPBlock />

        {/* Navigation Hint */}
        <div className="text-center mb-8">
           <p className="text-xs font-bold text-gray-400 animate-pulse">
             Switch between modules to see how KOSMA works.
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
                      ? `${module.theme.activeTab} transform scale-105 shadow-md`
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                  }`}
                >
                  {module.label}
                </button>
              ))}
           </div>
        </div>

        {/* CONDITIONAL RENDERING */}
        {isMobile ? (
            /* MOBILE STACKED VIEW */
            <div className="flex flex-col gap-24 pb-24 animate-in fade-in">
               {activeModule.features.map((feature, idx) => (
                 <div key={`${activeModuleId}-mob-${idx}`} className="flex flex-col gap-8">
                    <div className="px-2">
                       <div className={`text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2 ${activeModule.theme.label}`}>
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center border ${activeModule.theme.mobileNumber}`}>
                            {idx + 1}
                          </span>
                          Step {idx + 1} / {activeModule.features.length}
                       </div>
                       <h3 className="text-3xl font-black text-gray-900 mb-2">{feature.title}</h3>
                       <p className="text-lg font-bold text-gray-400 mb-6">{feature.desc}</p>

                       {/* Pain/Solution/Impact Mobile */}
                       <div className="space-y-4 mb-8">
                          <div className="bg-red-50 p-4 rounded-xl text-sm border border-red-100">
                             <span className="font-black text-red-400 uppercase text-[10px] block mb-1">Pain</span>
                             {feature.pain}
                          </div>
                          <div className={`p-4 rounded-xl text-sm border ${activeModule.theme.pill}`}>
                             <span className="font-black uppercase text-[10px] block mb-1 opacity-80">Solution</span>
                             {feature.solution}
                          </div>
                          <div className="bg-green-50 p-4 rounded-xl text-sm border border-green-100">
                             <span className="font-black text-green-500 uppercase text-[10px] block mb-1">Impact</span>
                             {feature.impact}
                          </div>
                       </div>
                    </div>
                    
                    {/* Visual - Aspect Ratio 9:16 for Mobile */}
                    <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-200 bg-gray-100 aspect-[9/16]">
                       <img 
                            src={feature.image} 
                            alt={feature.title} 
                            className="w-full h-full object-cover"
                            loading="lazy"
                            decoding="async" 
                       />
                    </div>
                 </div>
               ))}
            </div>
        ) : (
            /* DESKTOP STAGE VIEW */
            <div 
                ref={sectionRef}
                className="hidden lg:block relative h-[350vh]"
            >
               {/* The Sticky Stage */}
               <div className="sticky top-[180px] h-[calc(100vh-180px)] flex items-start justify-center">
                  {/* Grid - items-stretch to align height of Text and Image column */}
                  <div className="w-full max-w-7xl grid grid-cols-2 gap-16 xl:gap-24 items-stretch">
                     
                     {/* LEFT: Text Stage - Fixed Height 520px, overflow hidden, pt-8 */}
                     <div className="relative h-[520px] pt-8 flex gap-8">
                        {/* UX: Vertical Progress Rail */}
                        <div className="flex flex-col items-center h-[400px] py-4 w-8 shrink-0 relative">
                            {/* The vertical line */}
                            <div className="absolute top-4 bottom-4 left-1/2 w-0.5 bg-gray-100 -translate-x-1/2 rounded-full"></div>
                            
                            {/* The Dots */}
                            <div className="flex flex-col justify-between h-full relative z-10">
                                {activeModule.features.map((_, idx) => (
                                    <div 
                                        key={`rail-dot-${idx}`}
                                        className={`transition-all duration-500 rounded-full border-2 ${
                                            activeFeatureIndex === idx 
                                                ? `w-4 h-4 ${activeModule.theme.dotActive} ring-4 ${activeModule.theme.ring}/10` 
                                                : 'w-2.5 h-2.5 bg-gray-200 border-white'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Content Container */}
                        <div className="relative flex-1 overflow-hidden h-full">
                            {activeModule.features.map((feature, idx) => (
                            <div 
                                key={`${activeModuleId}-text-${idx}`}
                                className={`absolute top-0 left-0 w-full transition-all duration-500 ease-out ${
                                    activeFeatureIndex === idx 
                                    ? 'opacity-100 translate-y-0 pointer-events-auto delay-100' 
                                    : 'opacity-0 translate-y-4 pointer-events-none'
                                }`}
                            >
                                {/* UX: Chapter Label */}
                                <div className={`text-xs font-black uppercase tracking-widest mb-4 transition-colors duration-500 flex items-center gap-2 ${
                                    activeFeatureIndex === idx ? activeModule.theme.label : 'text-gray-300'
                                }`}>
                                    <span className={`px-2 py-0.5 rounded text-[10px] border ${activeModule.theme.pill}`}>
                                        STEP {idx + 1} / {activeModule.features.length}
                                    </span>
                                    <span>•</span>
                                    <span>{activeModule.label}</span>
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
                                    <div className={`backdrop-blur-sm p-6 rounded-2xl flex gap-4 items-start transition-all hover:shadow-sm border ${activeModule.theme.pill}`}>
                                        <div className="mt-1 bg-white/80 p-1.5 rounded-lg shrink-0 shadow-sm">
                                            <Zap className={`w-4 h-4 ${activeModule.theme.label.replace('text-', 'text-')}`} />
                                        </div>
                                        <div>
                                            <span className={`text-[10px] font-black uppercase tracking-widest block mb-1 ${activeModule.theme.label}`}>The Solution</span>
                                            <p className="text-gray-900 font-medium text-sm leading-relaxed">{feature.solution}</p>
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
                     </div>

                     {/* RIGHT: Image Stage - Fixed Height 520px */}
                     <div className="relative w-full h-[520px] bg-gray-50 rounded-2xl border border-gray-200 shadow-2xl overflow-hidden">
                        {/* Fake Browser Header */}
                        <div className="absolute top-0 left-0 right-0 h-8 bg-white border-b border-gray-100 flex items-center px-4 gap-2 z-20">
                           <div className="w-2.5 h-2.5 rounded-full bg-red-400/20"></div>
                           <div className="w-2.5 h-2.5 rounded-full bg-amber-400/20"></div>
                           <div className="w-2.5 h-2.5 rounded-full bg-green-400/20"></div>
                        </div>

                        {/* Single Active Image - No Multi-Layer */}
                        <div className="absolute inset-0 top-8 bg-white">
                            <img 
                                key={activeModule.features[activeFeatureIndex].image}
                                src={activeModule.features[activeFeatureIndex].image} 
                                alt={activeModule.features[activeFeatureIndex].title} 
                                className="w-full h-full object-cover object-top"
                                loading="lazy"
                                decoding="async"
                            />
                        </div>
                        
                        <div className="absolute bottom-6 right-6 px-4 py-2 bg-white/90 backdrop-blur rounded-lg shadow-lg border border-gray-100 pointer-events-none z-30">
                             <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">View</div>
                             <div className="text-sm font-bold text-gray-900">{activeModule.features[activeFeatureIndex].title}</div>
                        </div>
                     </div>

                  </div>
               </div>
            </div>
        )}

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
                     <Link to="/support" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-black text-white hover:text-brand-500 transition-colors">Support</Link>
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
                    Bring AI to your film budget
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

          {/* CONTENT SECTION - WRAPPED IN DOTS WITH OVERFLOW VISIBLE */}
          <PulsingDotsBackground containerClassName="overflow-visible relative z-10">
              {/* FEATURES SCROLLYTELLING */}
              <FeatureScrollytelling />

              {/* TRUST SECTION */}
              <TrustSection />

              {/* FOOTER */}
              <Footer />
          </PulsingDotsBackground>
      </div>
  );
};
