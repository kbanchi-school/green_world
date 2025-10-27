
import React from 'react';
import { PlantType, MissionProgress } from '../types';
import Missions from './Missions';
import Modal from './Modal';
import { Button } from './Button';

interface MissionModalProps {
  plantStats: Record<PlantType, number>;
  missionProgress: MissionProgress;
  onClose: () => void;
}

const MissionModal: React.FC<MissionModalProps> = ({ plantStats, missionProgress, onClose }) => {
  return (
    <Modal title="ミッション" onClose={onClose} contentDataTutorialId="mission-modal-content">
      <div className="p-4 max-h-[70vh] overflow-y-auto">
        <Missions plantStats={plantStats} missionProgress={missionProgress} />
        <Button 
            onClick={onClose} 
            className="w-full mt-4 bg-gray-600 hover:bg-gray-500"
        >
            閉じる
        </Button>
      </div>
    </Modal>
  );
};

export default MissionModal;
