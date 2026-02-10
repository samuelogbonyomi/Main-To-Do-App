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
      
      <div className="bg-[#121017] rounded-3xl border border-[#231E2F] shadow-2xl w-full max-w-md p-6 relative z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Manual Entry</h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#231E2F] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5">
          {/* Title Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Task Name</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full bg-[#1E1E1E] border border-[#322B42] rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-[#D48621] text-lg placeholder:text-gray-600 transition-colors"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Date Picker */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Due Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#1E1E1E] border border-[#322B42] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D48621] text-sm [color-scheme:dark]"
                />
                <Calendar size={16} className="absolute right-3 top-3.5 text-gray-500 pointer-events-none" />
              </div>
            </div>

            {/* Category Select */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Category</label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-[#1E1E1E] border border-[#322B42] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D48621] text-sm appearance-none cursor-pointer"
                >
                  <option value="personal">Personal</option>
                  <option value="work">Work</option>
                  <option value="others">Others</option>
                </select>
                <Tag size={16} className="absolute right-3 top-3.5 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Urgent Toggle */}
          <div 
            onClick={() => setUrgent(!urgent)}
            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${urgent ? 'bg-[#C94646]/20 border-[#C94646] text-[#C94646]' : 'bg-[#1E1E1E] border-[#322B42] text-gray-400 hover:bg-[#231E2F]'}`}
          >
            <Bell size={18} className={urgent ? 'fill-current' : ''} />
            <span className="text-sm font-medium">Mark as Urgent</span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="w-full bg-[#D48621] text-white py-4 rounded-xl font-bold shadow-lg hover:bg-[#b5701a] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 mt-2"
          >
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
};