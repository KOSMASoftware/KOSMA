
import React from 'react';
import { Link } from 'react-router-dom';
import { useCookieSettings } from '../../context/CookieContext';

export const Footer: React.FC = () => {
  const { openModal } = useCookieSettings();

  return (
    <footer className="relative z-10 bg-white/80 backdrop-blur-md border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          
          {/* Spalte 1: Product */}
          <div className="flex flex-col gap-4">
            <h4 className="font-black text-gray-900 text-sm uppercase tracking-widest">Product</h4>
            <ul className="space-y-3 text-sm text-gray-500 font-medium">
              <li><Link to="/#budgeting" className="hover:text-brand-500 transition-colors">Budgeting</Link></li>
              <li><Link to="/#financing" className="hover:text-brand-500 transition-colors">Financing</Link></li>
              <li><Link to="/#cashflow" className="hover:text-brand-500 transition-colors">Cash Flow</Link></li>
              <li><Link to="/#cost-control" className="hover:text-brand-500 transition-colors">Cost Control</Link></li>
            </ul>
          </div>

          {/* Spalte 2: Support */}
          <div className="flex flex-col gap-4">
            <h4 className="font-black text-gray-900 text-sm uppercase tracking-widest">Support</h4>
            <ul className="space-y-3 text-sm text-gray-500 font-medium">
              <li><Link to="/help" className="hover:text-brand-500 transition-colors">Knowledge Base</Link></li>
              <li><Link to="/learning" className="hover:text-brand-500 transition-colors">Learning Campus</Link></li>
              <li><Link to="/login?reset=true" className="hover:text-brand-500 transition-colors">Reset Password</Link></li>
            </ul>
          </div>

          {/* Spalte 3: Legal */}
          <div className="flex flex-col gap-4">
            <h4 className="font-black text-gray-900 text-sm uppercase tracking-widest">Legal</h4>
            <ul className="space-y-3 text-sm text-gray-500 font-medium">
              <li><Link to="/imprint" className="hover:text-brand-500 transition-colors">Imprint</Link></li>
              <li><Link to="/privacy" className="hover:text-brand-500 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-brand-500 transition-colors">Terms / GTC</Link></li>
              <li><Link to="/eula" className="hover:text-brand-500 transition-colors">EULA</Link></li>
              <li>
                  <button 
                    onClick={openModal} 
                    className="hover:text-brand-500 transition-colors text-left"
                  >
                    Cookie Settings
                  </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
           
           {/* Left: Support Logo */}
           <div className="flex flex-col gap-2">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">With the support of</span>
                <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/MEDIA-Logo.svg/2560px-MEDIA-Logo.svg.png" 
                    alt="Creative Europe MEDIA" 
                    className="h-10 w-auto object-contain object-left opacity-60 grayscale hover:grayscale-0 transition-all"
                />
           </div>

           {/* Right: Copyright */}
           <div className="flex flex-col md:items-end gap-2 w-full md:w-auto">
               <div className="flex justify-between md:justify-end items-center gap-4 w-full">
                   <div className="text-xl font-black text-brand-500 tracking-tighter md:hidden">KOSMA</div>
                   <div className="hidden md:block text-xl font-black text-brand-500 tracking-tighter opacity-20 hover:opacity-100 transition-opacity">KOSMA</div>
               </div>
               <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                  &copy; {new Date().getFullYear()} KOSMA
               </p>
           </div>
        </div>
      </div>
    </footer>
  );
};
