
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, CreditCard, Settings, GraduationCap } from 'lucide-react';

export const DashboardTabs: React.FC = () => {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="flex flex-wrap justify-center border-b border-gray-200 mb-8 bg-white/50 backdrop-blur-md sticky top-0 z-10 -mx-4 md:mx-0 px-4">
             <Link 
                to="/dashboard" 
                className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all ${
                    isActive('/dashboard')
                    ? 'border-brand-500 text-brand-600 translate-y-[1px]' 
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                }`}
            >
                <LayoutDashboard className="w-4 h-4" /> Overview
            </Link>
            <Link 
                to="/dashboard/subscription" 
                className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all ${
                    isActive('/dashboard/subscription') 
                    ? 'border-brand-500 text-brand-600 translate-y-[1px]' 
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                }`}
            >
                <CreditCard className="w-4 h-4" /> Subscription
            </Link>
            <Link 
                to="/dashboard/learning" 
                className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all ${
                    isActive('/dashboard/learning') 
                    ? 'border-brand-500 text-brand-600 translate-y-[1px]' 
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                }`}
            >
                <GraduationCap className="w-4 h-4" /> Learning & Rewards
            </Link>
            <Link 
                to="/dashboard/settings" 
                className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all ${
                    isActive('/dashboard/settings') 
                    ? 'border-brand-500 text-brand-600 translate-y-[1px]' 
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                }`}
            >
                <Settings className="w-4 h-4" /> Settings
            </Link>
        </div>
    );
};
