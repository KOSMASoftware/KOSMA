import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShieldCheck, TrendingUp, Server, Bug } from 'lucide-react';

export const AdminTabs = () => {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;
    const baseClass = "flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all";
    const activeClass = "border-brand-500 text-brand-600";
    const inactiveClass = "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300";

    return (
        <div className="flex flex-wrap justify-center border-b border-gray-200 mb-8 bg-white sticky top-0 z-10 pt-2 shadow-sm -mx-8 px-8">
            <Link to="/admin" className={`${baseClass} ${isActive('/admin') ? activeClass : inactiveClass}`}><LayoutDashboard className="w-4 h-4" /> Übersicht</Link>
            <Link to="/admin/users" className={`${baseClass} ${isActive('/admin/users') ? activeClass : inactiveClass}`}><ShieldCheck className="w-4 h-4" /> Nutzer & Lizenzen</Link>
            <Link to="/admin/marketing" className={`${baseClass} ${isActive('/admin/marketing') ? activeClass : inactiveClass}`}><TrendingUp className="w-4 h-4" /> Marketing</Link>
            <div className="h-4 w-px bg-gray-200 mx-2 self-center hidden md:block"></div>
            <Link to="/admin/system" className={`${baseClass} ${isActive('/admin/system') ? activeClass : inactiveClass}`}><Server className="w-4 h-4" /> System Health</Link>
            <Link to="/admin/debug" className={`${baseClass} ${isActive('/admin/debug') ? activeClass : inactiveClass}`}><Bug className="w-4 h-4" /> Stripe Debug</Link>
        </div>
    );
};