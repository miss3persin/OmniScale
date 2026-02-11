
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { StatBreakdown } from '../types';

interface Props {
  stats: StatBreakdown;
  color: string;
}

const StatRadar: React.FC<Props> = ({ stats, color }) => {
  // Helper to map descriptive stats to a 0-100 scale for visual representation
  const mapStatToValue = (stat: string): number => {
    const s = stat.toLowerCase();
    if (s.includes('infinite') || s.includes('outer') || s.includes('boundless')) return 150;
    if (s.includes('universal') || s.includes('galaxy')) return 120;
    if (s.includes('planetary') || s.includes('stellar')) return 100;
    if (s.includes('continent') || s.includes('island')) return 80;
    if (s.includes('mountain') || s.includes('city')) return 60;
    if (s.includes('building') || s.includes('wall')) return 40;
    if (s.includes('peak human') || s.includes('superhuman')) return 25;
    return 15;
  };

  const data = [
    { subject: 'AP', A: mapStatToValue(stats.attackPotency), fullMark: 150 },
    { subject: 'Speed', A: mapStatToValue(stats.speed), fullMark: 150 },
    { subject: 'Durability', A: mapStatToValue(stats.durability), fullMark: 150 },
    { subject: 'Striking', A: mapStatToValue(stats.strikingStrength), fullMark: 150 },
    { subject: 'Lifting', A: mapStatToValue(stats.liftingStrength), fullMark: 150 },
    { subject: 'IQ', A: mapStatToValue(stats.intelligence), fullMark: 150 },
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
