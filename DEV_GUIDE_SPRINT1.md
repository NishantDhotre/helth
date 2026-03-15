### Helth Dev Guide — Sprint 1 (Meals Chat)

#### 1. Objective

Get to **“Meals chat works”** as defined in the PRD:

- Home screen with 3 cards (Meals, Self Care, Overall).
- Meals chat fully functional:
  - **Mode 1**: “plan my day” → gym/rest-aware full day meal plan using PG, room items, ordering preferences.
  - **Mode 2**: “I had X” → logs meal, updates a rolling 7-day nutrition log, and shows updated daily targets.

Target platform: **Android only**, Expo (no backend, no DB, no navigation library).

---

#### 2. Quick Repo Reality Check

Current root (D:/projects-self-all/helth):

- `AGENTS.md`, `Docs/`, `app.json`, `package.json`, `tsconfig.json`, `assets/`, `App.tsx`, `index.ts`.
- No `src/` directory yet.
- No `eas.json` yet.
- `app.json` and `package.json` are not fully aligned with `Docs/04_Tech_Stack.md`.

Before writing feature code, we will:

1. Align `package.json` (scripts + key dependencies).
2. Align `app.json` (Android/iOS blocks, plugins, permissions).
3. Add `eas.json` with the build profiles from `Docs/04_Tech_Stack.md`.

---

#### 3. Config Alignment Checklist

**3.1 `package.json`**

- **Scripts** to add:
  - `"start": "expo start"`
  - `"android": "expo start --android"`
  - `"web": "expo start --web"`
- **Runtime deps** to ensure (versions can follow `Docs/04_Tech_Stack.md` and Expo 55 compatibility):
  - `expo`
  - `react`
  - `react-native`
  - `expo-file-system`
  - `expo-image-picker`
  - `expo-notifications`
  - `expo-task-manager`
  - `expo-secure-store`
  - `@react-native-async-storage/async-storage`
  - `zustand`
  - `react-native-markdown-display`
- **Dev deps** to ensure:
  - `@babel/core`
  - `typescript`
  - `@types/react`

**3.2 `app.json`**

Bring `app.json` in line with `Docs/04_Tech_Stack.md`:

- `expo.name`, `expo.slug`, `expo.version`, `expo.icon`.
- `expo.splash` with `./assets/splash.png` and dark background.
- `expo.android`:
  - `"package": "com.yourname.helth"`
  - `"versionCode": 1`
  - `adaptiveIcon.foregroundImage` / `backgroundColor`
  - `permissions`: `CAMERA`, `READ_EXTERNAL_STORAGE`, `RECEIVE_BOOT_COMPLETED`, `VIBRATE`.
- `expo.ios.bundleIdentifier` placeholder (keep, but iOS is deferred).
- `expo.plugins`: `expo-image-picker`, `expo-notifications`, `expo-secure-store`, `expo-task-manager`.

**3.3 `eas.json`**

Add `eas.json` to match the Tech Stack doc:

- `build.development`: dev client, internal distribution, Android APK.
- `build.preview`: internal APK.
- `build.production`: Android app bundle.

---

#### 4. Create `src/` Skeleton

Create these folders and empty files:

- `src/screens/`
  - `HomeScreen.tsx`
  - `ChatScreen.tsx`
  - `SettingsScreen.tsx`
- `src/components/`
  - `ChatCard.tsx`
  - `DailyCard.tsx`
  - `MessageBubble.tsx`
  - `ImageInputBar.tsx`
  - (placeholders for later: `InventoryList.tsx`, `NutritionLogViewer.tsx`, `SelfCareLogViewer.tsx`, `PendingSuggestionBanner.tsx`)
- `src/core/`
  - `systemPrompts.ts`
  - `contextAssembler.ts`
  - `geminiClient.ts`
  - `responseParser.ts`
  - `tdeeCalculator.ts`
  - `imageUtils.ts`
- `src/storage/`
  - `types.ts`
  - `fileSystem.ts`
  - `profile.ts`
  - `mealsContext.ts`
  - `nutritionLog.ts`
  - `pendingSuggestions.ts`
  - (placeholders for later: `selfcareContext.ts`, `selfcareInventory.ts`, `selfcareLog.ts`, `overallContext.ts`)
- `src/store/`
  - `chatStore.ts`
- `src/notifications/`
  - `scheduler.ts` (empty for Sprint 1)

Update `App.tsx` to import and render `HomeScreen` from `src/screens/HomeScreen`.

---

#### 5. Storage Layer — Sprint 1 Scope

Implement storage using `expo-file-system` and atomic writes (`safeWriteJSON` → `.tmp` → rename). Always seed from `Docs/06_Seed_Data.md` on first read.

**5.1 `src/storage/fileSystem.ts`**

- `CONTEXT_DIR = FileSystem.documentDirectory + 'context/'`
- `FILE_PATHS` for:
  - `profile`
  - `mealsContext`
  - `nutritionLog`
  - `selfcareContext`
  - `selfcareInventory`
  - `selfcareLog`
  - `overallContext`
  - `pendingSuggestions`
- Functions:
  - `ensureContextDir()`
  - `safeWriteJSON(path: string, data: object): Promise<void>`
  - `readJSON<T>(path: string): Promise<T>`

**5.2 `src/storage/types.ts`**

Define interfaces for:

- `Profile`
- `MealsContext`
- `NutritionLog`
- `Suggestion`, `PendingSuggestions`

Use `Docs/02_System_Design.md` + `Docs/06_Seed_Data.md` as the source of truth.

**5.3 `src/storage/profile.ts`**

- `readProfile(): Promise<Profile>`
- `updateField(dotPath: string, value: any): Promise<void>`
- `writeProfile(data: Profile): Promise<void>`

Behaviour:

- On first read, call `ensureFileExists(FILE_PATHS.profile, profileSeed)`.
- `updateField` uses dot-path to update nested properties, then calls `safeWriteJSON`.

**5.4 `src/storage/pendingSuggestions.ts`**

- `readPendingSuggestions(): Promise<PendingSuggestions>`
- `getPendingForChat(chatType: ChatType): Promise<Suggestion[]>`
- `writeSuggestion(suggestion: Omit<Suggestion, 'id'>): Promise<void>`
- `markAcknowledged(id: string): Promise<void>`
- `markImplemented(id: string): Promise<void>`

Seed from `pending_suggestions.json` in `Docs/06_Seed_Data.md`.

**5.5 `src/storage/mealsContext.ts`**

- `readMealsContext(): Promise<MealsContext>`
- `updateMealsContext(dotPath: string, value: any): Promise<void>`
- `addRoomItem(item: string, note: string): Promise<void>`
- `addOrderingPattern(observation: string): Promise<void>`
- `addMealPattern(observation: string): Promise<void>`
- `writeMealsContext(data: MealsContext): Promise<void>`

Seed from `meals_context.json` in `Docs/06_Seed_Data.md`.

**5.6 `src/storage/nutritionLog.ts`**

- `readNutritionLog(): Promise<NutritionLog>`
- `addTodayMeal(mealType, description, kcal, proteinG): Promise<void>`
- `updateTodayNotes(notes: string): Promise<void>`
- `rollLog(): Promise<void>` (7-day rolling window)
- `writeNutritionLog(data: NutritionLog): Promise<void>`

On first run, create `nutrition_log.json` using the seed with dynamic `TODAY_DATE` and `TODAY_DAY_TYPE`.

---

#### 6. Core Engine — Meals Chat

**6.1 `src/core/systemPrompts.ts`**

- Export:
  - `MEALS_SYSTEM_PROMPT`
  - `SELFCARE_SYSTEM_PROMPT`
  - `OVERALL_SYSTEM_PROMPT`
- Paste content directly from `Docs/03_System_Prompts.md`.

**6.2 `src/core/tdeeCalculator.ts`**

- Implement TDEE using Mifflin-St Jeor and rules from `Docs/02_System_Design.md`:
  - BMR: `(10 × weight_kg) + (6.25 × height_cm) − (5 × age) + 5`
  - Activity multiplier (moderately_active): `× 1.55`
  - Gym day: `TDEE − 300`
  - Rest day: `TDEE − 400`
  - Protein target: `1.8 × weight_kg`

**6.3 `src/core/contextAssembler.ts` (Meals only for Sprint 1)**

- `assembleMealsContext(): Promise<string>`:
  - Reads `profile`, `mealsContext`, `nutritionLog`, `pendingSuggestions` (for `meals`), and derived `today` info.
  - Returns a well-structured string summarising:
    - Today (date, gym/rest).
    - Profile basics.
    - Meals context (PG schedule, room items, ordering preferences, macros).
    - Today’s log and last 7 days.
    - Pending suggestions.

**6.4 `src/core/geminiClient.ts`**

- `sendMessage(chatType, userMessage, history, imageBase64?)`:
  - Gets API key from `expo-secure-store`.
  - Chooses system prompt and assembler based on `chatType`.
  - Builds payload for `gemini-2.0-flash` with:
    - `system_instruction` part.
    - History (last 20 messages) as `contents`.
    - User content: optional `inline_data` for image + text (user message or default photo prompt).
  - Calls the HTTP endpoint and returns the model text.

**6.5 `src/core/responseParser.ts`**

- `parseResponse(raw: string): Promise<string>`
- Internal `applyUpdate(u: any)`:
  - Implement exactly as the reference in `AGENTS.md`, routing updates to:
    - `profile`, `mealsContext`, `nutritionLog`, `selfcareContext`, `selfcareInventory`, `selfcareLog`, `overallContext`, `pendingSuggestions`.

**6.6 `src/core/imageUtils.ts`**

- `pickImage(source: 'camera' | 'gallery'): Promise<string | null>`
- `getDefaultPhotoPrompt(chatType: ChatType): string`

Implementation matches `AGENTS.md` and `Docs/02_System_Design.md` (base64 only, never stored).

---

#### 7. State — `src/store/chatStore.ts`

Use Zustand to manage per-chat state:

- State:
  - `messagesByChat: Record<ChatType, Message[]>`
  - `isLoadingByChat: Record<ChatType, boolean>`
  - `dailyCardByChat: Record<ChatType, DailyCardData | null>`
  - `pendingImageBase64: string | null`
- Actions (Sprint 1 focus):
  - `sendMessage(chatType, text, imageBase64?)`
  - `setPendingImageBase64(base64 | null)`

`sendMessage` flow:

1. If no text and no image → no-op.
2. For image-only → use `getDefaultPhotoPrompt(chatType)` as text.
3. Append user message to state.
4. Call `geminiClient.sendMessage`, pipe through `responseParser.parseResponse`.
5. Append assistant message, then recompute Meals `dailyCard` using storage.

---

#### 8. UI — Minimum for Sprint 1

**8.1 `HomeScreen.tsx`**

- Shows three `ChatCard`s:
  - Meals: active.
  - Self Care, Overall: “Coming soon”.
- Uses simple React state to switch between Home view and `ChatScreen` with `chatType`.

**8.2 `ChatScreen.tsx`**

- Receives `chatType` prop.
- Renders:
  - `DailyCard` (for Meals: today’s date, gym/rest, calories/protein consumed vs target, “next” hint).
  - Message list using `MessageBubble`.
  - `ImageInputBar` at the bottom.

**8.3 `MessageBubble.tsx`**

- Left/right alignment by role.
- Renders markdown using `react-native-markdown-display`.
- If message has `imageUri`, show a small image thumbnail above text (user bubbles only).

**8.4 `ImageInputBar.tsx`**

- Camera icon:
  - Opens bottom sheet with “Take Photo” and “Choose from Gallery”.
  - Calls `pickImage(source)`, stores base64 via `chatStore.setPendingImageBase64`.
- Shows thumbnail preview with × to clear.
- TextInput:
  - Placeholder:
    - No image: “Type a message…”
    - With image: “Add context (optional)…”
- Send button:
  - Disabled if no text and no image.
  - On press: calls `chatStore.sendMessage(chatType, text, pendingImageBase64)` and clears both.

---

#### 9. Sprint 1 “Done When” Checklist

- `npm run start` (or `pnpm`/`yarn` equivalent) runs an Expo app without errors.
- Home screen shows 3 cards; tapping **Meals** opens the chat.
- In Meals chat:
  - Typing **“plan my day”** returns a full day meal plan that:
    - Recognises today as gym or rest day.
    - Uses PG meals + room items from context.
  - Typing **“had whey and 3 eggs”**:
    - Updates today’s entry in `nutrition_log.json`.
    - Updates the Meals daily card numbers (calories and protein).
- No direct `FileSystem.writeAsStringAsync` calls exist outside `src/storage/fileSystem.ts`.
- All context files are created from seed data on first run and updated via storage functions only.

