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
    if (task.isCompleted) return <span className="text-emerald-500/80 font-mono text-[10px] uppercase tracking-wider">Done</span>;
    if (isOverdue) {
        const diff = new Date().getTime() - task.dueDate.getTime();
        const days = Math.floor(diff / (1000 * 3600 * 24));
        const dayStr = days === 0 ? 'Today' : `${days}d ago`;
        return <span className="text-red-400 font-mono text-[10px] uppercase tracking-wider">Due {dayStr}</span>;
    }
    
    // Normal format
    const timeStr = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', hour12: false }).format(task.dueDate);
    return <span className="text-zinc-500 font-mono text-[10px] uppercase tracking-wider">{timeStr}</span>;
  };

  return (
    <div 
      className={`
        group relative w-full flex items-center px-4 py-3 
        cursor-pointer transition-colors duration-200
        hover:bg-zinc-900/50
        ${task.isCompleted ? 'opacity-50' : 'opacity-100'}
      `}
      onClick={() => onToggle(task.id)}
    >
      {/* Selection Indicator (Left Border) */}
      <div className={`absolute left-0 top-0 bottom-0 w-[2px] transition-colors ${task.isCompleted ? 'bg-emerald-500/50' : 'bg-transparent group-hover:bg-amber-500/50'}`}></div>

      {/* Checkbox */}
      <div 
        className={`
          w-4 h-4 rounded-[3px] border flex items-center justify-center mr-4 shrink-0 transition-all duration-200
          ${task.isCompleted 
            ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500' 
            : 'bg-transparent border-zinc-700 group-hover:border-zinc-500'
          }
        `}
      >
        {task.isCompleted && <Check size={10} strokeWidth={3} />}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center justify-between">
            <span className={`text-xs font-mono font-medium truncate pr-4 transition-colors uppercase tracking-wide ${task.isCompleted ? 'text-zinc-500 line-through decoration-zinc-700' : 'text-zinc-200 group-hover:text-white'}`}>
                {task.title}
            </span>
        </div>
        
        <div className="flex items-center gap-3 mt-1">
             {/* Category Tag */}
             <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-600 bg-zinc-900/50 px-1.5 rounded border border-zinc-800/50">
               {task.category}
             </span>
             {getDueString()}
        </div>
      </div>

      {/* Right side arrow/indicator (decorative) */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-600 pl-2">
         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </div>

    </div>
  );
};
