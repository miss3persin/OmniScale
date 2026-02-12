
export enum PowerTier {
  TIER_11 = '11-C: Hypostatic',
  TIER_10 = '10-C: Below Average Human',
  TIER_9 = '9-B: Wall Level',
  TIER_8 = '8-A: Multi-City Block',
  TIER_7 = '7-B: City Level',
  TIER_6 = '6-A: Continent Level',
  TIER_5 = '5-B: Planet Level',
  TIER_4 = '4-B: Solar System',
  TIER_3 = '3-B: Multi-Galaxy',
  TIER_2 = '2-A: Multiverse Level+',
  TIER_1 = '1-A: Outerversal',
  TIER_0 = 'Tier 0: Boundless'
}

export interface StatBreakdown {
  attackPotency: string;
  durability: string;
  speed: string;
  liftingStrength: string;
  strikingStrength: string;
  intelligence: string;
}

export interface Feat {
  title: string;
  description: string;
  tier: string;
  source: string;
  confidence: number;
}

export interface Entity {
  id: string;
  name: string;
  verse: string;
  version: string;
  tier: string;
  stats: StatBreakdown;
  abilities: string[];
  resistances: string[];
  weaknesses: string[];
  feats: Feat[];
  notes?: string;
}

export type BattleMode = '1v1' | 'FFA' | 'Team';

export interface VersusVerdict {
  winner: string;
  difficulty: 'Neg Diff' | 'No Diff' | 'Low Diff' | 'Mid Diff' | 'High Diff' | 'Extreme Diff';
  analysis: string;
  keyFactors: string[];
  conditionalOutcomes: string[];
  rankings?: string[]; // For FFA rankings
  teamBreakdown?: string; // For team-based analysis
}

export interface HierarchyDefinition {
  category: string;
  subcategories: {
    name: string;
    description: string;
    examples: string;
  }[];
}

export type AppView = 'dashboard' | 'profiles' | 'versus' | 'hierarchy' | 'calculator';
