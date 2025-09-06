import React from 'react';
import SidebarIcon from './icons/SidebarIcon';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  return (
    <header className="bg-[var(--panel-dark)] backdrop-blur-sm p-2 sm:p-4 border-b border-[var(--border-color)] flex items-center justify-between z-10 flex-shrink-0">
      <div className="flex-1"></div>
      <h1 className="text-xl sm:text-2xl font-bold text-center text-[var(--neon-cyan)] [text-shadow:var(--glow-cyan)]">MZ</h1>
      <div className="flex-1 flex justify-end">
        <button onClick={onToggleSidebar} className="p-2 text-slate-300 hover:text-[var(--neon-cyan)] transition-colors" aria-label="تبديل الشريط الجانبي">
            <SidebarIcon className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};

export default Header;