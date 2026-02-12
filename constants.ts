
import { Entity, PowerTier } from './types';

export const MOCK_ENTITIES: Entity[] = [
  {
    id: 'mock-omni-01',
    name: 'Atlas Sentinel',
    verse: 'Omni Archive',
    version: 'Prototype 0.1',
    tier: PowerTier.TIER_6,
    stats: {
      attackPotency: '6-B: Country Level',
      durability: '6-A: Continent Level',
      speed: '6-B: Country Level',
      liftingStrength: '6-C: Island Level',
      strikingStrength: '6-B: Country Level',
      intelligence: '10-B: Average Human'
    },
    abilities: [
      'Geodesic Resonance Shielding',
      'Dimensional Anchor Field',
      'Pulsewave Gravity Break'
    ],
    resistances: ['Energy', 'Gravity', 'Spatial Manipulation'],
    weaknesses: ['Conceptual null fields', 'Absolute vacuum'],
    feats: [
      {
        title: 'Sea-Splitting Charge',
        description: 'Carried a continent-sized structure across ocean basins by reversing tidal vectors.',
        tier: '6-A: Continent Level',
        source: 'Omni Archive Log 07',
        confidence: 0.85
      },
      {
        title: 'Pulsewave Hammer',
        description: 'Shattered eighty kilometers of mountain range with a focused gravity pulse.',
        tier: '6-B: Country Level',
        source: 'Atlas Field Report',
        confidence: 0.78
      }
    ],
    notes: 'Prototype Sentinel with adaptive scaling algorithms that adjust to multiversal threats.'
  }
];
