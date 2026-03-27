import * as SecureStore from 'expo-secure-store';
import { MEALS_SYSTEM_PROMPT, SELFCARE_SYSTEM_PROMPT } from './systemPrompts';
import { assembleMealsContext, assembleOverallContext, assembleSelfCareContext } from './contextAssembler';
import type { ChatType } from '../storage/types';
import { getDefaultPhotoPrompt } from './imageUtils';

type HistoryMessage = { role: 'user' | 'model'; text: string };

const SYSTEM_PROMPTS: Record<ChatType, string> = {
  meals: MEALS_SYSTEM_PROMPT,
  selfcare: SELFCARE_SYSTEM_PROMPT,
  overall: 'OVERALL_SYSTEM_PROMPT_NOT_YET_IMPLEMENTED',
};

const ASSEMBLERS: Record<ChatType, () => Promise<string>> = {
  meals: assembleMealsContext,
  selfcare: assembleSelfCareContext,
  overall: assembleOverallContext,
};

export async function sendMessage(
  chatType: ChatType,
  userMessage: string,
  history: HistoryMessage[],
  imageBase64?: string,
): Promise<string> {
  const apiKey = await SecureStore.getItemAsync('gemini_api_key');
  if (!apiKey) {
    throw new Error('NO_API_KEY');
  }

  const context = await ASSEMBLERS[chatType]();
  const systemPrompt = SYSTEM_PROMPTS[chatType];

  const userParts: any[] = [];

  if (imageBase64) {
    userParts.push({
      inline_data: { mime_type: 'image/jpeg', data: imageBase64 },
    });
  }

  userParts.push({
    text: `${context}\n\n=== USER MESSAGE ===\n${userMessage || getDefaultPhotoPrompt(chatType)}`,
  });

  const payload = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [
      ...history.slice(-20).map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      })),
      {
        role: 'user',
        parts: userParts,
      },
    ],
    generation_config: { temperature: 0.7, max_output_tokens: 1000 },
  };

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
  );

  if (!res.ok) {
    throw new Error(`Gemini error: ${res.status}`);
  }

  const data = await res.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Gemini returned no text');
  }

  return text;
}

