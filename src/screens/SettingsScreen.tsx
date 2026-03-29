import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, TextInput } from 'react-native';
import type { ChatType, SelfCareInventory, Profile, PendingSuggestions } from '../storage/types';
import { readSelfCareInventory, setItemStock } from '../storage/selfcareInventory';
import { SelfCareLogViewer } from '../components/SelfCareLogViewer';
import { readOverallContext, addWeightEntry, type OverallContext } from '../storage/overallContext';
import { readProfile, updateField } from '../storage/profile';
import { readPendingSuggestions } from '../storage/pendingSuggestions';
import * as SecureStore from 'expo-secure-store';

interface Props {
  chatType?: ChatType;
  isGlobal?: boolean;
  onBack: () => void;
}

export const SettingsScreen: React.FC<Props> = ({ chatType, isGlobal, onBack }) => {
  const title =
    isGlobal
      ? 'Global Settings'
      : chatType === 'meals'
      ? 'Meals Settings'
      : chatType === 'selfcare'
        ? 'Self Care Settings'
        : 'Overall Settings';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backLabel}>{'‹'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        {isGlobal && <GlobalSettings />}
        {chatType === 'selfcare' && !isGlobal && <SelfCareSettings />}
        {chatType === 'meals' && !isGlobal && <MealsSettings />}
        {chatType === 'overall' && !isGlobal && <OverallSettings />}
      </ScrollView>
    </View>
  );
};

// ────── Self Care Settings ──────

const SelfCareSettings: React.FC = () => {
  const [inventory, setInventory] = useState<SelfCareInventory | null>(null);

  useEffect(() => {
    readSelfCareInventory().then(setInventory);
  }, []);

  const handleToggle = async (key: string, value: boolean) => {
    await setItemStock(key, value);
    const updated = await readSelfCareInventory();
    setInventory(updated);
  };

  if (!inventory) {
    return <Text style={styles.placeholder}>Loading inventory...</Text>;
  }

  return (
    <View>
      <Text style={styles.sectionTitle}>Product Inventory</Text>
      <Text style={styles.sectionSubtitle}>
        Toggle products off when you run out. The chat will adapt your routine automatically.
      </Text>
      {Object.entries(inventory.items).map(([key, item]) => (
        <View key={key} style={styles.inventoryRow}>
          <View style={styles.inventoryTextCol}>
            <Text style={styles.inventoryName}>{item.display_name}</Text>
          </View>
          <Switch
            value={item.in_stock}
            onValueChange={(val) => handleToggle(key, val)}
            trackColor={{ false: '#374151', true: '#4f46e5' }}
            thumbColor={item.in_stock ? '#e5e7eb' : '#9ca3af'}
          />
        </View>
      ))}
      <Text style={styles.lastUpdated}>Last updated: {inventory.last_updated}</Text>
      <SelfCareLogViewer />
    </View>
  );
};

// ────── Meals Settings ──────

const MealsSettings: React.FC = () => {
  return (
    <View>
      <Text style={styles.sectionTitle}>Meals Settings</Text>
      <Text style={styles.placeholder}>
        Room items, ordering preferences, and PG schedule are managed through the chat. Tell the Meals
        assistant about changes and it will update automatically.
      </Text>
    </View>
  );
};

// ────── Global Settings ──────

const GlobalSettings: React.FC = () => {
  const [nameInput, setNameInput] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [loaded, setLoaded] = useState(false);

  const loadData = async () => {
    const p = await readProfile();
    setNameInput(p.personal.name || '');
    const key = await SecureStore.getItemAsync('gemini_api_key');
    if (key) setApiKeyInput(key);
    setLoaded(true);
  };

  useEffect(() => { loadData(); }, []);

  const handleSaveName = async () => {
    const trimmed = nameInput.trim();
    if (trimmed) {
      await updateField('personal.name', trimmed);
      loadData();
    }
  };

  const handleSaveApiKey = async () => {
    const trimmed = apiKeyInput.trim();
    if (trimmed) {
      await SecureStore.setItemAsync('gemini_api_key', trimmed);
    } else {
      await SecureStore.deleteItemAsync('gemini_api_key');
    }
    loadData();
  };

  if (!loaded) return <Text style={styles.placeholder}>Loading...</Text>;

  return (
    <View>
      <Text style={styles.sectionTitle}>App Configuration</Text>
      <Text style={styles.sectionSubtitle}>Manage your AI connection and identity.</Text>
      
      <View style={styles.inputRow}>
        <TextInput 
          style={styles.textInput} 
          placeholder="Your Name" 
          placeholderTextColor="#6b7280"
          value={nameInput}
          onChangeText={setNameInput}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleSaveName}>
          <Text style={styles.addButtonLabel}>Save</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputRow}>
        <TextInput 
          style={styles.textInput} 
          placeholder="Gemini API Key (leave blank to delete)" 
          placeholderTextColor="#6b7280"
          value={apiKeyInput}
          onChangeText={setApiKeyInput}
          secureTextEntry
        />
        <TouchableOpacity style={styles.addButton} onPress={handleSaveApiKey}>
          <Text style={styles.addButtonLabel}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ────── Overall Settings ──────

const OverallSettings: React.FC = () => {
  const [ctx, setCtx] = useState<OverallContext | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [pending, setPending] = useState<PendingSuggestions | null>(null);

  const [newWeight, setNewWeight] = useState('');
  const [goalInput, setGoalInput] = useState('');

  const loadData = async () => {
    const [c, p, s] = await Promise.all([
      readOverallContext(),
      readProfile(),
      readPendingSuggestions()
    ]);
    setCtx(c);
    setProfile(p);
    setPending(s);
    setGoalInput(p.fitness.goal);
  };

  useEffect(() => { loadData(); }, []);

  const handleAddWeight = async () => {
    const w = parseFloat(newWeight);
    if (!isNaN(w)) {
      await addWeightEntry(new Date().toISOString().split('T')[0], w);
      await updateField('personal.weight_kg', w);
      setNewWeight('');
      loadData();
    }
  };

  const handleSaveGoal = async () => {
    if (goalInput.trim()) {
      await updateField('fitness.goal', goalInput.trim());
      loadData();
    }
  };

  if (!ctx || !profile || !pending) return <Text style={styles.placeholder}>Loading...</Text>;

  const weightHistory = [...ctx.weight_history].reverse().slice(0, 7);

  return (
    <View>
      <Text style={styles.sectionTitle}>Weight Log</Text>
      <View style={styles.inputRow}>
        <TextInput 
          style={styles.textInput} 
          placeholder="New weight (kg)" 
          placeholderTextColor="#6b7280"
          value={newWeight}
          onChangeText={setNewWeight}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddWeight}>
          <Text style={styles.addButtonLabel}>Add</Text>
        </TouchableOpacity>
      </View>
      {weightHistory.map((w, i) => (
        <View key={i} style={styles.inventoryRow}>
          <View style={styles.inventoryTextCol}>
            <Text style={styles.inventoryName}>{w.date}</Text>
          </View>
          <Text style={styles.inventoryName}>{w.weight_kg} kg</Text>
        </View>
      ))}

      <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Fitness Goal</Text>
      <View style={styles.inputRow}>
        <TextInput 
          style={styles.textInput} 
          value={goalInput}
          onChangeText={setGoalInput}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleSaveGoal}>
          <Text style={styles.addButtonLabel}>Save</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Cross-Chat Suggestions</Text>
      {pending.suggestions.length === 0 ? (
        <Text style={styles.placeholder}>No suggestions generated yet.</Text>
      ) : (
        pending.suggestions.map((s) => (
          <View key={s.id} style={styles.suggestionRow}>
            <Text style={styles.suggestionHeader}>{s.target_chat.toUpperCase()} · {s.status.toUpperCase()}</Text>
            <Text style={styles.suggestionText}>{s.suggestion}</Text>
          </View>
        ))
      )}
    </View>
  );
};


// ────── Styles ──────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050816',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backLabel: {
    color: '#e5e7eb',
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#f9fafb',
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f9fafb',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 16,
  },
  inventoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#111827',
  },
  inventoryTextCol: {
    flex: 1,
  },
  inventoryName: {
    fontSize: 15,
    color: '#e5e7eb',
  },
  lastUpdated: {
    marginTop: 16,
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
  },
  placeholder: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 22,
    marginTop: 8,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 16,
    marginTop: 8,
    gap: 8,
  },
  textInput: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1f2937',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#e5e7eb',
    fontSize: 14,
    backgroundColor: '#0b1120',
  },
  addButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  addButtonLabel: {
    color: '#e0e7ff',
    fontWeight: '600',
  },
  suggestionRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#111827',
  },
  suggestionHeader: {
    fontWeight: '600',
    fontSize: 12,
    color: '#c7d2fe',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  suggestionText: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 20,
  },
});
