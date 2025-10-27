import React from 'react';
import { Plot, PlantType, WeatherType, GameState } from '../types';
import { PLANT_DATA, PLOT_UNLOCK_LEVEL } from '../constants';
import { PlantIcon, WaterDropIcon } from './Icons';
import { Button } from './Button';

interface GardenProps {
  plots: Plot[];
  onPlotClick: (plotId: number) => void;
  selectedSeed: PlantType | null;
  onBuyPlotClick: () => void;
  canBuyPlot: boolean;
  onWaterPlant: (plotId: number) => void;
  gameState: GameState;
}

const Garden: React.FC<GardenProps> = ({ plots, onPlotClick, selectedSeed, onBuyPlotClick, canBuyPlot, onWaterPlant, gameState }) => {
  return (
    <div className="grid grid-cols-3 gap-4">
    {plots.map(plot => {
        const canPlant = selectedSeed && !plot.plant;
        const needsWater = plot.plant && !plot.plant.isGrown && !plot.plant.isWatered;
        const plantInfo = plot.plant ? PLANT_DATA[plot.plant.type] : null;

        const plotClasses = `
        aspect-square rounded-lg flex items-center justify-center
        transition-all duration-300 border-2 relative
        ${plot.plant ? (needsWater ? 'bg-orange-900 border-orange-700' : 'bg-green-900 border-green-700') : 'bg-yellow-900 border-yellow-700'}
        ${canPlant ? 'cursor-pointer hover:bg-yellow-800 hover:border-yellow-500 transform hover:scale-105' : ''}
        ${!plot.plant && !selectedSeed ? 'cursor-not-allowed' : ''}
        `;
        
        const getTutorialId = () => {
            if (plot.id !== 0) return undefined;
            if (!plot.plant) return 'plot-0';
            return undefined;
        }

        return (
        <div 
            key={plot.id} 
            onClick={() => onPlotClick(plot.id)} 
            className={plotClasses}
            data-tutorial-id={getTutorialId()}
            >
            {plot.plant ? (
            <div className="text-center">
                <span className="text-5xl block">{plantInfo!.emoji}</span>
                 <span className="text-sm font-bold block mt-1">
                    {plot.plant.isGrown ? 'Ready' : 
                     needsWater ? '水が必要' : 
                     plot.plant.isWatered ? `あと${plot.plant.growthStage}日` : ''
                    }
                </span>
                {needsWater && (
                   <button
                    onClick={(e) => { e.stopPropagation(); onWaterPlant(plot.id); }}
                    className="absolute bottom-1 right-1 bg-blue-500 hover:bg-blue-400 text-white p-2 rounded-full transform hover:scale-110 transition-transform disabled:bg-gray-600"
                    title={`水をやる (${plantInfo?.waterCost}円)`}
                    disabled={gameState.money < plantInfo!.waterCost}
                    data-tutorial-id={plot.id === 0 ? 'water-button-0' : undefined}
                   >
                       <WaterDropIcon className="w-5 h-5"/>
                   </button>
                )}
            </div>
            ) : (
                canPlant 
                ? <PlantIcon className="w-12 h-12 text-green-400" /> 
                : <span className="text-base text-yellow-500 opacity-50">空き地</span>
            )}
        </div>
        );
    })}

    <div 
      onClick={canBuyPlot ? onBuyPlotClick : undefined}
      title={!canBuyPlot ? `レベル${PLOT_UNLOCK_LEVEL}で解放` : '新しい畑を購入'}
      className={`aspect-square rounded-lg flex items-center justify-center
                  transition-all duration-300 border-2 border-dashed
                  ${canBuyPlot 
                    ? 'bg-slate-800 border-slate-600 cursor-pointer hover:bg-slate-700 hover:border-cyan-500' 
                    : 'bg-slate-900 border-slate-700 cursor-not-allowed opacity-60'}`}
    >
      <div className="text-center">
          <span className="text-4xl font-bold text-slate-500">+</span>
          {canBuyPlot ? (
              <span className="text-sm font-bold block mt-1 text-cyan-400">畑を追加</span>
          ) : (
              <span className="text-xs font-bold block mt-1 text-slate-500">Lv.{PLOT_UNLOCK_LEVEL}で解放</span>
          )}
      </div>
    </div>
    </div>
  );
};

export default Garden;