
import React from 'react';
import { Link } from 'react-router-dom';
import { useCookieSettings } from '../../context/CookieContext';
import { Logo } from '../ui/Logo';
import { H5, Small } from '../ui/Typography';

export const Footer: React.FC = () => {
  const { openModal } = useCookieSettings();

  // Link Style: 14px (text-sm), Bold
  const linkStyle = "text-sm font-bold cursor-pointer";

  return (
    <footer className="relative z-0 bg-white/80 backdrop-blur-md border-t border-gray-200 mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-4">
          
          {/* Col 1: Product */}
          <div className="flex flex-col gap-2">
            <H5 className="text-gray-900 mb-1">Product</H5>
            <ul className="space-y-1">
              <li><Link to="/#budgeting" className="hover:text-brand-500 transition-colors"><span className={linkStyle}>Budgeting</span></Link></li>
              <li><Link to="/#financing" className="hover:text-brand-500 transition-colors"><span className={linkStyle}>Financing</span></Link></li>
              <li><Link to="/#cashflow" className="hover:text-brand-500 transition-colors"><span className={linkStyle}>Cash Flow</span></Link></li>
              <li><Link to="/#cost-control" className="hover:text-brand-500 transition-colors"><span className={linkStyle}>Cost Control</span></Link></li>
            </ul>
          </div>

          {/* Col 2: Resources */}
          <div className="flex flex-col gap-2">
            <H5 className="text-gray-900 mb-1">Resources</H5>
            <ul className="space-y-1">
              <li><Link to="/learning" className="hover:text-brand-500 transition-colors"><span className={linkStyle}>Learning Campus</span></Link></li>
              <li><Link to="/help" className="hover:text-brand-500 transition-colors"><span className={linkStyle}>Knowledge Base</span></Link></li>
            </ul>
          </div>

          {/* Col 3: Support */}
          <div className="flex flex-col gap-2">
            <H5 className="text-gray-900 mb-1">Support</H5>
            <ul className="space-y-1">
              <li><Link to="/support" className="hover:text-brand-500 transition-colors"><span className={linkStyle}>Support & FAQ</span></Link></li>
              <li><Link to="/login?reset=true" className="hover:text-brand-500 transition-colors"><span className={linkStyle}>Reset Password</span></Link></li>
            </ul>
          </div>

          {/* Col 4: Legal */}
          <div className="flex flex-col gap-2">
            <H5 className="text-gray-900 mb-1">Legal</H5>
            <ul className="space-y-1">
              <li><Link to="/imprint" className="hover:text-brand-500 transition-colors"><span className={linkStyle}>Imprint</span></Link></li>
              <li><Link to="/privacy" className="hover:text-brand-500 transition-colors"><span className={linkStyle}>Privacy Policy</span></Link></li>
              <li><Link to="/terms" className="hover:text-brand-500 transition-colors"><span className={linkStyle}>Terms / GTC</span></Link></li>
              <li><Link to="/eula" className="hover:text-brand-500 transition-colors"><span className={linkStyle}>EULA</span></Link></li>
              <li>
                  <button 
                    onClick={openModal} 
                    className="hover:text-brand-500 transition-colors text-left"
                  >
                    <span className={linkStyle}>Cookie Settings</span>
                  </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-5 pt-3 border-t border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
           
           {/* Left: Support Logo - Meta info 12px */}
           <div className="flex flex-col gap-1">
                <Small className="font-bold text-gray-400 uppercase text-xs">With the support of</Small>
                <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/MEDIA-Logo.svg/2560px-MEDIA-Logo.svg.png" 
                    alt="Creative Europe MEDIA" 
                    className="h-6 w-auto object-contain object-left opacity-60 grayscale hover:grayscale-0 transition-all"
                />
           </div>

           {/* Right: Copyright - Meta info 12px */}
           <div className="flex flex-col md:items-end gap-1 w-full md:w-auto">
               <div className="flex justify-between md:justify-end items-center gap-4 w-full">
                   <div className="text-brand-500 md:hidden"><Logo className="h-4 w-auto" /></div>
                   <div className="hidden md:block text-brand-500 opacity-20 hover:opacity-100 transition-opacity"><Logo className="h-4 w-auto" /></div>
               </div>
               <Small className="font-bold text-gray-400 text-xs">
                  &copy; {new Date().getFullYear()} Headstart Media GmbH
               </Small>
           </div>
        </div>
      </div>
    </footer>
  );
};
