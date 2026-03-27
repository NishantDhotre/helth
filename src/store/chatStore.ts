import { create } from 'zustand';
import type { ChatType } from '../storage/types';
import { sendMessage } from '../core/geminiClient';
import { parseResponse } from '../core/responseParser';
import { readProfile } from '../storage/profile';
import { readNutritionLog } from '../storage/nutritionLog';
import { readSelfCareLog } from '../storage/selfcareLog';
import { readSelfCareContext } from '../storage/selfcareContext';
import { calculateTDEE } from '../core/tdeeCalculator';

export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  createdAt: string;
  imageThumbnailUri?: string;
}

export interface DailyCardData {
  titleLine: string;
  caloriesLine?: string;
  proteinLine?: string;
  nextLine?: string;
}

interface ChatStateSlice {
  messages: ChatMessage[];
  isLoading: boolean;
  dailyCardData: DailyCardData | null;
  pendingImageBase64: string | null;
}

interface ChatStoreState {
  chats: Record<ChatType, ChatStateSlice>;
  setPendingImage(chatType: ChatType, base64: string | null): void;
  send(chatType: ChatType, text: string, imageBase64?: string | null): Promise<void>;
  fetchDailyCard(chatType: ChatType): Promise<void>;
}

const initialSlice: ChatStateSlice = {
  messages: [],
  isLoading: false,
  dailyCardData: null,
  pendingImageBase64: null,
};

function createId() {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export const useChatStore = create<ChatStoreState>((set, get) => ({
  chats: {
    meals: { ...initialSlice },
    selfcare: { ...initialSlice },
    overall: { ...initialSlice },
  },

  setPendingImage(chatType, base64) {
    set((state) => ({
      chats: {
        ...state.chats,
        [chatType]: {
          ...state.chats[chatType],
          pendingImageBase64: base64,
        },
      },
    }));
  },

  async fetchDailyCard(chatType) {
    if (chatType === 'overall') return;
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const fullWeekday = now.toLocaleDateString('en-GB', { weekday: 'long' });
    
    if (chatType === 'meals') {
      try {
        const profile = await readProfile();
        const log = await readNutritionLog();
        const gymDay = profile.fitness.gym_days.map(d=>d.toLowerCase()).includes(fullWeekday.toLowerCase());
        const tdee = calculateTDEE(profile);
        const targetKcal = gymDay ? tdee.gymDayCalories : tdee.restDayCalories;
        const targetProtein = tdee.proteinTargetG;
        
        const todayLog = log.days.find(d => d.date === date);
        const eatenKcal = todayLog?.totals?.kcal || 0;
        const eatenProtein = todayLog?.totals?.protein_g || 0;
        
        const titleLine = `${fullWeekday} · ${gymDay ? 'Gym Day' : 'Rest Day'}`;
        const caloriesLine = `Calories: ${eatenKcal} / ${targetKcal} kcal ${eatenKcal >= targetKcal ? '✅' : ''}`;
        const proteinLine = `Protein: ${eatenProtein} / ${targetProtein}g ${eatenProtein >= targetProtein ? '✅' : ''}`;
        
        set((state) => ({ chats: { ...state.chats, meals: { ...state.chats.meals, dailyCardData: { titleLine, caloriesLine, proteinLine } } } }));
      } catch (e) {
      }
    } else if (chatType === 'selfcare') {
      try {
        const log = await readSelfCareLog();
        const ctx = await readSelfCareContext();
        
        const todayLog = log.days.find(d => d.date === date);
        const mStatus = todayLog?.skincare_morning || 'pending';
        const eStatus = todayLog?.skincare_evening || 'pending';
        const getIcon = (s: string) => s === 'completed' ? '✅' : s === 'skipped' ? '❌' : s === 'partial' ? '⚠️' : '⏳';
        
        const profile = await readProfile();
        const gymDay = profile.fitness.gym_days.map(d=>d.toLowerCase()).includes(fullWeekday.toLowerCase());
        const titleLine = `${fullWeekday} · ${gymDay ? 'Gym Day' : 'Rest Day'}`;
        const caloriesLine = `Morning: ${getIcon(mStatus)}  ·  Evening: ${getIcon(eStatus)}`;
        const proteinLine = `Beard: ${todayLog?.beard_done ? '✅' : '⏳'}  ·  Shaved: ${todayLog?.shaved ? '✅' : '❌'}`;
        
        const tonightTasks = ctx.weekly_actives.filter(a => {
          if (a.time !== 'evening') return false;
          if (a.day && a.day.toLowerCase() === fullWeekday.toLowerCase()) return true;
          if (a.days && a.days.map(d=>d.toLowerCase()).includes(fullWeekday.toLowerCase())) return true;
          return false;
        }).map(a => a.task).join(', ');
        const nextLine = tonightTasks ? `Tonight: ${tonightTasks}` : 'Tonight: standard routine';

        set((state) => ({ chats: { ...state.chats, selfcare: { ...state.chats.selfcare, dailyCardData: { titleLine, caloriesLine, proteinLine, nextLine } } } }));
      } catch (e) {
      }
    }
  },

  async send(chatType, text, imageBase64) {
    const trimmed = text.trim();
    const hasImage = !!imageBase64;
    if (!trimmed && !hasImage) {
      return;
    }

    const state = get();
    const slice = state.chats[chatType];
    const now = new Date().toISOString();

    const userMessage: ChatMessage = {
      id: createId(),
      role: 'user',
      text: trimmed || '',
      createdAt: now,
    };

    set({
      chats: {
        ...state.chats,
        [chatType]: {
          ...slice,
          messages: [...slice.messages, userMessage],
          isLoading: true,
          pendingImageBase64: null,
        },
      },
    });

    try {
      const history = slice.messages.map((m) => ({
        role: (m.role === 'user' ? 'user' : 'model') as 'user' | 'model',
        text: m.text,
      }));

      const raw = await sendMessage(chatType, trimmed, history, imageBase64 || undefined);
      const clean = await parseResponse(raw);

      const assistantMessage: ChatMessage = {
        id: createId(),
        role: 'assistant',
        text: clean,
        createdAt: new Date().toISOString(),
      };

      const latestState = get();
      const latestSlice = latestState.chats[chatType];

      set({
        chats: {
          ...latestState.chats,
          [chatType]: {
            ...latestSlice,
            messages: [...latestSlice.messages, assistantMessage],
            isLoading: false,
          },
        },
      });

      await get().fetchDailyCard(chatType);
    } catch (e: any) {
      const latestState = get();
      const latestSlice = latestState.chats[chatType];

      const errorMessage: ChatMessage = {
        id: createId(),
        role: 'assistant',
        text: e?.message === 'NO_API_KEY' ? 'Set your Gemini API key in settings to start chatting.' : 'Something went wrong. Please try again.',
        createdAt: new Date().toISOString(),
      };

      set({
        chats: {
          ...latestState.chats,
          [chatType]: {
            ...latestSlice,
            messages: [...latestSlice.messages, errorMessage],
            isLoading: false,
          },
        },
      });
    }
  },
}));

