import React from 'react';
import SidebarIcon from './icons/SidebarIcon';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  return (
    <header className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm p-4 border-b border-gray-200 dark:border-slate-700 shadow-sm flex items-center justify-between z-10 flex-shrink-0 transition-colors duration-300">
      <div className="flex-1"></div>
      <h1 className="text-xl font-bold text-center text-teal-600 dark:text-teal-300">حمزة سوبر بلس</h1>
      <div className="flex-1 flex justify-end">
        <button onClick={onToggleSidebar} className="p-2 text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors" aria-label="Toggle sidebar">
            <SidebarIcon className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};

export default Header;