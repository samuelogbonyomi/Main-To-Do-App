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

  const handleVoiceAddTask = (newTaskData: Omit<Task, 'id' | 'isCompleted'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: Math.random().toString(36).substr(2, 9),
      isCompleted: false
    };
    setTasks(prev => [...prev, newTask]);
    // Do not close modal to allow continuous interaction
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
    <div className="min-h-screen bg-[#06060a] font-sans flex justify-center overflow-x-hidden text-zinc-100 selection:bg-amber-500/30">
      
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 pointer-events-none z-0" 
           style={{
             backgroundImage: `linear-gradient(to right, #27272a 1px, transparent 1px),
                               linear-gradient(to bottom, #27272a 1px, transparent 1px)`,
             backgroundSize: '40px 40px',
             opacity: 0.05
           }}>
      </div>

      {/* Ambient Glow - Subtle/Top */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-500/5 blur-[120px] pointer-events-none z-0 rounded-full"></div>

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
        <div className="fixed bottom-8 left-0 right-0 flex flex-col items-center justify-end z-50 pointer-events-none gap-3">
          
          {/* Pop-out Options */}
          <div className={`flex items-center gap-3 transition-all duration-300 ease-out origin-bottom ${isFabOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-90 pointer-events-none'}`}>
             
             {/* Manually Option */}
             <button 
                onClick={openManual}
                className="bg-[#09090b] text-zinc-300 px-5 py-2.5 rounded-lg shadow-xl flex items-center gap-3 hover:bg-zinc-900 hover:text-white hover:-translate-y-0.5 transition-all pointer-events-auto border border-zinc-800 group backdrop-blur-md"
             >
                <div className="flex items-center justify-center text-amber-500 group-hover:text-amber-400 transition-colors">
                  <PenLine size={14} />
                </div>
                <span className="font-mono text-xs tracking-wide uppercase">Manual</span>
             </button>

             {/* Dictate Option */}
             <button 
                onClick={openVoice}
                className="bg-[#09090b] text-zinc-300 px-5 py-2.5 rounded-lg shadow-xl flex items-center gap-3 hover:bg-zinc-900 hover:text-white hover:-translate-y-0.5 transition-all pointer-events-auto border border-zinc-800 group backdrop-blur-md"
             >
                <div className="flex items-center justify-center text-amber-500 group-hover:text-amber-400 transition-colors">
                  <Mic size={14} />
                </div>
                <span className="font-mono text-xs tracking-wide uppercase">Dictate</span>
             </button>
          </div>

          {/* Main FAB Toggle */}
          <button
            onClick={() => setIsFabOpen(!isFabOpen)}
            className={`
              pointer-events-auto relative z-50 
              bg-[#09090b] hover:bg-zinc-900 text-zinc-400 hover:text-white
              w-14 h-14 rounded-xl shadow-2xl
              flex items-center justify-center 
              transition-all duration-300 border border-zinc-800 backdrop-blur-md
              ${isFabOpen ? 'rotate-45 bg-zinc-900 text-white' : ''}
            `}
          >
            <Plus size={24} strokeWidth={2} />
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
        onAdd={handleVoiceAddTask}
      />

    </div>
  );
};

export default App;
