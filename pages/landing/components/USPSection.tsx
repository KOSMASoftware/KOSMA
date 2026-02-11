
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { H2, H3, Paragraph } from '../../../components/ui/Typography';

export const USPBlock = () => {
  const steps = [
    {
      id: '01',
      title: 'Budgeting',
      desc: 'Create detailed calculations with flexible structures.',
      color: 'bg-amber-500',
      shadow: 'shadow-[0_0_15px_rgba(245,158,11,0.4)]',
      textHover: 'group-hover:text-amber-600'
    },
    {
      id: '02',
      title: 'Financing',
      desc: 'Manage sources, investors and cash installments.',
      color: 'bg-purple-600',
      shadow: 'shadow-[0_0_15px_rgba(147,51,234,0.4)]',
      textHover: 'group-hover:text-purple-600'
    },
    {
      id: '03',
      title: 'Cash Flow',
      desc: 'Visualize liquidity based on milestones and phases.',
      color: 'bg-green-600',
      shadow: 'shadow-[0_0_15px_rgba(22,163,74,0.4)]',
      textHover: 'group-hover:text-green-600'
    },
    {
      id: '04',
      title: 'Cost Control',
      desc: 'Track actuals vs. budget in real-time.',
      color: 'bg-brand-500',
      shadow: 'shadow-[0_0_15px_rgba(0,147,208,0.4)]',
      textHover: 'group-hover:text-brand-600'
    }
  ];

  return (
    <div className="relative py-20 md:py-32 bg-white">
       <div className="max-w-7xl mx-auto px-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
             
             {/* LEFT COLUMN: The Statement */}
             <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700 relative lg:sticky lg:top-32">
                {/* Huge Headline */}
                <H2 className="leading-[0.95] text-gray-900">
                  Financial Control.<br />
                  <span className="text-brand-500">From Script to Screen.</span>
                </H2>

                {/* The Mandatory Text */}
                <div className="relative pl-6 border-l-4 border-gray-100">
                   <Paragraph className="text-lg md:text-xl font-medium">
                     KOSMA is a software for <strong className="text-gray-900">film production companies</strong> and production managers providing a variety of unique tools to <strong className="text-gray-900">plan and control</strong> the financial side of projects from <span className="italic text-gray-800">development</span> to <span className="italic text-gray-800">delivery</span>.
                   </Paragraph>
                </div>
             </div>

             {/* RIGHT COLUMN: The Interactive Process List */}
             <div className="relative animate-in fade-in slide-in-from-right-8 duration-700 delay-200">
                <div className="flex flex-col">
                   {steps.map((step, idx) => (
                      <div 
                        key={step.id} 
                        className="group flex items-start gap-6 py-8 border-b border-gray-100 last:border-0 transition-all duration-300 hover:pl-4 cursor-default"
                      >
                         {/* Numbering - Visual Anchor - Keeping as visual element, not standard typo */}
                         <div className="text-2xl md:text-3xl font-black text-gray-100 group-hover:text-gray-200 transition-colors select-none tabular-nums">
                            {step.id}
                         </div>

                         {/* Content */}
                         <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                               {/* The Glowing Dot */}
                               <div className={`w-2.5 h-2.5 rounded-full ${step.color} ${step.shadow} transition-transform duration-300 group-hover:scale-125`}></div>
                               
                               {/* The Title */}
                               <H3 className={`${step.textHover} transition-colors`}>
                                  {step.title}
                               </H3>
                            </div>
                            
                            {/* The Description */}
                            <Paragraph className="text-sm md:text-base text-gray-400 group-hover:text-gray-600 transition-colors max-w-sm">
                               {step.desc}
                            </Paragraph>
                         </div>

                         {/* Hover Arrow on the far right */}
                         <div className="mt-2 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 text-gray-300">
                            <ArrowRight className="w-6 h-6" />
                         </div>
                      </div>
                   ))}
                </div>
             </div>

          </div>
       </div>
    </div>
  );
};
