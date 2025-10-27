import React, { useState, useMemo } from 'react';
import { GameState, PlantType } from '../types';
import { PLANT_DATA, GENE_COLORS, GENE_COMBINATIONS } from '../constants';
import Modal from './Modal';
import { Button } from './Button';
import { GeneIcon, SeedIcon } from './Icons';

interface BreedingLabModalProps {
  gameState: GameState;
  onClose: () => void;
  onExtractGene: (plotId: number) => void;
  onCombineGenes: (gene1: PlantType, gene2: PlantType) => void;
}

const BreedingLabModal: React.FC<BreedingLabModalProps> = ({ gameState, onClose, onExtractGene, onCombineGenes }) => {
  const [selectedGenes, setSelectedGenes] = useState<[PlantType | null, PlantType | null]>([null, null]);
  const [hoveredSeed, setHoveredSeed] = useState<PlantType | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);

  const grownPlants = useMemo(() => {
    return gameState.plots.filter(p => p.plant?.isGrown && PLANT_DATA[p.plant.type].geneType);
  }, [gameState.plots]);

  const ownedGenes = useMemo(() => {
    return (Object.keys(gameState.genes) as PlantType[]).filter(g => gameState.genes[g] > 0);
  }, [gameState.genes]);

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

  const handleSelectGene = (gene: PlantType) => {
    const availableCount = gameState.genes[gene] - (selectedGenes[0] === gene ? 1 : 0) - (selectedGenes[1] === gene ? 1 : 0);
    if (availableCount <= 0) return;

    if (selectedGenes[0] === null) {
      setSelectedGenes([gene, null]);
    } else if (selectedGenes[1] === null) {
      setSelectedGenes([selectedGenes[0], gene]);
    }
  };

  const handleUnselectGene = (index: number) => {
    const newSelected = [...selectedGenes] as [PlantType | null, PlantType | null];
    newSelected[index] = null;
    setSelectedGenes(newSelected);
  };
  
  const combinationResult = useMemo((): PlantType | null => {
    const [gene1, gene2] = selectedGenes;
    if (!gene1 || !gene2) return null;
    const recipe = GENE_COMBINATIONS[gene1]?.[gene2];
    return recipe?.result || null;
  }, [selectedGenes]);

  const handleCombine = () => {
    if (combinationResult && selectedGenes[0] && selectedGenes[1]) {
      onCombineGenes(selectedGenes[0], selectedGenes[1]);
      setSelectedGenes([null, null]);
    }
  };

  const renderSlot = (gene: PlantType | null, placeholder: string) => {
    if (!gene) return <span className="text-slate-500 text-sm">{placeholder}</span>;
    const plantInfo = PLANT_DATA[gene];
    const geneType = plantInfo.geneType;
    if (!geneType) return null;

    return (
        <div className={`w-full h-full rounded-md ${GENE_COLORS[geneType]} flex flex-col items-center justify-center p-1 text-center`}>
            <span className="text-3xl" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>{plantInfo.emoji}</span>
            <span className="text-[10px] font-bold text-black leading-tight" style={{ textShadow: '1px 1px 1px rgba(255,255,255,0.7)' }}>{gene}</span>
        </div>
    );
  };

  return (
    <>
      <Modal title="品種改良ラボ" onClose={onClose}>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[80vh] overflow-y-auto">
          {/* Gene Extractor */}
          <div className="bg-slate-900 p-4 rounded-xl space-y-3">
            <h3 className="text-xl font-bold text-cyan-300 flex items-center gap-2"><GeneIcon />遺伝子を抽出する</h3>
            <p className="text-sm text-slate-400">育った植物から遺伝子を取り出せます。抽出すると植物はなくなります。</p>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
              {grownPlants.length > 0 ? (
                grownPlants.map(plot => (
                  <div key={plot.id} className="bg-slate-700 p-2 rounded-lg flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{PLANT_DATA[plot.plant!.type].emoji}</span>
                      <span className="font-medium">{plot.plant!.type}</span>
                    </div>
                    <Button onClick={() => onExtractGene(plot.id)} className="text-sm px-3 py-1 bg-teal-600 hover:bg-teal-500">抽出</Button>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-center py-4">抽出できる植物がありません。</p>
              )}
            </div>
          </div>

          {/* Gene Combiner */}
          <div className="bg-slate-900 p-4 rounded-xl space-y-3">
              <h3 className="text-xl font-bold text-cyan-300 flex items-center gap-2"><SeedIcon />遺伝子を合成する</h3>
              
              {/* Your Genes */}
              <div>
                  <p className="text-sm text-slate-400 mb-2">あなたの遺伝子:</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {ownedGenes.length > 0 ? ownedGenes.map(gene => {
                    const plantInfo = PLANT_DATA[gene];
                    const geneType = plantInfo.geneType;
                    if (!geneType) return null;
                    
                    return (
                      <div 
                        key={gene} 
                        onClick={() => handleSelectGene(gene)} 
                        className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 cursor-pointer flex items-center justify-between gap-2 transition-transform hover:scale-105 w-full"
                        onMouseEnter={(e) => handleMouseEnter(e, gene)}
                        onMouseLeave={handleMouseLeave}
                        onMouseMove={handleMouseMove}
                      >
                          <div className="flex items-center gap-2">
                              <span className="text-2xl">{plantInfo.emoji}</span>
                              <div>
                                  <span className="font-bold text-sm">{gene}の遺伝子</span>
                                  <div className="flex items-center gap-1">
                                      <div className={`w-3 h-3 rounded-full ${GENE_COLORS[geneType]}`}></div>
                                      <span className="text-xs text-slate-400">{geneType}</span>
                                  </div>
                              </div>
                          </div>
                          <span className="text-sm bg-slate-800 px-2 py-0.5 rounded-full font-mono">{gameState.genes[gene]}</span>
                      </div>
                    )
                  }) : <p className="text-slate-500 text-sm text-center py-4">まだ遺伝子がありません。</p>}
                  </div>
              </div>

              {/* Combination Slots */}
              <div className="space-y-2">
                  <p className="text-sm text-slate-400">合成スロット:</p>
                  <div className="flex items-center justify-center gap-4 bg-slate-800 p-4 rounded-lg">
                      <div className="flex flex-col items-center gap-2">
                          <p className="text-sm font-bold text-slate-400">主(ベース)</p>
                          <div onClick={() => handleUnselectGene(0)} className="w-20 h-20 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-red-500">
                              {renderSlot(selectedGenes[0], '１')}
                          </div>
                      </div>
                      <span className="text-3xl font-bold text-slate-500 pt-8">+</span>
                      <div className="flex flex-col items-center gap-2">
                          <p className="text-sm font-bold text-slate-400">副(加える)</p>
                          <div onClick={() => handleUnselectGene(1)} className="w-20 h-20 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-red-500">
                              {renderSlot(selectedGenes[1], '２')}
                          </div>
                      </div>
                  </div>
              </div>

              {/* Result */}
              <div className="text-center bg-slate-800 p-4 rounded-lg h-28 flex flex-col items-center justify-center">
                  <p className="text-sm text-slate-400 mb-1">結果:</p>
                  {combinationResult ? (
                      <div className="flex items-center gap-2 text-lg">
                          <span className="text-3xl">{PLANT_DATA[combinationResult].emoji}</span>
                          <span className="font-bold">{combinationResult}の種</span>
                      </div>
                  ) : <p className="text-slate-500">?</p>}
              </div>

              <Button onClick={handleCombine} disabled={!combinationResult} className="w-full bg-green-600 hover:bg-green-500">合成する</Button>
          </div>
        </div>
        <div className="p-4 border-t border-slate-700">
          <Button onClick={onClose} className="w-full bg-gray-600 hover:bg-gray-500">閉じる</Button>
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

export default BreedingLabModal;