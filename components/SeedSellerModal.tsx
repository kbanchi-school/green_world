import React, { useState } from 'react';
import { Seller, PlantType } from '../types';
import { PLANT_DATA } from '../constants';
import Modal from './Modal';
import { Button } from './Button';
import { CoinIcon } from './Icons';

interface SeedSellerModalProps {
  sellers: Seller[];
  money: number;
  onBuy: (sellerId: number) => void;
  onBuyAll: () => void;
  onClose: () => void;
}

const SeedSellerModal: React.FC<SeedSellerModalProps> = ({ sellers, money, onBuy, onBuyAll, onClose }) => {
  const [hoveredSeed, setHoveredSeed] = useState<PlantType | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);

  const remainingSellers = sellers.filter(s => !s.sold);
  const totalCost = remainingSellers.reduce((sum, seller) => sum + seller.price, 0);
  const canAffordAll = money >= totalCost;

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
      <Modal title="種の商人たち" onClose={onClose} contentDataTutorialId="seed-seller-modal">
        <div className="p-4 space-y-4">
          <p className="text-slate-300">今日は3人の商人が訪れています。彼らから種を買いませんか？（一人一つまで）</p>
          <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
            {sellers.map(seller => {
              const plantInfo = PLANT_DATA[seller.seedType];
              const canAfford = money >= seller.price;
              const isSold = seller.sold;

              return (
                <div 
                  key={seller.id} 
                  className={`bg-slate-700 p-3 rounded-lg flex items-center justify-between transition-opacity duration-300 ${isSold ? 'opacity-50' : ''}`}
                  onMouseEnter={(e) => handleMouseEnter(e, seller.seedType)}
                  onMouseLeave={handleMouseLeave}
                  onMouseMove={handleMouseMove}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{plantInfo.emoji}</span>
                    <div>
                      <p className="font-bold">{seller.seedType}</p>
                      <p className="text-sm text-yellow-300 flex items-center gap-1"><CoinIcon />{seller.price}円</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => onBuy(seller.id)} 
                    disabled={!canAfford || isSold}
                    data-tutorial-id={`buy-seed-${seller.id}`}
                  >
                    {isSold ? '売り切れ' : '買う'}
                  </Button>
                </div>
              );
            })}
          </div>
          
          {remainingSellers.length > 0 && (
            <div className="mt-4 border-t border-slate-700 pt-4">
              <p className="text-right text-slate-400 mb-2">
                  残り合計: <span className="font-bold text-yellow-300">{totalCost.toLocaleString()}円</span>
              </p>
              <Button
                  onClick={onBuyAll}
                  disabled={!canAffordAll || remainingSellers.length === 0}
                  className="w-full bg-green-600 hover:bg-green-500"
              >
                  残りをすべて買う
              </Button>
            </div>
          )}

          <Button 
            onClick={onClose} 
            className="w-full mt-2 bg-gray-600 hover:bg-gray-500"
            data-tutorial-id="close-seller-modal"
          >
            閉じる
          </Button>
        </div>
      </Modal>

      {hoveredSeed && tooltipPosition && (
        <div
          className="fixed bg-slate-900 border border-slate-600 rounded-lg p-3 shadow-lg text-sm z-[1001] pointer-events-none transition-opacity duration-200 animate-fade-in-fast"
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
    </>
  );
};

export default SeedSellerModal;