


import React, { useState, useEffect, useCallback } from 'react';
import { PlantType, Plot, Seller, GamePhase, DailySummary, GameState, SaveData, GeneType, WeatherType } from './types';
import { PLANT_DATA, INITIAL_MONEY, INITIAL_CO2, INITIAL_PLOT_COUNT, MIN_DAILY_CO2_INCREASE, MAX_DAILY_CO2_INCREASE, MAX_CO2, BUYER_VISIT_FREQUENCY, XP_PER_LEVEL, MISSION_DATA, PLOT_UNLOCK_LEVEL, PLOT_BASE_COST, PLOT_COST_INCREMENT, BREEDING_UNLOCK_LEVEL, GENE_COMBINATIONS, WEATHER_DEFINITIONS, SPRINKLER_UNLOCK_LEVEL, SPRINKLER_COST, SPRINKLER_MAINTENANCE_COST } from './constants';
import Header from './components/Header';
import Garden from './components/Garden';
import Inventory from './components/Inventory';
import SeedSellerModal from './components/SeedSellerModal';
import PlantBuyerModal from './components/PlantBuyerModal';
import DailySummaryModal from './components/DailySummaryModal';
import WelcomeScreen from './components/WelcomeScreen';
import MissionModal from './components/MissionModal';
import PlotPurchaseModal from './components/PlotPurchaseModal';
import BreedingLabModal from './components/BreedingLabModal';
import Tutorial from './components/Tutorial';
import { tutorialSteps } from './tutorialContent';
import { Button } from './components/Button';
import { PlantIcon, MissionIcon, GeneIcon, WaterDropsIcon, QuestionMarkCircleIcon, CoinIcon, SprinklerIcon, LockIcon } from './components/Icons';
import Modal from './components/Modal';
import { audioManager } from './components/audio';
import HintModal from './components/HintModal';

const SAVE_KEY = 'greenWorldSave';
const TUTORIAL_COMPLETED_KEY = 'greenWorldTutorialCompleted';

const getInitialGameState = (): GameState => ({
  day: 1,
  money: INITIAL_MONEY,
  co2Level: INITIAL_CO2,
  level: 1,
  xp: 0,
  seeds: Object.values(PlantType).reduce((acc, type) => ({ ...acc, [type]: 0 }), {} as Record<PlantType, number>),
  plots: Array.from({ length: INITIAL_PLOT_COUNT }, (_, i) => ({ id: i, plant: null })),
  moneySpentToday: 0,
  moneyEarnedToday: 0,
  plantStats: Object.values(PlantType).reduce((acc, type) => ({ ...acc, [type]: 0 }), {} as Record<PlantType, number>),
  missionProgress: {},
  genes: Object.values(PlantType).reduce((acc, type) => ({ ...acc, [type]: 0 }), {} as Record<PlantType, number>),
  weather: WeatherType.Sunny,
  hasSprinkler: false,
});


interface SprinklerModalProps {
  onClose: () => void;
  onPurchase: () => void;
  hasSprinkler: boolean;
  playerMoney: number;
  playerLevel: number;
}

const SprinklerModal: React.FC<SprinklerModalProps> = ({ onClose, onPurchase, hasSprinkler, playerMoney, playerLevel }) => {
  const canAfford = playerMoney >= SPRINKLER_COST;
  const isUnlocked = playerLevel >= SPRINKLER_UNLOCK_LEVEL;

  return (
    <Modal title="自動水やりスプリンクラー" onClose={onClose}>
      <div className="p-6 text-slate-300 space-y-4 text-center">
        <SprinklerIcon className="w-24 h-24 mx-auto text-cyan-400" />
        {hasSprinkler ? (
          <div>
            <h3 className="text-xl font-bold text-green-400 mb-2">スプリンクラーは正常に稼働中です！</h3>
            <p>毎日自動で全ての植物に水やりを行います。</p>
            <div className="bg-slate-700 p-3 rounded-lg mt-4">
              <p>毎日の維持費: <span className="font-bold text-yellow-300">{SPRINKLER_MAINTENANCE_COST}円</span></p>
            </div>
            <Button onClick={onClose} className="w-full mt-6 bg-gray-600 hover:bg-gray-500">
              閉じる
            </Button>
          </div>
        ) : (
          <div>
            <h3 className="text-xl font-bold mb-2">スプリンクラーを設置しませんか？</h3>
            <p>毎日自動で水やりをしてくれる便利な機械です。水やりの手間と費用を節約できます！</p>
            
            {!isUnlocked ? (
                <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg mt-4 text-center">
                    <p className="font-bold text-yellow-400 flex items-center justify-center gap-2">
                        <LockIcon />
                        レベル {SPRINKLER_UNLOCK_LEVEL} で解放されます
                    </p>
                     <Button onClick={onClose} className="w-full mt-6 bg-gray-600 hover:bg-gray-500">
                      閉じる
                    </Button>
                </div>
            ) : (
                <>
                    <div className="bg-slate-700 p-4 rounded-lg my-4 space-y-2">
                      <div className="flex justify-between items-center text-lg">
                          <span>設置費用:</span>
                          <span className="font-bold text-yellow-300 flex items-center gap-1"><CoinIcon className="w-5 h-5"/>{SPRINKLER_COST.toLocaleString()}円</span>
                      </div>
                      <div className="flex justify-between items-center text-lg">
                          <span>毎日の維持費:</span>
                          <span className="font-bold text-yellow-300 flex items-center gap-1"><CoinIcon className="w-5 h-5"/>{SPRINKLER_MAINTENANCE_COST.toLocaleString()}円</span>
                      </div>
                    </div>
                    <div className="flex justify-center gap-4 mt-6">
                      <Button onClick={onClose} className="bg-gray-600 hover:bg-gray-500">
                        やめる
                      </Button>
                      <Button onClick={onPurchase} disabled={!canAfford} className="bg-green-600 hover:bg-green-500">
                        {canAfford ? '設置する' : 'お金が足りません'}
                      </Button>
                    </div>
                </>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};


const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(getInitialGameState());

  const [phase, setPhase] = useState<GamePhase>('WELCOME');
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [selectedSeed, setSelectedSeed] = useState<PlantType | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [co2SurgeTrigger, setCo2SurgeTrigger] = useState(0);
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  const [saveDataExists, setSaveDataExists] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isMissionsModalOpen, setIsMissionsModalOpen] = useState(false);
  const [isBuyPlotModalOpen, setIsBuyPlotModalOpen] = useState(false);
  const [isBreedingLabOpen, setIsBreedingLabOpen] = useState(false);
  const [isHintModalOpen, setIsHintModalOpen] = useState(false);
  const [isWatering, setIsWatering] = useState(false);
  const [tutorialState, setTutorialState] = useState({ isActive: false, step: 0 });
  const [isRevisitingSellers, setIsRevisitingSellers] = useState(false);
  const [isRevisitingBuyer, setIsRevisitingBuyer] = useState(false);
  const [isCo2Critical, setIsCo2Critical] = useState(false);
  const [isSprinklerModalOpen, setIsSprinklerModalOpen] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem(SAVE_KEY);
    if (savedData) {
      setSaveDataExists(true);
    }
  }, []);
  
  const advanceTutorial = () => {
    setTutorialState(prev => {
      if (prev.step >= tutorialSteps.length - 1) {
        endTutorial();
        return { ...prev, isActive: false };
      }
      return { ...prev, step: prev.step + 1 };
    });
  };

  const endTutorial = () => {
    localStorage.setItem(TUTORIAL_COMPLETED_KEY, 'true');
    setTutorialState({ isActive: false, step: 0 });
    if(phase === 'BUYER_VISIT' && !gameState.plots.some(p => p.plant?.isGrown)) {
        setPhase('PLANTING');
    }
  };


  const addMessage = (message: string) => {
    setMessages(prev => [message, ...prev.slice(0, 4)]);
  };

  const getRandomInt = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const generateSellers = useCallback((level: number) => {
    const newSellers: Seller[] = [];
    
    const availablePlantTypes = Object.values(PlantType).filter(type => {
        const info = PLANT_DATA[type];
        return info.seedPrice !== null && (!info.unlockLevel || level >= info.unlockLevel);
    });

    const totalChance = availablePlantTypes.reduce((sum, type) => sum + PLANT_DATA[type].sellerChance, 0);

    for (let i = 0; i < 3; i++) {
        const rand = Math.random() * totalChance;
        let cumulativeChance = 0;
        let chosenSeed: PlantType = availablePlantTypes[0];

        for (const type of availablePlantTypes) {
            cumulativeChance += PLANT_DATA[type].sellerChance;
            if (rand < cumulativeChance) {
                chosenSeed = type;
                break;
            }
        }
        
        const [minPrice, maxPrice] = PLANT_DATA[chosenSeed].seedPrice!;
        newSellers.push({
            id: i,
            seedType: chosenSeed,
            price: getRandomInt(minPrice, maxPrice),
            sold: false,
        });
    }
    setSellers(newSellers);
  }, []);
  
  const startGame = useCallback((startFn: () => void) => {
    if (!audioManager.isInitialized()) {
        audioManager.init();
    }
    audioManager.playBGM();
    startFn();
  }, []);
  
  const handleStartNewGame = useCallback(() => {
    const tutorialCompleted = localStorage.getItem(TUTORIAL_COMPLETED_KEY);
    startNewGame(!tutorialCompleted);
  }, []);

  const startNewGame = useCallback((isTutorial = false) => {
    localStorage.removeItem(SAVE_KEY);
    setSaveDataExists(false);
    const initialGameState = getInitialGameState();
    setGameState(initialGameState);
    setMessages([]);
    setPhase('SELLER_VISIT');
    if (isTutorial) {
        setTutorialState({ isActive: true, step: 0 });
        const tutorialSellers: Seller[] = [
            { id: 0, seedType: PlantType.MorningGlory, price: 300, sold: false },
            { id: 1, seedType: PlantType.Tulip, price: 500, sold: false },
            { id: 2, seedType: PlantType.Violet, price: 800, sold: false },
        ];
        setSellers(tutorialSellers);
    } else {
        generateSellers(initialGameState.level);
    }
  }, [generateSellers]);

  const loadGame = useCallback(() => {
    const savedDataString = localStorage.getItem(SAVE_KEY);
    if (savedDataString) {
      try {
        const savedData: SaveData = JSON.parse(savedDataString);
        
        // --- MIGRATION FOR PurpleTulip name change ---
        const oldPurpleTulipName = '紫のチューリップ';
        const newPurpleTulipName = PlantType.PurpleTulip;

        // FIX: Cast to string to allow comparison with old data values not present in the current enum.
        if ((newPurpleTulipName as string) !== oldPurpleTulipName) {
            const migrateRecord = (record: Record<string, number> | undefined) => {
                if (record && record[oldPurpleTulipName]) {
                    record[newPurpleTulipName] = (record[newPurpleTulipName] || 0) + record[oldPurpleTulipName];
                    delete record[oldPurpleTulipName];
                }
            };
            
            migrateRecord(savedData.gameState.seeds);
            migrateRecord(savedData.gameState.plantStats);
            migrateRecord(savedData.gameState.genes);

            if (savedData.gameState.plots) {
                savedData.gameState.plots.forEach(plot => {
                    // FIX: Cast to string to allow comparison with old data values not present in the current enum.
                    if (plot.plant && (plot.plant.type as string) === oldPurpleTulipName) {
                        plot.plant.type = newPurpleTulipName;
                    }
                });
            }

            if (savedData.sellers) {
                savedData.sellers.forEach(seller => {
                    // FIX: Cast to string to allow comparison with old data values not present in the current enum.
                    if ((seller.seedType as string) === oldPurpleTulipName) {
                        seller.seedType = newPurpleTulipName;
                    }
                });
            }
        }
        // --- END MIGRATION ---

        const initialGameState = getInitialGameState();

        const loadedGameState: GameState = {
          ...initialGameState,
          ...savedData.gameState,
          seeds: { ...initialGameState.seeds, ...savedData.gameState.seeds },
          plantStats: { ...initialGameState.plantStats, ...(savedData.gameState.plantStats || {}) },
          missionProgress: { ...initialGameState.missionProgress, ...(savedData.gameState.missionProgress || {}) },
          weather: savedData.gameState.weather || WeatherType.Sunny,
          hasSprinkler: savedData.gameState.hasSprinkler || false,
        };

        // Post-load check for gene format to handle old saves
        const savedGenes = loadedGameState.genes || {};
        const isOldGeneFormat = Object.keys(savedGenes).some(key => Object.values(GeneType).includes(key as GeneType));
        if (isOldGeneFormat) {
          loadedGameState.genes = initialGameState.genes; // Reset if old format.
        } else {
          // If new format, ensure all plant types are present in the state
          loadedGameState.genes = { ...initialGameState.genes, ...savedGenes };
        }
        
        if (savedData.gameState.plots) {
            loadedGameState.plots = savedData.gameState.plots.map((p: any) => ({
                id: p.id,
                plant: p.plant ? { ...p.plant, isWatered: p.plant.isWatered || false } : null,
            }));
        } else {
            loadedGameState.plots = initialGameState.plots;
        }
        
        setGameState(loadedGameState);
        setPhase(savedData.phase);
        setSellers(savedData.sellers);
        setMessages(savedData.messages);
      } catch (error) {
        console.error("Failed to load save data:", error);
        startGame(() => startNewGame(false));
      }
    }
  }, [startGame, startNewGame]);

  const handleSaveAndQuit = () => {
    audioManager.stopBGM();
    const dataToSave: SaveData = {
      gameState,
      phase,
      sellers,
      messages,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(dataToSave));
    setSaveDataExists(true);
    setPhase('WELCOME');
  };
  
  const handleToggleMute = useCallback(() => {
    audioManager.playClickSound();
    setIsMuted(prev => {
        const newMutedState = !prev;
        audioManager.toggleMute(newMutedState);
        return newMutedState;
    });
  }, []);

  const handleNextDay = () => {
    if (tutorialState.isActive && tutorialState.step === 8) {
        advanceTutorial();
    }

    let co2Increase = getRandomInt(MIN_DAILY_CO2_INCREASE, MAX_DAILY_CO2_INCREASE);
    let eventMessage: string | null = null;
    let co2Surge: number | undefined;
    let co2BonusReduction: number | undefined;

    const co2SurgeChance = 0.20;
    const CO2_SURGE_AMOUNT = 10;
    const surgeEvents = [
        "🏭 近くの工場がフル稼働し、CO2濃度が急上昇しました！",
        "🚧 大規模な都市開発工事が行われ、CO2濃度が急上昇しました！",
        "🚗 世界的な交通渋滞が発生し、CO2濃度が急上昇しました！",
        "🔥 遠くで山火事があったようで、空気が少し濁っています…",
    ];

    const CO2_REDUCTION_EVENT_CHANCE = 0.10; // 10%
    const reductionEvents = [
        "🌳 大規模な植林活動が成功し、CO2濃度が低下しました！",
        "💡 クリーンエネルギー技術のブレークスルーが発表されました！",
        "🌍 世界的な環境保護キャンペーンが効果を上げています！",
        "💨 革新的なCO2回収技術が実用化されたようです。",
    ];

    if (Math.random() < CO2_REDUCTION_EVENT_CHANCE && !tutorialState.isActive) {
        co2BonusReduction = getRandomInt(5, 10);
        eventMessage = reductionEvents[Math.floor(Math.random() * reductionEvents.length)];
    } else if (Math.random() < co2SurgeChance && !tutorialState.isActive) {
        co2Surge = CO2_SURGE_AMOUNT;
        eventMessage = surgeEvents[Math.floor(Math.random() * surgeEvents.length)];
    }

    let co2Reduction = 0;
    let weatherEventMessages: string[] = [];

    gameState.plots.forEach(plot => {
      if (plot.plant && !plot.plant.isGrown && plot.plant.isWatered && plot.plant.growthStage === 1) {
        let willGrow = true;
        if (gameState.weather === WeatherType.Cloudy && Math.random() < 0.5) {
          weatherEventMessages.push(`☁️ ${plot.plant.type}の成長が遅れた`);
          willGrow = false;
        }
        if (gameState.weather === WeatherType.Stormy && Math.random() < 0.3) {
          weatherEventMessages.push(`⛈️ ${plot.plant.type}が嵐で被害を受けた`);
          willGrow = false;
        }
        if(willGrow) {
          const plantInfo = PLANT_DATA[plot.plant.type];
          co2Reduction += plantInfo.co2Reduction;
        }
      }
    });

    setDailySummary({
        co2Increased: co2Increase,
        co2Decreased: co2Reduction,
        moneySpent: gameState.moneySpentToday,
        moneyEarned: gameState.moneyEarnedToday,
        eventMessage: eventMessage,
        co2Surge: co2Surge,
        co2BonusReduction: co2BonusReduction,
        weatherEventMessage: weatherEventMessages.length > 0 ? weatherEventMessages.join('。') + '。' : null,
    });

    setPhase('DAILY_SUMMARY');
  };

  const advanceToNextDay = () => {
    if (!dailySummary) return;
    
    if (tutorialState.isActive && tutorialState.step === 9) {
        advanceTutorial();
    }

    const isTutorialDay2Coming = tutorialState.isActive && gameState.day === 1;

    let newWeather: WeatherType = WeatherType.Sunny;

    if (!tutorialState.isActive) {
      const totalChance = WEATHER_DEFINITIONS.reduce((sum, weather) => sum + weather.chance, 0);
      const rand = Math.random() * totalChance;
      let cumulativeChance = 0;
      for (const weather of WEATHER_DEFINITIONS) {
          cumulativeChance += weather.chance;
          if (rand < cumulativeChance) {
              newWeather = weather.type;
              break;
          }
      }
    }

    const weatherInfo = WEATHER_DEFINITIONS.find(w => w.type === newWeather)!;
    
    setGameState(prev => {
        const autoWateredByRain = newWeather === WeatherType.Rainy || newWeather === WeatherType.Stormy;
        let newMoney = prev.money;
        let sprinklerDidWork = false;
        let maintenanceCostPaid = 0;

        if (prev.hasSprinkler) {
            if (newMoney >= SPRINKLER_MAINTENANCE_COST) {
                newMoney -= SPRINKLER_MAINTENANCE_COST;
                maintenanceCostPaid = SPRINKLER_MAINTENANCE_COST;
                sprinklerDidWork = true;
            } else {
                addMessage("⚠️ お金が足りず、スプリンクラーの維持費を払えませんでした。");
            }
        }
        
        const autoWatered = autoWateredByRain || sprinklerDidWork;

        let newCo2 = prev.co2Level + dailySummary.co2Increased - dailySummary.co2Decreased;
        if (dailySummary.co2Surge) {
          newCo2 += dailySummary.co2Surge;
        }
        if (dailySummary.co2BonusReduction) {
          newCo2 -= dailySummary.co2BonusReduction;
        }

        const thresholds = [
            { value: 90, message: "🚨最終警告：CO2濃度が90%を超えました！地球が悲鳴を上げています！" },
            { value: 80, message: "🚨緊急事態：CO2濃度が80%に達しました！破局が迫っています！" },
            { value: 60, message: "⚠️危険：CO2濃度が60%に達しました！地球の未来が危うい！" },
            { value: 40, message: "⚠️警告：CO2濃度が40%に達しました。緑を増やさないと危険です！" },
            { value: 20, message: "🔔注意：CO2濃度が20%に達しました。環境が悪化しています。" },
        ];
        
        const crossedThresholds: string[] = [];
        for (const threshold of thresholds) {
            if (prev.co2Level < threshold.value && newCo2 >= threshold.value) {
                crossedThresholds.push(threshold.message);
            }
        }

        // Add messages for crossed thresholds, with the most severe one appearing first in the log
        crossedThresholds.reverse().forEach(message => {
            addMessage(message);
        });

        if (dailySummary.eventMessage) {
            if (dailySummary.co2Surge) {
                setCo2SurgeTrigger(p => p + 1);
                addMessage(`${dailySummary.eventMessage} (+${dailySummary.co2Surge}%)`);
            } else if (dailySummary.co2BonusReduction) {
                audioManager.playMissionCompleteSound();
                addMessage(`${dailySummary.eventMessage} (-${dailySummary.co2BonusReduction}%)`);
            }
        }

        let newPlots = prev.plots.map(plot => {
            if (plot.plant && !plot.plant.isGrown && plot.plant.isWatered) {
                const plantInfo = PLANT_DATA[plot.plant.type];
                let growthStalled = false;
                if (prev.weather === WeatherType.Cloudy && Math.random() < 0.5) {
                    growthStalled = true;
                }
                if (prev.weather === WeatherType.Stormy && Math.random() < 0.3) {
                    addMessage(`⛈️ 嵐で${plot.plant.type}がダメージを受けました！`);
                    return { ...plot, plant: { ...plot.plant, growthStage: plantInfo.growthTime, isWatered: autoWatered } };
                }

                if (!growthStalled) {
                    const newGrowthStage = plot.plant.growthStage - 1;
                    if (newGrowthStage <= 0) {
                        addMessage(`${plantInfo.emoji}${plot.plant.type}が育ち、CO2が${plantInfo.co2Reduction}%減少しました！`);
                        return { ...plot, plant: { ...plot.plant, growthStage: 0, isGrown: true, isWatered: autoWatered } };
                    }
                    return { ...plot, plant: { ...plot.plant, growthStage: newGrowthStage, isWatered: autoWatered } };
                }
            }
             if (plot.plant) {
                return { ...plot, plant: { ...plot.plant, isWatered: autoWatered } };
            }
            return plot;
        });

        if (newCo2 >= MAX_CO2) {
            setPhase('GAME_OVER');
        }

        const newDay = prev.day + 1;
        addMessage(`☀️ ${newDay}日目になりました。`);
        addMessage(`今日の天気は${weatherInfo.emoji}${newWeather}です。`);
        
        if (sprinklerDidWork) {
            addMessage(`スプリンクラーが作動し、植物に水がやられました。(維持費 ${SPRINKLER_MAINTENANCE_COST}円)`);
        } else if (autoWateredByRain) {
          addMessage('雨のおかげで、すべての植物に水が与えられました！');
        }
        
        return {
            ...prev,
            day: newDay,
            money: newMoney,
            co2Level: Math.max(0, newCo2),
            plots: newPlots,
            moneySpentToday: maintenanceCostPaid,
            moneyEarnedToday: 0,
            weather: newWeather,
        };
    });

    if (isTutorialDay2Coming) {
        setPhase('BUYER_VISIT');
        addMessage(`今日は植物を買いに来る人がいます。`);
    } else {
        generateSellers(gameState.level);
        setPhase('SELLER_VISIT');
    }
    setDailySummary(null);
  };


  const handleBuySeed = (sellerId: number) => {
    const seller = sellers.find(s => s.id === sellerId);
    if (!seller || seller.sold) {
      addMessage("もう売り切れです。");
      return;
    }
    
    const { price, seedType } = seller;

    if (gameState.money >= price) {
      setGameState(prev => ({
        ...prev,
        money: prev.money - price,
        seeds: {
          ...prev.seeds,
          [seedType]: prev.seeds[seedType] + 1,
        },
        moneySpentToday: prev.moneySpentToday + price,
      }));
      setSellers(prevSellers => 
        prevSellers.map(s => s.id === sellerId ? { ...s, sold: true } : s)
      );
      addMessage(`${PLANT_DATA[seedType].emoji}${seedType}の種を${price}円で買いました。`);
      
      if (tutorialState.isActive && tutorialState.step === 1 && sellerId === 0) {
          advanceTutorial();
      }

    } else {
      addMessage("お金が足りません！");
    }
  };

  const handleBuyAllSeeds = () => {
    const remainingSellers = sellers.filter(s => !s.sold);
    const totalCost = remainingSellers.reduce((sum, seller) => sum + seller.price, 0);

    if (gameState.money >= totalCost) {
        const newSeeds = { ...gameState.seeds };
        remainingSellers.forEach(seller => {
            newSeeds[seller.seedType] = (newSeeds[seller.seedType] || 0) + 1;
        });

        setGameState(prev => ({
            ...prev,
            money: prev.money - totalCost,
            seeds: newSeeds,
            moneySpentToday: prev.moneySpentToday + totalCost,
        }));

        setSellers(prevSellers => 
            prevSellers.map(s => ({ ...s, sold: true }))
        );

        addMessage(`残りの種をすべて${totalCost}円で購入しました。`);
    } else {
        addMessage("お金が足りません！");
    }
  };
  
  const handleSelectSeed = (seed: PlantType | null) => {
    setSelectedSeed(seed);
    if (tutorialState.isActive && tutorialState.step === 5 && seed === PlantType.MorningGlory) {
        advanceTutorial();
    }
  };

  const handlePlotClick = (plotId: number) => {
    if (tutorialState.isActive && tutorialState.step === 6 && plotId === 0 && selectedSeed === PlantType.MorningGlory) {
        advanceTutorial();
    }

    const plot = gameState.plots.find(p => p.id === plotId);
    if (!plot) return;

    if (!selectedSeed) {
      // Don't show message if they are trying to water
      if (!plot.plant || plot.plant.isWatered) {
        addMessage("植える種を選択してください。");
      }
      return;
    }

    if (!plot.plant && gameState.seeds[selectedSeed] > 0) {
      const plantInfo = PLANT_DATA[selectedSeed];
      const newSeedCount = gameState.seeds[selectedSeed] - 1;

      setGameState(prev => ({
        ...prev,
        seeds: {
          ...prev.seeds,
          [selectedSeed]: newSeedCount,
        },
        plots: prev.plots.map(p =>
          p.id === plotId
            ? {
                ...p,
                plant: {
                  id: Date.now(),
                  type: selectedSeed,
                  growthStage: plantInfo.growthTime,
                  isGrown: false,
                  isWatered: prev.weather === WeatherType.Rainy || prev.weather === WeatherType.Stormy || prev.hasSprinkler
                },
              }
            : p
        ),
      }));
      addMessage(`${plantInfo.emoji}${selectedSeed}の種を植えました。`);

      if (newSeedCount <= 0) {
        setSelectedSeed(null);
      }
    }
  };
  
  const handleWaterPlant = (plotId: number) => {
    if (isWatering) return;

    const plot = gameState.plots.find(p => p.id === plotId);
    if (!plot || !plot.plant || plot.plant.isWatered) return;

    const plantInfo = PLANT_DATA[plot.plant.type];
    const cost = plantInfo.waterCost;

    if (gameState.money < cost) {
      addMessage(`水やりにお金が足りません！ (${cost}円必要)`);
      return;
    }
    
    if (tutorialState.isActive && tutorialState.step === 7 && plotId === 0) {
        advanceTutorial();
    }

    setIsWatering(true);
    setGameState(prev => ({
      ...prev,
      money: prev.money - cost,
      moneySpentToday: prev.moneySpentToday + cost,
      plots: prev.plots.map(p => 
        p.id === plotId ? { ...p, plant: { ...p.plant!, isWatered: true } } : p
      ),
    }));

    addMessage(`${plantInfo.emoji}${plot.plant.type}に${cost}円で水をやりました。`);
    setTimeout(() => setIsWatering(false), 200); // Debounce
  };

  const handleWaterAllPlants = () => {
    const plantsToWater = gameState.plots.filter(p => p.plant && !p.plant.isGrown && !p.plant.isWatered);
    if (plantsToWater.length === 0) {
      addMessage("水やりが必要な植物がありません。");
      return;
    }

    const totalCost = plantsToWater.reduce((sum, plot) => {
      const plantInfo = PLANT_DATA[plot.plant!.type];
      return sum + plantInfo.waterCost;
    }, 0);

    if (gameState.money < totalCost) {
      addMessage(`お金が足りません！ (合計 ${totalCost}円必要)`);
      return;
    }

    setGameState(prev => ({
      ...prev,
      money: prev.money - totalCost,
      moneySpentToday: prev.moneySpentToday + totalCost,
      plots: prev.plots.map(p => {
        if (p.plant && !p.plant.isGrown && !p.plant.isWatered) {
          return { ...p, plant: { ...p.plant, isWatered: true } };
        }
        return p;
      }),
    }));

    addMessage(`${plantsToWater.length}個の植物にまとめて水をやりました。 (${totalCost}円)`);
  };


  const handleBuyNewPlot = () => {
    const cost = PLOT_BASE_COST + (gameState.plots.length - INITIAL_PLOT_COUNT) * PLOT_COST_INCREMENT;

    if (gameState.money >= cost) {
      setGameState(prev => ({
        ...prev,
        money: prev.money - cost,
        plots: [...prev.plots, { id: prev.plots.length, plant: null }],
        moneySpentToday: prev.moneySpentToday + cost,
      }));
      addMessage(`新しい畑を${cost}円で購入しました！`);
    } else {
      addMessage("お金が足りません！");
    }
    setIsBuyPlotModalOpen(false);
  };
  
  const handleTutorialPlantSelection = (plotId: number) => {
    if (tutorialState.isActive && tutorialState.step === 10) {
      advanceTutorial();
    }
  };

  const handleSellPlants = (plantsToSell: Record<number, boolean>) => {
    if (tutorialState.isActive && tutorialState.step === 11) {
      advanceTutorial();
    }

    let earnings = 0;
    let xpGained = 0;
    const soldPlantCounts: Partial<Record<PlantType, number>> = {};

    const newPlots = gameState.plots.map(plot => {
      if (plot.plant && plot.plant.isGrown && plantsToSell[plot.id]) {
        const plantInfo = PLANT_DATA[plot.plant.type];
        earnings += plantInfo.sellPrice;
        xpGained += plantInfo.xp;
        soldPlantCounts[plot.plant.type] = (soldPlantCounts[plot.plant.type] || 0) + 1;
        return { ...plot, plant: null };
      }
      return plot;
    });

    if (earnings > 0) {
      addMessage(`${earnings}円で植物を売りました！ ${xpGained}XPを獲得しました。`);

      const newPlantStats = { ...gameState.plantStats };
      for (const [plantType, count] of Object.entries(soldPlantCounts)) {
          newPlantStats[plantType as PlantType] = (newPlantStats[plantType as PlantType] || 0) + count;
      }
      
      const newMissionProgress = { ...gameState.missionProgress };
      let missionRewards = 0;

      MISSION_DATA.forEach(mission => {
          if (!newMissionProgress[mission.id]?.completed) {
              if ((newPlantStats[mission.plantType] || 0) >= mission.targetCount) {
                  newMissionProgress[mission.id] = { completed: true };
                  missionRewards += mission.reward;
                  addMessage(`ミッション達成: 「${mission.title}」！ 報酬 ${mission.reward}円獲得！`);
                  audioManager.playMissionCompleteSound();
              }
          }
      });

      const newXp = gameState.xp + xpGained;
      const newLevel = gameState.level + Math.floor(newXp / XP_PER_LEVEL);
      const remainingXp = newXp % XP_PER_LEVEL;
      
      if (newLevel > gameState.level) {
        addMessage(`レベルアップ！レベル${newLevel}になりました！`);
      }

      setGameState(prev => ({
        ...prev,
        money: prev.money + earnings + missionRewards,
        xp: remainingXp,
        level: newLevel,
        plots: newPlots,
        moneyEarnedToday: prev.moneyEarnedToday + earnings + missionRewards,
        plantStats: newPlantStats,
        missionProgress: newMissionProgress,
      }));
    }
    
    if (isRevisitingBuyer) {
        setIsRevisitingBuyer(false);
    } else if (phase === 'BUYER_VISIT') {
        setPhase('PLANTING');
        addMessage(`植物を植えたり、世話をしたりしましょう。`);
    }
  };

  const handleExtractGene = (plotId: number) => {
    const plot = gameState.plots.find(p => p.id === plotId);
    if (!plot || !plot.plant || !plot.plant.isGrown) return;

    const plantInfo = PLANT_DATA[plot.plant.type];
    if (!plantInfo.geneType) return;

    setGameState(prev => {
        const newPlots = prev.plots.map(p => p.id === plotId ? { ...p, plant: null } : p);
        const newGenes = { ...prev.genes, [plot.plant!.type]: prev.genes[plot.plant!.type] + 1 };
        return { ...prev, plots: newPlots, genes: newGenes };
    });

    addMessage(`${plantInfo.emoji}${plot.plant.type}の遺伝子(${plantInfo.geneType})を抽出しました！`);
  };

  const handleCombineGenes = (gene1: PlantType, gene2: PlantType) => {
    const recipe = GENE_COMBINATIONS[gene1]?.[gene2];
    if (!recipe) {
        addMessage("この組み合わせでは何も生まれないようです...");
        return;
    }

    if (gameState.genes[gene1] < 1 || gameState.genes[gene2] < 1 || (gene1 === gene2 && gameState.genes[gene1] < 2)) {
        addMessage("遺伝子が足りません！");
        return;
    }
    
    const { result } = recipe;
    const resultPlantInfo = PLANT_DATA[result];

    setGameState(prev => {
        const newGenes = { ...prev.genes };
        newGenes[gene1]--;
        newGenes[gene2]--;
        const newSeeds = { ...prev.seeds, [result]: (prev.seeds[result] || 0) + 1 };
        return { ...prev, genes: newGenes, seeds: newSeeds };
    });

    addMessage(`遺伝子を合成して ${resultPlantInfo.emoji}${result} の種ができました！`);
  };

  const handlePurchaseSprinkler = () => {
    if (gameState.money >= SPRINKLER_COST) {
        setGameState(prev => ({
            ...prev,
            money: prev.money - SPRINKLER_COST,
            hasSprinkler: true,
            moneySpentToday: prev.moneySpentToday + SPRINKLER_COST,
        }));
        addMessage(`スプリンクラーを ${SPRINKLER_COST}円 で設置しました！`);
        audioManager.playMissionCompleteSound();
        setIsSprinklerModalOpen(false);
    } else {
        addMessage("お金が足りません！");
    }
};

  const handleCloseSellerModal = () => {
    if (tutorialState.isActive && tutorialState.step === 2) {
        advanceTutorial();
    }

    if (gameState.day % BUYER_VISIT_FREQUENCY === 0 && !tutorialState.isActive) {
        setPhase('BUYER_VISIT');
        addMessage(`今日は植物を買いに来る人がいます。`);
    } else {
        setPhase('PLANTING');
        addMessage(`植物を植えたり、世話をしたりしましょう。`);
    }
  };

  const handleOpenMissions = () => {
    setIsMissionsModalOpen(true);
    if (tutorialState.isActive && tutorialState.step === 12) {
      advanceTutorial();
    }
  };

  const handleCloseMissions = () => {
    setIsMissionsModalOpen(false);
    if (tutorialState.isActive && tutorialState.step === 13) {
      advanceTutorial();
    }
  };
  
  useEffect(() => {
    if (gameState.co2Level >= MAX_CO2) {
      setPhase('GAME_OVER');
    }
    setIsCo2Critical(gameState.co2Level >= 90);
  }, [gameState.co2Level]);
  
  if (phase === 'WELCOME') {
    return <WelcomeScreen 
      hasSaveData={saveDataExists} 
      onContinue={() => startGame(loadGame)} 
      onNewGame={() => startGame(handleStartNewGame)} 
    />;
  }

  const nextPlotCost = PLOT_BASE_COST + (gameState.plots.length - INITIAL_PLOT_COUNT) * PLOT_COST_INCREMENT;

  const plantsToWater = gameState.plots.filter(p => p.plant && !p.plant.isGrown && !p.plant.isWatered);
  const totalWaterCost = plantsToWater.reduce((sum, plot) => {
      const plantInfo = PLANT_DATA[plot.plant!.type];
      return sum + plantInfo.waterCost;
  }, 0);
  const canAffordAllWater = gameState.money >= totalWaterCost;
  
  const grownPlants = gameState.plots.filter(p => p.plant && p.plant.isGrown);

  return (
    <div className="h-screen bg-gradient-to-b from-slate-900 to-sky-900 text-white flex flex-col overflow-hidden">
      {tutorialState.isActive && (
        <Tutorial step={tutorialState.step} onNext={advanceTutorial} onSkip={endTutorial} />
      )}
      <div className="w-full max-w-6xl mx-auto flex flex-col h-full p-4 sm:p-8 gap-6">
        <Header 
            stats={gameState} 
            co2SurgeTrigger={co2SurgeTrigger}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            className="shrink-0"
            isCo2Critical={isCo2Critical}
        />
        
        <main className="grid grid-rows-[minmax(0,2fr)_minmax(0,1fr)] md:grid-rows-none grid-cols-1 md:grid-cols-3 gap-6 flex-grow min-h-0">
          <div data-tutorial-id="garden-container" className="md:col-span-2 bg-black bg-opacity-30 p-4 rounded-2xl shadow-lg border border-slate-700 flex flex-col min-h-0">
            <div className="flex justify-between items-center mb-4 shrink-0">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-cyan-300 flex items-center gap-2">
                        <PlantIcon className="w-6 h-6" />マイガーデン
                    </h2>
                    <Button onClick={() => setIsHintModalOpen(true)} className="bg-transparent hover:bg-slate-700 p-2 rounded-full" title="ヘルプ">
                        <QuestionMarkCircleIcon className="w-6 h-6 text-slate-400" />
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => setIsSprinklerModalOpen(true)}
                        className="bg-teal-600 hover:bg-teal-500 text-sm px-3 py-2 flex items-center gap-2"
                        disabled={gameState.level < SPRINKLER_UNLOCK_LEVEL && !gameState.hasSprinkler}
                        title={gameState.level < SPRINKLER_UNLOCK_LEVEL && !gameState.hasSprinkler ? `レベル${SPRINKLER_UNLOCK_LEVEL}で解放` : '自動水やりスプリンクラー'}
                    >
                        <SprinklerIcon className="w-5 h-5" />
                        <span>スプリンクラー</span>
                    </Button>
                    {grownPlants.length > 0 && phase === 'PLANTING' && (
                        <Button
                            onClick={() => setIsRevisitingBuyer(true)}
                            className="bg-yellow-600 hover:bg-yellow-500 text-sm px-3 py-2 flex items-center gap-2"
                            title="育った植物を売る"
                        >
                            <CoinIcon className="w-5 h-5" />
                            <span>植物を売る</span>
                        </Button>
                    )}
                    {plantsToWater.length > 0 && !gameState.hasSprinkler && (
                        <Button
                            onClick={handleWaterAllPlants}
                            disabled={!canAffordAllWater}
                            className="bg-blue-600 hover:bg-blue-500 text-sm px-3 py-2 flex items-center gap-2"
                            title={!canAffordAllWater ? `お金が足りません (${totalWaterCost}円必要)` : `まとめて水をやる (${totalWaterCost}円)`}
                        >
                            <WaterDropsIcon className="w-5 h-5" />
                            <span>まとめて水やり ({totalWaterCost}円)</span>
                        </Button>
                    )}
                </div>
            </div>
            <div className="overflow-y-auto">
              <Garden 
                plots={gameState.plots} 
                onPlotClick={handlePlotClick} 
                selectedSeed={selectedSeed}
                canBuyPlot={gameState.level >= PLOT_UNLOCK_LEVEL}
                onBuyPlotClick={() => setIsBuyPlotModalOpen(true)}
                onWaterPlant={handleWaterPlant}
                gameState={gameState}
              />
            </div>
             {phase === 'PLANTING' && (
                <Button 
                  data-tutorial-id="next-day-button"
                  onClick={handleNextDay} 
                  className="w-full mt-4 py-3 text-lg bg-green-600 hover:bg-green-500 transform hover:scale-[1.02] transition-transform"
                  disabled={tutorialState.isActive && tutorialState.step !== 8}
                >
                  次の日へ進む
                </Button>
              )}
          </div>
          <div className="flex flex-col gap-6 overflow-y-auto">
            <Inventory 
              seeds={gameState.seeds} 
              selectedSeed={selectedSeed} 
              onSelectSeed={handleSelectSeed}
              canOpenShop={phase === 'PLANTING' && sellers.some(s => !s.sold)}
              onOpenShop={() => setIsRevisitingSellers(true)}
            />
            <div className="bg-black bg-opacity-30 p-4 rounded-2xl shadow-lg border border-slate-700">
              <h3 className="text-lg font-bold mb-2 text-cyan-300">メッセージ</h3>
              <div className="space-y-2 text-sm">
                {messages.map((msg, i) => (
                  <p key={i} className={`transition-opacity duration-500 ${i === 0 ? 'opacity-100 text-white' : 'opacity-60'}`}>{msg}</p>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2 mt-auto">
              <Button 
                onClick={() => setIsBreedingLabOpen(true)} 
                className="w-full bg-purple-600 hover:bg-purple-500"
                disabled={gameState.level < BREEDING_UNLOCK_LEVEL || tutorialState.isActive}
                title={gameState.level < BREEDING_UNLOCK_LEVEL ? `レベル${BREEDING_UNLOCK_LEVEL}で解放` : ''}
              >
                <div className="flex items-center justify-center gap-2">
                  <GeneIcon className="w-5 h-5" />
                  <span>品種改良</span>
                </div>
              </Button>
              <Button 
                onClick={handleOpenMissions} 
                className="w-full bg-yellow-600 hover:bg-yellow-500"
                data-tutorial-id="missions-button"
                disabled={tutorialState.isActive && (tutorialState.step < 12 || tutorialState.step > 13)}
              >
                <div className="flex items-center justify-center gap-2">
                  <MissionIcon className="w-5 h-5" />
                  <span>ミッション</span>
                </div>
              </Button>
               <Button 
                  onClick={handleSaveAndQuit} 
                  className="w-full bg-blue-600 hover:bg-blue-500" 
                  disabled={tutorialState.isActive}
                >
                  セーブしてタイトルへ
                </Button>
            </div>
          </div>
        </main>
      </div>

      {isHintModalOpen && (
        <HintModal 
          playerLevel={gameState.level}
          onClose={() => setIsHintModalOpen(false)} 
        />
      )}
      
      {isSprinklerModalOpen && (
        <SprinklerModal
            onClose={() => setIsSprinklerModalOpen(false)}
            onPurchase={handlePurchaseSprinkler}
            hasSprinkler={gameState.hasSprinkler}
            playerMoney={gameState.money}
            playerLevel={gameState.level}
        />
      )}

      {isBreedingLabOpen && (
        <BreedingLabModal
          gameState={gameState}
          onClose={() => setIsBreedingLabOpen(false)}
          onExtractGene={handleExtractGene}
          onCombineGenes={handleCombineGenes}
        />
      )}

      {isMissionsModalOpen && (
        <MissionModal 
          plantStats={gameState.plantStats}
          missionProgress={gameState.missionProgress}
          onClose={handleCloseMissions}
        />
      )}

      {phase === 'DAILY_SUMMARY' && dailySummary && (
          <DailySummaryModal summary={dailySummary} onClose={advanceToNextDay} />
      )}

      {(phase === 'SELLER_VISIT' || isRevisitingSellers) && (
        <SeedSellerModal 
          sellers={sellers} 
          onBuy={handleBuySeed} 
          onClose={isRevisitingSellers ? () => setIsRevisitingSellers(false) : handleCloseSellerModal}
          money={gameState.money}
          onBuyAll={handleBuyAllSeeds}
        />
      )}

      {(phase === 'BUYER_VISIT' || isRevisitingBuyer) && (
        <PlantBuyerModal
          plots={gameState.plots}
          onSell={handleSellPlants}
          onSelectForSale={handleTutorialPlantSelection}
          onClose={() => {
            if (isRevisitingBuyer) {
                setIsRevisitingBuyer(false);
            } else if (phase === 'BUYER_VISIT') {
                setPhase('PLANTING');
                addMessage(`植物を植えたり、世話をしたりしましょう。`);
            }
          }}
        />
      )}
      
      {isBuyPlotModalOpen && (
        <PlotPurchaseModal
          cost={nextPlotCost}
          onConfirm={handleBuyNewPlot}
          onCancel={() => setIsBuyPlotModalOpen(false)}
        />
      )}

      {phase === 'GAME_OVER' && (
         <Modal title="ゲームオーバー" onClose={() => {}}>
            <div className="p-4 text-slate-300 space-y-4 text-center">
              <p className="text-2xl text-red-500">残念ながら、CO2濃度が{MAX_CO2}%に達してしまいました。</p>
              <p>地球は温暖化の危機に瀕しています...</p>
              <p>あなたは{gameState.day - 1}日間、地球を守り抜きました。</p>
              <Button onClick={() => startGame(() => startNewGame(false))} className="w-full mt-4 bg-red-600 hover:bg-red-500">もう一度挑戦する</Button>
            </div>
         </Modal>
      )}
    </div>
  );
};

export default App;