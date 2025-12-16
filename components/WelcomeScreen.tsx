import React from 'react';
import { Button } from './Button';

// Simple SVG for a factory icon
// FIX: Added style prop to allow passing CSS properties like animationDelay.
const FactoryIcon = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
    <svg viewBox="0 0 100 100" className={className} style={style} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 90V60h10v30H20Z M40 90V20h20l20 20v50H40Z M50 80h10V50H50v30Z" />
      <path d="M60 20V10h-5l-5-10-5 10h-5v10h15Z" />
    </svg>
);

// Simple SVG for a tree icon
// FIX: Added style prop to allow passing CSS properties like animationDelay.
const TreeIcon = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
    <svg viewBox="0 0 100 100" className={className} style={style} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M45 90h10V80H45v10Z M50 10.5A24.5 24.5 0 0 0 25.5 35c0 10 10 30 24.5 45 14.5-15 24.5-35 24.5-45A24.5 24.5 0 0 0 50 10.5Z" />
    </svg>
);


interface WelcomeScreenProps {
  hasSaveData: boolean;
  onContinue: () => void;
  onNewGame: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ hasSaveData, onContinue, onNewGame }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4 overflow-hidden relative">
      {/* 背景のグラデーション */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-slate-800 to-green-900 opacity-70 z-0"></div>
      
      {/* 左側の汚染された世界の背景 */}
      <div className="absolute top-0 left-0 w-1/2 h-full overflow-hidden z-10">
        <div className="absolute w-full h-full bg-gradient-to-r from-black via-transparent to-transparent opacity-50"></div>
        <FactoryIcon className="absolute -left-16 top-1/4 w-48 h-48 text-gray-700 opacity-40 animate-smoke-slow" style={{ animationDelay: '0s' }} />
        <FactoryIcon className="absolute left-1/4 bottom-1/4 w-64 h-64 text-gray-800 opacity-30 animate-smoke-fast" style={{ animationDelay: '2s' }} />
        <FactoryIcon className="absolute -left-10 bottom-10 w-32 h-32 text-gray-700 opacity-50 animate-smoke-slow" style={{ animationDelay: '4s' }} />
      </div>
      
       {/* 右側の緑豊かな世界の背景 */}
      <div className="absolute top-0 right-0 w-1/2 h-full overflow-hidden z-10">
        <div className="absolute w-full h-full bg-gradient-to-l from-green-900 via-transparent to-transparent opacity-30"></div>
        <TreeIcon className="absolute -right-16 top-1/4 w-48 h-48 text-green-800 opacity-50 animate-leaf-sway-slow" style={{ animationDelay: '0s' }} />
        <TreeIcon className="absolute right-1/4 bottom-1/4 w-64 h-64 text-green-900 opacity-40 animate-leaf-sway-fast" style={{ animationDelay: '2s' }} />
        <TreeIcon className="absolute -right-10 bottom-10 w-32 h-32 text-green-800 opacity-60 animate-leaf-sway-slow" style={{ animationDelay: '4s' }} />
      </div>


      <div className="text-center max-w-3xl mx-auto animate-fade-in z-20 bg-black bg-opacity-60 p-8 rounded-2xl shadow-2xl border border-slate-700">
        <h1 className="text-6xl sm:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-cyan-400 drop-shadow-[0_0_15px_rgba(56,189,248,0.6)]">
          Green World
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-slate-300 leading-relaxed">
          星の悲鳴が聞こえるか。灰色の空、乾いた大地...。<br />
          あなたのその手で、一輪の花を。希望の種を蒔き、失われた緑を、青い空を取り戻すのだ。
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          {hasSaveData && (
            <Button 
              onClick={onContinue} 
              className="px-8 py-4 text-xl bg-cyan-600 hover:bg-cyan-500 transform hover:scale-105 transition-transform duration-300"
              playSound={false}
            >
              続きから始める
            </Button>
          )}
          <Button 
            onClick={onNewGame} 
            className={`px-8 py-4 text-xl transform hover:scale-105 transition-transform duration-300 ${hasSaveData ? 'bg-gray-600 hover:bg-gray-500' : 'bg-green-600 hover:bg-green-500'}`}
            playSound={false}
          >
            {hasSaveData ? 'はじめから' : '地球を救う'}
          </Button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fade-in 1s ease-out forwards;
        }

        @keyframes smoke-slow {
          0% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 0.3; }
          50% { transform: translate(40px, -60px) scale(1.1) rotate(5deg); opacity: 0.4; }
          100% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 0.3; }
        }
        .animate-smoke-slow {
          animation: smoke-slow 25s ease-in-out infinite;
        }

        @keyframes smoke-fast {
          0% { transform: translate(0, 0) scale(1.1) rotate(-3deg); opacity: 0.2; }
          50% { transform: translate(20px, -80px) scale(1) rotate(0deg); opacity: 0.3; }
          100% { transform: translate(0, 0) scale(1.1) rotate(-3deg); opacity: 0.2; }
        }
        .animate-smoke-fast {
          animation: smoke-fast 20s ease-in-out infinite;
        }

        @keyframes leaf-sway-slow {
          0% { transform: rotate(-2deg) scale(1); opacity: 0.4; }
          50% { transform: rotate(2deg) scale(1.05) translateX(20px); opacity: 0.5; }
          100% { transform: rotate(-2deg) scale(1); opacity: 0.4; }
        }
        .animate-leaf-sway-slow {
            animation: leaf-sway-slow 15s ease-in-out infinite;
        }

        @keyframes leaf-sway-fast {
          0% { transform: rotate(3deg) scale(1.05) translateX(-10px); opacity: 0.3; }
          50% { transform: rotate(-3deg) scale(1) translateX(10px); opacity: 0.4; }
          100% { transform: rotate(3deg) scale(1.05) translateX(-10px); opacity: 0.3; }
        }
        .animate-leaf-sway-fast {
            animation: leaf-sway-fast 12s ease-in-out infinite;
        }
    `}</style>
    </div>
  );
};

export default WelcomeScreen;