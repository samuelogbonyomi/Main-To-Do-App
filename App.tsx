import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { TaskList } from './components/TaskList';
import { AddTaskModal } from './components/AddTaskModal';
import { VoiceModeModal } from './components/VoiceModeModal';
import { Task } from './types';
import { Plus, Mic, PenLine } from 'lucide-react';

// Mock initial data
const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    title: 'File 2025 franchise tax',
    isCompleted: false,
    dueDate: new Date(new Date().setDate(new Date().getDate() - 3)), // 3 days ago
    category: 'work',
    hasReminder: true
  },
  {
    id: '2',
    title: 'Send SAFE agreement',
    isCompleted: false,
    dueDate: new Date(new Date().setDate(new Date().getDate() - 3)), // 3 days ago
    category: 'work',
    hasReminder: false
  },
  {
    id: '3',
    title: 'Follow-up on Jackson (Send email)',
    isCompleted: false,
    dueDate: new Date(new Date().setHours(12, 30, 0, 0)), // Today 12:30
    category: 'work',
    hasReminder: false
  },
  {
    id: '4',
    title: 'Walk the dogs',
    isCompleted: true, // Completed task
    dueDate: new Date(),
    category: 'personal',
    hasReminder: false
  }
];

// ----------------------------------------------------------------------
// CUSTOM SOUND CONFIGURATION
// ----------------------------------------------------------------------
const CUSTOM_SOUND_URL = "./sound/success.mp3";

// Sound utility using Web Audio API (Fallback only)
const playFallbackSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); 
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1); 
    
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    console.error("Fallback audio failed", e);
  }
};

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  
  // Modal States
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'none' | 'manual' | 'voice'>('none');
  
  // Use a ref to persist the audio object instance
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio object with file path
    const audio = new Audio(CUSTOM_SOUND_URL);
    audio.preload = 'auto'; 
    
    audio.addEventListener('canplaythrough', () => {
        // console.log("Sound file loaded successfully");
    });

    audio.addEventListener('error', (e) => {
        console.warn("Failed to load sound file at:", CUSTOM_SOUND_URL, e);
    });
    
    audioRef.current = audio;
  }, []);

  const handleAddTask = (newTaskData: Omit<Task, 'id' | 'isCompleted'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: Math.random().toString(36).substr(2, 9),
      isCompleted: false
    };
    setTasks(prev => [...prev, newTask]);
    // Close any active modal
    setActiveModal('none');
    setIsFabOpen(false);
  };

  const handleToggleTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    
    // Play sound if we are completing the task
    if (task && !task.isCompleted) {
       // Try playing the audio ref
       if (audioRef.current) {
          const audio = audioRef.current;
          audio.currentTime = 0;
          
          const playPromise = audio.play();
          
          if (playPromise !== undefined) {
            playPromise.catch((e) => {
              console.warn("Audio play failed (file missing or interaction policy). Using fallback.", e);
              playFallbackSound();
            });
          }
       } else {
         playFallbackSound();
       }
    }

    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, isCompleted: !t.isCompleted } : t
    ));
  };

  const openManual = () => {
    setIsFabOpen(false);
    setActiveModal('manual');
  };

  const openVoice = () => {
    setIsFabOpen(false);
    setActiveModal('voice');
  };

  return (
    <div className="min-h-screen bg-[#050505] font-['IBM_Plex_Sans'] flex justify-center overflow-x-hidden text-white selection:bg-[#D48621]/30">
      
      {/* Background ambient glow */}
      <div className="fixed top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#15151A] to-transparent pointer-events-none z-0"></div>

      {/* Main Container */}
      <div className="w-full max-w-[900px] relative flex flex-col min-h-screen z-10">
        
        {/* Content Area */}
        <div className="flex-1 p-6 md:p-10 pb-32">
          <Header />

          <TaskList 
            tasks={tasks}
            onToggle={handleToggleTask}
            onAddTask={() => setIsFabOpen(true)}
          />
        </div>

        {/* Floating Action Menu */}
        <div className="fixed bottom-8 left-0 right-0 flex flex-col items-center justify-end z-50 pointer-events-none gap-4">
          
          {/* Pop-out Options */}
          <div className={`flex items-center gap-4 transition-all duration-300 ease-out origin-bottom ${isFabOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-90 pointer-events-none'}`}>
             
             {/* Manually Option */}
             <button 
                onClick={openManual}
                className="bg-[#131313] text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 hover:bg-[#1A1A1A] hover:-translate-y-1 transition-all pointer-events-auto border border-white/5 group backdrop-blur-md"
             >
                <div className="w-8 h-8 rounded-full bg-[#D48621]/10 flex items-center justify-center text-[#D48621] group-hover:bg-[#D48621] group-hover:text-white transition-colors">
                  <PenLine size={16} />
                </div>
                <span className="font-semibold text-sm">Manually</span>
             </button>

             {/* Dictate Option */}
             <button 
                onClick={openVoice}
                className="bg-[#131313] text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 hover:bg-[#1A1A1A] hover:-translate-y-1 transition-all pointer-events-auto border border-white/5 group backdrop-blur-md"
             >
                <div className="w-8 h-8 rounded-full bg-[#8A2BE2]/10 flex items-center justify-center text-[#8A2BE2] group-hover:bg-[#8A2BE2] group-hover:text-white transition-colors">
                  <Mic size={16} />
                </div>
                <span className="font-semibold text-sm">Dictate</span>
             </button>
             
          </div>

          {/* Main FAB Toggle */}
          <button
            onClick={() => setIsFabOpen(!isFabOpen)}
            className={`
              pointer-events-auto relative z-50 
              bg-gradient-to-br from-[#D48621] to-[#B06D15] hover:from-[#E59732] hover:to-[#C27E26] text-white 
              w-16 h-16 rounded-2xl shadow-[0_8px_30px_rgba(212,134,33,0.3)] 
              flex items-center justify-center 
              transition-all duration-300 border border-white/10
              ${isFabOpen ? 'rotate-45 from-[#C94646] to-[#A33232] shadow-[0_8px_30px_rgba(201,70,70,0.3)]' : 'hover:scale-105'}
            `}
          >
            <Plus size={32} strokeWidth={2.5} />
          </button>

        </div>
        
      </div>

      {/* Modals */}
      <AddTaskModal 
        isOpen={activeModal === 'manual'}
        onClose={() => setActiveModal('none')}
        onAdd={handleAddTask}
      />

      <VoiceModeModal
        isOpen={activeModal === 'voice'}
        onClose={() => setActiveModal('none')}
        onAdd={handleAddTask}
      />

    </div>
  );
};

export default App;