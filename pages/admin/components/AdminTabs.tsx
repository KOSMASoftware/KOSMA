
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShieldCheck, TrendingUp, Server, Bug } from 'lucide-react';
import { Label } from '../../../components/ui/Typography';

export const AdminTabs = () => {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;
    const baseClass = "flex items-center gap-2 px-6 py-4 border-b-2 transition-all group";
    const activeClass = "border-brand-500";
    const inactiveClass = "border-transparent hover:border-gray-300";

    const TabItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
        const active = isActive(to);
        return (
            <Link to={to} className={`${baseClass} ${active ? activeClass : inactiveClass}`}>
                <Icon className={`w-4 h-4 ${active ? 'text-brand-600' : 'text-gray-400 group-hover:text-gray-900'}`} />
                <Label className={`${active ? 'text-brand-600' : 'text-gray-500 group-hover:text-gray-900'} text-sm cursor-pointer`}>
                    {label}
                </Label>
            </Link>
        );
    };

    return (
        <div className="flex flex-wrap justify-center border-b border-gray-200 mb-8 bg-white sticky top-0 z-10 pt-2 shadow-sm -mx-8 px-8">
            <TabItem to="/admin" icon={LayoutDashboard} label="Übersicht" />
            <TabItem to="/admin/users" icon={ShieldCheck} label="Nutzer & Lizenzen" />
            <TabItem to="/admin/marketing" icon={TrendingUp} label="Marketing" />
            <div className="h-4 w-px bg-gray-200 mx-2 self-center hidden md:block"></div>
            <TabItem to="/admin/system" icon={Server} label="System Health" />
            <TabItem to="/admin/debug" icon={Bug} label="Stripe Debug" />
        </div>
    );
};
