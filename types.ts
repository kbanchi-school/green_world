

export enum PlantType {
  MorningGlory = 'アサガオ',
  Tulip = 'チューリップ',
  Violet = 'スミレ',
  Sunflower = 'ひまわり',
  Rose = 'バラ',
  Cactus = 'サボテン',
  PurpleMorningGlory = '紫のアサガオ',
  PurpleTulip = '紫色のチューリップ',
}

export enum GeneType {
  Red = '赤',
  Blue = '青',
  Yellow = '黄',
  Purple = '紫',
  Green = '緑',
}

export enum WeatherType {
  Sunny = '晴れ',
  Cloudy = '曇り',
  Rainy = '雨',
  Stormy = '嵐',
}

export interface PlantInfo {
  name: PlantType;
  emoji: string;
  seedPrice: [number, number] | null; // null for special plants
  sellPrice: number;
  growthTime: number;
  co2Reduction: number;
  xp: number;
  sellerChance: number;
  unlockLevel?: number;
  geneType?: GeneType;
  waterCost: number;
}

export interface Plant {
  id: number;
  type: PlantType;
  growthStage: number; // days remaining
  isGrown: boolean;
  isWatered: boolean;
}

export interface Plot {
  id: number;
  plant: Plant | null;
}

export interface Seller {
  id: number;
  seedType: PlantType;
  price: number;
  sold: boolean;
}

export type GamePhase = 'SELLER_VISIT' | 'BUYER_VISIT' | 'PLANTING' | 'GAME_OVER' | 'WELCOME' | 'DAILY_SUMMARY';

export interface DailySummary {
  co2Increased: number;
  co2Decreased: number;
  moneySpent: number;
  moneyEarned: number;
  eventMessage: string | null;
  co2Surge?: number;
  co2BonusReduction?: number;
  weatherEventMessage: string | null;
}

export interface Mission {
  id: string;
  title: string;
  plantType: PlantType;
  targetCount: number;
  reward: number;
}

export interface MissionProgress {
  [missionId: string]: {
    completed: boolean;
  };
}


export interface GameState {
  day: number;
  money: number;
  co2Level: number;
  level: number;
  xp: number;
  seeds: Record<PlantType, number>;
  plots: Plot[];
  moneySpentToday: number;
  moneyEarnedToday: number;
  plantStats: Record<PlantType, number>;
  missionProgress: MissionProgress;
  genes: Record<PlantType, number>;
  weather: WeatherType;
  hasSprinkler: boolean;
}

export interface SaveData {
  gameState: GameState;
  phase: GamePhase;
  sellers: Seller[];
  messages: string[];
}