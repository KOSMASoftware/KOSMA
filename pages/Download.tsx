
import React from 'react';
import { MarketingLayout } from '../components/layout/MarketingLayout';
import { Apple, Monitor, HardDrive, WifiOff, BookOpen, GraduationCap, ArrowRight, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DownloadPage: React.FC = () => {
  return (
    <MarketingLayout>
      <div className="min-h-[calc(100vh-72px)]">
        {/* HERO */}
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-32 text-center">
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter mb-8">
                Download KOSMA
            </h1>
            <p className="text-xl md:text-2xl text-gray-500 font-medium max-w-2xl mx-auto mb-16 leading-relaxed">
                Check out the full feature set with our 14-days trial.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-6 mb-24">
                <button className="flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-gray-900 text-white font-bold text-lg hover:bg-brand-500 transition-all shadow-xl shadow-gray-900/10 hover:shadow-brand-500/20 hover:-translate-y-1">
                    <Apple className="w-6 h-6 mb-1" />
                    Download for Mac
                </button>
                <button className="flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-gray-100 text-gray-900 font-bold text-lg hover:bg-white border border-transparent hover:border-gray-200 hover:shadow-lg transition-all">
                    <Monitor className="w-6 h-6" />
                    Download for Windows
                </button>
            </div>
        </div>

        {/* INFO TILES - UPDATED DESIGN: Flat, Neutral, Technical */}
        <div className="bg-white py-24 px-6 border-t border-slate-100">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                     <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Take the first KOSMA steps</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
                     {/* Local & Secure */}
                     <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 flex gap-6 items-start hover:border-slate-300 transition-colors">
                        <div className="w-12 h-12 rounded-xl bg-white text-slate-500 flex items-center justify-center shrink-0 border border-slate-100 shadow-sm">
                            <HardDrive className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 text-lg mb-2">Local & Secure</h3>
                            <p className="text-slate-500 leading-relaxed text-sm">
                                KOSMA stores your data locally on your machine and on the KOSMA server for you to share with other project members.
                            </p>
                        </div>
                     </div>

                     {/* Offline Ready */}
                     <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 flex gap-6 items-start hover:border-slate-300 transition-colors">
                        <div className="w-12 h-12 rounded-xl bg-white text-slate-500 flex items-center justify-center shrink-0 border border-slate-100 shadow-sm">
                            <WifiOff className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 text-lg mb-2">Offline Ready</h3>
                            <p className="text-slate-500 leading-relaxed text-sm">
                                No internet, no problem – KOSMA runs offline as desktop app, not in a browser.
                            </p>
                        </div>
                     </div>

                     {/* Knowledge Base */}
                     <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 flex gap-6 items-start hover:border-slate-300 transition-colors">
                        <div className="w-12 h-12 rounded-xl bg-white text-slate-500 flex items-center justify-center shrink-0 border border-slate-100 shadow-sm">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 text-lg mb-2">Need Help?</h3>
                            <p className="text-slate-500 leading-relaxed mb-4 text-sm">
                                Do you need more help? If you are having issues with KOSMA, you might find the answer in our Knowledge base.
                            </p>
                            <Link to="/help" className="font-bold text-slate-900 flex items-center gap-2 hover:gap-3 transition-all text-xs uppercase tracking-widest hover:text-brand-500">
                                Visit Knowledge Base <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                     </div>

                     {/* Learning Campus */}
                     <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 flex gap-6 items-start hover:border-slate-300 transition-colors">
                        <div className="w-12 h-12 rounded-xl bg-white text-slate-500 flex items-center justify-center shrink-0 border border-slate-100 shadow-sm">
                            <GraduationCap className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 text-lg mb-2">Become a Pro</h3>
                            <p className="text-slate-500 leading-relaxed mb-4 text-sm">
                                Want to become a KOSMA pro? Learn Kosma the easy way and check out our learning campus.
                            </p>
                            <Link to="/learning" className="font-bold text-slate-900 flex items-center gap-2 hover:gap-3 transition-all text-xs uppercase tracking-widest hover:text-brand-500">
                                Go to Learning Campus <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                     </div>
                </div>

                {/* SUPPORT BLOCK - Light & Neutral Redesign */}
                <div className="bg-slate-50 rounded-3xl p-12 md:p-16 text-center border border-slate-200">
                    <div className="max-w-3xl mx-auto">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-8 border border-slate-100 shadow-sm text-slate-400">
                            <MessageCircle className="w-8 h-8" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-6 tracking-tight">Can't find what you're looking for?</h2>
                        <p className="text-lg text-slate-500 mb-10 leading-relaxed max-w-2xl mx-auto">
                            Do you have a question, want to report an error, or add a feature to the wishlist?<br/>
                            Write to us, and we will respond as soon as possible.
                        </p>
                        <Link to="/support" className="inline-block px-10 py-4 bg-brand-500 text-white rounded-2xl font-bold text-lg hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20 hover:-translate-y-1">
                            Contact Support
                        </Link>
                    </div>
                </div>

                {/* FINAL CTA */}
                <div className="text-center mt-24">
                    <Link to="/signup" className="text-sm font-black text-gray-300 uppercase tracking-[0.3em] hover:text-brand-500 transition-colors">
                        Ready to join? Sign up now
                    </Link>
                </div>
            </div>
        </div>
      </div>
    </MarketingLayout>
  );
};
