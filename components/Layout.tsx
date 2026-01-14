
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { LogOut, LayoutDashboard, Settings, CreditCard, ShieldCheck, LineChart, Server, Menu, X, Zap, TrendingUp, Bug, HelpCircle } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const NavItem = ({ to, icon: Icon, label, active, onClick }: { to: string; icon: any; label: string; active: boolean; onClick?: () => void }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all ${
      active 
        ? 'bg-brand-50 text-brand-700 shadow-sm' 
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`}
  >
    <Icon className={`w-5 h-5 ${active ? 'text-brand-600' : 'text-gray-400'}`} />
    {label}
  </Link>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  if (!user) return <>{children}</>;

  const isCustomer = user.role === UserRole.CUSTOMER;
  const isAdmin = user.role === UserRole.ADMIN;

  const SidebarContent = (onClick?: () => void) => (
    <>
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 font-black text-2xl text-brand-500 tracking-tighter">
            <span>KOSMA</span>
          </div>
          <div className="mt-2 text-[10px] font-black text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full inline-block tracking-[0.2em]">
            {isAdmin ? 'ADMIN AREA' : 'CUSTOMER AREA'}
          </div>
        </div>
        <button className="md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <X className="w-6 h-6 text-gray-400" />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {isCustomer && (
          <>
            <NavItem to="/dashboard" icon={LayoutDashboard} label="Overview" active={location.pathname === '/dashboard'} onClick={onClick} />
            <NavItem to="/dashboard/subscription" icon={CreditCard} label="Subscription" active={location.pathname === '/dashboard/subscription'} onClick={onClick} />
            <div className="pt-4 mt-4 border-t border-gray-100">
               <NavItem 
                  to="/dashboard/settings" 
                  icon={Settings} 
                  label="Settings" 
                  active={location.pathname.includes('settings')} 
                  onClick={onClick}
               />
               <NavItem 
                  to="/help" 
                  icon={HelpCircle} 
                  label="Help Center" 
                  active={location.pathname === '/help'} 
                  onClick={onClick}
               />
            </div>
          </>
        )}

        {isAdmin && (
          <>
            <NavItem to="/admin" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/admin'} onClick={onClick} />
            <NavItem to="/admin/users" icon={ShieldCheck} label="Users & Licenses" active={location.pathname === '/admin/users'} onClick={onClick} />
            <NavItem to="/admin/marketing" icon={TrendingUp} label="Marketing" active={location.pathname === '/admin/marketing'} onClick={onClick} />
            <div className="pt-4 pb-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 mb-2">Technical</p>
                <NavItem to="/admin/system" icon={Server} label="System Health" active={location.pathname === '/admin/system'} onClick={onClick} />
                <NavItem to="/admin/debug" icon={Bug} label="Stripe Debug" active={location.pathname === '/admin/debug'} onClick={onClick} />
            </div>
            <div className="pt-4 mt-4 border-t border-gray-100">
                <NavItem 
                  to="/help" 
                  icon={HelpCircle} 
                  label="Help & Docs" 
                  active={location.pathname === '/help'} 
                  onClick={onClick}
               />
            </div>
          </>
        )}
      </nav>

      <div className="p-4 border-t border-gray-200 bg-gray-50/50">
        <div className="flex items-center gap-3 mb-4 p-2 rounded-xl bg-white shadow-sm border border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white font-black text-lg">
            {user.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-gray-900 truncate leading-tight">{user.name}</p>
            <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      <header className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center sticky top-0 z-30">
        <div className="text-xl font-black text-brand-500 tracking-tighter">KOSMA</div>
        <button onClick={() => setIsMobileMenuOpen(true)}>
          <Menu className="w-6 h-6 text-gray-600" />
        </button>
      </header>

      <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col sticky top-0 h-screen">
        {SidebarContent()}
      </aside>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-4/5 max-w-sm bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            {SidebarContent(() => setIsMobileMenuOpen(false))}
          </aside>
        </div>
      )}

      <main className="flex-1 w-full relative overflow-y-auto">
        <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
};