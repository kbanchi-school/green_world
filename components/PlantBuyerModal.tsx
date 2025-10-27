
import React, { useState, useMemo } from 'react';
import { Plot } from '../types';
import { PLANT_DATA } from '../constants';
import Modal from './Modal';
import { Button } from './Button';
import { CoinIcon } from './Icons';

interface PlantBuyerModalProps {
  plots: Plot[];
  onSell: (plantsToSell: Record<number, boolean>) => void;
  onClose: () => void;
  onSelectForSale?: (plotId: number) => void;
}

const PlantBuyerModal: React.FC<PlantBuyerModalProps> = ({ plots, onSell, onClose, onSelectForSale }) => {
  const [selectedPlots, setSelectedPlots] = useState<Record<number, boolean>>({});

  const grownPlants = useMemo(() => plots.filter(p => p.plant && p.plant.isGrown), [plots]);

  const areAllSelected = useMemo(() => {
    if (grownPlants.length === 0) return false;
    return grownPlants.every(plot => selectedPlots[plot.id]);
  }, [grownPlants, selectedPlots]);

  const handleToggleAll = () => {
    if (areAllSelected) {
      setSelectedPlots({});
    } else {
      const allSelected = grownPlants.reduce((acc, plot) => {
        acc[plot.id] = true;
        return acc;
      }, {} as Record<number, boolean>);
      setSelectedPlots(allSelected);
    }
  };

  const handleToggle = (plotId: number) => {
    setSelectedPlots(prev => ({ ...prev, [plotId]: !prev[plotId] }));
    if(onSelectForSale) onSelectForSale(plotId);
  };

  const totalEarnings = useMemo(() => {
    return grownPlants.reduce((total, plot) => {
      if (selectedPlots[plot.id] && plot.plant) {
        return total + PLANT_DATA[plot.plant.type].sellPrice;
      }
      return total;
    }, 0);
  }, [selectedPlots, grownPlants]);

  return (
    <Modal title="植物の買い手" onClose={onClose}>
      <div className="p-4">
        {grownPlants.length > 0 ? (
          <div className='space-y-4'>
            <div className="flex justify-between items-center">
              <p className="text-slate-300">売却する植物を選択してください。</p>
              <Button onClick={handleToggleAll} className="bg-indigo-600 hover:bg-indigo-500 text-sm px-3 py-1">
                {areAllSelected ? 'すべて解除' : 'すべて選択'}
              </Button>
            </div>
            <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
              {grownPlants.map(plot => {
                if (!plot.plant) return null;
                const plantInfo = PLANT_DATA[plot.plant.type];
                return (
                  <div 
                    key={plot.id} 
                    onClick={() => handleToggle(plot.id)}
                    className={`bg-slate-700 p-3 rounded-lg flex items-center justify-between cursor-pointer transition-all duration-200 ${selectedPlots[plot.id] ? 'ring-2 ring-cyan-400' : 'hover:bg-slate-600'}`}
                    data-tutorial-id={`plant-to-sell-${plot.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{plantInfo.emoji}</span>
                      <div>
                        <p className="font-bold">{plot.plant.type}</p>
                        <p className="text-sm text-yellow-300 flex items-center gap-1"><CoinIcon />{plantInfo.sellPrice}円</p>
                      </div>
                    </div>
                    <input type="checkbox" readOnly checked={!!selectedPlots[plot.id]} className="w-5 h-5 rounded text-cyan-500 bg-slate-800 border-slate-600 focus:ring-cyan-600" />
                  </div>
                );
              })}
            </div>
            <div className="mt-4 border-t border-slate-700 pt-4">
              <p className="text-lg font-bold text-right">合計: {totalEarnings}円</p>
              <Button 
                onClick={() => onSell(selectedPlots)} 
                disabled={totalEarnings === 0} 
                className="w-full mt-2 bg-green-600 hover:bg-green-500 focus:ring-green-400 text-lg py-3 transform hover:scale-105"
                data-tutorial-id="sell-plants-button"
              >
                選択した植物を売る
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-slate-300 text-center py-8">売れる植物がまだ育っていません。</p>
        )}
        <Button onClick={onClose} className="w-full mt-4 bg-gray-600 hover:bg-gray-500">閉じる</Button>
      </div>
    </Modal>
  );
};

export default PlantBuyerModal;
