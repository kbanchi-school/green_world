
import { PlantType, PlantInfo, Mission, GeneType, WeatherType } from './types';

export const INITIAL_MONEY = 5000;
export const INITIAL_CO2 = 20;
export const MAX_CO2 = 100;
export const MIN_DAILY_CO2_INCREASE = 2;
export const MAX_DAILY_CO2_INCREASE = 5;
export const INITIAL_PLOT_COUNT = 9;
export const BUYER_VISIT_FREQUENCY = 3; // every 3 days

export const PLOT_UNLOCK_LEVEL = 3;
export const PLOT_BASE_COST = 1000;
export const PLOT_COST_INCREMENT = 500;
export const BREEDING_UNLOCK_LEVEL = 5;

export const GENE_COLORS: Record<GeneType, string> = {
  [GeneType.Red]: 'bg-red-500 ring-red-300',
  [GeneType.Blue]: 'bg-blue-500 ring-blue-300',
  [GeneType.Yellow]: 'bg-yellow-400 ring-yellow-200',
  [GeneType.Purple]: 'bg-purple-500 ring-purple-300',
  [GeneType.Green]: 'bg-green-500 ring-green-300',
};

export const WEATHER_DEFINITIONS: { type: WeatherType, emoji: string, chance: number }[] = [
  { type: WeatherType.Sunny, emoji: '☀️', chance: 0.50 },
  { type: WeatherType.Cloudy, emoji: '☁️', chance: 0.25 },
  { type: WeatherType.Rainy, emoji: '🌧️', chance: 0.20 },
  { type: WeatherType.Stormy, emoji: '⛈️', chance: 0.05 },
];


export const PLANT_DATA: Record<PlantType, PlantInfo> = {
  [PlantType.MorningGlory]: {
    name: PlantType.MorningGlory,
    emoji: '🌺',
    seedPrice: [200, 500],
    sellPrice: 400,
    growthTime: 1,
    co2Reduction: 1,
    xp: 10,
    sellerChance: 0.50,
    geneType: GeneType.Blue,
    waterCost: 30,
  },
  [PlantType.Tulip]: {
    name: PlantType.Tulip,
    emoji: '🌷',
    seedPrice: [300, 700],
    sellPrice: 700,
    growthTime: 2,
    co2Reduction: 3,
    xp: 20,
    sellerChance: 0.35,
    geneType: GeneType.Red,
    waterCost: 50,
  },
  [PlantType.Violet]: {
    name: PlantType.Violet,
    emoji: '🪻',
    seedPrice: [500, 1000],
    sellPrice: 1000,
    growthTime: 3,
    co2Reduction: 4,
    xp: 30,
    sellerChance: 0.15,
    geneType: GeneType.Purple,
    waterCost: 70,
  },
  [PlantType.Sunflower]: {
    name: PlantType.Sunflower,
    emoji: '🌻',
    seedPrice: [1000, 1300],
    sellPrice: 1600,
    growthTime: 2,
    co2Reduction: 5,
    xp: 50,
    sellerChance: 0.15,
    unlockLevel: 5,
    geneType: GeneType.Yellow,
    waterCost: 100,
  },
  [PlantType.Rose]: {
    name: PlantType.Rose,
    emoji: '🌹',
    seedPrice: [4000, 4000],
    sellPrice: 10000,
    growthTime: 7,
    co2Reduction: 3,
    xp: 150,
    sellerChance: 0.05,
    unlockLevel: 5,
    geneType: GeneType.Red,
    waterCost: 140,
  },
  [PlantType.Cactus]: {
    name: PlantType.Cactus,
    emoji: '🌵',
    seedPrice: [1500, 2000],
    sellPrice: 2200,
    growthTime: 4,
    co2Reduction: 7,
    xp: 80,
    sellerChance: 0.08,
    unlockLevel: 5,
    geneType: GeneType.Green,
    waterCost: 15,
  },
  [PlantType.PurpleMorningGlory]: {
    name: PlantType.PurpleMorningGlory,
    emoji: '⚜️',
    seedPrice: null, // Cannot be bought
    sellPrice: 2000,
    growthTime: 2,
    co2Reduction: 6,
    xp: 100,
    sellerChance: 0,
    geneType: GeneType.Purple,
    waterCost: 80,
  },
  [PlantType.PurpleTulip]: {
    name: PlantType.PurpleTulip,
    emoji: '🌷',
    seedPrice: null,
    sellPrice: 2500,
    growthTime: 3,
    co2Reduction: 5,
    xp: 120,
    sellerChance: 0,
    geneType: GeneType.Purple,
    waterCost: 90,
  },
};

export type GeneCombinationRecipe = {
    result: PlantType;
};

export const GENE_COMBINATIONS: Partial<Record<PlantType, Partial<Record<PlantType, GeneCombinationRecipe>>>> = {
  [PlantType.MorningGlory]: {
    [PlantType.Tulip]: { result: PlantType.PurpleMorningGlory },
  },
  [PlantType.Tulip]: {
    [PlantType.MorningGlory]: { result: PlantType.PurpleTulip },
  },
  // Add more combinations here
};


export const XP_PER_LEVEL = 100;

export const MISSION_DATA: Mission[] = [
  {
    id: 'morning_glory_1',
    title: 'アサガオを10回収穫',
    plantType: PlantType.MorningGlory,
    targetCount: 10,
    reward: 1500,
  },
  {
    id: 'tulip_1',
    title: 'チューリップを10回収穫',
    plantType: PlantType.Tulip,
    targetCount: 10,
    reward: 2000,
  },
  {
    id: 'violet_1',
    title: 'スミレを10回収穫',
    plantType: PlantType.Violet,
    targetCount: 10,
    reward: 3000,
  },
  {
    id: 'sunflower_1',
    title: 'ひまわりを5回収穫',
    plantType: PlantType.Sunflower,
    targetCount: 5,
    reward: 5000,
  },
   {
    id: 'cactus_1',
    title: 'サボテンを5回収穫',
    plantType: PlantType.Cactus,
    targetCount: 5,
    reward: 7500,
  },
  {
    id: 'rose_1',
    title: 'バラを3回収穫',
    plantType: PlantType.Rose,
    targetCount: 3,
    reward: 10000,
  },
];
