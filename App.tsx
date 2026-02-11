
import React, { useState, useEffect } from 'react';
import { AppView, Entity, PowerTier, HierarchyDefinition, BattleMode, VersusVerdict } from './types';
import Sidebar from './components/Sidebar';
import { 
  Search, Plus, Trash2, ArrowRightLeft, Target, Shield, Gauge, 
  ExternalLink, Info, Activity, GitBranch, ChevronRight, X, 
  Brain, Zap, Trophy, Flame, Layers, Calculator as CalcIcon, Scale,
  Users as UsersIcon, UserCheck, Swords, Globe, Sparkles
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
  const [vsCombatants, setVsCombatants] = useState<Entity[]>([]);
  const [verdict, setVerdict] = useState<VersusVerdict | null>(null);

  // Calc State
  const [calcMass, setCalcMass] = useState('');
  const [calcVelocity, setCalcVelocity] = useState('');
  const [calcResult, setCalcResult] = useState<number | null>(null);

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

  const handleAddEntity = async () => {
    const name = window.prompt("Enter character name to index (e.g. 'Saitama', 'Goku', 'SCP-3812'):");
    if (!name || name.trim() === "") return;
    
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

  const handleSimulateBattle = async () => {
    if (vsCombatants.length < 2) {
      alert("Minimum 2 combatants required for tactical simulation.");
      return;
    }
    setLoading(true);
    setVerdict(null);
    try {
      const result = await geminiService.simulateBattle(vsCombatants, vsMode);
      setVerdict(result);
    } catch (error) {
      console.error("Versus simulation failed", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCombatant = (e: Entity) => {
    setVsCombatants(prev => 
      prev.find(c => c.id === e.id) 
        ? prev.filter(c => c.id !== e.id)
        : [...prev, e]
    );
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

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <h2 className={`text-4xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-zinc-900'}`}>Tactical Overview</h2>
                <p className={`text-sm mt-2 ${darkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>Real-time analytical interface for multiversal scaling.</p>
              </div>
              <div className="flex gap-4">
                <div className={`p-4 rounded-xl border ${darkMode ? 'border-zinc-800 bg-zinc-900/50' : 'border-zinc-200 bg-white shadow-sm'}`}>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Total Indexed</p>
                  <p className={`text-2xl font-mono font-bold ${darkMode ? 'text-white' : 'text-zinc-900'}`}>{entities.length}</p>
                </div>
                <button 
                  onClick={handleAddEntity}
                  className={`flex items-center gap-3 px-8 py-4 rounded-xl border transition-all shadow-lg active:scale-95 ${darkMode ? 'border-zinc-700 bg-white text-black hover:bg-zinc-200' : 'border-zinc-800 bg-black text-white hover:bg-zinc-800'}`}
                >
                  <Sparkles size={18} />
                  <span className="text-xs font-black uppercase tracking-widest">Index New Entity</span>
                </button>
              </div>
            </header>

            {entities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {entities.slice(0, 3).map(entity => (
                  <div 
                    key={entity.id} 
                    onClick={() => setSelectedEntity(entity)}
                    className={`p-6 rounded-2xl border transition-all cursor-pointer group active:scale-[0.98] ${darkMode ? 'bg-zinc-900 border-zinc-800 hover:border-white/20' : 'bg-white border-zinc-200 shadow-sm hover:border-black/20'}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className={`text-lg font-bold group-hover:underline ${darkMode ? 'text-white' : 'text-zinc-900'}`}>{entity.name}</h4>
                        <p className={`text-xs ${darkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>{entity.verse}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-[10px] font-mono border ${darkMode ? 'border-zinc-700 text-zinc-400' : 'border-zinc-200 text-zinc-600 bg-zinc-50'}`}>
                        {entity.tier}
                      </span>
                    </div>
                    <StatRadar stats={entity.stats} color={darkMode ? '#FFFFFF' : '#000000'} />
                  </div>
                ))}
              </div>
            ) : (
              <div className={`p-16 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center text-center ${darkMode ? 'border-zinc-800 text-zinc-700' : 'border-zinc-300 text-zinc-400'}`}>
                <div className="w-20 h-20 rounded-full bg-zinc-900/50 flex items-center justify-center mb-6">
                  <Plus size={40} className="opacity-20" />
                </div>
                <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-zinc-900'}`}>Omni-Vault is Empty</h3>
                <p className={`max-w-xs text-sm ${darkMode ? 'opacity-60 text-zinc-400' : 'text-zinc-600'}`}>The database requires character indexing to function. Start by adding an entity from any fiction or non-fiction verse.</p>
                <button 
                  onClick={handleAddEntity} 
                  className={`mt-8 px-10 py-4 rounded-full text-xs font-black uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 ${darkMode ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'}`}
                >
                  Index First Character
                </button>
              </div>
            )}

            {entities.length > 0 && (
              <section className={`p-8 rounded-2xl border ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
                <div className="flex items-center gap-3 mb-6">
                  <Activity size={24} className={darkMode ? 'text-white' : 'text-zinc-900'} />
                  <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-zinc-900'}`}>System Feed</h3>
                </div>
                <div className="space-y-4">
                  {entities.slice(0, 3).map((e, i) => (
                    <div key={e.id} className={`flex gap-4 items-center p-5 rounded-xl border-l-4 transition-all cursor-pointer ${darkMode ? 'border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300' : 'border-black/10 bg-zinc-50 hover:bg-zinc-100 text-zinc-700'}`} onClick={() => setSelectedEntity(e)}>
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center font-mono text-xs transition-all ${darkMode ? 'bg-black/40 text-zinc-400' : 'bg-white text-zinc-500 shadow-sm'}`}>
                        {String(i+1).padStart(2, '0')}
                       </div>
                       <div>
                         <p className="text-sm">
                          Entity Indexing Complete: <span className={`font-black ${darkMode ? 'text-white' : 'text-black'}`}>{e.name}</span>. Validated Tier: <span className={`font-mono font-bold ${darkMode ? 'text-white' : 'text-black'}`}>{e.tier}</span>.
                         </p>
                         <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter mt-1">Vault Sync ID: {e.id.toUpperCase()}</p>
                       </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        );
      case 'profiles':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
               <h2 className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-zinc-900'}`}>Entity Archives</h2>
               <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                 <div className="relative">
                   <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                   <input 
                    type="text" 
                    placeholder="Search characters..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`pl-12 pr-6 py-3 rounded-xl border text-sm outline-none transition-all w-full sm:w-64 ${darkMode ? 'bg-zinc-900 border-zinc-800 text-white focus:border-zinc-500' : 'bg-white border-zinc-200 focus:border-black text-black shadow-sm'}`}
                   />
                 </div>
                 <button 
                  onClick={handleAddEntity}
                  disabled={loading}
                  className={`flex items-center justify-center gap-3 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 ${darkMode ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'} disabled:opacity-50`}
                 >
                   <Plus size={18} />
                   {loading ? 'SYNCING...' : 'INDEX NEW'}
                 </button>
               </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {filteredEntities.map(entity => (
                <div 
                  key={entity.id} 
                  onClick={() => setSelectedEntity(entity)}
                  className={`p-6 rounded-2xl border grid grid-cols-12 gap-6 items-center cursor-pointer transition-all active:scale-[0.99] ${darkMode ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700' : 'bg-white border-zinc-200 shadow-sm hover:border-zinc-300'}`}
                >
                  <div className="col-span-12 md:col-span-3">
                    <h4 className={`text-xl font-black truncate ${darkMode ? 'text-white' : 'text-zinc-900'}`}>{entity.name}</h4>
                    <p className={`text-xs ${darkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>{entity.verse}</p>
                  </div>
                  <div className="col-span-6 md:col-span-2 text-center md:border-x border-zinc-800/20">
                    <p className="text-[10px] uppercase text-zinc-500 mb-1 font-black tracking-widest">Scaling Tier</p>
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border ${darkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-100 border-zinc-200 text-zinc-900'}`}>
                      {entity.tier}
                    </span>
                  </div>
                  <div className="col-span-12 md:col-span-4 flex gap-8 px-4 justify-around">
                    <div className="flex flex-col items-center">
                      <Target size={16} className="text-zinc-500 mb-1" />
                      <p className="text-[10px] uppercase text-zinc-500 font-bold tracking-tighter">AP</p>
                      <p className={`text-xs font-bold truncate max-w-[80px] ${darkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>{entity.stats.attackPotency}</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <Gauge size={16} className="text-zinc-500 mb-1" />
                      <p className="text-[10px] uppercase text-zinc-500 font-bold tracking-tighter">SPD</p>
                      <p className={`text-xs font-bold truncate max-w-[80px] ${darkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>{entity.stats.speed}</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <Shield size={16} className="text-zinc-500 mb-1" />
                      <p className="text-[10px] uppercase text-zinc-500 font-bold tracking-tighter">DUR</p>
                      <p className={`text-xs font-bold truncate max-w-[80px] ${darkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>{entity.stats.durability}</p>
                    </div>
                  </div>
                  <div className="col-span-6 md:col-span-3 flex justify-end gap-3">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setEntities(entities.filter(en => en.id !== entity.id)); }}
                      className={`p-3 rounded-xl transition-all ${darkMode ? 'text-zinc-500 hover:text-red-400 hover:bg-red-500/10' : 'text-zinc-400 hover:text-red-600 hover:bg-red-50 shadow-sm'}`}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
              {entities.length === 0 && (
                <div className={`text-center py-32 ${darkMode ? 'text-zinc-700' : 'text-zinc-400'} italic text-lg`}>
                  No characters indexed in the Omni-Vault.
                </div>
              )}
            </div>
          </div>
        );
      case 'versus':
        return (
          <div className="space-y-12 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
                 <h2 className={`text-4xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-zinc-900'}`}>Battle Simulator</h2>
                 <p className={`${darkMode ? 'text-zinc-500' : 'text-zinc-600'} text-sm mt-1`}>Cross-verse conflict modeling with analytical precision.</p>
              </div>
              <div className={`flex gap-2 p-1.5 rounded-2xl border ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
                {(['1v1', 'FFA', 'Team'] as BattleMode[]).map(mode => (
                  <button
                    key={mode}
                    onClick={() => { setVsMode(mode); setVerdict(null); setVsCombatants([]); }}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 ${vsMode === mode ? (darkMode ? 'bg-white text-black' : 'bg-black text-white shadow-lg') : (darkMode ? 'text-zinc-500 hover:text-white' : 'text-zinc-500 hover:text-black')}`}
                  >
                    {mode === '1v1' ? 'Duel' : mode === 'FFA' ? 'Chaos' : 'Team War'}
                  </button>
                ))}
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className={`lg:col-span-4 p-8 rounded-3xl border ${darkMode ? 'bg-zinc-950 border-zinc-800 shadow-2xl' : 'bg-white border-zinc-200 shadow-xl'}`}>
                <div className="flex justify-between items-center mb-8 border-b border-zinc-800/20 pb-4">
                  <h3 className={`text-xs font-black uppercase tracking-widest ${darkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>Deployment List</h3>
                  <span className={`text-[10px] font-mono px-2 py-1 rounded bg-zinc-900 ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>{vsCombatants.length} / MAX</span>
                </div>
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-3 custom-scrollbar">
                  {entities.length > 0 ? entities.map(e => (
                    <button
                      key={e.id}
                      onClick={() => toggleCombatant(e)}
                      className={`w-full flex items-center justify-between p-5 rounded-xl border transition-all active:scale-[0.98] ${
                        vsCombatants.find(c => c.id === e.id)
                          ? (darkMode ? 'border-white bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]' : 'border-black bg-zinc-100 text-black font-bold')
                          : (darkMode ? 'border-zinc-800/50 text-zinc-500 hover:border-zinc-600 hover:bg-zinc-900' : 'border-zinc-200 text-zinc-600 hover:border-zinc-400 hover:bg-zinc-50')
                      }`}
                    >
                      <div className="text-left">
                        <p className="text-sm font-black">{e.name}</p>
                        <p className="text-[10px] font-mono opacity-60 uppercase">{e.tier}</p>
                      </div>
                      {vsCombatants.find(c => c.id === e.id) ? <UserCheck size={18} /> : <Plus size={18} className="opacity-40" />}
                    </button>
                  )) : (
                    <div className="py-24 text-center opacity-30 italic text-sm">
                      Vault is currently empty.
                    </div>
                  )}
                </div>
              </div>

              <div className={`lg:col-span-8 p-12 rounded-3xl border flex flex-col min-h-[500px] transition-all ${darkMode ? 'bg-black border-zinc-800' : 'bg-zinc-100/50 border-zinc-200 shadow-inner'}`}>
                 <div className="flex-1">
                   <div className="flex flex-wrap gap-8 justify-center mb-16">
                      {vsCombatants.length > 0 ? vsCombatants.map(c => (
                        <div key={c.id} className="group relative p-8 rounded-3xl border border-white/10 bg-zinc-900 flex flex-col items-center gap-5 animate-in zoom-in-75 w-48 shadow-2xl">
                          <div className={`w-20 h-20 rounded-full border-2 flex items-center justify-center text-2xl font-black group-hover:scale-110 transition-all ${darkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-800 border-zinc-600 text-white'}`}>
                            {c.name.charAt(0)}
                          </div>
                          <div className="text-center w-full">
                            <p className="text-base font-black truncate w-full text-white">{c.name}</p>
                            <p className="text-[10px] font-mono text-zinc-500 mt-2 tracking-widest uppercase">{c.tier}</p>
                          </div>
                          <button onClick={() => toggleCombatant(c)} className="absolute -top-3 -right-3 p-2 rounded-full bg-red-600 text-white border-2 border-zinc-950 hover:bg-red-500 transition-all shadow-2xl active:scale-90"><X size={16} /></button>
                        </div>
                      )) : (
                        <div className={`text-center py-20 flex flex-col items-center ${darkMode ? 'opacity-20' : 'opacity-30'}`}>
                          <Swords size={100} className="mb-8" />
                          <p className={`text-2xl font-black uppercase tracking-tighter ${darkMode ? 'text-white' : 'text-zinc-900'}`}>Arena Deployment Pending</p>
                          <p className={`text-sm mt-3 ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>Select indexed combatants from the vault to initiate analysis.</p>
                        </div>
                      )}
                   </div>
                 </div>

                 {vsCombatants.length >= 2 && (
                   <button 
                    onClick={handleSimulateBattle}
                    disabled={loading}
                    className={`w-full py-8 rounded-3xl font-black tracking-[0.5em] uppercase text-xl transition-all shadow-2xl active:scale-95 ${darkMode ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'} disabled:opacity-30 disabled:cursor-not-allowed`}
                   >
                     {loading ? 'SIMULATING OUTCOMES...' : 'INITIATE CONFLICT'}
                   </button>
                 )}
              </div>
            </div>

            {verdict && (
              <div className={`p-12 rounded-[3.5rem] border animate-in slide-in-from-bottom-20 duration-1000 shadow-[0_0_100px_rgba(0,0,0,0.2)] ${darkMode ? 'bg-zinc-950 border-zinc-700' : 'bg-white border-zinc-200'}`}>
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 border-b border-zinc-800/20 pb-10 gap-8">
                  <div className="text-center md:text-left">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-3">Simulation Complete</p>
                    <h3 className={`text-5xl md:text-7xl font-black tracking-tighter mb-4 leading-none ${darkMode ? 'text-zinc-300' : 'text-zinc-500'}`}>
                      {vsMode === 'FFA' ? 'DOMINANT: ' : 'WINNER: '}<span className={darkMode ? 'text-white' : 'text-black'}>{verdict.winner}</span>
                    </h3>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-6">
                      <span className={`text-xs uppercase tracking-[0.2em] font-black px-5 py-2 rounded-xl border ${darkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-zinc-100 border-zinc-200 text-zinc-600'}`}>Difficulty: {verdict.difficulty}</span>
                      <span className={`text-xs uppercase tracking-[0.2em] font-black px-5 py-2 rounded-xl border ${darkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-zinc-100 border-zinc-200 text-zinc-600'}`}>{vsMode} Mode</span>
                    </div>
                  </div>
                  <Trophy size={96} className="text-yellow-500 drop-shadow-[0_0_40px_rgba(234,179,8,0.3)] animate-bounce-slow" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                   <div className="space-y-12">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-3">
                          <div className="w-10 h-1 bg-white" />
                          Analytical Summary
                        </h4>
                        <p className={`text-2xl leading-relaxed font-light italic ${darkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>{verdict.analysis}</p>
                      </div>
                      
                      {verdict.teamBreakdown && (
                        <div className={`p-8 rounded-3xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-zinc-50 border-zinc-200 shadow-sm'}`}>
                          <h4 className={`text-[10px] font-black uppercase tracking-widest mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>Tactical Synergy</h4>
                          <p className={`text-sm leading-relaxed ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>{verdict.teamBreakdown}</p>
                        </div>
                      )}

                      <div className="space-y-6">
                        <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">Key Performance Indicators</p>
                        <div className="space-y-4">
                          {verdict.keyFactors.map((f, i) => (
                            <div key={i} className={`flex gap-5 p-6 rounded-2xl border transition-all hover:scale-[1.02] ${darkMode ? 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-500' : 'bg-white border-zinc-200 shadow-sm hover:border-zinc-400'}`}>
                              <Zap size={24} className="text-yellow-500 flex-shrink-0" />
                              <p className={`text-sm leading-relaxed font-medium ${darkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>{f}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                   </div>

                   <div className="space-y-16">
                      {verdict.rankings && verdict.rankings.length > 0 && (
                        <div className={`p-10 rounded-[3rem] border ${darkMode ? 'bg-zinc-900 border-zinc-800 shadow-2xl' : 'bg-white border-zinc-200 shadow-lg'}`}>
                          <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-10 flex items-center gap-3">
                            <Layers size={16} />
                            Elimination Matrix
                          </h4>
                          <div className="space-y-6">
                            {verdict.rankings.map((r, i) => (
                              <div key={i} className="flex items-center gap-8 group">
                                <span className={`w-12 h-12 rounded-2xl flex items-center justify-center font-mono text-lg font-black border transition-all ${i === 0 ? (darkMode ? 'bg-white text-black border-white' : 'bg-black text-white border-black shadow-xl') : (darkMode ? 'bg-zinc-800 text-zinc-500 border-zinc-700' : 'bg-zinc-100 text-zinc-400 border-zinc-200')}`}>
                                  {i+1}
                                </span>
                                <p className={`text-2xl font-black tracking-tight transition-all ${i === 0 ? (darkMode ? 'text-white' : 'text-black') : (darkMode ? 'text-zinc-500 group-hover:text-zinc-300' : 'text-zinc-400 group-hover:text-zinc-600')}`}>{r}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className={`p-10 rounded-[3rem] border ${darkMode ? 'border-red-900/20 bg-red-950/5' : 'border-red-200 bg-red-50/50 shadow-inner'}`}>
                        <h4 className="text-xs font-black uppercase tracking-widest text-red-500/60 mb-8 flex items-center gap-3">
                          <Info size={16} />
                          Contingency Nodes
                        </h4>
                        <div className="space-y-6">
                          {verdict.conditionalOutcomes.map((o, i) => (
                            <div key={i} className={`flex gap-5 border-l-4 pl-8 py-2 ${darkMode ? 'border-red-900/30' : 'border-red-200'}`}>
                              <p className={`text-sm leading-relaxed italic ${darkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>{o}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            )}
          </div>
        );
      case 'hierarchy':
        return (
          <div className="space-y-16 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-zinc-800/20 pb-10 gap-8">
               <div className="max-w-3xl">
                  <h2 className={`text-6xl font-black tracking-tighter ${darkMode ? 'text-white' : 'text-zinc-900'}`}>Omni-Index</h2>
                  <p className={`text-lg mt-6 font-light leading-relaxed ${darkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>The definitive ontological classification system. Used to benchmark entities against physical, metaphysical, and conceptual planes of existence.</p>
               </div>
               <div className={`flex items-center gap-6 p-6 rounded-3xl border ${darkMode ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-zinc-200 shadow-lg'}`}>
                  <Globe size={48} className={darkMode ? 'text-zinc-700' : 'text-zinc-300'} />
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-black text-zinc-500 tracking-[0.3em] mb-1">Archive Version</p>
                    <p className={`text-lg font-mono font-bold ${darkMode ? 'text-zinc-300' : 'text-zinc-900'}`}>System 8.2.1</p>
                  </div>
               </div>
            </header>

            <div className="space-y-28">
              {HIERARCHY_DATA.map((cat, idx) => (
                <div key={idx} className="space-y-10">
                  <div className="flex items-center gap-8">
                    <h3 className={`text-xs font-black uppercase tracking-[0.6em] whitespace-nowrap ${darkMode ? 'text-zinc-600' : 'text-zinc-500'}`}>
                      {cat.category}
                    </h3>
                    <div className={`h-px flex-1 ${darkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {cat.subcategories.map((sub, sidx) => (
                      <div key={sidx} className={`group p-10 rounded-[3rem] border transition-all hover:scale-[1.03] ${darkMode ? 'bg-zinc-950 border-zinc-900 hover:border-zinc-500 shadow-2xl' : 'bg-white border-zinc-200 shadow-xl hover:border-black'}`}>
                        <div className="flex justify-between items-start mb-8">
                           <h4 className={`text-[10px] font-black tracking-[0.2em] uppercase py-2 px-5 rounded-xl border transition-all ${darkMode ? 'bg-zinc-900 border-zinc-800 text-white group-hover:bg-white group-hover:text-black' : 'bg-zinc-50 border-zinc-200 text-zinc-900 group-hover:bg-black group-hover:text-white'}`}>{sub.name}</h4>
                           <ChevronRight size={20} className={darkMode ? 'text-zinc-800' : 'text-zinc-300'} />
                        </div>
                        <p className={`text-sm leading-relaxed mb-10 font-light min-h-[60px] ${darkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>{sub.description}</p>
                        <div className={`pt-8 border-t ${darkMode ? 'border-zinc-900' : 'border-zinc-100'}`}>
                          <div className="flex items-center gap-3 mb-3">
                            <Layers size={14} className="text-zinc-500" />
                            <p className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Typical Archetypes</p>
                          </div>
                          <p className={`text-xs font-bold leading-relaxed italic ${darkMode ? 'text-zinc-400' : 'text-zinc-700'}`}>{sub.examples}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'calculator':
        return (
          <div className="space-y-12 animate-in fade-in duration-500">
            <header>
               <h2 className={`text-4xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-zinc-900'}`}>Energy Quantifier</h2>
               <p className={`${darkMode ? 'text-zinc-500' : 'text-zinc-600'} text-sm mt-2 font-light`}>Convert observed cinematic evidence into quantitative kinetic energy measurements.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className={`p-12 rounded-[3.5rem] border ${darkMode ? 'bg-zinc-950 border-zinc-800 shadow-2xl' : 'bg-white border-zinc-200 shadow-xl'}`}>
                <div className="flex items-center gap-4 mb-10">
                  <CalcIcon size={24} className="text-zinc-500" />
                  <h3 className={`text-xl font-black uppercase tracking-[0.2em] ${darkMode ? 'text-white' : 'text-zinc-900'}`}>Kinetic Input</h3>
                </div>
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase text-zinc-500 font-black tracking-[0.3em]">Object Mass (kg)</label>
                    <input 
                      type="number" 
                      value={calcMass}
                      onChange={(e) => setCalcMass(e.target.value)}
                      placeholder="e.g. 1000" 
                      className={`w-full p-5 rounded-2xl border text-base outline-none transition-all ${darkMode ? 'bg-black border-zinc-800 text-white focus:border-zinc-500' : 'bg-zinc-50 border-zinc-200 focus:border-black text-black'}`} 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase text-zinc-500 font-black tracking-[0.3em]">Velocity (m/s)</label>
                    <input 
                      type="number" 
                      value={calcVelocity}
                      onChange={(e) => setCalcVelocity(e.target.value)}
                      placeholder="e.g. 300,000,000" 
                      className={`w-full p-5 rounded-2xl border text-base outline-none transition-all ${darkMode ? 'bg-black border-zinc-800 text-white focus:border-zinc-500' : 'bg-zinc-50 border-zinc-200 focus:border-black text-black'}`} 
                    />
                  </div>
                  <button 
                    onClick={calculateKE}
                    className={`w-full py-6 rounded-2xl font-black text-sm tracking-[0.4em] uppercase mt-8 transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-95 ${darkMode ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'}`}>
                    COMPUTE SCALE
                  </button>
                </div>
              </div>

              <div className={`p-12 rounded-[3.5rem] border flex flex-col justify-center items-center relative overflow-hidden transition-all ${darkMode ? 'bg-black border-zinc-800 shadow-2xl' : 'bg-zinc-100 border-zinc-300 shadow-inner'}`}>
                <div className={`absolute top-0 right-0 p-10 opacity-5 ${darkMode ? 'text-white' : 'text-black'}`}>
                  <Zap size={200} />
                </div>
                <p className="text-[10px] uppercase text-zinc-500 tracking-[0.5em] mb-6 font-black">Measured Yield</p>
                <p className={`text-6xl md:text-8xl font-mono font-black tracking-tighter ${darkMode ? 'text-white' : 'text-zinc-900'}`}>
                  {calcResult ? calcResult.toExponential(2) : '0.00'} J
                </p>
                <div className="mt-16 pt-16 border-t border-zinc-500/10 w-full text-center">
                  <p className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.3em] mb-4">Scaling Classification</p>
                  <p className={`text-2xl md:text-3xl font-black mt-2 px-10 py-4 rounded-2xl inline-block shadow-2xl ${darkMode ? 'bg-zinc-900 text-white border border-zinc-800' : 'bg-white text-black border border-zinc-200'}`}>
                    {calcResult ? getTierFromEnergy(calcResult) : 'No Data Detected'}
                  </p>
                </div>
              </div>
            </div>
          </div>
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
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-12 min-h-full flex flex-col">
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
                    <h2 className={`text-6xl md:text-9xl font-black tracking-tighter leading-none ${darkMode ? 'text-white' : 'text-black'}`}>{selectedEntity.name}</h2>
                    <p className={`font-black text-sm md:text-lg uppercase tracking-[0.4em] ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>{selectedEntity.version}</p>
                  </div>
                  <div className="text-center md:text-right shrink-0">
                    <p className="text-[10px] text-zinc-600 uppercase font-black tracking-[0.5em] mb-6">Omni-Vault Scale</p>
                    <p className={`text-6xl md:text-8xl font-black font-mono leading-none border-b-[12px] pb-4 inline-block shadow-[0_20px_60px_rgba(0,0,0,0.1)] ${darkMode ? 'text-white border-white' : 'text-black border-black'}`}>{selectedEntity.tier}</p>
                  </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
                  <div className="lg:col-span-5 space-y-12">
                     <div className={`p-12 rounded-[4rem] border ${darkMode ? 'bg-black border-zinc-900 shadow-2xl' : 'bg-zinc-50 border-zinc-200 shadow-inner'}`}>
                        <StatRadar stats={selectedEntity.stats} color={darkMode ? '#FFFFFF' : '#000000'} />
                        <div className="grid grid-cols-2 gap-8 mt-12">
                          <div className={`p-8 rounded-3xl border transition-all ${darkMode ? 'bg-zinc-950 border-zinc-900 hover:border-zinc-500' : 'bg-white border-zinc-200 shadow-sm'}`}>
                            <p className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em] mb-3">Speed Index</p>
                            <p className={`text-sm font-black truncate ${darkMode ? 'text-white' : 'text-zinc-900'}`}>{selectedEntity.stats.speed}</p>
                          </div>
                          <div className={`p-8 rounded-3xl border transition-all ${darkMode ? 'bg-zinc-950 border-zinc-900 hover:border-zinc-500' : 'bg-white border-zinc-200 shadow-sm'}`}>
                            <p className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em] mb-3">Durability Unit</p>
                            <p className={`text-sm font-black truncate ${darkMode ? 'text-white' : 'text-zinc-900'}`}>{selectedEntity.stats.durability}</p>
                          </div>
                        </div>
                     </div>
                  </div>

                  <div className="lg:col-span-7 space-y-16">
                    <section>
                      <div className={`flex items-center gap-4 mb-10 border-l-[6px] pl-8 ${darkMode ? 'border-white' : 'border-black'}`}>
                        <Flame size={32} className={darkMode ? 'text-white' : 'text-black'} />
                        <h3 className={`font-black uppercase text-xl tracking-[0.4em] ${darkMode ? 'text-white' : 'text-black'}`}>Tactical Hax</h3>
                      </div>
                      <div className="flex flex-wrap gap-5">
                        {selectedEntity.abilities.map((a, i) => (
                          <span key={i} className={`px-8 py-4 rounded-2xl border text-xs font-black uppercase tracking-widest transition-all ${darkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-500' : 'bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-black hover:text-white'}`}>{a}</span>
                        ))}
                      </div>
                    </section>

                    <section>
                      <div className={`flex items-center gap-4 mb-10 border-l-[6px] pl-8 ${darkMode ? 'border-zinc-800' : 'border-zinc-300'}`}>
                        <Shield size={32} className="text-zinc-500" />
                        <h3 className="font-black uppercase text-xl tracking-[0.4em] text-zinc-500">Resistances</h3>
                      </div>
                      <div className="flex flex-wrap gap-5">
                        {selectedEntity.resistances.map((r, i) => (
                          <span key={i} className={`px-6 py-3 rounded-xl border text-[10px] font-bold tracking-widest uppercase ${darkMode ? 'bg-zinc-950 border-zinc-900/50 text-zinc-700' : 'bg-zinc-50 border-zinc-100 text-zinc-400'}`}>{r}</span>
                        ))}
                      </div>
                    </section>

                    <section className={`p-12 rounded-[3.5rem] border ${darkMode ? 'bg-zinc-900/30 border-zinc-800 shadow-2xl' : 'bg-zinc-50 border-zinc-200 shadow-inner'}`}>
                      <div className="flex items-center gap-4 mb-8">
                        <Scale size={24} className="text-zinc-600" />
                        <h3 className="font-black uppercase text-xs tracking-[0.4em] text-zinc-500">Analytical Insights</h3>
                      </div>
                      <p className={`text-lg leading-relaxed font-light italic ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        {selectedEntity.notes || "No significant narrative anomalies or outliers detected within current continuity index."}
                      </p>
                    </section>
                  </div>
                </div>

                <section className="space-y-12">
                  <div className="flex items-center gap-5 border-b border-zinc-800/20 pb-10">
                    <Activity size={32} className={darkMode ? 'text-white' : 'text-black'} />
                    <h3 className={`font-black uppercase text-3xl tracking-tight ${darkMode ? 'text-white' : 'text-black'}`}>Feat Log & Evidence Matrix</h3>
                  </div>
                  <div className={`rounded-[3.5rem] border overflow-hidden ${darkMode ? 'border-zinc-900 bg-black/40 shadow-3xl' : 'border-zinc-200 bg-white shadow-2xl'}`}>
                    <table className="w-full text-left border-collapse">
                      <thead className={`text-[10px] uppercase font-black tracking-[0.4em] ${darkMode ? 'bg-zinc-900 text-zinc-500' : 'bg-zinc-100 text-zinc-600'}`}>
                        <tr>
                          <th className="px-12 py-10">Feat Index</th>
                          <th className="px-12 py-10">Evidence & Context</th>
                          <th className="px-12 py-10 text-center">Output Tier</th>
                          <th className="px-12 py-10 text-right">Confidence</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${darkMode ? 'divide-zinc-900' : 'divide-zinc-100'}`}>
                        {selectedEntity.feats.map((f, i) => (
                          <tr key={i} className={`group transition-all ${darkMode ? 'hover:bg-white/[0.03]' : 'hover:bg-zinc-50'}`}>
                            <td className={`px-12 py-12 font-black text-2xl tracking-tighter transition-all ${darkMode ? 'text-zinc-400 group-hover:text-white' : 'text-zinc-600 group-hover:text-black'}`}>{f.title}</td>
                            <td className={`px-12 py-12 text-base leading-relaxed max-w-md font-light italic ${darkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>{f.description}</td>
                            <td className="px-12 py-12 text-center">
                              <span className={`px-6 py-3 rounded-2xl border text-xs font-mono font-bold tracking-widest ${darkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-zinc-100 border-zinc-200 text-zinc-800 shadow-sm'}`}>{f.tier}</span>
                            </td>
                            <td className="px-12 py-12 text-right">
                              <div className="flex flex-col items-end">
                                <span className={`text-lg font-mono font-black ${darkMode ? 'text-zinc-700' : 'text-zinc-400'}`}>{(f.confidence * 100).toFixed(0)}%</span>
                                <div className={`w-24 h-1 rounded-full mt-2 ${darkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
                                  <div className="h-full bg-green-500 rounded-full" style={{width: `${f.confidence * 100}%`}}></div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
