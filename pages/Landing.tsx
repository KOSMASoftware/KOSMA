
import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MorphingText } from '../components/MorphingText';
import { PulsingDotsBackground } from '../components/ui/pulsing-dots-background';
import { Logo } from '../components/ui/Logo';
import { Globe, ChevronDown, CheckCircle, Download, AlertTriangle, Lightbulb, TrendingUp, Menu, X, Check, ArrowRight, AlertCircle, Zap, Quote, PencilRuler, Coins, Video, Scissors, Flag, Calculator, PieChart, BarChart3, Layers } from 'lucide-react';
import { Footer } from '../components/layout/Footer';
import { Card } from '../components/ui/Card';
import TestimonialSlider from '../components/TestimonialSlider';
import { ShimmerButton } from '../components/ui/ShimmerButton';
import { ImageZoom } from '../components/ui/ImageZoom';

const BRAND = '#0093D5';
const BG = '#0b0f14';

// --- KOSMA TEXT LOGO SVG ---
const KosmaTextLogo = () => (
  <svg width="75" height="17" viewBox="0 0 75 17" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-auto">
    <path d="M-0.000144362 15.936V0.288035H3.52786V6.69603H3.62386L8.27986 0.288035H12.1679L7.43986 6.52803L13.0319 15.936H9.16786L5.35186 9.33604L3.52786 11.736V15.936H-0.000144362ZM20.4458 16.224C19.0378 16.224 17.7978 15.896 16.7258 15.24C15.6698 14.584 14.8378 13.648 14.2298 12.432C13.6378 11.2 13.3418 9.73603 13.3418 8.04003C13.3418 6.32803 13.6378 4.88003 14.2298 3.69603C14.8378 2.49603 15.6698 1.58403 16.7258 0.960035C17.7978 0.320035 19.0378 3.43323e-05 20.4458 3.43323e-05C21.8538 3.43323e-05 23.0858 0.320035 24.1418 0.960035C25.2138 1.58403 26.0458 2.49603 26.6378 3.69603C27.2458 4.89603 27.5498 6.34403 27.5498 8.04003C27.5498 9.73603 27.2458 11.2 26.6378 12.432C26.0458 13.648 25.2138 14.584 24.1418 15.24C23.0858 15.896 21.8538 16.224 20.4458 16.224ZM20.4458 13.176C21.5178 13.176 22.3658 12.712 22.9898 11.784C23.6138 10.856 23.9258 9.60803 23.9258 8.04003C23.9258 6.47203 23.6138 5.24803 22.9898 4.36803C22.3658 3.48803 21.5178 3.04804 20.4458 3.04804C19.3738 3.04804 18.5258 3.48803 17.9018 4.36803C17.2778 5.24803 16.9658 6.47203 16.9658 8.04003C16.9658 9.60803 17.2778 10.856 17.9018 11.784C18.5258 12.712 19.3738 13.176 20.4458 13.176ZM35.268 16.224C34.244 16.224 33.22 16.032 32.196 15.648C31.188 15.264 30.284 14.704 29.484 13.968L31.5 11.544C32.06 12.024 32.684 12.416 33.372 12.72C34.06 13.024 34.724 13.176 35.364 13.176C36.1 13.176 36.644 13.04 36.996 12.768C37.364 12.496 37.548 12.128 37.548 11.664C37.548 11.168 37.34 10.808 36.924 10.584C36.524 10.344 35.98 10.08 35.292 9.79203L33.252 8.92803C32.724 8.70403 32.22 8.40803 31.74 8.04003C31.26 7.65603 30.868 7.18403 30.564 6.62403C30.26 6.06403 30.108 5.40803 30.108 4.65603C30.108 3.79203 30.34 3.00803 30.804 2.30403C31.284 1.60003 31.94 1.04003 32.772 0.624035C33.62 0.208035 34.588 3.43323e-05 35.676 3.43323e-05C36.572 3.43323e-05 37.468 0.176034 38.364 0.528035C39.26 0.880035 40.044 1.39204 40.716 2.06403L38.916 4.29603C38.404 3.89603 37.892 3.59203 37.38 3.38404C36.868 3.16004 36.3 3.04804 35.676 3.04804C35.068 3.04804 34.58 3.17603 34.212 3.43203C33.86 3.67203 33.684 4.01603 33.684 4.46403C33.684 4.94403 33.908 5.30403 34.356 5.54403C34.82 5.78403 35.388 6.04003 36.06 6.31203L38.076 7.12803C39.02 7.51203 39.772 8.04003 40.332 8.71203C40.892 9.38403 41.172 10.272 41.172 11.376C41.172 12.24 40.94 13.04 40.476 13.776C40.012 14.512 39.34 15.104 38.46 15.552C37.58 16 36.516 16.224 35.268 16.224ZM43.828 15.936V0.288035H47.692L50.212 7.24803C50.372 7.69603 50.524 8.16803 50.668 8.66404C50.812 9.16003 50.964 9.64803 51.124 10.128H51.22C51.38 9.64803 51.524 9.16003 51.652 8.66404C51.796 8.16803 51.948 7.69603 52.108 7.24803L54.58 0.288035H58.42V15.936H55.204V10.2C55.204 9.68803 55.228 9.12003 55.276 8.49604C55.34 7.85603 55.404 7.21603 55.468 6.57603C55.548 5.93603 55.612 5.36803 55.66 4.87203H55.564L54.292 8.59203L52.06 14.568H50.116L47.884 8.59203L46.636 4.87203H46.54C46.604 5.36803 46.668 5.93603 46.732 6.57603C46.796 7.21603 46.852 7.85603 46.9 8.49604C46.964 9.12003 46.996 9.68803 46.996 10.2V15.936H43.828ZM65.7812 8.01603L65.3972 9.45603H68.7332L68.3732 8.01603C68.1652 7.23203 67.9492 6.40003 67.7252 5.52003C67.5172 4.64003 67.3092 3.79203 67.1012 2.97603H67.0052C66.8132 3.80803 66.6132 4.66403 66.4052 5.54403C66.2132 6.40803 66.0052 7.23203 65.7812 8.01603ZM60.1172 15.936L65.0132 0.288035H69.2612L74.1572 15.936H70.4132L69.4532 12.216H64.6772L63.7172 15.936H60.1172Z" fill="#0093D5"/>
  </svg>
);

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
  icon: any; // Lucide Icon Component
  colorName: 'amber' | 'purple' | 'brand' | 'rose' | 'green';
  theme: ModuleTheme;
  features: FeatureItem[];
};

const MODULES: ModuleData[] = [
  {
    id: 'development',
    label: 'Development',
    icon: PencilRuler,
    colorName: 'amber',
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
        title: 'Financing plan templates',
        desc: 'Faster setup with consistent financing structure.',
        pain: 'Each financing plan starts from scratch.',
        solution: 'Load a financing plan template and adapt it quickly.',
        impact: 'Faster setup with consistent financing structure.',
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
    icon: Coins,
    colorName: 'purple',
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
        title: 'Manage financing sources',
        desc: 'Clear funding ownership and easier partner reporting.',
        pain: 'Financing sources and producer shares are scattered across files.',
        solution: 'Edit financing sources and assign them to producers directly.',
        impact: 'Clear funding ownership and easier partner reporting.',
        image: 'https://i.ibb.co/tp0B8GWh/Cash-Flow.png'
      },
      {
        title: 'Split costs between producers',
        desc: 'Clear cost ownership and faster co‑production reporting.',
        pain: 'Costs are split manually across partners, making co‑production budgets messy.',
        solution: 'KOSMA lets you assign costs to multiple producers directly in settings.',
        impact: 'Clear cost ownership and faster co‑production reporting.',
        image: 'https://i.ibb.co/tp0B8GWh/Cash-Flow.png'
      },
      {
        title: 'Funding effects as variables',
        desc: 'Accurate funding calculations tied to real budget data.',
        pain: 'Funding logic is hard to integrate with budget effects.',
        solution: 'Use funding effects as variables in the financing plan.',
        impact: 'Accurate funding calculations tied to real budget data.',
        image: 'https://i.ibb.co/tp0B8GWh/Cash-Flow.png'
      }
    ]
  },
  {
    id: 'production',
    label: 'Production',
    icon: Video,
    colorName: 'brand',
    theme: {
      activeTab: 'text-brand-600 bg-brand-50 shadow-brand-500/10 ring-1 ring-brand-100',
      dotActive: 'bg-brand-600 border-brand-100',
      ring: 'ring-brand-600',
      label: 'text-brand-600',
      pill: 'bg-brand-50 border-brand-200 text-brand-700',
      mobileNumber: 'bg-brand-50 text-brand-600 border-brand-100'
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
      }
    ]
  },
  {
    id: 'post-production',
    label: 'Post Production',
    icon: Scissors,
    colorName: 'rose',
    theme: {
      activeTab: 'text-rose-600 bg-rose-50 shadow-rose-500/10 ring-1 ring-rose-100',
      dotActive: 'bg-rose-600 border-rose-100',
      ring: 'ring-rose-600',
      label: 'text-rose-600',
      pill: 'bg-rose-50 border-rose-200 text-rose-700',
      mobileNumber: 'bg-rose-50 text-rose-600 border-rose-100'
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
        title: 'Recalculate forecasts',
        desc: 'Up‑to‑date cost outlooks at any time.',
        pain: 'Forecasts are outdated as soon as costs change.',
        solution: 'Recalculate forecasts per account instantly.',
        impact: 'Up‑to‑date cost outlooks at any time.',
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
    id: 'final-accounts',
    label: 'Final Accounts',
    icon: Flag,
    colorName: 'green',
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
        title: 'Import accounting data',
        desc: 'Less manual work and fewer reconciliation errors.',
        pain: 'Accounting data must be re‑entered manually.',
        solution: 'Import accounting data directly into Cost Control.',
        impact: 'Less manual work and fewer reconciliation errors.',
        image: 'https://i.ibb.co/tp0B8GWh/Cash-Flow.png'
      },
      {
        title: 'Add loans/transfers',
        desc: 'Complete cash‑flow picture without external tools.',
        pain: 'Inter‑producer transfers and loans are tracked separately.',
        solution: 'Add loans or transfers directly into the cash‑flow plan.',
        impact: 'Complete cash‑flow picture without external tools.',
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

// Helper to render the consistent feature boxes
const FeatureProcess = ({ feature, colorName }: { feature: FeatureItem, colorName: string }) => {
  // Color Mapping
  const colors: Record<string, any> = {
    amber: { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700', icon: 'text-amber-600', light: 'bg-amber-50/50' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-700', icon: 'text-purple-600', light: 'bg-purple-50/50' },
    brand: { bg: 'bg-brand-50', border: 'border-brand-100', text: 'text-brand-700', icon: 'text-brand-600', light: 'bg-brand-50/50' }, // map 'brand' to blue-ish
    rose: { bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-700', icon: 'text-rose-600', light: 'bg-rose-50/50' },
    green: { bg: 'bg-green-50', border: 'border-green-100', text: 'text-green-700', icon: 'text-green-600', light: 'bg-green-50/50' },
  };
  
  const theme = colors[colorName] || colors.brand;

  return (
    <div className="flex flex-col gap-3">
       {/* 1. Challenge (Neutral) */}
       <div className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 transition-all hover:border-slate-200">
          <div className="shrink-0 mt-0.5">
             <AlertCircle className="w-5 h-5 text-slate-400" />
          </div>
          <div>
             <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">The Challenge</div>
             <p className="text-sm text-slate-600 font-medium leading-relaxed">{feature.pain}</p>
          </div>
       </div>

       {/* 2. Solution (Themed Highlight) */}
       <div className={`flex gap-4 p-4 rounded-xl border ${theme.bg} ${theme.border} relative overflow-hidden transition-all shadow-sm`}>
          {/* Subtle decoration */}
          <div className={`absolute top-0 right-0 w-16 h-16 ${theme.icon} opacity-5 -mr-4 -mt-4 rounded-full blur-xl pointer-events-none`}></div>
          
          <div className="shrink-0 mt-0.5 bg-white rounded-lg p-1 shadow-sm border border-white/50 h-fit">
             <Zap className={`w-4 h-4 ${theme.icon}`} />
          </div>
          <div className="relative z-10">
             <div className={`text-[10px] font-black uppercase tracking-widest ${theme.text} mb-1 opacity-90`}>The KOSMA Way</div>
             <p className="text-sm text-gray-900 font-bold leading-relaxed">{feature.solution}</p>
          </div>
       </div>

       {/* 3. Impact (High Value) */}
       <div className="flex gap-4 p-4 rounded-xl bg-white border border-gray-100 shadow-sm transition-all hover:shadow-md hover:border-gray-200">
          <div className="shrink-0 mt-0.5">
             <TrendingUp className="w-5 h-5 text-gray-900" />
          </div>
          <div>
             <div className="text-[10px] font-black uppercase tracking-widest text-gray-900 mb-1">The Result</div>
             <p className="text-sm text-gray-600 font-medium leading-relaxed">{feature.impact}</p>
          </div>
       </div>
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

          {/* Testimonial Slider */}
          <div className="w-full">
             <TestimonialSlider />
          </div>
       </div>
    </section>
  );
};

// --- SIGNATURE STATEMENT CARD (Interactive 3D Tilt) ---
const SignatureCard: React.FC = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [glowPos, setGlowPos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    // Only engage on desktop-like environments if needed, but safe to run always on JS
    // Logic: Map mouse position relative to card center to a small rotation range (-2.5 to 2.5 deg)
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateY = ((x - centerX) / centerX) * 2.5; // Rotate Y depends on X axis
    const rotateX = ((centerY - y) / centerY) * 2.5; // Rotate X depends on Y axis (inverted)

    setRotation({ x: rotateX, y: rotateY });
    setGlowPos({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    // Smoothly reset
    setRotation({ x: 0, y: 0 });
  };

  return (
    <div className="w-full max-w-4xl mx-auto perspective-1000 mt-8 md:mt-12 mb-8 px-4">
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`
          relative rounded-[2rem] border transition-all duration-300 ease-out
          ${isHovering ? 'border-white/60 shadow-2xl shadow-gray-200/50 scale-[1.01]' : 'border-white/20 shadow-xl shadow-gray-100/30'}
          bg-white/70 backdrop-blur-md overflow-hidden group
        `}
        style={{
          transform: isHovering 
            ? `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` 
            : 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
          transition: isHovering ? 'none' : 'transform 0.5s ease-out'
        }}
      >
        {/* Shine Effect */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay"
          style={{
            background: `radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 60%)`
          }}
        />
        
        {/* Content */}
        <div className="relative z-10 px-8 py-12 md:px-16 md:py-16 text-center">
           <div className="flex flex-col items-center">
             
             {/* Decorative Top Line - Inside Card now */}
             <div className="w-px h-12 bg-gradient-to-b from-transparent via-gray-300 to-transparent mb-8 opacity-40"></div>
             
             <p className="text-2xl md:text-4xl font-medium text-gray-400 leading-snug tracking-tight">
               <span className="text-transparent bg-clip-text bg-gradient-to-br from-gray-900 via-brand-600 to-brand-400 font-black drop-shadow-sm">
                 KOSMA
               </span>
               {' '}is a software for{' '}
               <span className="text-gray-900 font-bold">film production companies</span>
               {' '}and production managers providing a variety of unique tools to{' '}
               <span className="text-brand-600 font-black">plan and control</span>
               {' '}the financial side of projects from{' '}
               <span className="text-gray-800 italic font-serif">development</span>
               {' '}to{' '}
               <span className="text-gray-800 italic font-serif">delivery</span>.
             </p>
           </div>
        </div>
      </div>
    </div>
  );
};

// --- NEW USP COMPONENT (COMPACT & ROBUST ANIMATION) ---
const USPBlock = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
      }
    }, { threshold: 0.1 });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  // Helper for staged delay
  // We use direct style injection to stagger the transitions
  const transitionClass = `transition-all duration-1000 ease-out transform ${
    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
  }`;
  
  const delayStyle = (ms: number) => ({ transitionDelay: `${ms}ms` });

  return (
    <div ref={ref} className="relative py-12 md:py-20 text-center px-4 max-w-6xl mx-auto">
       <style>{`
         /* Dot Animation */
         @keyframes converge-tl { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(24px, 24px); } }
         @keyframes converge-tr { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-24px, 24px); } }
         @keyframes converge-br { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-24px, -24px); } }
         @keyframes converge-bl { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(24px, -24px); } }
         .anim-dot { animation-duration: 4s; animation-timing-function: ease-in-out; animation-iteration-count: infinite; }
         
         /* LED Border Spin */
         @keyframes border-spin {
            from { transform: translate(-50%, -50%) rotate(0deg); }
            to { transform: translate(-50%, -50%) rotate(360deg); }
         }
         
         /* Perspective container for the card */
         .perspective-1000 {
            perspective: 1000px;
         }
       `}</style>

       <div className="h-32 w-full flex items-center justify-center mb-6 relative">
          <div className="relative w-24 h-24">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-gray-900 rounded-xl rotate-45 z-10 shadow-xl border-2 border-white flex items-center justify-center">
                <Layers className="w-5 h-5 text-white -rotate-45" />
             </div>
             
             <div className="absolute top-0 left-0 w-6 h-6 bg-amber-500 rounded-full anim-dot shadow-md border-2 border-white" style={{ animationName: 'converge-tl' }}></div>
             <div className="absolute top-0 right-0 w-6 h-6 bg-purple-600 rounded-full anim-dot shadow-md border-2 border-white" style={{ animationName: 'converge-tr' }}></div>
             <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-600 rounded-full anim-dot shadow-md border-2 border-white" style={{ animationName: 'converge-br' }}></div>
             <div className="absolute bottom-0 left-0 w-6 h-6 bg-slate-500 rounded-full anim-dot shadow-md border-2 border-white" style={{ animationName: 'converge-bl' }}></div>
          </div>
       </div>

       {/* Headline - Reduced Margin (mb-6) */}
       <h2 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter mb-6 leading-[0.95]">
         <span className={`block ${transitionClass}`} style={delayStyle(0)}>
           Four Modules.
         </span>
         <span className={`block ${transitionClass}`} style={delayStyle(200)}>
           <span className="text-brand-500">One System.</span>
         </span>
       </h2>

       {/* Modules Grid - Reduced Margin (mb-8) */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8 max-w-5xl mx-auto">
          {[
            { label: 'Budgeting', icon: Calculator, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100', glowColor: '#F59E0B', delay: 300 },
            { label: 'Financing', icon: PieChart, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', glowColor: '#9333EA', delay: 400 },
            { label: 'Cash Flow', icon: Coins, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100', glowColor: '#16A34A', delay: 500 },
            { label: 'Cost Control', icon: BarChart3, color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200', glowColor: '#475569', delay: 600 }
          ].map((item) => (
             <div 
               key={item.label}
               className={`group relative rounded-2xl p-6 flex flex-col items-center gap-3 border shadow-sm transform hover:scale-105 transition-all duration-300 ${item.bg} ${item.border} ${transitionClass} overflow-hidden`}
               style={delayStyle(item.delay)}
             >
                {/* Glow Border Overlay */}
                <div 
                   className="absolute inset-0 rounded-2xl pointer-events-none z-0 p-[2px]"
                   style={{
                     mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                     maskComposite: 'exclude',
                     WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                     WebkitMaskComposite: 'xor',
                   }}
                 >
                    <div 
                      className="absolute top-1/2 left-1/2 w-[200%] h-[200%] opacity-0 group-hover:opacity-100 group-hover:animate-[border-spin_3s_linear_infinite]"
                      style={{
                        background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, ${item.glowColor} 60deg, transparent 100deg)`,
                      }}
                    />
                 </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center gap-3">
                    <div className="bg-white p-3 rounded-xl shadow-sm">
                        <item.icon className={`w-8 h-8 ${item.color}`} />
                    </div>
                    <span className={`font-black uppercase tracking-widest text-xs ${item.color.replace('text-', 'text-opacity-80 text-')}`}>{item.label}</span>
                </div>
             </div>
          ))}
       </div>

       {/* SIGNATURE CARD COMPONENT REPLACES PLAIN TEXT */}
       <div className={`${transitionClass}`} style={delayStyle(700)}>
          <SignatureCard />
       </div>
    </div>
  );
};

const FeatureScrollytelling = () => {
  const [activeModuleId, setActiveModuleId] = useState('development');
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

        {/* Phase Headline */}
        <div className="text-center mb-10 max-w-4xl mx-auto mt-32">
           <div className="inline-block p-3 rounded-full bg-gray-50 border border-gray-100 mb-6">
              <TrendingUp className="w-6 h-6 text-gray-400" />
           </div>
           <h3 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight leading-tight">
             Maximum oversight, control and safety in all phases of production
           </h3>
        </div>

        {/* TABS - Sticky outside the scroll container with reduced margin */}
        <div className="sticky top-[80px] z-30 flex justify-center mb-8 md:mb-12">
           <div className="inline-flex flex-wrap justify-center p-1.5 bg-gray-100/80 backdrop-blur-md rounded-2xl border border-gray-200 shadow-sm transition-all duration-300">
              {MODULES.map(module => (
                <button
                  key={module.id}
                  onClick={() => setActiveModuleId(module.id)}
                  className={`px-6 py-3 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${
                    activeModuleId === module.id
                      ? `${module.theme.activeTab} transform scale-105 shadow-md`
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                  }`}
                >
                  <module.icon className="w-4 h-4" />
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

                       {/* Unified Cards for Mobile */}
                       <FeatureProcess feature={feature} colorName={activeModule.colorName} />
                    </div>
                    
                    {/* Visual - Aspect Ratio 9:16 for Mobile - Updated with ImageZoom */}
                    <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-200 bg-gray-100 aspect-[9/16]">
                       <ImageZoom 
                            src={feature.image} 
                            alt={feature.title} 
                            className="w-full h-full object-cover"
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

                                {/* Unified Cards for Desktop */}
                                <FeatureProcess feature={feature} colorName={activeModule.colorName} />
                            </div>
                            ))}
                        </div>
                     </div>

                     {/* RIGHT: Image Stage - Fixed Height 520px - UPDATED FOR ZOOM */}
                     <div className="relative w-full h-[520px] bg-gray-50 rounded-2xl border border-gray-200 shadow-2xl overflow-hidden group">
                        {/* Fake Browser Header */}
                        <div className="absolute top-0 left-0 right-0 h-8 bg-white border-b border-gray-100 flex items-center px-4 gap-2 z-20">
                           <div className="w-2.5 h-2.5 rounded-full bg-red-400/20"></div>
                           <div className="w-2.5 h-2.5 rounded-full bg-amber-400/20"></div>
                           <div className="w-2.5 h-2.5 rounded-full bg-green-400/20"></div>
                        </div>

                        {/* Single Active Image - Background Blur + Contain Zoom Strategy */}
                        <div className="absolute inset-0 top-8 bg-gray-100 flex items-center justify-center overflow-hidden">
                            {/* 1. Background Blur Layer (fills container to remove whitespace) */}
                            <div 
                                className="absolute inset-0 bg-cover bg-center blur-2xl opacity-50 scale-110 transition-all duration-700"
                                style={{ 
                                    backgroundImage: `url(${activeModule.features[activeFeatureIndex].image})`,
                                }}
                            />

                            {/* 2. Main Image (Zoomable, Contained) */}
                            <div className="relative z-10 w-full h-full p-4 flex items-center justify-center">
                                <ImageZoom
                                    key={activeModule.features[activeFeatureIndex].image} // Key forces re-mount on change for clean transition
                                    src={activeModule.features[activeFeatureIndex].image}
                                    alt={activeModule.features[activeFeatureIndex].title}
                                    className="max-h-full max-w-full object-contain shadow-2xl rounded-lg animate-in fade-in zoom-in-95 duration-500"
                                    style={{ maxHeight: '460px' }} // 520px total - 32px header - padding
                                />
                            </div>
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
  const navigate = useNavigate();

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
                <div className="max-w-5xl w-full">
                    
                    {/* NEW ROW 1: Logo + "Simply..." Subheadline */}
                    <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4 mb-6 text-lg md:text-xl font-bold text-white/80 tracking-wide pointer-events-auto">
                        <div className="flex items-center gap-3">
                            <KosmaTextLogo />
                            <span className="hidden md:inline text-brand-500">—</span>
                        </div>
                        <p className="leading-relaxed">
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
                    </div>

                    {/* NEW ROW 2: Main Headline */}
                    <h1
                        className="m-0 font-black tracking-[-0.04em] leading-[0.95] text-[clamp(38px,6vw,86px)] mb-10"
                        style={{ textShadow: '0 0 24px rgba(0,0,0,0.65)' }}
                    >
                        Bring AI to your film budget
                    </h1>

                    <div className="mt-8 flex flex-wrap gap-6 justify-center pointer-events-auto items-center">
                        <ShimmerButton
                            onClick={() => navigate('/download')}
                            className="shadow-[0_0_30px_rgba(0,147,213,0.5)] hover:shadow-[0_0_50px_rgba(0,147,213,0.7)] transition-shadow"
                            background="#0093D5"
                            shimmerColor="#ffffff"
                            borderRadius="1rem"
                            shimmerDuration="2.5s"
                        >
                            <span className="text-white font-black text-sm px-6 py-1 tracking-wide">Download</span>
                        </ShimmerButton>

                        <ShimmerButton
                            onClick={scrollToFeatures}
                            background="rgba(255, 255, 255, 0.05)"
                            shimmerColor="rgba(255, 255, 255, 0.4)"
                            borderRadius="1rem"
                            className="backdrop-blur-md border border-white/10"
                            shimmerDuration="4s"
                        >
                            <span className="text-white/90 font-bold text-sm px-6 py-1">Explore Features</span>
                        </ShimmerButton>
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
