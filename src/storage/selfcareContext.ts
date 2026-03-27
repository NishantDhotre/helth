import * as FileSystem from 'expo-file-system';
import { FILE_PATHS, ensureContextDir, readJSON, safeWriteJSON } from './fileSystem';
import type { SelfCareContext } from './types';

const SELFCARE_CONTEXT_SEED: SelfCareContext = {
  skin: {
    type: 'combination, oily T-zone',
    notes: 'post-gym skin tends to be oily',
  },
  routine: {
    morning: [
      { step: 'cleanser', product_key: 'cetaphil_cleanser', note: 'use detan on oily/gym days' },
      { step: 'toner', product_key: 'tonymoly_toner' },
      { step: 'moisturizer', product_key: 'dotkey_moisturizer' },
      { step: 'sunscreen', product_key: 'dotkey_sunscreen', critical: true },
      { step: 'lip_balm', product_key: 'wishcare_lip_balm' },
    ],
    evening: [
      { step: 'cleanser', product_key: 'cetaphil_cleanser' },
      { step: 'toner', product_key: 'tonymoly_toner' },
      { step: 'moisturizer', product_key: 'dotkey_moisturizer' },
      { step: 'lip_balm', product_key: 'wishcare_lip_balm', note: 'thick layer at night' },
    ],
  },
  weekly_actives: [
    {
      task: 'vitamin_c_serum', day: 'sunday', time: 'evening',
      product_key: 'vitamin_c_serum',
      gap_after_shaving_hrs: 48, gap_after_dermaroll_hrs: 48,
      cannot_combine_with: 'kumkumadi',
    },
    {
      task: 'kumkumadi', day: 'wednesday', time: 'evening',
      product_key: 'kumkumadi_oil',
      gap_after_shaving_hrs: 48, gap_after_dermaroll_hrs: 48,
      cannot_combine_with: 'vitamin_c',
    },
    {
      task: 'ice_roller', days: ['monday', 'friday'], time: 'morning',
      product_key: 'ice_roller',
      advance_warning_hrs: 24,
      advance_warning_text: 'Put ice roller in freezer — needed tomorrow morning',
    },
    {
      task: 'beard_dermaroll', day: 'thursday', time: 'evening',
      product_key: 'beard_derma_roller',
      gap_before_shaving_hrs: 48, gap_after_shaving_hrs: 48,
      no_actives_after_hrs: 48,
    },
    {
      task: 'beard_product', days: ['monday', 'tuesday', 'friday', 'sunday'],
      time: 'evening', product_key: 'beard_product_minoxidil',
      note: 'dry skin only, never same night as dermaroll',
    },
    {
      task: 'shampoo_conditioner', day: 'wednesday', time: 'evening',
      product_keys: ['scalpe_shampoo', 'plum_conditioner'],
    },
    {
      task: 'aha_body_scrub', day: 'wednesday', time: 'evening',
      product_key: 'aha_body_scrub',
      note: 'body only — avoid within 24hrs of body shaving',
    },
  ],
  constraints: {
    never_same_night: ['vitamin_c + kumkumadi'],
    post_shave_blackout_hrs: 48,
    post_dermaroll_blackout_hrs: 48,
    shaving_day: 'saturday',
    last_shave_date: null,
    last_dermaroll_date: null,
  },
  patterns: { learned: [] },
};

async function ensureFileExists(): Promise<void> {
  await ensureContextDir();
  const info = await FileSystem.getInfoAsync(FILE_PATHS.selfcareContext);
  if (!info.exists) {
    await safeWriteJSON(FILE_PATHS.selfcareContext, SELFCARE_CONTEXT_SEED);
  }
}

export async function readSelfCareContext(): Promise<SelfCareContext> {
  await ensureFileExists();
  return readJSON<SelfCareContext>(FILE_PATHS.selfcareContext);
}

export async function writeSelfCareContext(data: SelfCareContext): Promise<void> {
  await ensureContextDir();
  await safeWriteJSON(FILE_PATHS.selfcareContext, data);
}

export async function updateLastShaveDate(date: string): Promise<void> {
  const ctx = await readSelfCareContext();
  ctx.constraints.last_shave_date = date;
  await safeWriteJSON(FILE_PATHS.selfcareContext, ctx);
}

export async function updateLastDermarollDate(date: string): Promise<void> {
  const ctx = await readSelfCareContext();
  ctx.constraints.last_dermaroll_date = date;
  await safeWriteJSON(FILE_PATHS.selfcareContext, ctx);
}

export async function addSelfCarePattern(observation: string): Promise<void> {
  const ctx = await readSelfCareContext();
  ctx.patterns.learned.push({ observation });
  await safeWriteJSON(FILE_PATHS.selfcareContext, ctx);
}
