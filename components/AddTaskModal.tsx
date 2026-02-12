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
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity" onClick={onClose}></div>
      
      <div className="bg-[#131313] rounded-3xl border border-[#222222] shadow-2xl w-full max-w-md p-8 relative z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-lg font-bold text-white tracking-wide">New Entry</h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white/40 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Title Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-semibold text-white/40 uppercase tracking-widest ml-1">Task Name</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="System prompt..."
              className="w-full bg-[#0A0A0A] border border-[#222222] rounded-xl px-5 py-4 text-white focus:outline-none focus:border-[#D48621] text-base placeholder:text-white/20 transition-colors"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Date Picker */}
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-white/40 uppercase tracking-widest ml-1">Target Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#222222] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D48621] text-sm [color-scheme:dark]"
                />
                <Calendar size={14} className="absolute right-4 top-4 text-white/30 pointer-events-none" />
              </div>
            </div>

            {/* Category Select */}
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-white/40 uppercase tracking-widest ml-1">Type</label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-[#0A0A0A] border border-[#222222] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D48621] text-sm appearance-none cursor-pointer"
                >
                  <option value="personal">Personal</option>
                  <option value="work">Work</option>
                  <option value="others">Others</option>
                </select>
                <Tag size={14} className="absolute right-4 top-4 text-white/30 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Urgent Toggle */}
          <div 
            onClick={() => setUrgent(!urgent)}
            className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${urgent ? 'bg-[#C94646]/10 border-[#C94646]/50 text-[#C94646]' : 'bg-[#0A0A0A] border-[#222222] text-white/40 hover:border-white/20'}`}
          >
            <Bell size={16} className={urgent ? 'fill-current' : ''} />
            <span className="text-sm font-medium">High Priority</span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="w-full bg-gradient-to-r from-[#D48621] to-[#B06D15] text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-[#D48621]/20 hover:scale-[1.01] transition-all disabled:opacity-50 disabled:hover:scale-100 mt-4 text-sm tracking-wide"
          >
            Initialize Task
          </button>
        </div>
      </div>
    </div>
  );
};