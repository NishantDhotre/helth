import * as profileStorage from '../storage/profile';
import * as mealsCtx from '../storage/mealsContext';
import * as nutritionLog from '../storage/nutritionLog';
import * as selfcareCtx from '../storage/selfcareContext';
import * as selfcareInv from '../storage/selfcareInventory';
import * as selfcareLog from '../storage/selfcareLog';
import * as overallCtx from '../storage/overallContext';
import * as pending from '../storage/pendingSuggestions';

export async function parseResponse(raw: string): Promise<string> {
  const match = raw.match(/\[CONTEXT_UPDATE\]([\s\S]*?)\[\/CONTEXT_UPDATE\]/);
  if (match) {
    try {
      const update = JSON.parse(match[1].trim());
      await applyUpdate(update);
    } catch (e) {
      console.warn('CONTEXT_UPDATE parse failed:', e);
    }
  }
  return raw.replace(/\[CONTEXT_UPDATE\][\s\S]*?\[\/CONTEXT_UPDATE\]/, '').trim();
}

async function applyUpdate(u: any) {
  if (u.profile_update) {
    for (const [path, val] of Object.entries(u.profile_update)) {
      await profileStorage.updateField(path, val);
    }
  }

  if (u.nutrition_log_today?.meals_added) {
    for (const [mealType, desc] of Object.entries(u.nutrition_log_today.meals_added)) {
      const delta = u.nutrition_log_today.nutrition_delta ?? { kcal: 0, protein_g: 0 };
      await nutritionLog.addTodayMeal(mealType as any, desc as string, delta.kcal, delta.protein_g);
    }
  }

  if (u.selfcare_inventory) {
    for (const [key, val] of Object.entries(u.selfcare_inventory)) {
      await selfcareInv.setItemStock(key, val as boolean);
    }
  }

  if (u.selfcare_log_today) {
    const s = u.selfcare_log_today;
    if (s.skincare_morning) await selfcareLog.updateTodaySkincareMorning(s.skincare_morning);
    if (s.skincare_evening) await selfcareLog.updateTodaySkincareEvening(s.skincare_evening);
    if (s.actives_used?.length) await selfcareLog.addActivesUsed(s.actives_used);
    if (s.beard_done !== undefined) await selfcareLog.setBeardDone(s.beard_done);
    if (s.shaved !== undefined) {
      await selfcareLog.setShaved(s.shaved);
      if (s.shaved) {
        await selfcareCtx.updateLastShaveDate(new Date().toISOString().split('T')[0]);
      }
    }
  }

  if (u.selfcare_context_update?.constraints_update?.last_shave_date) {
    await selfcareCtx.updateLastShaveDate(u.selfcare_context_update.constraints_update.last_shave_date);
  }
  if (u.selfcare_context_update?.pattern_observation) {
    await selfcareCtx.addSelfCarePattern(u.selfcare_context_update.pattern_observation);
  }

  if (u.meals_context_update?.pattern_observation) {
    await mealsCtx.addMealPattern(u.meals_context_update.pattern_observation);
  }
  if (u.meals_context_update?.room_items_add) {
    const { item, note } = u.meals_context_update.room_items_add;
    await mealsCtx.addRoomItem(item, note);
  }

  if (u.overall_context_update?.weight_entry) {
    const { date, weight_kg } = u.overall_context_update.weight_entry;
    await overallCtx.addWeightEntry(date, weight_kg);
    await profileStorage.updateField('personal.weight_kg', weight_kg);
  }
  if (u.overall_context_update?.observation) {
    const { domain, observation } = u.overall_context_update.observation;
    await overallCtx.addObservation(domain, observation);
  }
  if (u.overall_context_update?.milestone) {
    await overallCtx.addMilestone(u.overall_context_update.milestone.note);
  }

  if (u.pending_suggestion) {
    await pending.writeSuggestion(u.pending_suggestion);
  }
  if (u.pending_suggestion_update) {
    if (u.pending_suggestion_update.status === 'implemented') {
      await pending.markImplemented(u.pending_suggestion_update.id);
    }
  }
}

