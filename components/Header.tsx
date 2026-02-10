import React, { useState, useEffect } from 'react';

interface VerseData {
  text: string;
  reference: string;
  version: string;
}

const CHANGE_INTERVAL = 30000; // 30 seconds

// Function to get a dynamic image URL with a random seed
const getDynamicBgUrl = (seed: number) => 
  `https://image.pollinations.ai/prompt/mystical%20zen%20nature%20landscape%20dark%20moody%20foggy%20forest?width=800&height=600&nologo=true&seed=${seed}`;

export const Header: React.FC = () => {
  const [time, setTime] = useState(new Date());
  
  const day = time.getDate().toString().padStart(2, '0');
  const year = time.getFullYear();
  const month = time.toLocaleString('default', { month: 'short' }).toUpperCase();
  const weekday = time.toLocaleString('default', { weekday: 'long' }).toUpperCase();
  const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const [verseData, setVerseData] = useState<VerseData>({
    text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
    reference: "John 3:16",
    version: "NIV"
  });
  const [loading, setLoading] = useState(true);

  // Background Image Logic
  const [bgUrl, setBgUrl] = useState('');
  const [avatarSeed, setAvatarSeed] = useState('');
  const [progress, setProgress] = useState(0);

  // Initialize random seeds on mount
  useEffect(() => {
    setBgUrl(getDynamicBgUrl(Math.floor(Math.random() * 10000)));
    setAvatarSeed(Math.random().toString(36).substring(7));
  }, []);

  // Timer for Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Timer for Image Rotation and Progress Bar
  useEffect(() => {
    // 1. Image Switcher Interval (30s)
    const imageInterval = setInterval(() => {
      setBgUrl(getDynamicBgUrl(Math.floor(Math.random() * 10000)));
      setProgress(0); // Reset progress immediately
    }, CHANGE_INTERVAL);

    // 2. Progress Bar Animator (50ms)
    const step = 100 * (50 / CHANGE_INTERVAL);
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + step;
      });
    }, 50);

    return () => {
      clearInterval(imageInterval);
      clearInterval(progressInterval);
    };
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
    <div className="flex flex-col gap-6 mb-12">
      {/* Top Bar: Logo and Profile */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-wide">ZenDo</h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#FFE4D9] border-2 border-black overflow-hidden">
             {avatarSeed && (
               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`} alt="Profile" className="w-full h-full" />
             )}
        </div>
      </div>

      {/* Hero Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
        
        {/* Date Container */}
        <div className="h-[220px] bg-[#121017] rounded-[24px] border border-[#231E2F] flex flex-col items-center justify-center relative overflow-hidden shadow-lg group">
          
          {/* Background Image Layer */}
          <div className="absolute inset-0 z-0 bg-[#121017]">
             {bgUrl && (
               <img 
                  key={bgUrl} // Trigger fade animation when URL changes
                  src={bgUrl} 
                  alt="Background" 
                  className="w-full h-full object-cover opacity-50 transition-all duration-700 animate-in fade-in"
               />
             )}
             <div className="absolute inset-0 bg-gradient-to-t from-[#121017] via-[#121017]/50 to-transparent opacity-90"></div>
          </div>

          {/* Top Info: Year & Time */}
          <div className="absolute top-4 left-5 z-10">
            <span className="text-xs font-medium tracking-widest text-white/40">{year}</span>
          </div>
          <div className="absolute top-4 right-5 z-10 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-[#369574] rounded-full animate-pulse"></div>
            <span className="text-xs font-mono tracking-widest text-white/80">{timeStr}</span>
          </div>

          {/* Center Info: Date */}
          <div className="relative z-10 flex flex-col items-center mt-[-4px]">
            <span className="text-[86px] font-bold font-['IBM_Plex_Serif'] leading-none text-white drop-shadow-2xl">{day}</span>
            <div className="flex flex-col items-center mt-1">
              <span className="text-sm font-semibold tracking-[0.2em] text-white drop-shadow-md uppercase">{weekday}</span>
              <span className="text-[10px] font-medium tracking-[0.2em] text-[#D48621] mt-1 drop-shadow-md uppercase">{month}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="absolute bottom-[6px] left-1/2 -translate-x-1/2 w-[60%] h-[2px] z-20">
             <div className="h-full bg-[#D48621] transition-all duration-75 ease-linear rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        {/* Verse Box */}
        <div className="h-[220px] bg-gradient-to-br from-[#493DD3] to-[#362DA6] rounded-[24px] border border-[#231E2F] p-8 flex flex-col justify-between relative overflow-hidden shadow-lg group hover:shadow-xl transition-shadow duration-300">
           
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
          <div className="absolute -right-6 -bottom-8 text-white/5 rotate-12 pointer-events-none select-none">
             <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H22.017V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM5.01697 21L5.01697 18C5.01697 16.8954 5.9124 16 7.01697 16H10.017C10.5693 16 11.017 15.5523 11.017 15V9C11.017 8.44772 10.5693 8 10.017 8H6.01697C5.46468 8 5.01697 8.44772 5.01697 9V11C5.01697 11.5523 4.56925 12 4.01697 12H3.01697V5H13.017V15C13.017 18.3137 10.3307 21 7.01697 21H5.01697Z" />
             </svg>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 bg-[#F5BB6E] rounded-full shadow-[0_0_8px_rgba(245,187,110,0.6)]"></div>
              <h3 className="text-xs font-bold tracking-[0.15em] uppercase text-white/80">Bible Verse of the day</h3>
            </div>
            <p className={`text-lg md:text-xl font-light leading-relaxed text-white line-clamp-3 transition-opacity duration-500 ${loading ? 'opacity-50' : 'opacity-100'}`}>
              "{verseData.text}"
            </p>
          </div>
          
          <div className="flex items-center gap-3 mt-auto relative z-10">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full backdrop-blur-sm border border-white/5 shadow-inner">
                <span className="font-semibold text-xs text-white tracking-wide">{verseData.reference}</span>
                <span className="w-1 h-1 bg-white/40 rounded-full"></span>
                <span className="font-medium text-xs text-white/70">{verseData.version}</span>
             </div>
             
             <div className="ml-auto text-xs hidden sm:block text-white/50 group-hover:text-white/80 transition-colors">
                <span className="font-normal">Powered by </span>
                <span className="font-medium underline cursor-pointer">OurManna</span>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};