
import { GoogleGenAI, Type } from "@google/genai";
import { Entity, VersusVerdict, BattleMode, PowerTier, Feat } from "./types";

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  return new GoogleGenAI({ apiKey });
};

const parseJSON = (text: string) => {
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
};

const safeString = (value: unknown, fallback: string) => {
  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }
  return fallback;
};

const safeArray = <T>(value: unknown, fallback: T[] = []) => {
  return Array.isArray(value) ? (value as T[]) : fallback;
};

const normalizeStats = (stats: any) => ({
  attackPotency: safeString(stats?.attackPotency, "Unknown"),
  durability: safeString(stats?.durability, "Unknown"),
  speed: safeString(stats?.speed, "Unknown"),
  liftingStrength: safeString(stats?.liftingStrength, "Unknown"),
  strikingStrength: safeString(stats?.strikingStrength, "Unknown"),
  intelligence: safeString(stats?.intelligence, "Unknown"),
});

const normalizeFeats = (feats: any): Feat[] => {
  return safeArray<any>(feats).map((feat) => ({
    title: safeString(feat?.title, "Unknown Feat"),
    description: safeString(feat?.description, "No description provided."),
    tier: safeString(feat?.tier, "Unknown Tier"),
    source: safeString(feat?.source, "Unknown Source"),
    confidence: typeof feat?.confidence === "number" ? feat.confidence : 0.5,
  }));
};

const normalizeEntity = (data: any): Entity => ({
  id: "",
  name: safeString(data?.name, "Untitled Entity"),
  verse: safeString(data?.verse, "Unknown Verse"),
  version: safeString(data?.version, "Canonical 0.0"),
  tier: safeString(data?.tier, PowerTier.TIER_6),
  stats: normalizeStats(data?.stats),
  abilities: safeArray<string>(data?.abilities),
  resistances: safeArray<string>(data?.resistances),
  weaknesses: safeArray<string>(data?.weaknesses),
  feats: normalizeFeats(data?.feats),
  notes: safeString(data?.notes, ""),
});

const difficultyMapping: Record<string, VersusVerdict["difficulty"]> = {
  'neg diff': 'Neg Diff',
  'negative diff': 'Neg Diff',
  'neg difficulty': 'Neg Diff',
  'negative difficulty': 'Neg Diff',
  'no diff': 'No Diff',
  'no difference': 'No Diff',
  'no concept of diff': 'No Diff',
  'conceptless': 'No Diff',
  'low': 'Low Diff',
  'low diff': 'Low Diff',
  'low difficulty': 'Low Diff',
  'mid': 'Mid Diff',
  'mid diff': 'Mid Diff',
  'mid difficulty': 'Mid Diff',
  'medium': 'Mid Diff',
  'high': 'High Diff',
  'high diff': 'High Diff',
  'high difficulty': 'High Diff',
  'extreme': 'Extreme Diff',
  'extreme diff': 'Extreme Diff',
  'extreme difficulty': 'Extreme Diff',
  'inconclusive': 'Neg Diff',
  'unknown': 'Neg Diff'
};

const normalizeVerdict = (data: any): VersusVerdict => {
  const raw = typeof data?.difficulty === "string" ? data.difficulty.trim().toLowerCase() : "";
  const difficulty = difficultyMapping[raw] ?? 'Neg Diff';

  return {
    winner: safeString(data?.winner, "Inconclusive"),
    difficulty,
    analysis: safeString(data?.analysis, "No analysis provided."),
    keyFactors: safeArray<string>(data?.keyFactors),
    conditionalOutcomes: safeArray<string>(data?.conditionalOutcomes),
    rankings: safeArray<string>(data?.rankings),
    teamBreakdown: typeof data?.teamBreakdown === "string" ? data.teamBreakdown : undefined,
  };
};

export const geminiService = {
  async analyzeEntity(name: string): Promise<Entity> {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Perform a rigorous, expert-level powerscaling index for: "${name}".
      Include:
      1. Official Verse and Version (peak form or specific iteration).
      2. Exact Tier (Standard VSBW style: e.g., 10-C, 9-B, 5-A, 1-A, High 1-A).
      3. Precise Stat breakdowns (AP, Speed, Durability, etc.).
      4. List of complex Abilities/Hax and specific Resistances.
      5. 4+ Significant Feats with structured evidence and confidence scores.
      6. Analytical notes on cosmology scaling (e.g. R#C, dimensional transcendence).
      
      BE ANALYTICAL. Avoid bias. Output strictly in JSON format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            verse: { type: Type.STRING },
            version: { type: Type.STRING },
            tier: { type: Type.STRING },
            stats: {
              type: Type.OBJECT,
              properties: {
                attackPotency: { type: Type.STRING },
                durability: { type: Type.STRING },
                speed: { type: Type.STRING },
                liftingStrength: { type: Type.STRING },
                strikingStrength: { type: Type.STRING },
                intelligence: { type: Type.STRING },
              },
              required: ["attackPotency", "durability", "speed", "liftingStrength", "strikingStrength", "intelligence"]
            },
            abilities: { type: Type.ARRAY, items: { type: Type.STRING } },
            resistances: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            notes: { type: Type.STRING },
            feats: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  tier: { type: Type.STRING },
                  source: { type: Type.STRING },
                  confidence: { type: Type.NUMBER },
                },
                required: ["title", "description", "tier", "source", "confidence"]
              }
            }
          },
          required: ["name", "verse", "version", "tier", "stats", "abilities", "resistances", "weaknesses", "feats"]
        }
      }
    });

    const parsed = parseJSON(response.text || "{}");
    const entity = normalizeEntity(parsed);
    return {
      ...entity,
      id: Math.random().toString(36).substr(2, 9),
    };
  },

  async simulateBattle(combatants: (Entity & { team?: string })[], mode: BattleMode): Promise<VersusVerdict> {
    const ai = getGeminiClient();
    const combatantsInfo = combatants.map(e => ({
      name: e.name,
      tier: e.tier,
      stats: e.stats,
      abilities: e.abilities,
      resistances: e.resistances,
      ...(e.team ? { team: e.team } : {})
    }));

    const prompt = `VS BATTLE SIMULATION ENGINE
    Mode: ${mode}
    Combatants: ${JSON.stringify(combatantsInfo)}
    
    Instructions:
    - If 1v1: Traditional duel analysis.
    - If FFA: Rank survival and performance of all parties.
    - If Team: Split them logically into two balanced or canon-relevant teams and analyze synergy.
    - Report team assignments (e.g., Team Alpha vs Team Beta) when provided.
    - Factor in: Hax, Speed blitz potential, Resistance nullification, and Dimensional scaling.
    - Tone: Detached, tactical, evidentiary.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            winner: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            analysis: { type: Type.STRING },
            keyFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
            conditionalOutcomes: { type: Type.ARRAY, items: { type: Type.STRING } },
            rankings: { type: Type.ARRAY, items: { type: Type.STRING } },
            teamBreakdown: { type: Type.STRING }
          },
          required: ["winner", "difficulty", "analysis", "keyFactors", "conditionalOutcomes"]
        }
      }
    });

    const parsed = parseJSON(response.text || "{}");
    return normalizeVerdict(parsed);
  }
};
