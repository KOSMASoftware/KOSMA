
import React from 'react';
import { Menu } from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
  onMobileMenuClick: () => void;
  sidebar: React.ReactNode;
  mobileMenu?: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children, onMobileMenuClick, sidebar, mobileMenu }) => {
  return (
    <div className="min-h-screen bg-transparent flex flex-col md:flex-row font-sans text-gray-900">
      {/* MOBILE HEADER */}
      <header className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center sticky top-0 z-30 h-[72px]">
        <div className="text-xl font-black text-brand-500 tracking-tighter">KOSMA</div>
        <button onClick={onMobileMenuClick} className="p-2 -mr-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col sticky top-0 h-screen z-20">
        {sidebar}
      </aside>

      {/* MOBILE MENU OVERLAY */}
      {mobileMenu}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 w-full relative overflow-y-auto h-[calc(100vh-72px)] md:h-screen">
        <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
};
