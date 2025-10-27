import React, { useState } from 'react';
import { PlantType } from '../types';
import { PLANT_DATA } from '../constants';
import { SeedIcon } from './Icons';

interface InventoryProps {
  seeds: Record<PlantType, number>;
  selectedSeed: PlantType | null;
  onSelectSeed: (seed: PlantType | null) => void;
}

const Inventory: React.FC<InventoryProps> = ({ seeds, selectedSeed, onSelectSeed }) => {
  const [hoveredSeed, setHoveredSeed] = useState<PlantType | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  
  const ownedSeedTypes = Object.values(PlantType).filter(type => seeds[type] > 0);
  
  const handleMouseEnter = (event: React.MouseEvent, type: PlantType) => {
    setHoveredSeed(type);
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseLeave = () => {
    setHoveredSeed(null);
    setTooltipPosition(null);
  };
  
  const handleMouseMove = (event: React.MouseEvent) => {
    if (hoveredSeed) {
        setTooltipPosition({ x: event.clientX, y: event.clientY });
    }
  };

  return (
    <>
      <div className="bg-black bg-opacity-30 p-4 rounded-2xl shadow-lg border border-slate-700">
        <h3 className="text-lg font-bold mb-3 text-cyan-300 flex items-center gap-2"><SeedIcon />種のインベントリ</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
          {ownedSeedTypes.length > 0 ? (
            ownedSeedTypes.map(type => {
              const isSelected = selectedSeed === type;

              const itemClasses = `
                flex items-center justify-between p-2 rounded-lg transition-all duration-200
                cursor-pointer
                ${isSelected ? 'bg-cyan-500 ring-2 ring-cyan-300' : 'bg-slate-700 hover:bg-slate-600'}
              `;

              return (
                <div 
                  key={type} 
                  className={itemClasses} 
                  onClick={() => onSelectSeed(isSelected ? null : type)}
                  onMouseEnter={(e) => handleMouseEnter(e, type)}
                  onMouseLeave={handleMouseLeave}
                  onMouseMove={handleMouseMove}
                  data-tutorial-id={`select-seed-${type}`}
                  >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{PLANT_DATA[type].emoji}</span>
                    <span className="font-medium">{type}</span>
                  </div>
                  <span className="font-bold bg-slate-900 px-2 py-1 rounded-md text-sm">{seeds[type]}</span>
                </div>
              );
            })
          ) : (
            <p className="text-slate-400 text-center py-4 text-sm">種がありません。商人から購入しましょう。</p>
          )}
        </div>
      </div>
      {hoveredSeed && tooltipPosition && (
        <div
          className="fixed bg-slate-900 border border-slate-600 rounded-lg p-3 shadow-lg text-sm z-50 pointer-events-none transition-opacity duration-200 animate-fade-in-fast"
          style={{
            top: tooltipPosition.y,
            left: tooltipPosition.x,
            transform: 'translate(15px, -100%)',
          }}
        >
          {(() => {
            const plantInfo = PLANT_DATA[hoveredSeed];
            return (
              <>
                <h4 className="font-bold text-base text-cyan-300 flex items-center gap-2">
                  <span className="text-xl">{plantInfo.emoji}</span>
                  {plantInfo.name}
                </h4>
                <div className="mt-2 space-y-1 text-slate-300">
                  <p>成長日数: <span className="font-bold text-white">{plantInfo.growthTime}日</span></p>
                  <p>CO2削減: <span className="font-bold text-green-400">{plantInfo.co2Reduction}%</span></p>
                  <p>売却価格: <span className="font-bold text-yellow-300">{plantInfo.sellPrice}円</span></p>
                </div>
              </>
            );
          })()}
        </div>
      )}
      <style>{`
        @keyframes fade-in-fast {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .animate-fade-in-fast {
            animation: fade-in-fast 0.2s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default Inventory;