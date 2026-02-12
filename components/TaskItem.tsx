import React from 'react';
import { Task } from '../types';
import { Check } from 'lucide-react';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  isOverdue?: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, isOverdue }) => {
  const getDueString = () => {
    if (task.isCompleted) return <span className="text-[#369574] font-medium text-xs">Completed</span>;
    if (isOverdue) return <span className="text-[#C94646] font-medium text-xs">Due {getRelativeTime(task.dueDate)}</span>;
    
    // Normal format
    const timeStr = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).format(task.dueDate);
    return <span className="text-white/40 font-normal text-xs font-mono">Due {timeStr}</span>;
  };

  const getRelativeTime = (date: Date) => {
    const diff = new Date().getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 3600 * 24));
    if (days === 0) return 'today';
    if (days === 1) return '1d ago';
    return `${Math.abs(days)}d ago`;
  };

  // Modern Crypto Theme Colors
  const COMPLETED_COLOR = '#27D17F';
  const OVERDUE_COLOR = '#E95D5D';
  const PENDING_COLOR = '#D48621';

  let borderColor = 'border-[#222222]'; // Default subtle border
  let glowStyle = {};

  if (task.isCompleted) {
    borderColor = 'border-[#27D17F]/30';
  } else if (isOverdue) {
    borderColor = 'border-[#E95D5D]/30';
  }

  return (
    <div 
      className={`relative w-full group transition-all duration-300 cursor-pointer ${task.isCompleted ? 'opacity-60 hover:opacity-100' : ''}`}
      onClick={() => onToggle(task.id)}
    >
      <div 
        className={`
          w-full min-h-[72px] bg-[#131313] rounded-xl border ${borderColor} 
          flex items-center px-5 py-3 shadow-lg 
          group-hover:bg-[#1A1A1A] group-hover:border-white/10 group-hover:translate-x-1 transition-all
        `}
      >
        {/* Checkbox (Custom styled) */}
        <div
          className={`
            w-5 h-5 rounded-md border flex items-center justify-center mr-5 shrink-0 transition-all duration-300
            ${task.isCompleted 
              ? `bg-[${COMPLETED_COLOR}]/20 border-[${COMPLETED_COLOR}]` 
              : `bg-transparent border-white/20 group-hover:border-[${PENDING_COLOR}]`
            }
          `}
        >
          {task.isCompleted && <Check size={12} strokeWidth={3} color={COMPLETED_COLOR} />}
        </div>

        {/* Content */}
        <div className="flex flex-col justify-center flex-1">
          <span className={`font-medium text-sm text-white leading-tight mb-1 transition-colors ${task.isCompleted ? 'text-white/30 line-through' : 'group-hover:text-white'}`}>
            {task.title}
          </span>
          <div className="flex items-center gap-3">
             {/* Category Tag */}
             <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-white/5 ${task.isCompleted ? 'text-white/20 bg-white/5' : 'text-white/40 bg-white/5'}`}>
               {task.category}
             </span>
             {getDueString()}
          </div>
        </div>

        {/* Right side arrow/indicator (decorative) */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white/20">
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </div>
      </div>
    </div>
  );
};