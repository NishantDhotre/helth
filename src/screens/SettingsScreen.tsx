import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import type { ChatType, SelfCareInventory } from '../storage/types';
import { readSelfCareInventory, setItemStock } from '../storage/selfcareInventory';
import { SelfCareLogViewer } from '../components/SelfCareLogViewer';

interface Props {
  chatType: ChatType;
  onBack: () => void;
}

export const SettingsScreen: React.FC<Props> = ({ chatType, onBack }) => {
  const title =
    chatType === 'meals'
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
        {chatType === 'selfcare' && <SelfCareSettings />}
        {chatType === 'meals' && <MealsSettings />}
        {chatType === 'overall' && (
          <Text style={styles.placeholder}>Overall settings coming in Sprint 3.</Text>
        )}
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
  },
});
