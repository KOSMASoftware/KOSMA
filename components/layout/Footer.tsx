
import React from 'react';
import { Link } from 'react-router-dom';
import { useCookieSettings } from '../../context/CookieContext';
import { Logo } from '../ui/Logo';
import { Small } from '../ui/Typography';

export const Footer: React.FC = () => {
  const { openModal } = useCookieSettings();

  return (
    <footer className="relative z-0 bg-white/80 backdrop-blur-md border-t border-gray-200 mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Col 1: Product */}
          <div className="flex flex-col gap-1.5">
            <Small as="div" className="uppercase tracking-widest text-gray-400 mb-1">Product</Small>
            <ul className="space-y-0.5">
              <li><Link to="/#budgeting"><Small className="hover:text-brand-500 transition-colors">Budgeting</Small></Link></li>
              <li><Link to="/#financing"><Small className="hover:text-brand-500 transition-colors">Financing</Small></Link></li>
              <li><Link to="/#cashflow"><Small className="hover:text-brand-500 transition-colors">Cash Flow</Small></Link></li>
              <li><Link to="/#cost-control"><Small className="hover:text-brand-500 transition-colors">Cost Control</Small></Link></li>
            </ul>
          </div>

          {/* Col 2: Resources */}
          <div className="flex flex-col gap-1.5">
            <Small as="div" className="uppercase tracking-widest text-gray-400 mb-1">Resources</Small>
            <ul className="space-y-0.5">
              <li><Link to="/learning"><Small className="hover:text-brand-500 transition-colors">Learning Campus</Small></Link></li>
              <li><Link to="/help"><Small className="hover:text-brand-500 transition-colors">Knowledge Base</Small></Link></li>
            </ul>
          </div>

          {/* Col 3: Support */}
          <div className="flex flex-col gap-1.5">
            <Small as="div" className="uppercase tracking-widest text-gray-400 mb-1">Support</Small>
            <ul className="space-y-0.5">
              <li><Link to="/support"><Small className="hover:text-brand-500 transition-colors">Support & FAQ</Small></Link></li>
              <li><Link to="/login?reset=true"><Small className="hover:text-brand-500 transition-colors">Reset Password</Small></Link></li>
            </ul>
          </div>

          {/* Col 4: Legal */}
          <div className="flex flex-col gap-1.5">
            <Small as="div" className="uppercase tracking-widest text-gray-400 mb-1">Legal</Small>
            <ul className="space-y-0.5">
              <li><Link to="/imprint"><Small className="hover:text-brand-500 transition-colors">Imprint</Small></Link></li>
              <li><Link to="/privacy"><Small className="hover:text-brand-500 transition-colors">Privacy Policy</Small></Link></li>
              <li><Link to="/terms"><Small className="hover:text-brand-500 transition-colors">Terms / GTC</Small></Link></li>
              <li><Link to="/eula"><Small className="hover:text-brand-500 transition-colors">EULA</Small></Link></li>
              <li>
                  <button 
                    onClick={openModal} 
                    className="text-left"
                  >
                    <Small className="hover:text-brand-500 transition-colors">Cookie Settings</Small>
                  </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-4 pt-2 border-t border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
           
           {/* Left: Support Logo */}
           <div className="flex flex-col gap-1">
                <Small className="uppercase tracking-widest text-gray-400 text-[10px]">With the support of</Small>
                <img 
                    src="https://zpnbnjvhklgxfhsoczbp.supabase.co/storage/v1/object/public/public-assets/branding/media-logo.svg" 
                    alt="Creative Europe MEDIA" 
                    className="h-6 w-auto object-contain object-left opacity-60 grayscale hover:grayscale-0 transition-all"
                />
           </div>

           {/* Right: Copyright */}
           <div className="flex flex-col md:items-end gap-1 w-full md:w-auto">
               <div className="flex justify-between md:justify-end items-center gap-4 w-full">
                   <div className="text-brand-500 md:hidden"><Logo className="h-4 w-auto" /></div>
                   <div className="hidden md:block text-brand-500 opacity-20 hover:opacity-100 transition-opacity"><Logo className="h-4 w-auto" /></div>
               </div>
               <Small className="text-gray-400 text-[10px]">
                  &copy; {new Date().getFullYear()} Headstart Media GmbH
               </Small>
           </div>
        </div>
      </div>
    </footer>
  );
};
