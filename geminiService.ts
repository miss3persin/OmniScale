import { GoogleGenAI, Type } from "@google/genai";
import { Entity, VersusVerdict, BattleMode } from "./types";

const getApiKey = (): string => {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) {
    throw new Error(
      "Missing Gemini API key. Set VITE_GEMINI_API_KEY in a local .env file before using AI features."
    );
  }
  return key;
};

const withTimeout = async <T>(promise: Promise<T>, ms: number, message: string): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), ms);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

const safeParseJson = <T>(raw: string | undefined, fallback: T): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const assertEntityShape = (data: Partial<Entity>): Entity => {
  if (!data.name || !data.verse || !data.version || !data.tier) {
    throw new Error("Gemini response is missing required entity fields.");
  }

  const stats = data.stats;
  if (
    !stats ||
    !stats.attackPotency ||
    !stats.durability ||
    !stats.speed ||
    !stats.liftingStrength ||
    !stats.strikingStrength ||
    !stats.intelligence
  ) {
    throw new Error("Gemini response is missing a complete stat block.");
  }

  if (!Array.isArray(data.abilities) || !Array.isArray(data.resistances) || !Array.isArray(data.weaknesses) || !Array.isArray(data.feats)) {
    throw new Error("Gemini response is missing array fields for abilities/resistances/weaknesses/feats.");
  }

  return {
    id: crypto.randomUUID().slice(0, 12),
    name: data.name,
    verse: data.verse,
    version: data.version,
    tier: data.tier,
    stats,
    abilities: data.abilities,
    resistances: data.resistances,
    weaknesses: data.weaknesses,
    feats: data.feats,
    notes: data.notes,
  };
};

const assertVerdictShape = (data: Partial<VersusVerdict>): VersusVerdict => {
  if (!data.winner || !data.difficulty || !data.analysis || !Array.isArray(data.keyFactors) || !Array.isArray(data.conditionalOutcomes)) {
    throw new Error("Gemini response is missing required verdict fields.");
  }

  return {
    winner: data.winner,
    difficulty: data.difficulty,
    analysis: data.analysis,
    keyFactors: data.keyFactors,
    conditionalOutcomes: data.conditionalOutcomes,
    rankings: data.rankings,
    teamBreakdown: data.teamBreakdown,
  };
};

export const geminiService = {
  async analyzeEntity(name: string): Promise<Entity> {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const response = await withTimeout(ai.models.generateContent({
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
              required: ["attackPotency", "durability", "speed", "liftingStrength", "strikingStrength", "intelligence"],
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
                required: ["title", "description", "tier", "source", "confidence"],
              },
            },
          },
          required: ["name", "verse", "version", "tier", "stats", "abilities", "resistances", "weaknesses", "feats"],
        },
      },
    }), 25000, "Gemini request timed out while indexing entity. Please retry.");

    return assertEntityShape(safeParseJson<Partial<Entity>>(response.text, {}));
  },

  async simulateBattle(entities: Entity[], mode: BattleMode): Promise<VersusVerdict> {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const combatantsInfo = entities.map((e) => ({
      name: e.name,
      tier: e.tier,
      stats: e.stats,
      abilities: e.abilities,
      resistances: e.resistances,
    }));

    const prompt = `VS BATTLE SIMULATION ENGINE
    Mode: ${mode}
    Combatants: ${JSON.stringify(combatantsInfo)}

    Instructions:
    - If 1v1: Traditional duel analysis.
    - If FFA: Rank survival and performance of all parties.
    - If Team: Split them logically into two balanced or canon-relevant teams and analyze synergy.
    - Factor in: Hax, Speed blitz potential, Resistance nullification, and Dimensional scaling.
    - Tone: Detached, tactical, evidentiary.`;

    const response = await withTimeout(ai.models.generateContent({
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
            teamBreakdown: { type: Type.STRING },
          },
          required: ["winner", "difficulty", "analysis", "keyFactors", "conditionalOutcomes"],
        },
      },
    }), 25000, "Gemini request timed out during battle simulation. Please retry.");

    return assertVerdictShape(safeParseJson<Partial<VersusVerdict>>(response.text, {}));
  },
};
