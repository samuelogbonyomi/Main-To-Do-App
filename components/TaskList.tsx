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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-mono font-medium text-zinc-400 uppercase tracking-wider">Task Queue</h2>
        
        <div className="flex items-center p-1 bg-zinc-900/50 border border-zinc-800 rounded-lg">
          {/* Today Tab */}
          <button
            onClick={() => setActiveTab('Today')}
            className={`
              px-3 py-1.5 rounded text-xs font-medium flex items-center gap-2 transition-all font-mono uppercase tracking-wide
              ${activeTab === 'Today' 
                ? 'bg-zinc-800 text-zinc-100 shadow-sm' 
                : 'bg-transparent text-zinc-500 hover:text-zinc-300'
              }
            `}
          >
            TODAY
            <span className={`px-1.5 py-0.5 rounded-[4px] text-[10px] font-mono ${activeTab === 'Today' ? 'bg-amber-500/20 text-amber-500' : 'bg-zinc-800 text-zinc-500'}`}>
              {todayCount}
            </span>
          </button>

          {/* Later Tab */}
          <button
            onClick={() => setActiveTab('Later')}
            className={`
              px-3 py-1.5 rounded text-xs font-medium flex items-center gap-2 transition-all font-mono uppercase tracking-wide
              ${activeTab === 'Later' 
                ? 'bg-zinc-800 text-zinc-100 shadow-sm' 
                : 'bg-transparent text-zinc-500 hover:text-zinc-300'
              }
            `}
          >
            LATER
            <span className={`px-1.5 py-0.5 rounded-[4px] text-[10px] font-mono ${activeTab === 'Later' ? 'bg-purple-500/20 text-purple-400' : 'bg-zinc-800 text-zinc-500'}`}>
              {laterCount}
            </span>
          </button>
        </div>
      </div>

      {/* Main List Container */}
      <div className="border border-zinc-800 rounded-lg bg-[#09090b] overflow-hidden divide-y divide-zinc-800/50">
        
        {/* Overdue Section */}
        {overdueTasks.length > 0 && (
          <div className="bg-red-500/5 border-b border-red-500/10">
            <div className="px-4 py-2 flex items-center gap-2 border-b border-red-500/10">
               <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
               <h3 className="text-[10px] font-mono font-semibold text-red-400 tracking-widest uppercase">Critical / Overdue</h3>
            </div>
            <div className="divide-y divide-red-500/10">
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
        {(todoTasks.length > 0 || completedTasks.length > 0) ? (
          <div className="divide-y divide-zinc-800/50">
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
        ) : (
             relevantTasks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 opacity-50">
                 <div className="w-12 h-12 rounded-lg border border-dashed border-zinc-700 flex items-center justify-center mb-3 bg-zinc-900/50">
                    <span className="text-xl grayscale opacity-50">✨</span>
                 </div>
                 <p className="text-zinc-400 font-mono text-xs uppercase tracking-wider">No Active Tasks</p>
                 <p className="text-[10px] text-zinc-600 mt-1 font-mono">System Idle</p>
              </div>
            )
        )}

      </div>

    </div>
  );
};
