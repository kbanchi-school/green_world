
import React from 'react';
import { PlantType, MissionProgress } from '../types';
import { MISSION_DATA } from '../constants';
import { CheckIcon, MissionIcon } from './Icons';

interface MissionsProps {
  plantStats: Record<PlantType, number>;
  missionProgress: MissionProgress;
}

const Missions: React.FC<MissionsProps> = ({ plantStats, missionProgress }) => {
  return (
    <div className="bg-black bg-opacity-30 p-4 rounded-2xl shadow-lg border border-slate-700">
      <h3 className="text-lg font-bold mb-3 text-cyan-300 flex items-center gap-2"><MissionIcon />ミッション</h3>
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {MISSION_DATA.map(mission => {
          const progress = plantStats[mission.plantType] || 0;
          const isCompleted = missionProgress[mission.id]?.completed;
          const progressPercent = Math.min((progress / mission.targetCount) * 100, 100);

          return (
            <div key={mission.id} className={`p-3 rounded-lg transition-colors duration-500 ${isCompleted ? 'bg-green-900 bg-opacity-50' : 'bg-slate-700'}`}>
              <div className="flex justify-between items-center mb-1">
                <p className="font-bold text-sm">{mission.title}</p>
                {isCompleted ? (
                   <div className="flex items-center gap-1 text-green-400 text-sm font-bold">
                     <CheckIcon className="w-5 h-5" />
                     <span>達成！</span>
                   </div>
                ) : (
                  <p className="font-bold text-yellow-300 text-sm">¥{mission.reward.toLocaleString()}</p>
                )}
              </div>
              {!isCompleted && (
                <div>
                  <div className="w-full bg-slate-800 rounded-full h-2.5">
                    <div className="bg-cyan-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                  </div>
                  <p className="text-right text-xs text-slate-400 mt-1">{progress} / {mission.targetCount}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Missions;
