import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ChatScreen } from './ChatScreen';
import { ChatCard } from '../components/ChatCard';
import type { ChatType } from '../storage/types';
import { SettingsScreen } from './SettingsScreen';
import { readPendingSuggestions } from '../storage/pendingSuggestions';
import * as Notifications from 'expo-notifications';
import { computeAndScheduleNotifications } from '../notifications/scheduler';

type Screen = { type: 'home' } | { type: 'chat'; chatType: ChatType; initialAction?: string } | { type: 'settings'; chatType: ChatType };

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
    <View style={styles.container}>
      <Text style={styles.title}>Helth</Text>
      <Text style={styles.subtitle}>Three specialised chats</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050816',
    paddingHorizontal: 24,
    paddingTop: 72,
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
  cards: {
    marginTop: 32,
    rowGap: 16,
  },
});
