import React, { useState, useEffect } from 'react';

interface VerseData {
  text: string;
  reference: string;
  version: string;
}

export const Header: React.FC = () => {
  const [time, setTime] = useState(new Date());
  
  const day = time.getDate().toString().padStart(2, '0');
  const month = time.toLocaleString('default', { month: 'short' }).toUpperCase();
  const weekday = time.toLocaleString('default', { weekday: 'long' });
  const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

  // Dynamic Greeting
  const hour = time.getHours();
  let greeting = "Good Morning";
  if (hour >= 12 && hour < 18) greeting = "Good Afternoon";
  if (hour >= 18) greeting = "Good Evening";

  // Week Number Calculation
  const getWeekNumber = (d: Date) => {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(),0,1));
    return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
  };
  const weekNumber = getWeekNumber(time);

  const [verseData, setVerseData] = useState<VerseData>({
    text: "For God so loved the world that he gave his one and only Son...",
    reference: "John 3:16",
    version: "NIV"
  });
  const [loading, setLoading] = useState(true);

  // Avatar seed
  const [avatarSeed] = useState('zendo-user');

  // Timer for Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchVerse = async () => {
      try {
        const response = await fetch('https://beta.ourmanna.com/api/v1/get?format=json&order=daily');
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        
        if (data.verse && data.verse.details) {
          setVerseData({
            text: data.verse.details.text,
            reference: data.verse.details.reference,
            version: data.verse.details.version
          });
        }
      } catch (error) {
        console.error("Failed to fetch daily verse:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVerse();
  }, []);

  return (
    <div className="flex flex-col gap-6 mb-8">
      {/* Top Bar: Logo and Profile */}
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
             <div className="w-6 h-6 rounded bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <div className="w-2 h-2 bg-amber-500 rotate-45"></div>
             </div>
            <h1 className="text-lg font-mono font-medium text-zinc-100 tracking-tight">ZenDo <span className="text-zinc-600 text-xs ml-2">BETA 2.0</span></h1>
        </div>
        <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs font-mono text-zinc-400">SYSTEM ONLINE</span>
             </div>
             <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden p-0.5">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`} alt="Profile" className="w-full h-full rounded-full opacity-80 hover:opacity-100 transition-opacity" />
             </div>
        </div>
      </div>

      {/* Hero Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4">
        
        {/* Date Container */}
        <div className="group relative rounded-lg bg-[#09090b] border border-zinc-800 p-5 flex flex-col justify-between overflow-hidden hover:border-zinc-700 transition-colors">
            {/* Header */}
            <div className="flex justify-between items-start">
                <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Time & Date</span>
                <span className="text-xs font-mono text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">W{weekNumber}</span>
            </div>

            {/* Main Value */}
            <div className="flex flex-col mt-4">
                <h2 className="text-4xl font-mono font-medium text-zinc-100 tracking-tighter">
                {timeStr}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-zinc-400 text-xs font-mono uppercase tracking-wide">{weekday}, {month} {day}</span>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-zinc-800/50 flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-zinc-600"></div>
                <span className="text-xs text-zinc-500 font-mono uppercase tracking-wide">{greeting}</span>
            </div>
        </div>

        {/* Verse Box */}
        <div className="group relative rounded-lg bg-[#09090b] border border-zinc-800 p-5 flex flex-col overflow-hidden hover:border-zinc-700 transition-colors">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Daily Signal</h3>
                <span className="text-xs font-mono text-zinc-600">{verseData.version}</span>
            </div>

            {/* Content */}
            <div className="flex-1 flex items-center">
                <p className={`text-sm text-zinc-300 font-mono font-light leading-relaxed transition-opacity duration-500 uppercase tracking-wide ${loading ? 'opacity-50' : 'opacity-100'}`}>
                "{verseData.text}"
                </p>
            </div>
            
            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-zinc-800/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-purple-500"></div>
                    <span className="text-xs font-mono text-purple-400">{verseData.reference}</span>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};