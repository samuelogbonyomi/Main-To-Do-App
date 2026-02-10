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
    if (task.isCompleted) return <span className="text-[#369574] font-normal text-xs">Done!</span>;
    if (isOverdue) return <span className="text-[#C94646] font-normal text-xs">Due {getRelativeTime(task.dueDate)}</span>;
    
    // Normal format
    const timeStr = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).format(task.dueDate);
    return <span className="text-white/60 font-normal text-xs">Due {timeStr}</span>;
  };

  const getRelativeTime = (date: Date) => {
    const diff = new Date().getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 3600 * 24));
    if (days === 0) return 'today';
    if (days === 1) return '1 day ago';
    return `${Math.abs(days)} days ago`;
  };

  // Color Constants from Design
  const RED = '#C94646';
  const GREEN = '#369574';
  const YELLOW_ORANGE = '#F5BB6E';
  const ORANGE = '#D48621';
  const DARK_BG = '#1E1E1E';

  // State Logic
  // 1. Indicator Bar (Left Side):
  //    - Overdue: Red
  //    - Completed: Green
  //    - Pending (Normal): Yellow/Orange
  //
  // 2. Checkbox:
  //    - Completed: Green Background, Green Border
  //    - Pending (Any, including Overdue): Dark BG (#1E1E1E), Orange Border (#D48621)

  let indicatorColor = YELLOW_ORANGE; 
  let checkboxBorderColor = ORANGE;
  let checkboxBgColor = DARK_BG;

  if (task.isCompleted) {
    indicatorColor = GREEN;
    checkboxBorderColor = GREEN;
    checkboxBgColor = GREEN;
  } else if (isOverdue) {
    indicatorColor = RED;
    // Overdue tasks still use the standard pending checkbox style
    checkboxBorderColor = ORANGE;
    checkboxBgColor = DARK_BG;
  } else {
    // Normal Pending
    indicatorColor = YELLOW_ORANGE;
    checkboxBorderColor = ORANGE;
    checkboxBgColor = DARK_BG;
  }

  return (
    <div 
      className="relative w-full group transition-transform hover:scale-[1.01] cursor-pointer"
      onClick={() => onToggle(task.id)}
    >
      {/* Status Indicator - Left */}
      <div 
        className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-6 rounded-l-full" 
        style={{ backgroundColor: indicatorColor }}
      ></div>

      {/* Status Indicator - Right */}
      <div 
        className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full" 
        style={{ backgroundColor: indicatorColor }}
      ></div>

      <div 
        className="w-full h-[60px] bg-[#121017] rounded-2xl border border-[#231E2F] flex items-center px-6"
      >
        {/* Checkbox */}
        <div
          className={`
            w-4 h-4 rounded-[6px] border-2 flex items-center justify-center mr-4 shrink-0 transition-all
          `}
          style={{ 
            borderColor: checkboxBorderColor, 
            backgroundColor: checkboxBgColor
          }}
        >
          {task.isCompleted && <Check size={10} strokeWidth={4} color="white" />}
        </div>

        {/* Content */}
        <div className="flex flex-col justify-center">
          <span className={`font-semibold text-sm text-white leading-tight ${task.isCompleted ? 'line-through decoration-white/50 text-white/50' : ''}`}>
            {task.title}
          </span>
          <div className="mt-0.5 leading-none">
            {getDueString()}
          </div>
        </div>
      </div>
    </div>
  );
};