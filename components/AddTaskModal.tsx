import React, { useState, useEffect } from 'react';
import { X, Calendar, Tag, Bell } from 'lucide-react';
import { Task } from '../types';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (task: Omit<Task, 'id' | 'isCompleted'>) => void;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<'work' | 'personal' | 'others'>('personal');
  const [urgent, setUrgent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDate(new Date().toISOString().split('T')[0]);
      setCategory('personal');
      setUrgent(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd({
      title,
      dueDate: new Date(date), 
      category,
      hasReminder: urgent
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      <div className="bg-[#09090b] rounded-xl border border-zinc-800 shadow-2xl w-full max-w-md p-6 relative z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-mono font-medium text-zinc-300 uppercase tracking-wider">New Entry</h3>
          <button 
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5">
          {/* Title Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-medium text-zinc-500 uppercase tracking-wider">Task Name</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ENTER TASK DESCRIPTION..."
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-200 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 text-xs placeholder:text-zinc-600 transition-all font-mono uppercase tracking-wide"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Date Picker */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-medium text-zinc-500 uppercase tracking-wider">Target Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2.5 text-zinc-300 focus:outline-none focus:border-amber-500/50 text-xs font-mono uppercase tracking-wide [color-scheme:dark]"
                />
              </div>
            </div>

            {/* Category Select */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-medium text-zinc-500 uppercase tracking-wider">Type</label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2.5 text-zinc-300 focus:outline-none focus:border-amber-500/50 text-xs font-mono uppercase tracking-wide appearance-none cursor-pointer"
                >
                  <option value="personal">PERSONAL</option>
                  <option value="work">WORK</option>
                  <option value="others">OTHERS</option>
                </select>
                <div className="absolute right-3 top-2.5 text-zinc-600 pointer-events-none">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>
            </div>
          </div>

          {/* Urgent Toggle */}
          <div 
            onClick={() => setUrgent(!urgent)}
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${urgent ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-zinc-900/30 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
          >
            <Bell size={14} className={urgent ? 'fill-current' : ''} />
            <span className="text-xs font-mono uppercase tracking-wide">High Priority</span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="w-full bg-zinc-100 hover:bg-white text-zinc-900 py-3 rounded-lg font-mono font-medium shadow-lg hover:shadow-zinc-100/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2 text-xs uppercase tracking-wide"
          >
            Confirm Entry
          </button>
        </div>
      </div>
    </div>
  );
};
