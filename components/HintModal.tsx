import React, { useState } from 'react';
import Modal from './Modal';
import { Button } from './Button';
import { PLANT_DATA } from '../constants';
import { LockIcon } from './Icons';

interface HintModalProps {
  playerLevel: number;
  onClose: () => void;
}

type Tab = 'basic' | 'plants';

const HintModal: React.FC<HintModalProps> = ({ playerLevel, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('basic');

  const renderBasicHelp = () => (
    <div className="space-y-4 text-slate-300 p-2">
      <div>
        <h4 className="font-bold text-cyan-300 text-lg mb-2">ゲームの目的</h4>
        <p>増え続けるCO2濃度を100%未満に保ちながら、植物を育てて地球を救うことが目的です。</p>
      </div>
      <div>
        <h4 className="font-bold text-cyan-300 text-lg mb-2">基本的な流れ</h4>
        <ol className="list-decimal list-inside space-y-2">
          <li><strong>種の購入:</strong> 毎朝訪れる商人から種を買います。</li>
          <li><strong>種を植える:</strong> インベントリから種を選び、空いている畑をクリックして植えます。</li>
          <li><strong>水やり:</strong> 植えた植物には水が必要です。水やりボタンでお金を払って水をあげます。</li>
          <li><strong>成長:</strong> 「次の日へ」ボタンで時間を進めると、植物が成長します。</li>
          <li><strong>収穫と売却:</strong> 育った植物は、数日おきに訪れる買い手に売ってお金にできます。</li>
          <li><strong>CO2削減:</strong> 植物が完全に育つと、そのタイミングでCO2を削減してくれます。</li>
        </ol>
      </div>
    </div>
  );

  const renderPlantGuide = () => {
    const allPlants = Object.values(PLANT_DATA);
    return (
      <div className="space-y-3">
        {allPlants.map(plant => {
          const isUnlocked = !plant.unlockLevel || playerLevel >= plant.unlockLevel;
          return (
            <div key={plant.name} className={`p-3 rounded-lg transition-all duration-300 ${isUnlocked ? 'bg-slate-700' : 'bg-slate-800 opacity-60'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl mt-1">{isUnlocked ? plant.emoji : '❓'}</span>
                  <div>
                    <h4 className="font-bold">{isUnlocked ? plant.name : '？？？'}</h4>
                    {!isUnlocked && <p className="text-xs text-slate-400 flex items-center gap-1"><LockIcon className="w-3 h-3"/> Lv.{plant.unlockLevel}で解放</p>}
                  </div>
                </div>
              </div>
              {isUnlocked && (
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm pl-11 text-slate-300">
                  <p>CO2削減: <span className="font-bold text-green-400">{plant.co2Reduction}%</span></p>
                  <p>売却価格: <span className="font-bold text-yellow-300">{plant.sellPrice}円</span></p>
                  <p>成長日数: <span className="font-bold text-white">{plant.growthTime}日</span></p>
                  <p>種価格: <span className="font-bold text-yellow-300">{plant.seedPrice ? `${plant.seedPrice[0]}~${plant.seedPrice[1]}円` : '購入不可'}</span></p>
                  <p>水やり費: <span className="font-bold text-blue-300">{plant.waterCost}円</span></p>
                  <p>獲得XP: <span className="font-bold text-purple-400">{plant.xp}</span></p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Modal title="ヘルプ" onClose={onClose}>
      <div className="p-4 max-h-[70vh] flex flex-col">
        <div className="flex border-b border-slate-700 mb-4 shrink-0">
          <button onClick={() => setActiveTab('basic')} className={`px-4 py-2 font-bold transition-colors ${activeTab === 'basic' ? 'text-cyan-300 border-b-2 border-cyan-300' : 'text-slate-400 hover:text-white'}`}>基本操作</button>
          <button onClick={() => setActiveTab('plants')} className={`px-4 py-2 font-bold transition-colors ${activeTab === 'plants' ? 'text-cyan-300 border-b-2 border-cyan-300' : 'text-slate-400 hover:text-white'}`}>植物図鑑</button>
        </div>
        <div className="overflow-y-auto flex-grow pr-2">
          {activeTab === 'basic' ? renderBasicHelp() : renderPlantGuide()}
        </div>
        <Button onClick={onClose} className="w-full mt-4 bg-gray-600 hover:bg-gray-500 shrink-0">閉じる</Button>
      </div>
    </Modal>
  );
};

export default HintModal;
