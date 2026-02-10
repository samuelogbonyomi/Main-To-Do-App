import React from 'react';
import { Plus } from 'lucide-react';

interface SidebarProps {
  onAddTaskClick: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onAddTaskClick }) => {
  const today = new Date();
  const day = today.getDate();
  const month = today.toLocaleString('default', { month: 'short' }).toUpperCase();
  const weekday = today.toLocaleString('default', { weekday: 'long' });

  return (
    <div className="w-full md:w-[380px] relative flex flex-col justify-between p-8 md:p-12 text-white overflow-hidden shrink-0 group">
      {/* Background Image */}
      <img 
        src="https://images.unsplash.com/photo-1490730141103-6cac27aaab94?q=80&w=2940&auto=format&fit=crop" 
        alt="Zen Background" 
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] ease-in-out group-hover:scale-110"
      />
      
      {/* Overlays */}
      <div className="absolute inset-0 bg-slate-900/30 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-40"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60"></div>

      {/* Top Content: Date */}
      <div className="relative z-10 mt-2">
        <h2 className="text-xl font-medium tracking-wide opacity-90 mb-1">{weekday}</h2>
        <div className="flex items-start gap-3">
          <h1 className="text-8xl font-light tracking-tighter leading-none">{day}</h1>
          <span className="text-2xl font-light tracking-widest opacity-80 mt-2 border-t border-white/30 pt-1">{month}</span>
        </div>
      </div>
      
      {/* Bottom Content: FAB and Quote */}
      <div className="relative z-10 flex flex-col items-start gap-8">
        <div>
           <p className="text-sm font-semibold opacity-70 mb-2 uppercase tracking-widest">Daily Focus</p>
           <p className="text-xl font-light leading-snug text-white/90 italic">
             "Simplicity is the ultimate sophistication."
           </p>
        </div>

        <button
          onClick={onAddTaskClick}
          className="group/btn flex items-center gap-3 bg-white text-slate-900 pr-6 pl-2 py-2 rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
          aria-label="Add Task"
        >
          <div className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center group-hover/btn:rotate-90 transition-transform duration-300">
             <Plus size={20} strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-sm tracking-wide">Add New Task</span>
        </button>
      </div>
    </div>
  );
};