
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

        {/* INFO TILES */}
        <div className="bg-gray-50/80 backdrop-blur-sm py-24 px-6 border-t border-gray-100">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                     <h2 className="text-2xl font-bold text-gray-900">Take the first KOSMA steps with our user-friendly tutorials</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                     <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 flex gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <HardDrive className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg mb-2">Local & Secure</h3>
                            <p className="text-gray-500 leading-relaxed">
                                KOSMA stores your data locally on your machine and on the KOSMA server for you to share with other project members.
                            </p>
                        </div>
                     </div>

                     <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 flex gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                            <WifiOff className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg mb-2">Offline Ready</h3>
                            <p className="text-gray-500 leading-relaxed">
                                No internet, no problem – KOSMA runs offline as desktop app, not in a browser.
                            </p>
                        </div>
                     </div>

                     <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 flex gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg mb-2">Need Help?</h3>
                            <p className="text-gray-500 leading-relaxed mb-4">
                                Do you need more help? If you are having issues with KOSMA, you might find the answer in our Knowledge base.
                            </p>
                            <Link to="/help" className="font-black text-brand-500 flex items-center gap-2 hover:gap-3 transition-all text-sm uppercase tracking-widest">
                                Visit Knowledge Base <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                     </div>

                     <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 flex gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                            <GraduationCap className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg mb-2">Become a Pro</h3>
                            <p className="text-gray-500 leading-relaxed mb-4">
                                Want to become a KOSMA pro? Learn Kosma the easy way and check out our learning campus.
                            </p>
                            <Link to="/learning" className="font-black text-brand-500 flex items-center gap-2 hover:gap-3 transition-all text-sm uppercase tracking-widest">
                                Go to Learning Campus <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                     </div>
                </div>

                {/* SUPPORT BLOCK */}
                <div className="bg-gray-900 rounded-[3rem] p-12 md:p-16 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/20 blur-3xl rounded-full -mr-32 -mt-32 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 blur-3xl rounded-full -ml-32 -mb-32 pointer-events-none"></div>
                    
                    <div className="relative z-10 max-w-3xl mx-auto">
                        <MessageCircle className="w-16 h-16 mx-auto mb-8 text-brand-400" />
                        <h2 className="text-3xl md:text-4xl font-black mb-6 tracking-tight">Can't find what you're looking for?</h2>
                        <p className="text-xl text-gray-400 mb-10 leading-relaxed">
                            Do you have a question, want to report an error, or add a feature to the wishlist?<br/>
                            Write to us, and we will respond as soon as possible.
                        </p>
                        <Link to="/contact" className="inline-block px-10 py-5 bg-white text-gray-900 rounded-2xl font-black text-lg hover:bg-brand-500 hover:text-white transition-all shadow-xl">
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
