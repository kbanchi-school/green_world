import React from 'react';
import { Button } from './Button';
import { LeafIcon } from './Icons';

interface WelcomeScreenProps {
  hasSaveData: boolean;
  onContinue: () => void;
  onNewGame: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ hasSaveData, onContinue, onNewGame }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-sky-900 text-white flex items-center justify-center p-4">
      <div className="text-center max-w-2xl mx-auto animate-fade-in">
        <LeafIcon className="w-32 h-32 mx-auto text-green-300 drop-shadow-lg" />
        <h1 className="text-5xl sm:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-cyan-400 mt-4">
          Green World
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-slate-300">
          増え続ける二酸化炭素(CO2)から地球を救うため、あなたの力が必要です。<br />
          植物を植えて育て、この星を緑でいっぱいにしましょう！
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          {hasSaveData && (
            <Button 
              onClick={onContinue} 
              className="px-8 py-4 text-xl bg-cyan-600 hover:bg-cyan-500 transform hover:scale-105"
              playSound={false}
            >
              続きから始める
            </Button>
          )}
          <Button 
            onClick={onNewGame} 
            className={`px-8 py-4 text-xl transform hover:scale-105 ${hasSaveData ? 'bg-gray-600 hover:bg-gray-500' : 'bg-green-600 hover:bg-green-500'}`}
            playSound={false}
          >
            {hasSaveData ? 'はじめから' : 'ゲームを始める'}
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
    `}</style>
    </div>
  );
};

export default WelcomeScreen;