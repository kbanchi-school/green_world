import React, { useState, useEffect } from 'react';
import { CoinIcon, DayIcon, LeafIcon, LevelIcon, SoundOnIcon, SoundOffIcon } from './Icons';
import { MAX_CO2, XP_PER_LEVEL, WEATHER_DEFINITIONS } from '../constants';
import { GameState } from '../types';

interface HeaderProps {
  stats: GameState;
  co2SurgeTrigger: number;
  isMuted: boolean;
  onToggleMute: () => void;
  className?: string;
  isCo2Critical: boolean;
}

const Header: React.FC<HeaderProps> = ({ stats, co2SurgeTrigger, isMuted, onToggleMute, className, isCo2Critical }) => {
  const [isShaking, setIsShaking] = useState(false);

  const co2Percentage = (stats.co2Level / MAX_CO2) * 100;
  let co2Color = 'bg-green-500';
  if (co2Percentage > 50) co2Color = 'bg-yellow-500';
  if (co2Percentage > 80) co2Color = 'bg-red-500';

  const xpPercentage = (stats.xp / XP_PER_LEVEL) * 100;
  
  const weatherInfo = WEATHER_DEFINITIONS.find(w => w.type === stats.weather);

  useEffect(() => {
    if (co2SurgeTrigger > 0) {
      setIsShaking(true);
      const timer = setTimeout(() => setIsShaking(false), 500); // Animation duration
      return () => clearTimeout(timer);
    }
  }, [co2SurgeTrigger]);

  return (
    <header className={`bg-black bg-opacity-30 p-2 md:p-4 rounded-2xl shadow-lg border border-slate-700 ${className || ''}`}>
      <style>{`
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-3px, 0, 0); }
          40%, 60% { transform: translate3d(3px, 0, 0); }
        }
        .animate-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes critical-pulse {
          50% {
            box-shadow: 0 0 12px 5px rgba(239, 68, 68, 0.5); /* red-500 with opacity */
          }
        }
        .animate-critical-pulse {
          animation: critical-pulse 1.5s ease-in-out infinite;
        }
      `}</style>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-1 md:gap-2 text-center">
        
        <div className="col-span-3 md:col-span-1 flex items-center justify-between md:justify-center gap-4 px-1 md:px-0">
           <h1 className="text-xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-cyan-400">Green World</h1>
           <button onClick={onToggleMute} className="text-slate-400 hover:text-white transition-colors" aria-label={isMuted ? 'Unmute' : 'Mute'}>
                {isMuted ? <SoundOffIcon className="w-5 h-5 md:w-7 md:h-7" /> : <SoundOnIcon className="w-5 h-5 md:w-7 md:h-7" />}
           </button>
        </div>

        <div style={{ display: 'contents' }} data-tutorial-id="main-stats">
          <div className="bg-slate-800 p-1 md:p-2 rounded-lg flex items-center justify-center gap-1.5 md:gap-2">
            <span className="text-xl md:text-3xl">{weatherInfo?.emoji}</span>
            <div className="text-left">
              <span className="text-[10px] md:text-xs text-slate-400">天気</span>
              <p className="font-bold text-xs md:text-lg leading-tight">{stats.weather}</p>
            </div>
          </div>
          
          <div className="bg-slate-800 p-1 md:p-2 rounded-lg flex items-center justify-center gap-1.5 md:gap-2">
            <DayIcon className="w-4 h-4 md:w-8 md:h-8" />
            <div className="text-left">
              <span className="text-[10px] md:text-xs text-slate-400">Day</span>
              <p className="font-bold text-xs md:text-lg leading-tight">{stats.day}</p>
            </div>
          </div>

          <div className="bg-slate-800 p-1 md:p-2 rounded-lg flex items-center justify-center gap-1.5 md:gap-2">
            <CoinIcon className="w-3 h-3 md:w-6 md:h-6" />
            <div className="text-left">
              <span className="text-[10px] md:text-xs text-slate-400">Money</span>
              <p className="font-bold text-xs md:text-lg leading-tight">¥{stats.money.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-slate-800 p-1 md:p-2 rounded-lg flex items-center justify-center gap-1.5 md:gap-2">
            <LevelIcon className="w-4 h-4 md:w-8 md:h-8" />
            <div className="text-left">
              <span className="text-[10px] md:text-xs text-slate-400">Level {stats.level}</span>
              <div className="w-12 md:w-20 h-2 md:h-3 bg-slate-600 rounded-full mt-0.5 md:mt-1 overflow-hidden">
                  <div className="bg-purple-500 h-full" style={{ width: `${xpPercentage}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className={`bg-slate-800 p-1 md:p-2 rounded-lg flex items-center justify-center gap-1.5 md:gap-2 col-span-2 md:col-span-1 ${isShaking ? 'animate-shake' : ''} ${isCo2Critical ? 'animate-critical-pulse' : ''}`} data-tutorial-id="co2-stat">
           <LeafIcon className="w-4 h-4 md:w-8 md:h-8" />
           <div className="text-left w-full">
             <span className="text-[10px] md:text-xs text-slate-400">CO2濃度</span>
             <div className="w-full h-4 md:h-5 bg-slate-600 rounded-full mt-0.5 md:mt-1 overflow-hidden relative">
               <div className={`${co2Color} h-full transition-all duration-500`} style={{ width: `${co2Percentage}%` }}></div>
               <span className="absolute inset-0 flex items-center justify-center text-[10px] md:text-sm font-bold text-black mix-blend-screen">{Math.round(stats.co2Level)}%</span>
             </div>
           </div>
        </div>
      </div>
    </header>
  );
};

export default Header;