import React from 'react';
import Modal from './Modal';
import { Button } from './Button';
import { CoinIcon } from './Icons';

interface PlotPurchaseModalProps {
  cost: number;
  onConfirm: () => void;
  onCancel: () => void;
}

const PlotPurchaseModal: React.FC<PlotPurchaseModalProps> = ({ cost, onConfirm, onCancel }) => {
  return (
    <Modal title="新しい畑の購入" onClose={onCancel}>
      <div className="p-6 text-center text-slate-300 space-y-4">
        <p className="text-lg">
          新しい畑をアンロックしますか？
        </p>
        <div className="bg-slate-700 p-4 rounded-lg inline-flex items-center justify-center gap-3 text-2xl font-bold">
            <CoinIcon className="w-8 h-8 text-yellow-300" />
            <span className="text-yellow-300">{cost.toLocaleString()}円</span>
        </div>
        <div className="flex justify-center gap-4 mt-4">
            <Button onClick={onCancel} className="bg-gray-600 hover:bg-gray-500">
                やめる
            </Button>
            <Button onClick={onConfirm} className="bg-green-600 hover:bg-green-500">
                購入する
            </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PlotPurchaseModal;