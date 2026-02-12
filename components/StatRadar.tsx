
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { StatBreakdown } from '../types';

interface Props {
  stats: StatBreakdown;
  color: string;
}

const descriptorScale: [RegExp, number][] = [
  [/(omni|omniversal|omniversal)/i, 120],
  [/(transcend|boundless|outer)/i, 115],
  [/multiversal/i, 110],
  [/universal|galactic/i, 105],
  [/stellar/i, 100],
  [/planetary/i, 95],
  [/continent/i, 90],
  [/city|urban/i, 75],
  [/village|town/i, 70],
  [/wall|building/i, 60],
  [/superhuman|peak human/i, 55],
  [/human|average/i, 30],
];

const parseTierValue = (text: string) => {
  const tierMatch = text.match(/(\d{1,2})(?:\s*[-:\s]*([abc]))?/i);
  if (!tierMatch) return null;
  const tierNumber = parseInt(tierMatch[1], 10);
  const normalizedTier = Math.min(11, Math.max(1, tierNumber));
  const tierBase = (12 - normalizedTier) * 6;
  const letterModifier = tierMatch[2]?.toLowerCase() === 'a' ? 5 : tierMatch[2]?.toLowerCase() === 'b' ? 3 : 1;
  return Math.min(120, tierBase + letterModifier);
};

const descriptorValue = (text: string) => {
  for (const [pattern, value] of descriptorScale) {
    if (pattern.test(text)) {
      return value;
    }
  }
  return 20;
};

const parseNumeric = (text: string) => {
  const cleaned = text.replace(/[,]/g, '').match(/(\d+(\.\d+)?)(e[+-]?\d+)?/i);
  if (!cleaned) return null;
  const value = parseFloat(cleaned[0]);
  if (Number.isNaN(value)) return null;
  const logValue = Math.log10(Math.max(1, value));
  const scaled = Math.min(120, Math.max(15, Math.round((logValue / 9) * 120)));
  return scaled;
};

const normalizeStat = (stat: string) => {
  const lower = stat.toLowerCase();
  const tier = parseTierValue(lower);
  if (tier !== null) return tier;
  const numeric = parseNumeric(lower);
  if (numeric !== null) return numeric;
  return descriptorValue(lower);
};

const clampValue = (value: number) => Math.min(120, Math.max(5, value));

const StatRadar: React.FC<Props> = ({ stats, color }) => {
  const data = [
    { subject: 'AP', A: clampValue(normalizeStat(stats.attackPotency)), fullMark: 120 },
    { subject: 'Speed', A: clampValue(normalizeStat(stats.speed)), fullMark: 120 },
    { subject: 'Durability', A: clampValue(normalizeStat(stats.durability)), fullMark: 120 },
    { subject: 'Striking', A: clampValue(normalizeStat(stats.strikingStrength)), fullMark: 120 },
    { subject: 'Lifting', A: clampValue(normalizeStat(stats.liftingStrength)), fullMark: 120 },
    { subject: 'Intelligence', A: clampValue(normalizeStat(stats.intelligence)), fullMark: 120 },
  ];

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#444" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 10 }} />
          <Radar
            name="Combat Capacity"
            dataKey="A"
            stroke={color}
            fill={color}
            fillOpacity={0.4}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatRadar;
