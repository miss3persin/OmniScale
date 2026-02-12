
import React, { useState, useEffect, useRef } from 'react';
import { AppView, Entity, PowerTier, HierarchyDefinition, BattleMode, VersusVerdict } from './types';
import { MOCK_ENTITIES } from './constants';
import Sidebar from './components/Sidebar';
import { 
  Search, Plus, Trash2, Shield, Activity, ChevronRight, X, 
  Zap, Trophy, Flame, Layers, Calculator as CalcIcon, Scale,
  UserCheck, Swords, Globe, Sparkles
} from 'lucide-react';
import { geminiService } from './geminiService';
import StatRadar from './components/StatRadar';

const HIERARCHY_DATA: HierarchyDefinition[] = [
  {
    category: "Lower & Human Tiers (11 - 10)",
    subcategories: [
      { name: "Tier 11: Lower-Dimensional", description: "11-C to 11-A. Entities existing in 0, 1, or 2 dimensions. Infinitesimal compared to standard 3D life.", examples: "Geometric points, living shadows, paper-thin sprites" },
      { name: "Tier 10: Human Range", description: "10-C (Below Average), 10-B (Average), 10-A (Athlete). Standard biological capabilities without supernatural amps.", examples: "Average Joe, Athlete, Peak Human (Real-world limits)" }
    ]
  },
  {
    category: "Superhuman & Urban Tiers (9 - 8)",
    subcategories: [
      { name: "Tier 9: Street to Room", description: "9-C (Street), 9-B (Wall), 9-A (Small Building). Can break concrete, destroy vehicles, or level small structures.", examples: "The Terminator, Captain America (Early), Killer Croc" },
      { name: "Tier 8: Urban Destruction", description: "8-C (Building), 8-B (City Block), 8-A (Multi-City Block). Capable of leveling skyscrapers or entire residential blocks.", examples: "MCU Spider-Man, Early Deku, Colossus" }
    ]
  },
  {
    category: "Tectonic & Continental Tiers (7 - 6)",
    subcategories: [
      { name: "Tier 7: Tactical Nuclear", description: "7-C (Town), 7-B (City), 7-A (Mountain). Destruction ranging from small townships to massive mountain ranges.", examples: "All Might, base Naruto, Godzilla (standard)" },
      { name: "Tier 6: Global Impact", description: "6-C (Island), 6-B (Country), 6-A (Continent). Can displace entire tectonic plates or sink large landmasses.", examples: "Saitama (Casual), Whitebeard, Juubidara" }
    ]
  },
  {
    category: "Planetary & Stellar Tiers (5 - 4)",
    subcategories: [
      { name: "Tier 5: Planetary Systems", description: "5-C (Moon), 5-B (Planet), 5-A (Large Planet). Destruction of moons to gas giants like Jupiter.", examples: "Saiyan Saga Vegeta, Frieza (First Form), Boros" },
      { name: "Tier 4: Stellar Range", description: "4-C (Star), 4-B (Solar System), 4-A (Multi-Solar System). Energy output matching stars or supernovae.", examples: "Super Perfect Cell, Thor (Comics), Silver Surfer" }
    ]
  },
  {
    category: "Cosmic & Universal Tiers (3 - 2)",
    subcategories: [
      { name: "Tier 3: Galactic to Universal", description: "3-B (Galaxy), 3-A (Universal). Destruction of millions of galaxies up to the entire physical matter of a universe.", examples: "Odin, Galactus (Fed), Alien X" },
      { name: "Tier 2: Multiversal", description: "Low 2-C (Universe+), 2-C (Low Multiverse), 2-B (Multiverse), 2-A (Multiverse+). Affecting multiple space-time continuums (4D structures).", examples: "Goku (MUI), Arceus, Anti-Spiral" }
    ]
  },
  {
    category: "Transcendental Tiers (1 - 0)",
    subcategories: [
      { name: "Tier 1: Extra-Dimensional", description: "1-C (Complex Multiversal: 6D-11D), 1-B (Hyperversal: 12D+), 1-A (Outerversal: Transcending dimensions).", examples: "The Living Tribunal, Lucifer Morningstar, Bill Cipher" },
      { name: "Tier 0: Boundless", description: "Total transcendence of all conceptual hierarchies, dimensionality, and metaphysical systems.", examples: "The One Above All, The Overvoid, Azathoth" }
    ]
  }
];

type VsCombatant = {
  entity: Entity;
  team?: 'A' | 'B';
};

type BattleReadiness = {
  ready: boolean;
  message: string;
  counts: {
    A: number;
    B: number;
  };
};

const TEAM_LABELS: Record<'A' | 'B', string> = {
  A: 'Team Alpha',
  B: 'Team Beta'
};

const evaluateBattleReadiness = (combatants: VsCombatant[], mode: BattleMode): BattleReadiness => {
  const counts = { A: 0, B: 0 };
  combatants.forEach(({ team }) => {
    if (team === 'A') counts.A += 1;
    if (team === 'B') counts.B += 1;
  });

  switch (mode) {
    case '1v1':
      return {
        ready: combatants.length === 2,
        message: combatants.length === 2 ? 'Duel ready.' : 'Select exactly two fighters for Duel.',
        counts
      };
    case 'FFA':
      return {
        ready: combatants.length >= 2,
        message: combatants.length >= 2 ? 'Chaos is primed.' : 'Collect at least two combatants for Chaos.',
        counts
      };
    case 'Team':
      return {
        ready: counts.A > 0 && counts.B > 0,
        message: counts.A > 0 && counts.B > 0 ? 'Team War prepared.' : 'Assign at least one combatant to each team.',
        counts
      };
    default:
      return { ready: false, message: 'Mode unavailable.', counts };
  }
};

const createThemeClasses = (darkMode: boolean) => ({
  body: darkMode ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-900',
  surface: darkMode ? 'bg-zinc-900 border-zinc-800 text-white shadow-none' : 'bg-white border-zinc-200 text-black shadow-sm',
  surfaceCard: darkMode ? 'bg-zinc-950 border-zinc-900 shadow-2xl text-white' : 'bg-white border-zinc-200 shadow-xl text-black',
  surfaceSoft: darkMode ? 'bg-zinc-900/40 border-zinc-800' : 'bg-zinc-50 border-zinc-200 shadow-inner',
  textPrimary: darkMode ? 'text-white' : 'text-zinc-900',
  textMuted: darkMode ? 'text-zinc-500' : 'text-zinc-600',
  textAlt: darkMode ? 'text-zinc-400' : 'text-zinc-500',
  buttonPrimary: darkMode ? 'border-zinc-700 bg-white text-black hover:bg-zinc-200' : 'border-zinc-800 bg-black text-white hover:bg-zinc-800',
  buttonGhost: darkMode ? 'text-zinc-500 hover:text-white hover:bg-zinc-900 border border-transparent' : 'text-zinc-500 hover:text-black hover:bg-zinc-100 border border-transparent',
  badge: darkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-zinc-100 border-zinc-200 text-zinc-900',
  overlay: darkMode ? 'bg-black/95' : 'bg-white/95'
});

type ThemeClasses = ReturnType<typeof createThemeClasses>;

interface DashboardViewProps {
  entities: Entity[];
  benchmarkTier: string;
  openIndexModal: () => void;
  setSelectedEntity: (entity: Entity) => void;
  theme: ThemeClasses;
  darkMode: boolean;
}

const DashboardView: React.FC<DashboardViewProps> = ({ entities, benchmarkTier, openIndexModal, setSelectedEntity, theme, darkMode }) => (
  <div className="space-y-8 animate-in fade-in duration-500">
    <header className="flex flex-col md:flex-row justify-between gap-6">
      <div className="space-y-2">
        <p className={`text-[10px] uppercase tracking-[0.4em] ${theme.textMuted}`}>Omni-Scale Benchmark</p>
        <h2 className={`text-3xl sm:text-4xl font-black tracking-tight ${theme.textPrimary}`}>Tactical Overview</h2>
        <p className={`text-sm ${theme.textMuted}`}>Real-time analytical interface for multiversal scaling.</p>
        <p className={`text-xs uppercase tracking-[0.4em] ${theme.textAlt}`}>Baseline Tier: {benchmarkTier}</p>
      </div>
      <div className="flex gap-4">
        <div className={`p-4 rounded-xl border ${theme.surfaceSoft}`}>
          <p className="text-[10px] uppercase tracking-widest font-black text-zinc-500">Total Indexed</p>
          <p className="text-2xl font-mono font-bold">{entities.length}</p>
        </div>
        <button
          onClick={openIndexModal}
          className={`flex items-center gap-3 px-8 py-4 rounded-xl border transition-all shadow-lg active:scale-95 ${theme.buttonPrimary}`}
        >
          <Sparkles size={18} />
          <span className="text-xs font-black uppercase tracking-widest">Index New Entity</span>
        </button>
      </div>
    </header>

    {entities.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {entities.slice(0, 3).map(entity => (
          <article
            key={entity.id}
            onClick={() => setSelectedEntity(entity)}
            className={`p-6 rounded-2xl border transition-all cursor-pointer group active:scale-[0.98] ${theme.surface}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className={`text-lg font-bold group-hover:underline ${theme.textPrimary}`}>{entity.name}</h4>
                <p className={`text-xs ${theme.textMuted}`}>{entity.verse}</p>
              </div>
              <span className={`px-2 py-1 rounded text-[10px] font-mono border ${theme.badge}`}>{entity.tier}</span>
            </div>
            <StatRadar stats={entity.stats} color={darkMode ? '#FFFFFF' : '#000000'} />
          </article>
        ))}
      </div>
    ) : (
      <div className={`p-16 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center text-center ${theme.surfaceSoft}`}>
        <div className="w-20 h-20 rounded-full bg-zinc-900/50 flex items-center justify-center mb-6">
          <Plus size={40} className="opacity-20" />
        </div>
        <h3 className="text-xl font-bold mb-2">Omni-Vault is Empty</h3>
        <p className={`max-w-xs text-sm ${theme.textMuted}`}>The database requires character indexing to function. Start by adding an entity from any fiction or non-fiction verse.</p>
        <button
          onClick={openIndexModal}
          className="mt-8 px-10 py-4 rounded-full text-xs font-black uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 bg-black text-white hover:bg-zinc-800"
        >
          Index First Character
        </button>
      </div>
    )}

    {entities.length > 0 && (
      <section className={`p-8 rounded-2xl border ${theme.surface}`}>
        <div className="flex items-center gap-3 mb-6">
          <Activity size={24} className={theme.textPrimary} />
          <h3 className={`text-xl font-bold ${theme.textPrimary}`}>System Feed</h3>
        </div>
        <div className="space-y-4">
          {entities.slice(0, 3).map((e, i) => (
            <div
              key={e.id}
              className={`flex gap-4 items-center p-5 rounded-xl border-l-4 transition-all cursor-pointer ${theme.surfaceSoft}`}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-mono text-xs">
                {String(i+1).padStart(2, '0')}
              </div>
              <div>
                <p className="text-sm">
                  Entity Indexing Complete: <span className="font-black">{e.name}</span>. Validated Tier: <span className="font-mono font-bold">{e.tier}</span>.
                </p>
                <p className="text-[10px] uppercase tracking-tighter mt-1 text-zinc-500">Vault Sync ID: {e.id.toUpperCase()}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    )}
  </div>
);

interface ProfilesViewProps {
  filteredEntities: Entity[];
  totalEntities: number;
  setSelectedEntity: (entity: Entity) => void;
  openIndexModal: () => void;
  loading: boolean;
  removeEntity: (id: string) => void;
  theme: ThemeClasses;
  darkMode: boolean;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}

const ProfilesView: React.FC<ProfilesViewProps> = ({ filteredEntities, totalEntities, setSelectedEntity, openIndexModal, loading, removeEntity, theme, darkMode, searchQuery, setSearchQuery }) => (
  <div className="space-y-8 animate-in fade-in duration-500">
    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
      <h2 className={`text-2xl sm:text-3xl font-black ${theme.textPrimary}`}>Entity Archives</h2>
      <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search characters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`pl-12 pr-6 py-3 rounded-xl border text-sm outline-none transition-all w-full ${theme.surfaceSoft}`}
          />
        </div>
        <button
          onClick={openIndexModal}
          disabled={loading}
          className={`flex items-center justify-center gap-3 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 ${theme.buttonPrimary} disabled:opacity-50`}
        >
          <Plus size={18} />
          {loading ? 'SYNCING...' : 'INDEX NEW'}
        </button>
      </div>
    </div>

    <div className="grid gap-5">
      {filteredEntities.map(entity => (
        <article
          key={entity.id}
          onClick={() => setSelectedEntity(entity)}
          className={`p-6 rounded-3xl border ${theme.surface} transition-all hover:shadow-[0_20px_80px_rgba(0,0,0,0.25)]`}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h4 className={`text-2xl font-black ${theme.textPrimary}`}>{entity.name}</h4>
              <p className={`text-sm ${theme.textMuted}`}>{entity.verse}</p>
            </div>
            <span className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold border ${theme.badge}`}>{entity.tier}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            {[{ label: 'AP', value: entity.stats.attackPotency }, { label: 'SPD', value: entity.stats.speed }, { label: 'DUR', value: entity.stats.durability }].map(stat => (
              <div key={`${entity.id}-${stat.label}`} className={`p-3 rounded-2xl border ${theme.surfaceSoft}`}>
                <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-black">{stat.label}</p>
                <p className="text-sm font-black">{stat.value}</p>
              </div>
            ))}
          </div>

          {entity.resistances.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 text-[10px] font-bold uppercase tracking-[0.3em]">
              {entity.resistances.map((resistance, index) => (
                <span key={`${entity.id}-resistance-${index}`} className={`px-3 py-2 rounded-2xl border ${theme.badge}`}>
                  {resistance}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-4 text-[10px] uppercase tracking-[0.3em]">
            <span className={`${theme.textAlt}`}>Vault ID: {entity.id.toUpperCase()}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeEntity(entity.id);
              }}
              className={`p-3 rounded-xl transition-all ${darkMode ? 'text-zinc-500 hover:text-red-400 hover:bg-red-500/10' : 'text-zinc-400 hover:text-red-600 hover:bg-red-50 shadow-sm'}`}
            >
              <Trash2 size={20} />
            </button>
          </div>
        </article>
      ))}

      {totalEntities === 0 && (
        <div className="text-center py-20 italic text-lg text-zinc-400">
          No characters indexed in the Omni-Vault.
        </div>
      )}
    </div>
  </div>
);

interface VersusViewProps {
  darkMode: boolean;
  entities: Entity[];
  vsCombatants: VsCombatant[];
  toggleCombatant: (entity: Entity, team?: 'A' | 'B') => void;
  vsMode: BattleMode;
  onModeChange: (mode: BattleMode) => void;
  handleSimulateBattle: () => void;
  verdict: VersusVerdict | null;
  theme: ThemeClasses;
  loading: boolean;
  readiness: BattleReadiness;
  duelWarningVisible: boolean;
  duelWarningMessage: string;
  clearSelections: () => void;
}

const HierarchyView: React.FC<{ theme: ThemeClasses; darkMode: boolean }> = ({ theme, darkMode }) => (
  <div className="space-y-10 animate-in fade-in duration-500">
    <header className="flex flex-col gap-4">
      <p className={`text-[10px] uppercase tracking-[0.4em] ${theme.textMuted}`}>Conceptual Hierarchy</p>
      <h2 className={`text-3xl sm:text-4xl font-black ${theme.textPrimary}`}>Omni Tiers Codex</h2>
      <p className={`text-sm ${theme.textMuted}`}>Navigate the tiered classifications that guide all scaling and narrative assessments.</p>
    </header>

    <div className="grid gap-6">
      {HIERARCHY_DATA.map(category => (
        <article
          key={category.category}
          className={`rounded-[2.5rem] border p-6 transition-all ${theme.surfaceSoft}`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h3 className={`text-xl font-black ${theme.textPrimary}`}>{category.category}</h3>
            <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">Contextual depth</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {category.subcategories.map(sub => (
              <div
                key={sub.name}
                className={`rounded-2xl border px-4 py-3 ${darkMode ? 'border-zinc-800 bg-zinc-950/60' : 'border-zinc-200 bg-white'}`}
              >
                <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">{sub.name}</p>
                <p className={`text-sm font-black ${theme.textPrimary}`}>{sub.description}</p>
                <p className="text-xs text-zinc-400 mt-2">Examples: {sub.examples}</p>
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  </div>
);

const VersusView: React.FC<VersusViewProps> = ({
  darkMode,
  entities,
  vsCombatants,
  toggleCombatant,
  vsMode,
  onModeChange,
  handleSimulateBattle,
  verdict,
  theme,
  loading,
  readiness,
  duelWarningVisible,
  duelWarningMessage,
  clearSelections
}) => {
  const isTeamMode = vsMode === 'Team';
  const deploymentLabel = isTeamMode
    ? `Team Alpha: ${readiness.counts.A} · Team Beta: ${readiness.counts.B}`
    : `${vsCombatants.length} indexed`;

  const renderDualCards = () => {
    if (!isTeamMode) {
      return (
        <div className="flex flex-wrap gap-4 justify-center">
          {vsCombatants.length > 0 ? vsCombatants.map(c => (
            <div key={c.entity.id} className="relative flex-1 min-w-[160px] max-w-[220px] bg-gradient-to-b from-zinc-900 to-zinc-950 border border-white/10 rounded-3xl p-6 text-center shadow-2xl">
              <div className="w-16 h-16 rounded-full border-2 mx-auto flex items-center justify-center text-2xl font-black text-white">
                {c.entity.name.charAt(0)}
              </div>
              <p className="text-base font-black break-words mt-4 text-white">{c.entity.name}</p>
              <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-400">{c.entity.tier}</p>
              <button
                onClick={() => toggleCombatant(c.entity)}
                className="absolute -top-3 -right-3 p-2 rounded-full bg-red-600 text-white border-2 border-zinc-950 hover:bg-red-500 transition-all shadow-2xl"
              >
                <X size={16} />
              </button>
            </div>
          )) : (
            <div className="text-center py-20 opacity-30">
              <Swords size={100} className="mx-auto mb-8" />
              <p className={`text-2xl font-black uppercase tracking-tighter ${theme.textPrimary}`}>Arena Deployment Pending</p>
              <p className="text-sm mt-2 text-zinc-500">Select indexed combatants from the vault to initiate analysis.</p>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="grid gap-4 lg:grid-cols-2">
        {(['A', 'B'] as const).map(team => {
          const members = vsCombatants.filter(c => c.team === team);
          return (
            <div key={team} className={`rounded-3xl border p-4 ${theme.surface} space-y-4`}>
              <div className="flex items-center justify-between">
                <h4 className="text-sm uppercase tracking-[0.4em] font-black">{TEAM_LABELS[team]}</h4>
                <span className="text-xs font-mono uppercase tracking-[0.3em] text-zinc-500">{members.length} fighters</span>
              </div>
              <div className="space-y-3">
                {members.length > 0 ? members.map(member => (
                  <div key={member.entity.id} className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-zinc-800 bg-zinc-950/40">
                    <div className="flex-1">
                      <p className="text-sm font-black">{member.entity.name}</p>
                      <p className="text-[10px] uppercase text-zinc-500 tracking-[0.3em]">{member.entity.tier}</p>
                    </div>
                    <button
                      onClick={() => toggleCombatant(member.entity, member.team)}
                      className="rounded-full bg-red-600 text-white p-2 border border-zinc-950 hover:bg-red-500"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )) : (
                  <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Awaiting selections</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 relative">
      {duelWarningVisible && (
        <div className="pointer-events-none fixed inset-x-6 top-6 z-50 flex justify-center">
          <div
            className={`rounded-3xl border px-6 py-3 text-sm font-black uppercase tracking-[0.3em] shadow-2xl transition-all ${
              darkMode ? 'bg-white text-black border-white/40' : 'bg-black text-white border-zinc-900/70'
            }`}
          >
            {duelWarningMessage}
          </div>
        </div>
      )}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h2 className={`text-3xl sm:text-4xl font-black tracking-tight ${theme.textPrimary}`}>Battle Simulator</h2>
          <p className={`${theme.textMuted} text-sm mt-1`}>Cross-verse conflict modeling with analytical precision.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className={`flex gap-2 p-1.5 rounded-2xl border ${theme.surfaceSoft}`}>
            {( ['1v1', 'FFA', 'Team'] as BattleMode[] ).map(mode => (
            <button
              key={mode}
              onClick={() => onModeChange(mode)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 ${vsMode === mode ? (darkMode ? 'bg-white text-black' : 'bg-black text-white shadow-lg') : theme.buttonGhost}`}
            >
              {mode === '1v1' ? 'Duel' : mode === 'FFA' ? 'Chaos' : 'Team War'}
            </button>
            ))}
          </div>
          <button
            onClick={clearSelections}
            className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${darkMode ? 'border-white text-white hover:bg-white/10' : 'border-black text-black hover:bg-black/10'}`}
          >
            Clear Selection
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-8">
        <div className={`p-6 rounded-3xl border ${theme.surface}`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Deployment List</h3>
            <span className={`text-[10px] font-mono px-2 py-1 rounded ${theme.badge}`}>{deploymentLabel}</span>
          </div>
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
            {entities.length > 0 ? entities.map(entity => {
              const selection = vsCombatants.find(c => c.entity.id === entity.id);
              const isSelected = Boolean(selection);
              if (isTeamMode) {
                return (
                  <div
                    key={entity.id}
                    className="w-full flex items-center justify-between p-4 rounded-2xl border border-zinc-800 bg-zinc-900/30"
                  >
                    <div>
                      <p className="text-sm font-black">{entity.name}</p>
                      <p className="text-[10px] font-mono opacity-60 uppercase">{entity.tier}</p>
                    </div>
                    <div className="flex gap-2">
                      {(['A', 'B'] as const).map(team => {
                        const active = selection?.team === team;
                        return (
                          <button
                            key={`${entity.id}-${team}`}
                            onClick={() => toggleCombatant(entity, team)}
                            className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] transition border ${active ? 'bg-zinc-100 text-black' : 'bg-transparent text-zinc-500 hover:bg-zinc-900/70'}`}
                          >
                            {TEAM_LABELS[team]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              }
              return (
                <button
                  key={entity.id}
                  onClick={() => toggleCombatant(entity)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-colors ${
                    isSelected
                      ? darkMode
                        ? 'border-white bg-white/10 text-white'
                        : 'border-zinc-900 bg-zinc-100 text-zinc-900 shadow-inner'
                      : darkMode
                        ? 'border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:bg-zinc-900/40'
                        : 'border-zinc-200 text-zinc-900 hover:border-zinc-500 hover:bg-zinc-50'
                  }`}
                >
                  <div className="text-left">
                    <p className="text-sm font-black">{entity.name}</p>
                    <p className="text-[10px] font-mono opacity-60 uppercase">{entity.tier}</p>
                  </div>
                  {isSelected ? <UserCheck size={18} /> : <Plus size={18} className="opacity-40" />}
                </button>
              );
            }) : (
              <div className="py-20 text-center opacity-30 italic text-sm">
                Vault is currently empty.
              </div>
            )}
          </div>
        </div>

        <div className={`p-8 rounded-3xl border ${theme.surfaceSoft} flex flex-col gap-6 min-h-[500px]`}>
          {renderDualCards()}
          <div>
            <button
              onClick={handleSimulateBattle}
              disabled={loading || !readiness.ready}
              className={`w-full py-6 rounded-3xl font-black tracking-[0.5em] uppercase text-xl transition-all shadow-2xl active:scale-95 ${theme.buttonPrimary} ${(!readiness.ready || loading) ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              {loading ? 'SIMULATING OUTCOMES...' : 'INITIATE CONFLICT'}
            </button>
            <p className="mt-3 text-xs uppercase tracking-[0.3em] text-zinc-500">{readiness.message}</p>
          </div>
        </div>
      </div>

      {verdict && (
        <div className={`p-10 rounded-[3rem] border ${theme.surfaceCard}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-zinc-900/50 pb-8 mb-8">
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 mb-3">Simulation Complete</p>
              <h3 className={`text-4xl sm:text-5xl font-black tracking-tighter ${theme.textPrimary}`}>
                {vsMode === 'FFA' ? 'DOMINANT: ' : 'WINNER: '}<span className={theme.textPrimary}>{verdict.winner}</span>
              </h3>
              <div className="flex flex-wrap gap-3 mt-6">
                <span className="text-xs uppercase tracking-[0.2em] font-black px-5 py-2 rounded-xl border border-zinc-800 text-zinc-400">Difficulty: {verdict.difficulty}</span>
                <span className="text-xs uppercase tracking-[0.2em] font-black px-5 py-2 rounded-xl border border-zinc-800 text-zinc-400">{vsMode} Mode</span>
              </div>
            </div>
            <Trophy size={96} className="text-yellow-500 drop-shadow-[0_0_40px_rgba(234,179,8,0.3)]" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`rounded-2xl border ${theme.surfaceSoft} p-6`}>
              <h4 className="text-xs uppercase tracking-[0.4em] text-zinc-500 mb-4">Key Factors</h4>
              <ul className="space-y-2">
                {verdict.keyFactors.map((factor, idx) => (
                  <li key={`factor-${idx}`} className="text-sm">{factor}</li>
                ))}
              </ul>
            </div>
            <div className={`rounded-2xl border ${theme.surfaceSoft} p-6`}>
              <h4 className="text-xs uppercase tracking-[0.4em] text-zinc-500 mb-4">Contingency Nodes</h4>
              <div className="space-y-2">
                {verdict.conditionalOutcomes.map((node, idx) => (
                  <p key={`node-${idx}`} className="text-sm italic">{node}</p>
                ))}
              </div>
            </div>
          </div>

          {verdict.rankings && verdict.rankings.length > 0 && (
            <div className={`mt-8 rounded-2xl border ${theme.surfaceSoft} p-6`}>
              <h4 className="text-xs uppercase tracking-[0.4em] text-zinc-500 mb-4">Elimination Matrix</h4>
              <div className="space-y-3">
                {verdict.rankings.map((rank, idx) => (
                  <div key={`rank-${idx}`} className="flex items-center gap-3">
                    <span className={`w-10 h-10 rounded-2xl flex items-center justify-center font-mono font-black border ${idx === 0 ? 'bg-white text-black' : 'border-zinc-800'}`}>{idx + 1}</span>
                    <p className={`text-lg font-black ${idx === 0 ? theme.textPrimary : 'text-zinc-400'}`}>{rank}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface CalculatorViewProps {
  theme: ThemeClasses;
  darkMode: boolean;
  calcMass: string;
  calcVelocity: string;
  calcResult: number | null;
  setCalcMass: React.Dispatch<React.SetStateAction<string>>;
  setCalcVelocity: React.Dispatch<React.SetStateAction<string>>;
  calculateKE: () => void;
  getTierFromEnergy: (joules: number) => string;
}

const CalculatorView: React.FC<CalculatorViewProps> = ({
  theme,
  darkMode,
  calcMass,
  calcVelocity,
  calcResult,
  setCalcMass,
  setCalcVelocity,
  calculateKE,
  getTierFromEnergy
}) => {
  const [scenarioNote, setScenarioNote] = useState('');
  const parsedMass = parseFloat(calcMass);
  const parsedVelocity = parseFloat(calcVelocity);
  const momentum = !Number.isNaN(parsedMass) && !Number.isNaN(parsedVelocity) ? parsedMass * parsedVelocity : null;
  const energyTier = calcResult !== null ? getTierFromEnergy(calcResult) : 'Awaiting kinetic data';
  const tntEquivalent = calcResult !== null ? `${(calcResult / 4.184e9).toFixed(2)} t` : '—';
  const referenceFeats = [
    { title: 'Planet Crash', energy: '2.5 × 10²⁴ J', tier: '6-A', description: 'Shocks entire continents and collapses crustal plates.' },
    { title: 'Star Pulse', energy: '5.8 × 10²⁶ J', tier: '4-B', description: 'Disrupts stellar balance and sends coronal waves.' },
    { title: 'Multiversal Cascade', energy: '1.1 × 10²⁹ J', tier: '2-A', description: 'Rewrites dimensional constants across a multiverse.' }
  ];
  const consoleSummary = calcResult !== null
    ? `Current blast registers ${calcResult.toLocaleString()} J, roughly ${energyTier}, with ${tntEquivalent} of TNT equivalent.`
    : 'Run the kinetic lab to unlock tiered impact scorings.';

  const metricCards = [
    { label: 'Tier Estimate', value: energyTier, note: 'Derived from continuum hierarchy' },
    { label: 'TNT Equivalent', value: tntEquivalent, note: 'Per 1 tonne of TNT = 4.184e9 J' },
    { label: 'Momentum Carry', value: momentum !== null ? `${momentum.toFixed(1)} kg·m/s` : 'Awaiting data', note: 'Mass × Velocity' }
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header>
        <p className={`text-[10px] uppercase tracking-[0.4em] ${theme.textMuted}`}>Omni Tools Console</p>
        <h2 className={`text-3xl sm:text-4xl font-black ${theme.textPrimary}`}>Adaptable Kinetic & Impact Modules</h2>
        <p className={`text-sm ${theme.textMuted}`}>Use this suite for AP-style estimations, tier conversions, and quick scenario briefs.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className={`p-6 rounded-[2.5rem] border ${theme.surface}`}>
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">Mass (kg)</span>
                <input
                  type="number"
                  min="0"
                  value={calcMass}
                  onChange={(e) => setCalcMass(e.target.value)}
                  placeholder="e.g. 5500"
                  className={`w-full px-4 py-3 rounded-2xl border text-sm outline-none transition-all ${darkMode ? 'bg-zinc-900 border-zinc-800 text-white focus:border-white' : 'bg-zinc-50 border-zinc-200 text-black focus:border-black'}`}
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">Velocity (m/s)</span>
                <input
                  type="number"
                  min="0"
                  value={calcVelocity}
                  onChange={(e) => setCalcVelocity(e.target.value)}
                  placeholder="e.g. 1300"
                  className={`w-full px-4 py-3 rounded-2xl border text-sm outline-none transition-all ${darkMode ? 'bg-zinc-900 border-zinc-800 text-white focus:border-white' : 'bg-zinc-50 border-zinc-200 text-black focus:border-black'}`}
                />
              </label>
            </div>
            <button
              onClick={calculateKE}
              className={`w-full px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-[0.3em] transition-all shadow-2xl ${darkMode ? 'bg-white text-black hover:bg-zinc-100' : 'bg-black text-white hover:bg-zinc-900'}`}
            >
              Run Kinetic Lab
            </button>

            <div className="grid gap-4 md:grid-cols-3">
              {metricCards.map(card => (
                <div key={card.label} className={`flex flex-col rounded-2xl border px-4 py-3 ${darkMode ? 'border-zinc-800 bg-zinc-950/40' : 'border-zinc-200 bg-white'}`}>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">{card.label}</span>
                  <p className={`text-lg font-black ${darkMode ? 'text-white' : 'text-zinc-900'}`}>{card.value}</p>
                  <p className="text-[10px] text-zinc-500">{card.note}</p>
                </div>
              ))}
            </div>

            <div className="rounded-[2rem] border px-5 py-4 bg-gradient-to-br from-zinc-900/70 to-black">
              <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400">Projection</p>
              <p className="text-sm font-light text-zinc-200">{consoleSummary}</p>
            </div>
          </div>
        </section>

        <section className={`p-6 rounded-[2.5rem] border ${theme.surfaceSoft}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-xl font-black ${theme.textPrimary}`}>Reference Spectrum</h3>
            <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">Omni database</span>
          </div>
          <div className="space-y-4">
            {referenceFeats.map(ref => (
              <div key={ref.title} className="rounded-2xl border border-zinc-800/70 p-4 bg-zinc-900/60 shadow-inner">
                <p className="text-sm font-black text-white">{ref.title}</p>
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">{ref.tier} • {ref.energy}</p>
                <p className="text-xs text-zinc-300">{ref.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className={`p-6 rounded-[2.5rem] border ${theme.surface}`}>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">Scenario Briefing</p>
            <h3 className={`text-2xl font-black ${theme.textPrimary}`}>Note & Narrative Export</h3>
          </div>
          <span className="text-xs uppercase tracking-[0.3em] text-zinc-500">Autonomous note</span>
        </div>
        <textarea
          value={scenarioNote}
          onChange={(e) => setScenarioNote(e.target.value)}
          rows={4}
          placeholder="Document how this kinetic event should read in lore—control the context before you sync it to the vault."
          className={`mt-4 w-full p-4 rounded-2xl border text-sm outline-none transition-all resize-none ${darkMode ? 'bg-zinc-900 border-zinc-800 text-white focus:border-white' : 'bg-zinc-50 border-zinc-200 text-black focus:border-black'}`}
        />
        <div className="mt-4 rounded-2xl border px-4 py-3 bg-zinc-950/30">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Console Summary</p>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {scenarioNote.trim() ? scenarioNote : consoleSummary}
          </p>
        </div>
      </section>
    </div>
  );
};

const App: React.FC = () => {
  const [currentView, setView] = useState<AppView>('dashboard');
  const [darkMode, setDarkMode] = useState(true);
  const [entities, setEntities] = useState<Entity[]>(() => {
    const saved = localStorage.getItem('omni-entities');
    return saved ? JSON.parse(saved) : [];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  
  // VS State
  const [vsMode, setVsMode] = useState<BattleMode>('1v1');
  const [vsCombatants, setVsCombatants] = useState<VsCombatant[]>([]);
  const [verdict, setVerdict] = useState<VersusVerdict | null>(null);

  // Calc State
  const [calcMass, setCalcMass] = useState('');
  const [calcVelocity, setCalcVelocity] = useState('');
  const [calcResult, setCalcResult] = useState<number | null>(null);
  const [indexModalOpen, setIndexModalOpen] = useState(false);
  const [pendingEntityName, setPendingEntityName] = useState('');
  const [duelWarningVisible, setDuelWarningVisible] = useState(false);
  const [duelWarningMessage, setDuelWarningMessage] = useState('');
  const duelWarningTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const theme = createThemeClasses(darkMode);

  const showDuelWarning = (message: string) => {
    setDuelWarningMessage(message);
    setDuelWarningVisible(true);
    if (duelWarningTimer.current) {
      clearTimeout(duelWarningTimer.current);
    }
    duelWarningTimer.current = setTimeout(() => {
      setDuelWarningVisible(false);
    }, 3000);
  };

  useEffect(() => {
    localStorage.setItem('omni-entities', JSON.stringify(entities));
  }, [entities]);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
      document.body.style.backgroundColor = '#000000';
    } else {
      document.body.classList.remove('dark');
      document.body.style.backgroundColor = '#F4F4F5'; // zinc-100
    }
  }, [darkMode]);

  useEffect(() => {
    return () => {
      if (duelWarningTimer.current) {
        clearTimeout(duelWarningTimer.current);
      }
    };
  }, []);

  const addEntityByName = async (name: string) => {
    setLoading(true);
    try {
      const newEntity = await geminiService.analyzeEntity(name);
      setEntities(prev => [newEntity, ...prev]);
      setSelectedEntity(newEntity);
    } catch (error) {
      console.error("Analysis failed", error);
      window.alert("Synchronization error with Omni-Vault. The entity could not be retrieved. Please check your network or try again later.");
    } finally {
      setLoading(false);
    }
  };

  const openIndexModal = () => setIndexModalOpen(true);
  const closeIndexModal = () => {
    setIndexModalOpen(false);
    setPendingEntityName('');
  };

  const handleIndexSubmit = async () => {
    const trimmed = pendingEntityName.trim();
    if (!trimmed) return;
    await addEntityByName(trimmed);
    closeIndexModal();
  };

  const resetVsState = () => {
    setVsCombatants([]);
    setVerdict(null);
  };

  const handleModeChange = (mode: BattleMode) => {
    setVsMode(mode);
    resetVsState();
  };

  const clearCombatants = () => {
    setVsCombatants([]);
    setVerdict(null);
  };

  const handleSimulateBattle = async () => {
    const readiness = evaluateBattleReadiness(vsCombatants, vsMode);
    if (!readiness.ready) {
      alert(readiness.message);
      return;
    }
    setLoading(true);
    setVerdict(null);
    try {
      const payload = vsCombatants.map(combatant => ({
        ...combatant.entity,
        team: combatant.team ? (combatant.team === 'A' ? 'Team Alpha' : 'Team Beta') : undefined
      }));
      const result = await geminiService.simulateBattle(payload, vsMode);
      setVerdict(result);
    } catch (error) {
      console.error("Versus simulation failed", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCombatant = (entity: Entity, team?: 'A' | 'B') => {
    setVsCombatants(prev => {
      const existingIndex = prev.findIndex(c => c.entity.id === entity.id);
      if (vsMode === 'Team') {
        if (!team) return prev;
        if (existingIndex >= 0) {
          const existing = prev[existingIndex];
          if (existing.team === team) {
            return prev.filter((_, idx) => idx !== existingIndex);
          }
          const updated = [...prev];
          updated[existingIndex] = { entity, team };
          return updated;
        }
        return [...prev, { entity, team }];
      }

      if (existingIndex >= 0) {
        return prev.filter((_, idx) => idx !== existingIndex);
      }
      if (vsMode === '1v1' && prev.length >= 2) {
        showDuelWarning('Duel mode requires exactly two combatants.');
        return prev;
      }
      return [...prev, { entity }];
    });
  };

  const removeEntity = (id: string) => {
    setEntities(prev => prev.filter(e => e.id !== id));
  };

  const calculateKE = () => {
    const m = parseFloat(calcMass);
    const v = parseFloat(calcVelocity);
    if (!isNaN(m) && !isNaN(v)) {
      const ke = 0.5 * m * Math.pow(v, 2);
      setCalcResult(ke);
    }
  };

  const getTierFromEnergy = (joules: number) => {
    if (joules < 1000) return "10-B: Average Human";
    if (joules < 15000) return "9-B: Wall Level";
    if (joules < 10**9) return "8-B: City Block";
    if (joules < 10**13) return "7-B: City Level";
    if (joules < 10**22) return "6-A: Continent Level";
    if (joules < 10**32) return "5-B: Planet Level";
    return "High Tier (Stellar/Universal+)";
  };

  const filteredEntities = entities.filter(e => 
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.verse.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const battleReadiness = evaluateBattleReadiness(vsCombatants, vsMode);

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardView
            entities={entities}
            setSelectedEntity={setSelectedEntity}
            openIndexModal={openIndexModal}
            benchmarkTier={PowerTier.TIER_6}
            theme={theme}
            darkMode={darkMode}
          />
        );
      case 'profiles':
        return (
          <ProfilesView
            filteredEntities={filteredEntities}
            totalEntities={entities.length}
            setSelectedEntity={setSelectedEntity}
            openIndexModal={openIndexModal}
            loading={loading}
            removeEntity={removeEntity}
            theme={theme}
            darkMode={darkMode}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        );
      case 'versus':
        return (
          <VersusView
            darkMode={darkMode}
            entities={entities}
            vsCombatants={vsCombatants}
            toggleCombatant={toggleCombatant}
            vsMode={vsMode}
            handleSimulateBattle={handleSimulateBattle}
            verdict={verdict}
            theme={theme}
            loading={loading}
            onModeChange={handleModeChange}
            readiness={battleReadiness}
            duelWarningMessage={duelWarningMessage}
            duelWarningVisible={duelWarningVisible}
            clearSelections={clearCombatants}
          />
        );
      case 'hierarchy':
        return <HierarchyView theme={theme} darkMode={darkMode} />;
      case 'calculator':
        return (
          <CalculatorView
            theme={theme}
            darkMode={darkMode}
            calcMass={calcMass}
            calcVelocity={calcVelocity}
            calcResult={calcResult}
            setCalcMass={setCalcMass}
            setCalcVelocity={setCalcVelocity}
            calculateKE={calculateKE}
            getTierFromEnergy={getTierFromEnergy}
          />
        );
      default:
        return <div>Section construction in progress.</div>;
    }
  };

  return (
    <div className={`flex h-screen overflow-hidden ${darkMode ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-900'} transition-colors duration-300`}>
      <Sidebar 
        currentView={currentView} 
        setView={setView} 
        darkMode={darkMode} 
        toggleDarkMode={() => setDarkMode(!darkMode)} 
      />
      
      <main className="flex-1 overflow-y-auto relative custom-scrollbar">
        <div className="max-w-5xl lg:max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-10 md:py-12 min-h-full flex flex-col">
          {renderContent()}
        </div>

        {/* Global Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl flex items-center justify-center z-[200] animate-in fade-in duration-500">
             <div className="flex flex-col items-center gap-10">
                <div className="relative">
                  <div className="w-32 h-32 border-[6px] border-zinc-900 rounded-full"></div>
                  <div className="w-32 h-32 border-t-[6px] border-white rounded-full animate-spin absolute top-0 left-0 shadow-[0_0_50px_rgba(255,255,255,0.2)]"></div>
                  <Activity size={48} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white animate-pulse" />
                </div>
                <div className="text-center space-y-3">
                  <p className="text-xl font-black tracking-[0.6em] uppercase text-white animate-pulse">Omni-Vault Syncing</p>
                  <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono">Querying Multiversal Records & Conceptual Feats...</p>
                </div>
             </div>
          </div>
        )}

        {/* Detail Modal */}
        {selectedEntity && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-10 bg-black/95 backdrop-blur-3xl animate-in fade-in zoom-in-95 duration-500">
            <div className={`w-full max-w-7xl max-h-[95vh] overflow-y-auto rounded-[4rem] border transition-all ${darkMode ? 'bg-zinc-950 border-zinc-800 text-white shadow-[0_0_150px_rgba(0,0,0,1)]' : 'bg-white border-zinc-200 text-black shadow-2xl'} relative custom-scrollbar`}>
              <button 
                onClick={() => setSelectedEntity(null)}
                className={`sticky top-8 float-right mr-8 md:mr-12 p-4 rounded-2xl transition-all z-20 shadow-2xl active:scale-90 ${darkMode ? 'bg-zinc-900 border border-zinc-800 text-white hover:bg-white hover:text-black' : 'bg-black text-white hover:bg-zinc-800'}`}
              >
                <X size={32} />
              </button>

              <div className="p-10 md:p-20 space-y-24">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-16 border-b border-zinc-800/20 pb-16">
                  <div className="space-y-8 flex-1">
                    <div className="flex flex-wrap items-center gap-5">
                      <span className={`px-5 py-2 rounded-full border text-[10px] font-black uppercase tracking-[0.3em] ${darkMode ? 'bg-white/5 border-white/10 text-zinc-400' : 'bg-zinc-100 border-zinc-200 text-zinc-600'}`}>{selectedEntity.verse}</span>
                      <div className={`w-1.5 h-1.5 rounded-full ${darkMode ? 'bg-zinc-800' : 'bg-zinc-300'}`} />
                      <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest font-bold">Record ID: {selectedEntity.id.toUpperCase()}</span>
                    </div>
                    <h2 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-none ${darkMode ? 'text-white' : 'text-black'}`}>{selectedEntity.name}</h2>
                    <p className={`font-black text-sm md:text-lg uppercase tracking-[0.4em] ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>{selectedEntity.version}</p>
                  </div>
                  <div className="text-center md:text-right shrink-0">
                    <p className="text-[10px] text-zinc-600 uppercase font-black tracking-[0.5em] mb-6">Omni-Vault Scale</p>
                    <p className={`text-4xl sm:text-5xl md:text-6xl font-black font-mono leading-none border-b-[12px] pb-4 inline-block shadow-[0_20px_60px_rgba(0,0,0,0.1)] ${darkMode ? 'text-white border-white' : 'text-black border-black'}`}>{selectedEntity.tier}</p>
                  </div>
                </header>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                <div className="lg:col-span-5 space-y-12">
                  <div className={`p-10 rounded-[3rem] border ${darkMode ? 'bg-black border-zinc-900 shadow-[0_0_40px_rgba(0,0,0,0.8)]' : 'bg-zinc-50 border-zinc-200 shadow-inner'}`}>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">Speed Index</p>
                        <p className={`text-base font-black ${darkMode ? 'text-white' : 'text-zinc-900'}`}>{selectedEntity.stats.speed}</p>
                      </div>
                      <p className="text-xs uppercase text-zinc-400 tracking-[0.5em]">Stat</p>
                    </div>
                    <StatRadar stats={selectedEntity.stats} color={darkMode ? '#FFFFFF' : '#000000'} />
                    <div className="mt-8 grid grid-cols-2 gap-6">
                      {[
                        { label: 'Durability', value: selectedEntity.stats.durability },
                        { label: 'Attack Potency', value: selectedEntity.stats.attackPotency }
                      ].map((stat, index) => (
                        <div key={index} className={`p-4 rounded-2xl border ${darkMode ? 'border-zinc-800' : 'border-zinc-200'} bg-opacity-50`}>
                          <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">{stat.label}</p>
                          <p className={`text-sm font-black ${darkMode ? 'text-white' : 'text-zinc-900'}`}>{stat.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <section className={`p-6 rounded-3xl border ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
                      <div className="flex items-center gap-3 mb-4">
                        <Flame size={24} className={darkMode ? 'text-white' : 'text-black'} />
                        <h3 className={`font-black uppercase text-sm tracking-[0.4em] ${darkMode ? 'text-white' : 'text-black'}`}>Tactical Hax</h3>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {selectedEntity.abilities.map((ability, index) => (
                          <span key={index} className={`px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-[0.3em] ${darkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-zinc-100 border-zinc-200 text-zinc-700'}`}>
                            {ability}
                          </span>
                        ))}
                      </div>
                    </section>

                    <section className={`p-6 rounded-3xl border ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
                      <div className="flex items-center gap-3 mb-4">
                        <Shield size={24} className={darkMode ? 'text-zinc-400' : 'text-zinc-500'} />
                        <h3 className={`font-black uppercase text-sm tracking-[0.4em] text-zinc-500`}>Resistances</h3>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {selectedEntity.resistances.map((resistance, index) => (
                          <span key={index} className={`px-3 py-2 rounded-2xl border text-[10px] font-bold tracking-[0.3em] ${darkMode ? 'bg-zinc-950 border-zinc-900/50 text-zinc-500' : 'bg-zinc-50 border-zinc-100 text-zinc-400'}`}>
                            {resistance}
                          </span>
                        ))}
                      </div>
                    </section>
                  </div>

                  <section className={`p-6 rounded-[2.5rem] border ${darkMode ? 'bg-zinc-900/30 border-zinc-800 shadow-2xl' : 'bg-zinc-50 border-zinc-200 shadow-inner'}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <Scale size={24} className="text-zinc-600" />
                      <h3 className="font-black uppercase text-xs tracking-[0.4em] text-zinc-500">Analytical Insights</h3>
                    </div>
                    <p className={`text-base leading-relaxed font-light italic ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                      {selectedEntity.notes || "No significant narrative anomalies or outliers detected within current continuity index."}
                    </p>
                  </section>
                </div>
              </div>

              <section className="space-y-8">
                <div className="flex flex-col gap-3 border-b border-zinc-800/20 pb-6">
                  <div className="flex items-center gap-3">
                    <Activity size={28} className={darkMode ? 'text-white' : 'text-black'} />
                    <h3 className={`font-black uppercase text-2xl tracking-tight ${darkMode ? 'text-white' : 'text-black'}`}>Feat Log & Evidence Matrix</h3>
                  </div>
                  <p className={`text-sm ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>Evidence curated across journals and multiversal scans, prioritized by confidence.</p>
                </div>
                <div className="grid gap-5 lg:grid-cols-2">
                  {selectedEntity.feats.map((feat, index) => (
                    <article
                      key={index}
                      className={`p-6 rounded-3xl border transition-all ${darkMode ? 'bg-zinc-900 border-zinc-800 shadow-[0_15px_40px_rgba(0,0,0,0.4)]' : 'bg-white border-zinc-200 shadow-xl'}`}
                    >
                      <div className="flex justify-between items-start gap-4 mb-3">
                        <h4 className={`text-xl font-black ${darkMode ? 'text-white' : 'text-zinc-900'}`}>{feat.title}</h4>
                        <span className="text-xs font-mono uppercase tracking-[0.3em] text-zinc-400">{(feat.confidence * 100).toFixed(0)}%</span>
                      </div>
                      <p className={`text-base leading-relaxed font-light italic ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>{feat.description}</p>
                      <div className="mt-4 flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.3em]">
                        <span className="px-3 py-1 rounded-full border border-zinc-800 text-zinc-400">{feat.tier}</span>
                        <span className="text-zinc-500">Source: {feat.source}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          </div>
          </div>
        )}

        {/* Index New Entity Modal */}
        {indexModalOpen && (
          <div className="fixed inset-0 z-[180] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl">
            <div className={`w-full max-w-3xl rounded-[3rem] border ${darkMode ? 'bg-zinc-950 border-zinc-800 text-white shadow-[0_0_80px_rgba(0,0,0,0.6)]' : 'bg-white border-zinc-200 text-black shadow-2xl'} relative`}>
              <div className="px-8 py-6 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-black">Omni-Vault Indexing</p>
                  <h3 className="text-2xl sm:text-3xl font-black leading-tight">Index a New Entity</h3>
                <p className={`text-sm leading-relaxed ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  Describe the character, entity, or concept you want analyzed. Include canon source, version, and any notable feats if available.
                </p>
                </div>
                <label className="text-xs uppercase tracking-[0.3em] text-zinc-500 font-black">Entity Keywords / Name</label>
                <input
                  type="text"
                  value={pendingEntityName}
                  onChange={(e) => setPendingEntityName(e.target.value)}
                  placeholder="e.g. Saitama (One Punch Man) | SCP-3812 (Tale of the White Void)"
                  className={`w-full p-4 rounded-2xl border text-sm outline-none transition-all placeholder:text-zinc-500 ${darkMode ? 'bg-zinc-900 border-zinc-800 text-white focus:border-white' : 'bg-zinc-50 border-zinc-200 text-black focus:border-black'}`}
                />
                <div className="flex flex-wrap justify-end gap-3 mt-4">
                  <button
                    onClick={closeIndexModal}
                    className={`px-4 py-3 rounded-2xl text-sm font-black uppercase tracking-[0.3em] border transition-all ${darkMode ? 'border-zinc-700 text-zinc-400 hover:bg-zinc-900' : 'border-zinc-200 text-zinc-500 hover:bg-zinc-100'}`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleIndexSubmit}
                    disabled={loading || !pendingEntityName.trim()}
                    className={`px-4 py-3 rounded-2xl text-sm font-black uppercase tracking-[0.3em] transition-all shadow-2xl ${darkMode ? 'bg-white text-black hover:bg-zinc-100 disabled:opacity-40' : 'bg-black text-white hover:bg-zinc-900 disabled:opacity-40'}`}
                  >
                    {loading ? 'Indexing...' : 'Index Entity'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
