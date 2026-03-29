import * as FileSystem from 'expo-file-system/legacy';
import { FILE_PATHS, ensureContextDir, readJSON, safeWriteJSON } from './fileSystem';

// Minimal types until Sprint 3 defines full interfaces in types.ts
export interface OverallContext {
  fitness_journey: {
    start_date: string;
    start_weight_kg: number;
    current_week: number;
  };
  weight_history: { date: string; weight_kg: number }[];
  observations: { date?: string; domain: string; observation: string }[];
  milestones: { date?: string; note: string }[];
}

const OVERALL_CONTEXT_SEED: OverallContext = {
  fitness_journey: {
    start_date: '2026-01-01',
    start_weight_kg: 74.0,
    current_week: 11,
  },
  weight_history: [
    { date: '2026-01-01', weight_kg: 74.0 },
    { date: '2026-03-13', weight_kg: 71.0 },
  ],
  observations: [],
  milestones: [],
};

async function ensureFileExists(): Promise<void> {
  await ensureContextDir();
  const info = await FileSystem.getInfoAsync(FILE_PATHS.overallContext);
  if (!info.exists) {
    await safeWriteJSON(FILE_PATHS.overallContext, OVERALL_CONTEXT_SEED);
  }
}

export async function readOverallContext(): Promise<OverallContext> {
  await ensureFileExists();
  return readJSON<OverallContext>(FILE_PATHS.overallContext);
}

export async function writeOverallContext(data: OverallContext): Promise<void> {
  await ensureContextDir();
  await safeWriteJSON(FILE_PATHS.overallContext, data);
}

export async function addWeightEntry(date: string, weightKg: number): Promise<void> {
  const ctx = await readOverallContext();
  ctx.weight_history.push({ date, weight_kg: weightKg });
  if (ctx.weight_history.length > 30) {
    ctx.weight_history = ctx.weight_history.slice(-30);
  }
  await safeWriteJSON(FILE_PATHS.overallContext, ctx);
}

export async function addObservation(domain: string, observation: string): Promise<void> {
  const ctx = await readOverallContext();
  ctx.observations.push({
    date: new Date().toISOString().split('T')[0],
    domain,
    observation,
  });
  if (ctx.observations.length > 20) {
    ctx.observations = ctx.observations.slice(-20);
  }
  await safeWriteJSON(FILE_PATHS.overallContext, ctx);
}

export async function addMilestone(note: string): Promise<void> {
  const ctx = await readOverallContext();
  ctx.milestones.push({
    date: new Date().toISOString().split('T')[0],
    note,
  });
  await safeWriteJSON(FILE_PATHS.overallContext, ctx);
}
