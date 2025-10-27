
import React from 'react';
import { DailySummary } from '../types';
import Modal from './Modal';
import { Button } from './Button';
import { SummaryUpIcon, SummaryDownIcon, CoinIcon, LeafIcon } from './Icons';

interface DailySummaryModalProps {
  summary: DailySummary;
  onClose: () => void;
}

const DailySummaryModal: React.FC<DailySummaryModalProps> = ({ summary, onClose }) => {
  const { co2Increased, co2Decreased, moneySpent, moneyEarned, eventMessage, co2Surge, co2BonusReduction, weatherEventMessage } = summary;

  const netCo2Change = (co2Increased + (co2Surge || 0)) - (co2Decreased + (co2BonusReduction || 0));


  return (
    <Modal title="一日のまとめ" onClose={() => {}}>
      <div className="p-6 space-y-4 text-slate-300">
        {eventMessage && co2Surge && (
          <div className="bg-red-900 bg-opacity-50 border border-red-700 p-3 rounded-lg text-center">
            <p className="font-bold text-red-300">緊急ニュース！</p>
            <p>{eventMessage}</p>
          </div>
        )}
        
        {eventMessage && co2BonusReduction && (
            <div className="bg-green-900 bg-opacity-50 border border-green-600 p-3 rounded-lg text-center">
                <p className="font-bold text-green-300">朗報！</p>
                <p>{eventMessage}</p>
            </div>
        )}

        {weatherEventMessage && (
          <div className="bg-blue-900 bg-opacity-50 border border-blue-700 p-3 rounded-lg text-center">
            <p className="font-bold text-blue-300">天気の影響</p>
            <p>{weatherEventMessage}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* CO2 Section */}
          <div className="bg-slate-700 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><LeafIcon />二酸化炭素(CO2)</h3>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-red-400">
                <SummaryUpIcon />
                <span>環境悪化:</span>
              </div>
              <span className="font-bold">{co2Increased}%</span>
            </div>
            {co2Surge && (
                <div className="flex justify-between items-center text-red-400">
                    <div className="flex items-center gap-2 pl-6">
                        <span>イベント:</span>
                    </div>
                    <span className="font-bold">+{co2Surge}%</span>
                </div>
            )}
             <div className="flex justify-between items-center mt-1">
              <div className="flex items-center gap-2 text-green-400">
                <SummaryDownIcon />
                <span>植物効果:</span>
              </div>
              <span className="font-bold">{co2Decreased}%</span>
            </div>
            {co2BonusReduction && (
                <div className="flex justify-between items-center text-green-400">
                    <div className="flex items-center gap-2 pl-6">
                        <span>イベント:</span>
                    </div>
                    <span className="font-bold">-{co2BonusReduction}%</span>
                </div>
            )}
            <div className="border-t border-slate-600 my-2"></div>
            <div className="flex justify-between items-center font-bold text-xl">
                <span>結果:</span>
                <span className={netCo2Change > 0 ? 'text-red-400' : 'text-green-400'}>
                    {netCo2Change >= 0 ? '+' : ''}{netCo2Change}%
                </span>
            </div>
          </div>

          {/* Money Section */}
          <div className="bg-slate-700 p-4 rounded-lg">
             <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><CoinIcon />お金</h3>
             <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-red-400">
                <SummaryUpIcon />
                <span>支出:</span>
              </div>
              <span className="font-bold">¥{moneySpent.toLocaleString()}</span>
            </div>
             <div className="flex justify-between items-center mt-1">
              <div className="flex items-center gap-2 text-green-400">
                <SummaryDownIcon />
                <span>収入:</span>
              </div>
              <span className="font-bold">¥{moneyEarned.toLocaleString()}</span>
            </div>
            <div className="border-t border-slate-600 my-2"></div>
            <div className="flex justify-between items-center font-bold text-xl">
                <span>収支:</span>
                <span className={moneyEarned - moneySpent < 0 ? 'text-red-400' : 'text-green-400'}>
                   {moneyEarned - moneySpent >= 0 ? '+' : ''}¥{(moneyEarned - moneySpent).toLocaleString()}
                </span>
            </div>
          </div>
        </div>

        <Button 
          onClick={onClose} 
          className="w-full mt-4 bg-green-600 hover:bg-green-500"
          data-tutorial-id="close-summary-button"
        >
          次の日へ進む
        </Button>
      </div>
    </Modal>
  );
};

export default DailySummaryModal;
