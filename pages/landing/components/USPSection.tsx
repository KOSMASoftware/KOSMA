import React, { useEffect, useRef, useState } from 'react';
import { Layers, Calculator, PieChart, Coins, BarChart3 } from 'lucide-react';

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
          relative rounded-2xl border transition-all duration-300 ease-out
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
        <div className="relative z-10 p-6 md:p-8 text-center">
           <div className="flex flex-col items-center">
             
             {/* Decorative Top Line - Inside Card now */}
             <div className="w-px h-12 bg-gradient-to-b from-transparent via-gray-300 to-transparent mb-4 opacity-40"></div>
             
             <p className="text-xl md:text-2xl font-medium text-gray-400 leading-snug tracking-tight">
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

export const USPBlock = () => {
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
    <div ref={ref} className="relative py-12 text-center px-4 max-w-6xl mx-auto">
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
       <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tighter mb-6 leading-tight">
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