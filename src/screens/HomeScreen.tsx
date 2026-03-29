import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ChatScreen } from './ChatScreen';
import { ChatCard } from '../components/ChatCard';
import type { ChatType } from '../storage/types';
import { SettingsScreen } from './SettingsScreen';
import { readPendingSuggestions } from '../storage/pendingSuggestions';
import * as Notifications from 'expo-notifications';
import { computeAndScheduleNotifications } from '../notifications/scheduler';

type Screen = { type: 'home' } | { type: 'chat'; chatType: ChatType; initialAction?: string } | { type: 'settings'; chatType: ChatType } | { type: 'global_settings' };

export const HomeScreen: React.FC = () => {
  const [screen, setScreen] = useState<Screen>({ type: 'home' });
  const [pending, setPending] = useState<Record<string, boolean>>({});

  useEffect(() => {
    computeAndScheduleNotifications();
    readPendingSuggestions().then(res => {
      const p: Record<string, boolean> = {};
      res.suggestions.forEach(s => {
        if (s.status === 'pending') {
          p[s.target_chat] = true;
        }
      });
      setPending(p);
    });
  }, [screen]);

  const lastNotificationResponse = Notifications.useLastNotificationResponse();
  useEffect(() => {
    if (lastNotificationResponse) {
      const data = lastNotificationResponse.notification.request.content.data;
      if (data?.chatType && data?.action) {
        setScreen({ type: 'chat', chatType: data.chatType as ChatType, initialAction: data.action as string });
      }
    }
  }, [lastNotificationResponse]);

  if (screen.type === 'global_settings') {
    return (
      <SettingsScreen
        isGlobal
        onBack={() => setScreen({ type: 'home' })}
      />
    );
  }

  if (screen.type === 'settings') {
    return (
      <SettingsScreen
        chatType={screen.chatType}
        onBack={() => setScreen({ type: 'chat', chatType: screen.chatType })}
      />
    );
  }

  if (screen.type === 'chat') {
    return (
      <ChatScreen
        chatType={screen.chatType}
        initialAction={screen.initialAction}
        onBack={() => setScreen({ type: 'home' })}
        onSettings={() => setScreen({ type: 'settings', chatType: screen.chatType })}
      />
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Helth</Text>
          <Text style={styles.subtitle}>Three specialised chats</Text>
        </View>
        <TouchableOpacity style={styles.globalSettingsBtn} onPress={() => setScreen({ type: 'global_settings' })}>
          <Text style={styles.globalSettingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.cards}>
        <ChatCard
          chatType="meals"
          title="Meals"
          subtitle="Plan the day and log food."
          onPress={() => setScreen({ type: 'chat', chatType: 'meals' })}
          hasPendingSuggestion={pending.meals}
        />
        <ChatCard
          chatType="selfcare"
          title="Self Care"
          subtitle="Skincare, beard & hair routines."
          onPress={() => setScreen({ type: 'chat', chatType: 'selfcare' })}
          hasPendingSuggestion={pending.selfcare}
        />
        <ChatCard
          chatType="overall"
          title="Overall"
          subtitle="Big picture & fitness trends."
          onPress={() => setScreen({ type: 'chat', chatType: 'overall' })}
          hasPendingSuggestion={pending.overall}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050816',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 16,
    color: '#a0aec0',
  },
  globalSettingsBtn: {
    padding: 8,
    backgroundColor: '#1f2937',
    borderRadius: 8,
  },
  globalSettingsIcon: {
    fontSize: 20,
  },
  cards: {
    marginTop: 32,
    rowGap: 16,
  },
  configSection: {
    marginTop: 48,
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
    paddingTop: 24,
  },
  configTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f9fafb',
    marginBottom: 4,
  },
  configSubtitle: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 16,
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
});
