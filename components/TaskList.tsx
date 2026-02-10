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
      <div className="flex items-center gap-5 mb-8">
        <h2 className="text-2xl font-semibold text-white">My Tasks</h2>
        
        <div className="flex items-center gap-4">
          {/* Today Tab */}
          <button
            onClick={() => setActiveTab('Today')}
            className={`
              pl-3 pr-2 py-2 rounded-xl text-sm font-semibold flex items-center gap-3 transition-all
              ${activeTab === 'Today' 
                ? 'bg-[#231E2F] text-white' 
                : 'bg-transparent text-white/50 hover:bg-[#231E2F]/50'
              }
            `}
          >
            Today
            <span className={`
               w-[22px] h-[20px] rounded-md text-xs font-semibold flex items-center justify-center
               ${activeTab === 'Today' ? 'bg-[#369574] text-white' : 'bg-[#322B42] text-white/60'}
            `}>
              {todayCount}
            </span>
          </button>

          {/* Later Tab */}
          <button
            onClick={() => setActiveTab('Later')}
            className={`
              pl-3 pr-2 py-2 rounded-xl text-sm font-semibold flex items-center gap-3 transition-all border border-transparent
              ${activeTab === 'Later' 
                 ? 'bg-[#231E2F] text-white border-[#322B42]' 
                : 'bg-transparent border-[#322B42] text-white hover:bg-[#231E2F]/50'
              }
            `}
          >
            Later
            <div className="relative w-[23px] h-[20px] bg-[#D48621] rounded-md flex items-center justify-center">
               <span className="text-[#FFF4D9] text-xs font-semibold">{laterCount}</span>
            </div>
          </button>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-8">
        
        {/* Overdue Section */}
        {overdueTasks.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 relative">
            <h3 className="text-xs font-medium text-white/60 tracking-[0.08em] mb-4 uppercase ml-1">Overdue Tasks</h3>
            <div className="flex flex-col gap-4">
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
            <h3 className="text-xs font-medium text-white/60 tracking-[0.08em] mb-4 uppercase ml-1">To Do</h3>
            <div className="flex flex-col gap-4">
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
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
             <div className="w-16 h-16 bg-[#231E2F] rounded-full flex items-center justify-center mb-4 border border-[#322B42]">
                <span className="text-2xl">🌱</span>
             </div>
             <p className="text-white font-bold">No tasks due.</p>
             <p className="text-sm text-gray-400">Enjoy your free time!</p>
          </div>
        )}
      </div>

    </div>
  );
};