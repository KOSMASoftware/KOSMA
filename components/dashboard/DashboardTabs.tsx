
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, CreditCard, Settings, GraduationCap } from 'lucide-react';
import { Label } from '../ui/Typography';

export const DashboardTabs: React.FC = () => {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;

    // Base classes for the link container (layout only)
    const linkBase = "flex items-center gap-2 px-6 py-4 border-b-2 transition-all group";
    
    // Active/Inactive styles for the container
    const linkActive = "border-brand-500 translate-y-[1px]";
    const linkInactive = "border-transparent hover:border-gray-300";

    // Text styling helpers
    const textActive = "text-brand-600";
    const textInactive = "text-gray-500 group-hover:text-gray-900";

    return (
        <div className="flex flex-wrap justify-center border-b border-gray-200 mb-8 bg-white/50 backdrop-blur-md sticky top-0 z-10 -mx-4 md:mx-0 px-4">
             <Link 
                to="/dashboard" 
                className={`${linkBase} ${isActive('/dashboard') ? linkActive : linkInactive}`}
            >
                <LayoutDashboard className={`w-4 h-4 ${isActive('/dashboard') ? textActive : textInactive}`} /> 
                <Label className={`cursor-pointer ${isActive('/dashboard') ? textActive : textInactive}`}>Overview</Label>
            </Link>
            <Link 
                to="/dashboard/subscription" 
                className={`${linkBase} ${isActive('/dashboard/subscription') ? linkActive : linkInactive}`}
            >
                <CreditCard className={`w-4 h-4 ${isActive('/dashboard/subscription') ? textActive : textInactive}`} /> 
                <Label className={`cursor-pointer ${isActive('/dashboard/subscription') ? textActive : textInactive}`}>Subscription</Label>
            </Link>
            <Link 
                to="/dashboard/learning" 
                className={`${linkBase} ${isActive('/dashboard/learning') ? linkActive : linkInactive}`}
            >
                <GraduationCap className={`w-4 h-4 ${isActive('/dashboard/learning') ? textActive : textInactive}`} /> 
                <Label className={`cursor-pointer ${isActive('/dashboard/learning') ? textActive : textInactive}`}>Learning & Rewards</Label>
            </Link>
            <Link 
                to="/dashboard/settings" 
                className={`${linkBase} ${isActive('/dashboard/settings') ? linkActive : linkInactive}`}
            >
                <Settings className={`w-4 h-4 ${isActive('/dashboard/settings') ? textActive : textInactive}`} /> 
                <Label className={`cursor-pointer ${isActive('/dashboard/settings') ? textActive : textInactive}`}>Settings</Label>
            </Link>
        </div>
    );
};
