import React, { useState } from 'react';
import { Task, FilterType } from '../types';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onAddTask: () => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, onToggle, onAddTask }) => {
  const [activeTab, setActiveTab] = useState<FilterType>('Today');

  const isDateToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const isOverdue = (date: Date) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    return date < today && !isDateToday(date);
  };

  const relevantTasks = tasks.filter(task => {
    if (activeTab === 'Today') {
      return isDateToday(task.dueDate) || (isOverdue(task.dueDate) && !task.isCompleted);
    } else {
      const today = new Date();
      today.setHours(23,59,59,999);
      return task.dueDate > today;
    }
  });

  const overdueTasks = relevantTasks.filter(t => isOverdue(t.dueDate) && !t.isCompleted);
  const todoTasks = relevantTasks.filter(t => !isOverdue(t.dueDate) && !t.isCompleted);
  const completedTasks = relevantTasks.filter(t => t.isCompleted);
  
  const todayCount = tasks.filter(t => isDateToday(t.dueDate) || (isOverdue(t.dueDate) && !t.isCompleted)).length;
  const laterCount = tasks.filter(t => {
      const today = new Date();
      today.setHours(23,59,59,999);
      return t.dueDate > today;
  }).length;

  return (
    <div className="flex-1 w-full">
      
      {/* Tabs Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-medium text-white tracking-wide">Your Tasks</h2>
        
        <div className="flex items-center p-1 bg-[#131313] border border-[#222222] rounded-xl">
          {/* Today Tab */}
          <button
            onClick={() => setActiveTab('Today')}
            className={`
              px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-all
              ${activeTab === 'Today' 
                ? 'bg-[#222222] text-white shadow-sm' 
                : 'bg-transparent text-white/40 hover:text-white/60'
              }
            `}
          >
            Today
            <span className={`px-1.5 py-0.5 rounded text-[10px] ${activeTab === 'Today' ? 'bg-[#D48621]/20 text-[#D48621]' : 'bg-white/10 text-white/40'}`}>
              {todayCount}
            </span>
          </button>

          {/* Later Tab */}
          <button
            onClick={() => setActiveTab('Later')}
            className={`
              px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-all
              ${activeTab === 'Later' 
                ? 'bg-[#222222] text-white shadow-sm' 
                : 'bg-transparent text-white/40 hover:text-white/60'
              }
            `}
          >
            Later
            <span className={`px-1.5 py-0.5 rounded text-[10px] ${activeTab === 'Later' ? 'bg-[#8A2BE2]/20 text-[#8A2BE2]' : 'bg-white/10 text-white/40'}`}>
              {laterCount}
            </span>
          </button>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-8">
        
        {/* Overdue Section */}
        {overdueTasks.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 relative">
            <h3 className="text-[10px] font-semibold text-[#E95D5D] tracking-widest mb-4 uppercase ml-1 flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-[#E95D5D] animate-pulse"></span>
               Action Required
            </h3>
            <div className="flex flex-col gap-3">
              {overdueTasks.map(task => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  onToggle={onToggle}
                  isOverdue={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* To Do Section */}
        {(todoTasks.length > 0 || completedTasks.length > 0) && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
            {overdueTasks.length > 0 && (
               <h3 className="text-[10px] font-semibold text-white/40 tracking-widest mb-4 uppercase ml-1">In Progress</h3>
            )}
            <div className="flex flex-col gap-3">
              {todoTasks.map(task => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  onToggle={onToggle}
                  isOverdue={false}
                />
              ))}
               {completedTasks.map(task => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  onToggle={onToggle}
                  isOverdue={false}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {relevantTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 opacity-30">
             <div className="w-20 h-20 rounded-full border border-dashed border-white/20 flex items-center justify-center mb-4">
                <span className="text-3xl grayscale">✨</span>
             </div>
             <p className="text-white font-medium text-sm">All caught up</p>
             <p className="text-xs text-white/40 mt-1">System status: Idle</p>
          </div>
        )}
      </div>

    </div>
  );
};