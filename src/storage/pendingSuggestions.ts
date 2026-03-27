import { FILE_PATHS, ensureContextDir, readJSON, safeWriteJSON } from './fileSystem';
import type { ChatType, PendingSuggestions, Suggestion } from './types';

const PENDING_SUGGESTIONS_SEED: PendingSuggestions = {
  suggestions: [],
};

async function ensureFileExists(): Promise<void> {
  await ensureContextDir();
  const existing = await readJSON<PendingSuggestions | null>(FILE_PATHS.pendingSuggestions).catch(() => null);
  if (!existing) {
    await safeWriteJSON(FILE_PATHS.pendingSuggestions, PENDING_SUGGESTIONS_SEED);
  }
}

export async function readPendingSuggestions(): Promise<PendingSuggestions> {
  await ensureFileExists();
  return readJSON<PendingSuggestions>(FILE_PATHS.pendingSuggestions);
}

export async function getPendingForChat(chatType: ChatType): Promise<Suggestion[]> {
  const all = await readPendingSuggestions();
  return all.suggestions.filter((s) => s.target_chat === chatType && s.status === 'pending');
}

export async function writeSuggestion(suggestion: Omit<Suggestion, 'id'>): Promise<void> {
  await ensureFileExists();
  const data = await readPendingSuggestions();

  const id = `sug_${Date.now().toString(36)}`;
  const newSuggestion: Suggestion = {
    ...suggestion,
    id,
  };

  const updated: PendingSuggestions = {
    suggestions: [...data.suggestions, newSuggestion],
  };

  await safeWriteJSON(FILE_PATHS.pendingSuggestions, updated);
}

async function updateStatus(id: string, status: Suggestion['status']): Promise<void> {
  await ensureFileExists();
  const data = await readPendingSuggestions();

  const updated: PendingSuggestions = {
    suggestions: data.suggestions.map((s) => (s.id === id ? { ...s, status } : s)),
  };

  await safeWriteJSON(FILE_PATHS.pendingSuggestions, updated);
}

export async function markAcknowledged(id: string): Promise<void> {
  await updateStatus(id, 'acknowledged');
}

export async function markImplemented(id: string): Promise<void> {
  await updateStatus(id, 'implemented');
}

