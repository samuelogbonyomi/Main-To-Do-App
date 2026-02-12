import React, { useState, useEffect } from 'react';

interface VerseData {
  text: string;
  reference: string;
  version: string;
}

export const Header: React.FC = () => {
  const [time, setTime] = useState(new Date());
  
  const day = time.getDate().toString().padStart(2, '0');
  const year = time.getFullYear();
  const month = time.toLocaleString('default', { month: 'short' }).toUpperCase();
  const weekday = time.toLocaleString('default', { weekday: 'long' });
  const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const [verseData, setVerseData] = useState<VerseData>({
    text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
    reference: "John 3:16",
    version: "NIV"
  });
  const [loading, setLoading] = useState(true);

  // Avatar seed (static for now, but could be dynamic)
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

  // SVG Noise Data URI for the grain effect
  const noiseBg = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.4'/%3E%3C/svg%3E")`;

  return (
    <div className="flex flex-col gap-8 mb-10">
      {/* Top Bar: Logo and Profile */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D48621] to-[#8A2BE2] flex items-center justify-center transform rotate-3 shadow-[0_0_15px_rgba(212,134,33,0.3)]">
                <div className="w-3 h-3 bg-white rounded-full"></div>
             </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">ZenDo</h1>
        </div>
        <div className="flex items-center gap-4">
             {/* Search Bar Simulation */}
             <div className="hidden md:flex items-center bg-[#131313]/50 backdrop-blur-sm border border-[#222222] rounded-full px-4 py-2 text-sm text-gray-500 w-64 focus-within:border-white/20 transition-colors">
                <span>Search tasks...</span>
             </div>
             <div className="w-10 h-10 rounded-full bg-[#131313] border border-[#222222] overflow-hidden p-0.5 ring-1 ring-white/5 hover:ring-white/20 transition-all cursor-pointer">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`} alt="Profile" className="w-full h-full rounded-full" />
             </div>
        </div>
      </div>

      {/* Hero Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
        
        {/* Date Container - Orange/Gold Gradient Border */}
        <div className="group relative min-h-[240px] rounded-xl p-[1px] bg-gradient-to-br from-[#D48621]/40 via-[#D48621]/5 to-transparent shadow-2xl">
          <div className="h-full w-full rounded-[11px] relative overflow-hidden bg-[#131313]">
            
            {/* Background Layers */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1c1c21] to-[#0d0d10] z-0"></div>
            
            {/* Grain Overlay */}
            <div 
              className="absolute inset-0 opacity-[0.07] pointer-events-none z-1 mix-blend-overlay" 
              style={{ backgroundImage: noiseBg }}
            ></div>
            
            {/* Ambient Glow */}
            <div className="absolute top-0 right-0 w-[180px] h-[180px] bg-[#D48621]/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 z-0"></div>

            <div className="p-7 h-full flex flex-col justify-between relative z-10">
               
               {/* Header */}
               <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-white/90">Current Time</span>
                  
                  {/* Badge style like reference dropdown */}
                  <div className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-lg px-3 py-1.5 backdrop-blur-sm">
                     <span className="text-xs font-medium text-white/60">{year}</span>
                  </div>
               </div>

               {/* Main Value */}
               <div className="flex flex-col mt-2">
                  <h2 className="text-[56px] font-medium leading-none tracking-tight text-white drop-shadow-sm">
                    {day}
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                     <span className="text-[#D48621] text-sm font-bold tracking-wider">{month}</span>
                     <span className="text-white/40 text-sm">•</span>
                     <span className="text-white/60 text-sm font-medium">{weekday}</span>
                  </div>
               </div>

               {/* Footer / Graph-like decorative element */}
               <div className="pt-6 mt-auto">
                  <div className="flex items-end justify-between">
                      <div className="flex flex-col">
                         <span className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Live Clock</span>
                         <span className="text-xl font-mono text-white/90 tracking-wide">{timeStr}</span>
                      </div>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Verse Box - Purple Gradient Border */}
        <div className="group relative min-h-[240px] rounded-xl p-[1px] bg-gradient-to-br from-[#8A2BE2]/40 via-[#8A2BE2]/5 to-transparent shadow-2xl">
           <div className="h-full w-full rounded-[11px] relative overflow-hidden bg-[#131313] flex flex-col">
             
            {/* Background Layers */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1c1c21] to-[#0d0d10] z-0"></div>
            
            {/* Grain Overlay */}
            <div 
              className="absolute inset-0 opacity-[0.07] pointer-events-none z-1 mix-blend-overlay" 
              style={{ backgroundImage: noiseBg }}
            ></div>
            
            {/* Ambient Glow */}
            <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-[#8A2BE2]/10 rounded-full blur-[90px] translate-y-1/2 -translate-x-1/2 z-0"></div>

            <div className="p-7 flex flex-col h-full relative z-10">
              
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                 <h3 className="text-sm font-medium text-white/90">Daily Inspiration</h3>
                 
                 {/* Version Badge */}
                 <div className="px-3 py-1.5 bg-[#8A2BE2]/10 border border-[#8A2BE2]/20 rounded-lg backdrop-blur-sm">
                   <span className="text-xs font-bold text-[#8A2BE2]">{verseData.version}</span>
                 </div>
              </div>

              {/* Content (Big Text) */}
              <div className="flex-1 flex items-center justify-start my-2">
                 <p className={`text-xl md:text-2xl font-light leading-relaxed text-white/90 transition-all duration-700 text-left ${loading ? 'opacity-50 blur-sm' : 'opacity-100'}`}>
                   "{verseData.text}"
                 </p>
              </div>
              
              {/* Footer */}
              <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-4">
                 <div className="flex flex-col">
                    <span className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Reference</span>
                    <span className="text-sm font-medium text-[#8A2BE2]">{verseData.reference}</span>
                 </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};