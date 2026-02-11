
import React, { useEffect, useRef, useState } from 'react';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { ImageZoom } from '../../../components/ui/ImageZoom';
import { MODULES, FeatureItem } from '../data';
import { USPBlock } from './USPSection';
import { KosmaMarkIcon } from './LandingIcons';
import { H3, H5, Paragraph } from '../../../components/ui/Typography';

// Helper to render the consistent feature boxes
const FeatureProcess = ({ feature, colorName }: { feature: FeatureItem, colorName: string }) => {
  // Color Mapping
  const colors: Record<string, any> = {
    amber: { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700', icon: 'text-amber-600', light: 'bg-amber-50/50' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-700', icon: 'text-purple-600', light: 'bg-purple-50/50' },
    brand: { bg: 'bg-brand-50', border: 'border-brand-100', text: 'text-brand-700', icon: 'text-brand-600', light: 'bg-brand-50/50' }, 
    rose: { bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-700', icon: 'text-rose-600', light: 'bg-rose-50/50' },
    green: { bg: 'bg-green-50', border: 'border-green-100', text: 'text-green-700', icon: 'text-green-600', light: 'bg-green-50/50' },
  };
  
  const theme = colors[colorName] || colors.brand;

  return (
    <div className="flex flex-col gap-3">
       {/* 1. Challenge (Neutral) */}
       <div className="flex gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-slate-50 border border-slate-100 transition-all hover:border-slate-200">
          <div className="shrink-0 mt-0.5">
             <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-slate-400" />
          </div>
          <div>
             <H5 className="text-slate-400 mb-1">The Challenge</H5>
             <Paragraph className="text-xs md:text-sm text-slate-600 font-medium">{feature.pain}</Paragraph>
          </div>
       </div>

       {/* 2. Solution (Themed Highlight) */}
       <div className={`flex gap-3 md:gap-4 p-3 md:p-4 rounded-xl border ${theme.bg} ${theme.border} relative overflow-hidden transition-all shadow-sm`}>
          {/* Subtle decoration */}
          <div className={`absolute top-0 right-0 w-16 h-16 ${theme.icon} opacity-5 -mr-4 -mt-4 rounded-full blur-xl pointer-events-none`}></div>
          
          <div className="shrink-0 mt-0.5 bg-white rounded-lg p-1 shadow-sm border border-white/50 h-fit">
             <KosmaMarkIcon className={`w-3 h-3 md:w-4 md:h-4 ${theme.icon}`} />
          </div>
          <div className="relative z-10">
             <H5 className={`${theme.text} mb-1 opacity-90`}>The KOSMA Way</H5>
             <Paragraph className="text-xs md:text-sm text-gray-900 font-bold">{feature.solution}</Paragraph>
          </div>
       </div>

       {/* 3. Impact (High Value) */}
       <div className="flex gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-white border border-gray-100 shadow-sm transition-all hover:shadow-md hover:border-gray-200">
          <div className="shrink-0 mt-0.5">
             <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-gray-900" />
          </div>
          <div>
             <H5 className="text-gray-900 mb-1">The Result</H5>
             <Paragraph className="text-xs md:text-sm text-gray-600 font-medium">{feature.impact}</Paragraph>
          </div>
       </div>
    </div>
  );
};

export const FeatureScrollytelling = () => {
  const [activeModuleId, setActiveModuleId] = useState('development');
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 1024 : false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null); 
  
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

  // Scroll Progress Logic
  useEffect(() => {
    if (isMobile) return;

    let ticking = false;
    let lastIndex = -1;

    const handleScroll = () => {
      if (!sectionRef.current) return;
      if (ticking) return; 

      ticking = true;
      window.requestAnimationFrame(() => {
        if (!sectionRef.current) {
            ticking = false;
            return;
        }
        
        const rect = sectionRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const height = rect.height;
        const stickyOffset = 180; 
        
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
    handleScroll(); 
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeModule, isMobile]);

  return (
    // Outer Container
    <section id="features" className="relative w-full py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* NEW USP BLOCK */}
        <USPBlock />

        {/* Phase Headline */}
        <div id="detailed-features" className="text-center mb-8 md:mb-10 max-w-4xl mx-auto mt-16 md:mt-24 scroll-mt-32">
           <H3>
             Maximum oversight, control and safety in all phases of production
           </H3>
        </div>

        {/* TABS */}
        <div className="relative md:sticky md:top-[80px] z-30 flex justify-center mb-8 md:mb-12 -mx-6 px-6 md:mx-0 md:px-0">
           <div 
             ref={scrollContainerRef}
             className="flex overflow-x-auto snap-x no-scrollbar md:inline-flex md:flex-wrap md:justify-center p-1.5 bg-gray-100/90 backdrop-blur-md rounded-2xl border border-gray-200 shadow-sm transition-all duration-300 max-w-full"
           >
              {MODULES.map(module => (
                <button
                  key={module.id}
                  onClick={() => setActiveModuleId(module.id)}
                  className={`shrink-0 snap-center px-4 md:px-6 py-2.5 md:py-3 rounded-xl text-xs md:text-sm font-black transition-all flex items-center gap-2 mr-2 md:mr-0 ${
                    activeModuleId === module.id
                      ? `${module.theme.activeTab} shadow-sm`
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                  }`}
                >
                  <module.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  {module.label}
                </button>
              ))}
           </div>
        </div>

        {/* CONDITIONAL RENDERING */}
        {isMobile ? (
            /* MOBILE TIMELINE VIEW */
            <div className="flex flex-col pb-24 animate-in fade-in relative pl-4">
               {/* Vertical Timeline Line */}
               <div className="absolute left-[19px] top-4 bottom-0 w-0.5 bg-gray-100 rounded-full"></div>

               {activeModule.features.map((feature, idx) => (
                 <div key={`${activeModuleId}-mob-${idx}`} className="flex flex-col gap-6 mb-16 relative">
                    
                    {/* Step Header attached to Timeline */}
                    <div className="flex items-center gap-4">
                       {/* Number Bubble */}
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-white text-xs font-black shrink-0 relative z-10 shadow-sm ${activeModule.theme.mobileNumber} bg-white`}>
                          {idx + 1}
                       </div>
                       <div className="flex-1 pt-1">
                          <H3>{feature.title}</H3>
                       </div>
                    </div>

                    {/* Content Body (indented) */}
                    <div className="pl-12 flex flex-col gap-6">
                       <Paragraph className="text-sm font-medium text-gray-500">
                          {feature.desc}
                       </Paragraph>

                       {/* Visual */}
                       <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200 bg-gray-100 aspect-[4/3] w-full">
                          <ImageZoom 
                               src={feature.image} 
                               alt={feature.title} 
                               className="w-full h-full object-cover"
                          />
                       </div>

                       {/* Unified Cards for Mobile */}
                       <FeatureProcess feature={feature} colorName={activeModule.colorName} />
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
                  <div className="w-full max-w-7xl grid grid-cols-2 gap-8 xl:gap-12 items-stretch">
                     
                     {/* LEFT: Text Stage */}
                     <div className="relative h-[520px] pt-8 flex gap-8">
                        {/* Vertical Progress Rail */}
                        <div className="flex flex-col items-center h-[400px] py-4 w-8 shrink-0 relative">
                            <div className="absolute top-4 bottom-4 left-1/2 w-0.5 bg-gray-100 -translate-x-1/2 rounded-full"></div>
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
                                
                                <H3 className="mb-2 leading-tight">
                                    {feature.title}
                                </H3>
                                <Paragraph className="font-bold text-gray-400 mb-10">
                                    {feature.desc}
                                </Paragraph>

                                {/* Unified Cards for Desktop */}
                                <FeatureProcess feature={feature} colorName={activeModule.colorName} />
                            </div>
                            ))}
                        </div>
                     </div>

                     {/* RIGHT: Image Stage */}
                     <div className="relative w-full h-[520px] bg-gray-50 rounded-2xl border border-gray-200 shadow-2xl overflow-hidden group">
                        {/* Fake Browser Header */}
                        <div className="absolute top-0 left-0 right-0 h-8 bg-white border-b border-gray-100 flex items-center px-4 gap-2 z-20">
                           <div className="w-2.5 h-2.5 rounded-full bg-red-400/20"></div>
                           <div className="w-2.5 h-2.5 rounded-full bg-amber-400/20"></div>
                           <div className="w-2.5 h-2.5 rounded-full bg-green-400/20"></div>
                        </div>

                        {/* Image Logic */}
                        <div className="absolute inset-0 top-8 bg-gray-100 flex items-center justify-center overflow-hidden">
                            <div 
                                className="absolute inset-0 bg-cover bg-center blur-2xl opacity-50 scale-110 transition-all duration-700"
                                style={{ 
                                    backgroundImage: `url(${activeModule.features[activeFeatureIndex].image})`,
                                }}
                            />

                            <div className="relative z-10 w-full h-full p-4 flex items-center justify-center">
                                <ImageZoom
                                    key={activeModule.features[activeFeatureIndex].image} 
                                    src={activeModule.features[activeFeatureIndex].image}
                                    alt={activeModule.features[activeFeatureIndex].title}
                                    className="max-h-full max-w-full object-contain shadow-2xl rounded-lg animate-in fade-in zoom-in-95 duration-500"
                                    style={{ maxHeight: '460px' }} 
                                />
                            </div>
                        </div>
                        
                        <div className="absolute bottom-6 right-6 px-4 py-2 bg-white/90 backdrop-blur rounded-lg shadow-lg border border-gray-100 pointer-events-none z-30">
                             <H5 className="mb-0">View</H5>
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
