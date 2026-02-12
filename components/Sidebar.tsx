
import React from 'react';
import { LayoutDashboard, Users, Swords, GitBranch, Calculator, Zap, Moon, Sun } from 'lucide-react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, darkMode, toggleDarkMode }) => {
  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'profiles', label: 'Entities', icon: Users },
    { id: 'versus', label: 'Versus', icon: Swords },
    { id: 'hierarchy', label: 'Hierarchy', icon: GitBranch },
    { id: 'calculator', label: 'Omni Calcs', icon: Calculator },
  ];

  return (
    <div className={`w-64 sm:w-72 h-full flex flex-col border-r transition-all duration-500 ${darkMode ? 'bg-black border-zinc-800' : 'bg-white border-zinc-200 shadow-2xl'}`}>
      <div className="p-10 flex items-center gap-4">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all shadow-xl ${darkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>
          <Zap size={24} />
        </div>
        <h1 className={`text-2xl font-black tracking-tighter ${darkMode ? 'text-white' : 'text-black'}`}>OMNISCALE</h1>
      </div>

      <nav className="flex-1 px-6 py-4 space-y-3">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id as AppView)}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all active:scale-95 ${
              currentView === item.id
                ? (darkMode ? 'bg-white text-black shadow-2xl' : 'bg-black text-white shadow-xl')
                : (darkMode ? 'text-zinc-500 hover:text-white hover:bg-zinc-900' : 'text-zinc-500 hover:text-black hover:bg-zinc-100')
            }`}
          >
            <item.icon size={20} className={currentView === item.id ? '' : 'opacity-40'} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className={`p-8 border-t ${darkMode ? 'border-zinc-800' : 'border-zinc-100'}`}>
        <button
          onClick={toggleDarkMode}
          className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all active:scale-95 shadow-lg border ${darkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:text-black'}`}
        >
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">{darkMode ? 'Amoled Mode' : 'Light Matrix'}</span>
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
