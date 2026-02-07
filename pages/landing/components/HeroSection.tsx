import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MorphingText } from '../../../components/MorphingText';
import { Logo } from '../../../components/ui/Logo';
import { Globe, ChevronDown, Menu, X } from 'lucide-react';
import { ShimmerButton } from '../../../components/ui/ShimmerButton';
import { BG } from '../data';
import { KosmaTextLogo } from './LandingIcons';

export const HeroSection = () => {
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

      <canvas 
        ref={canvasRef} 
        onClick={randomize}
        className="absolute inset-0 w-full h-full block cursor-crosshair" 
      />

      <div className="relative z-10 w-full h-full flex items-center justify-center px-6 text-center pointer-events-none">
          <div className="max-w-5xl w-full flex flex-col items-center">
              
              {/* HERO CONTENT (No Card) */}
              <div className="pointer-events-auto inline-block">
                  
                  {/* NEW ROW 1: Logo + "Simply..." Subheadline */}
                  <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4 mb-6 text-base md:text-lg font-bold text-gray-200 tracking-wide">
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
                          className="text-white"
                          />{' '}
                          Software
                      </p>
                  </div>

                  {/* NEW ROW 2: Main Headline */}
                  <h1
                      className="m-0 font-black tracking-tight leading-none text-3xl md:text-4xl mb-10 text-white"
                      style={{ textShadow: '0 0 24px rgba(255,255,255,0.65)' }}
                  >
                      Bring AI to your film budget
                  </h1>

                  <div className="mt-8 flex flex-wrap gap-6 justify-center items-center">
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
                          className="shadow-[0_0_30px_rgba(245,158,11,0.45)] hover:shadow-[0_0_50px_rgba(245,158,11,0.65)] transition-shadow"
                          background="#F59E0B"
                          shimmerColor="#ffffff"
                          borderRadius="1rem"
                          shimmerDuration="2.5s"
                      >
                          <span className="text-white font-black text-sm px-6 py-1 tracking-wide">Explore Features</span>
                      </ShimmerButton>
                  </div>
              </div>
          </div>
      </div>

      <div className="absolute bottom-8 left-0 w-full z-10 text-[10px] tracking-[0.2em] uppercase text-white/40 flex justify-center gap-6 pointer-events-none px-4">
          <span>Move cursor</span>
          <span>Click to randomize</span>
      </div>

      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(80% 60% at 50% 10%, rgba(0,147,213,0.10), transparent)' }} />
    </div>
  );
};