import * as FileSystem from 'expo-file-system';
import { FILE_PATHS, ensureContextDir, readJSON, safeWriteJSON } from './fileSystem';
import type { SelfCareInventory } from './types';

const SELFCARE_INVENTORY_SEED: SelfCareInventory = {
  last_updated: '2026-03-13',
  items: {
    cetaphil_cleanser:       { display_name: 'Cetaphil Gentle Cleanser',           in_stock: true },
    detan_face_wash:         { display_name: 'Dot & Key Mango Detan Face Wash',     in_stock: true },
    tonymoly_toner:          { display_name: 'TONYMOLY Ceramide Mochi Toner',       in_stock: true },
    dotkey_moisturizer:      { display_name: 'Dot & Key Ceramide + HA Moisturizer', in_stock: true },
    dotkey_sunscreen:        { display_name: 'Dot & Key SPF 50 Sunscreen',          in_stock: true },
    wishcare_lip_balm:       { display_name: 'WishCare SPF 50 Lip Balm',            in_stock: true },
    vitamin_c_serum:         { display_name: 'Plum 15% Vitamin C Serum',            in_stock: true },
    kumkumadi_oil:           { display_name: 'Kumkumadi Oil',                        in_stock: true },
    aha_body_scrub:          { display_name: 'Bodywise 10% AHA Body Scrub',         in_stock: true },
    scalpe_shampoo:          { display_name: 'Scalpe Pro Anti-Dandruff Shampoo',    in_stock: true },
    plum_conditioner:        { display_name: 'Plum Conditioner',                    in_stock: true },
    beard_derma_roller:      { display_name: 'Beard Derma Roller 0.5mm',            in_stock: true },
    beard_product_minoxidil: { display_name: 'Minoxidil / Beard Oil',               in_stock: true },
    ice_roller:              { display_name: 'Ice Roller',                           in_stock: true },
  },
};

async function ensureFileExists(): Promise<void> {
  await ensureContextDir();
  const info = await FileSystem.getInfoAsync(FILE_PATHS.selfcareInventory);
  if (!info.exists) {
    await safeWriteJSON(FILE_PATHS.selfcareInventory, SELFCARE_INVENTORY_SEED);
  }
}

export async function readSelfCareInventory(): Promise<SelfCareInventory> {
  await ensureFileExists();
  return readJSON<SelfCareInventory>(FILE_PATHS.selfcareInventory);
}

export async function writeSelfCareInventory(data: SelfCareInventory): Promise<void> {
  await ensureContextDir();
  await safeWriteJSON(FILE_PATHS.selfcareInventory, data);
}

export async function setItemStock(key: string, inStock: boolean): Promise<void> {
  const inv = await readSelfCareInventory();
  if (inv.items[key]) {
    inv.items[key].in_stock = inStock;
    inv.last_updated = new Date().toISOString().split('T')[0];
    await safeWriteJSON(FILE_PATHS.selfcareInventory, inv);
  }
}

export async function addItem(key: string, displayName: string): Promise<void> {
  const inv = await readSelfCareInventory();
  inv.items[key] = { display_name: displayName, in_stock: true };
  inv.last_updated = new Date().toISOString().split('T')[0];
  await safeWriteJSON(FILE_PATHS.selfcareInventory, inv);
}

export async function removeItem(key: string): Promise<void> {
  const inv = await readSelfCareInventory();
  delete inv.items[key];
  inv.last_updated = new Date().toISOString().split('T')[0];
  await safeWriteJSON(FILE_PATHS.selfcareInventory, inv);
}
