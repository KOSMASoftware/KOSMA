import React, { useState, useEffect } from 'react';
import { MarketingLayout } from '../components/layout/MarketingLayout';
import { Download, Monitor, ArrowRight, UserCircle, Plus, Laptop, Command, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ShimmerButton } from '../components/ui/ShimmerButton';
import { Card } from '../components/ui/Card';
import { ImageZoom } from '../components/ui/ImageZoom';

export const DownloadPage: React.FC = () => {
  const [os, setOs] = useState<'mac' | 'windows' | 'unknown'>('unknown');
  const [downloadStarted, setDownloadStarted] = useState(false);

  useEffect(() => {
    const ua = window.navigator.userAgent.toLowerCase();
    if (ua.includes('mac')) setOs('mac');
    else if (ua.includes('win')) setOs('windows');
  }, []);

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    setDownloadStarted(true);
    // Simulate download delay
    setTimeout(() => {
        window.location.href = 'https://services.kosma.io/installer/KOSMA.air';
    }, 800);
  };

  return (
    <MarketingLayout>
      <div className="min-h-[calc(100vh-72px)] flex flex-col items-center py-16 md:py-24 px-6">
        
        {/* --- HERO HEADER --- */}
        <div className="text-center max-w-3xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter mb-6 leading-[1.1]">
                Get KOSMA<br/>
                <span className="text-brand-500">Production Ready.</span>
            </h1>
            <p className="text-lg text-gray-500 font-medium mb-10 leading-relaxed max-w-xl mx-auto">
                Download the native desktop client. <br/>
                No browser limitations, full offline capability.
            </p>

            <div className="flex flex-col items-center gap-4">
                <ShimmerButton 
                    onClick={handleDownload}
                    className="shadow-2xl shadow-brand-500/30"
                    background="#0093D0"
                    shimmerColor="#ffffff"
                    borderRadius="0.75rem"
                >
                    <div className="flex items-center gap-3 px-8 py-2">
                        <Download className="w-5 h-5" />
                        <span className="text-base font-black tracking-tight">
                            Download for {os === 'windows' ? 'Windows' : 'macOS'}
                        </span>
                    </div>
                </ShimmerButton>
                
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                    <span>v2.4.1</span>
                    <span>•</span>
                    <button onClick={() => setOs(os === 'mac' ? 'windows' : 'mac')} className="hover:text-brand-500 transition-colors">
                        Switch to {os === 'windows' ? 'macOS' : 'Windows'}
                    </button>
                </div>
            </div>
        </div>

        {/* --- APP VISUAL (SCREENSHOT) --- */}
        <div className="w-full max-w-5xl mx-auto mb-24 relative animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
            {/* Window Frame */}
            <div className="rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden relative z-10 ring-1 ring-gray-900/5">
                {/* Traffic Lights (Neutral) */}
                <div className="h-10 bg-gray-50 border-b border-gray-100 flex items-center px-4 gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                    <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                    <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                    <div className="flex-1 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-[-50px]">KOSMA - Project Overview</div>
                </div>
                {/* Actual Screenshot */}
                <div className="relative bg-gray-100 aspect-[16/10] overflow-hidden">
                     <ImageZoom 
                        src="https://i.ibb.co/tp0B8GWh/Cash-Flow.png" 
                        alt="KOSMA Interface" 
                        className="w-full h-full object-cover"
                     />
                </div>
            </div>
            
            {/* Background Glow */}
            <div className="absolute -inset-4 bg-brand-500/10 blur-3xl rounded-[3rem] -z-10"></div>
        </div>

        {/* --- 3-STEP ONBOARDING CARDS --- */}
        <div className="max-w-6xl mx-auto w-full">
            <div className="text-center mb-12">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">How to start</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Step 1 */}
                <Card className="p-8 items-start h-full">
                    <div className="mb-6 w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                        <Laptop className="w-6 h-6" />
                    </div>
                    <div className="mb-2 flex items-center gap-3">
                        <span className="text-xs font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded">STEP 1</span>
                        <h3 className="text-lg font-black text-gray-900">Install App</h3>
                    </div>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed mb-4">
                        Run the installer. KOSMA is a native app that runs locally on your machine for maximum performance.
                    </p>
                    {downloadStarted && (
                        <div className="mt-auto pt-4 flex items-center gap-2 text-xs font-bold text-green-600">
                            <CheckCircle2 className="w-4 h-4" /> Download started
                        </div>
                    )}
                </Card>

                {/* Step 2 */}
                <Card className="p-8 items-start h-full">
                    <div className="mb-6 w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                        <UserCircle className="w-6 h-6" />
                    </div>
                    <div className="mb-2 flex items-center gap-3">
                        <span className="text-xs font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded">STEP 2</span>
                        <h3 className="text-lg font-black text-gray-900">Login</h3>
                    </div>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed mb-6">
                        Use your website credentials to log in. You don't need a separate license key for the trial.
                    </p>
                    <Link to="/signup" className="mt-auto inline-flex items-center gap-1 text-xs font-black uppercase tracking-widest text-brand-500 hover:underline">
                        Create Account <ArrowRight className="w-3 h-3" />
                    </Link>
                </Card>

                {/* Step 3 */}
                <Card className="p-8 items-start h-full">
                    <div className="mb-6 w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
                        <Plus className="w-6 h-6" />
                    </div>
                    <div className="mb-2 flex items-center gap-3">
                        <span className="text-xs font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded">STEP 3</span>
                        <h3 className="text-lg font-black text-gray-900">First Project</h3>
                    </div>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed mb-4">
                        Create a new project or load a template. You are ready to work offline immediately.
                    </p>
                </Card>
            </div>
        </div>

      </div>
    </MarketingLayout>
  );
};