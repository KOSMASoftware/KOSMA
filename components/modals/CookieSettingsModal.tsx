
import React, { useState } from 'react';
import { X, Check, ShieldCheck, BarChart3, Megaphone } from 'lucide-react';
import { useCookieSettings } from '../../context/CookieContext';

export const CookieSettingsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { preferences, savePreferences } = useCookieSettings();
  const [localPrefs, setLocalPrefs] = useState(preferences);

  const handleSave = () => {
    savePreferences(localPrefs);
    onClose();
  };

  const toggle = (key: keyof typeof localPrefs) => {
    if (key === 'essential') return; // Locked
    setLocalPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleReset = () => {
      setLocalPrefs({ essential: true, analytics: true, marketing: false });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 pb-6 border-b border-gray-100 flex justify-between items-start">
            <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Cookie Settings</h2>
                <p className="text-sm text-gray-500 font-medium mt-2 leading-relaxed">
                    We use cookies and similar technologies to ensure the operation of the Service and to improve it. You can change your preferences at any time.
                </p>
            </div>
            <button onClick={onClose} className="p-2 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-xl transition-colors">
                <X className="w-5 h-5" />
            </button>
        </div>
        
        <div className="p-8 space-y-6">
            {/* Essential */}
            <div className="flex gap-4 items-start opacity-60 cursor-not-allowed select-none">
                <div className="mt-1 p-2 bg-gray-100 rounded-lg text-gray-500 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                        <h3 className="font-bold text-gray-900">Essential</h3>
                        <div className="w-10 h-6 bg-brand-500/50 rounded-full p-1 flex justify-end">
                            <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                        Required for the operation of the Service (e.g. login, security, language settings). They cannot be disabled.
                    </p>
                </div>
            </div>

            {/* Analytics */}
            <div className="flex gap-4 items-start">
                <div className={`mt-1 p-2 rounded-lg shrink-0 transition-colors ${localPrefs.analytics ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'}`}>
                    <BarChart3 className="w-5 h-5" />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-1 cursor-pointer" onClick={() => toggle('analytics')}>
                        <h3 className="font-bold text-gray-900">Analytics</h3>
                        <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 ${localPrefs.analytics ? 'bg-brand-500' : 'bg-gray-200'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${localPrefs.analytics ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                        Analytics cookies help us understand how the Service is used. All data is processed in aggregated or anonymized form.
                    </p>
                </div>
            </div>

            {/* Marketing */}
            <div className="flex gap-4 items-start">
                <div className={`mt-1 p-2 rounded-lg shrink-0 transition-colors ${localPrefs.marketing ? 'bg-purple-50 text-purple-600' : 'bg-gray-50 text-gray-400'}`}>
                    <Megaphone className="w-5 h-5" />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-1 cursor-pointer" onClick={() => toggle('marketing')}>
                        <h3 className="font-bold text-gray-900">Marketing</h3>
                        <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 ${localPrefs.marketing ? 'bg-brand-500' : 'bg-gray-200'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${localPrefs.marketing ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                        Marketing cookies are used to show relevant content and measure campaign performance. They are only used if you explicitly enable them.
                    </p>
                </div>
            </div>
        </div>

        <div className="p-8 pt-0 flex gap-4">
             <button 
                onClick={handleReset}
                className="flex-1 py-4 rounded-xl border border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50 transition-colors"
             >
                Reset to default
             </button>
             <button 
                onClick={handleSave}
                className="flex-[2] py-4 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-brand-500 transition-colors shadow-xl shadow-gray-900/10 flex items-center justify-center gap-2"
             >
                <Check className="w-4 h-4" /> Save Settings
             </button>
        </div>
      </div>
    </div>
  );
};
