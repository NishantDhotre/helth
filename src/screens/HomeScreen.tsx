import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ChatScreen } from './ChatScreen';
import { ChatCard } from '../components/ChatCard';
import type { ChatType } from '../storage/types';
import { SettingsScreen } from './SettingsScreen';

type Screen = { type: 'home' } | { type: 'chat'; chatType: ChatType } | { type: 'settings'; chatType: ChatType };

export const HomeScreen: React.FC = () => {
  const [screen, setScreen] = useState<Screen>({ type: 'home' });

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
        />
        <ChatCard
          chatType="selfcare"
          title="Self Care"
          subtitle="Skincare, beard & hair routines."
          onPress={() => setScreen({ type: 'chat', chatType: 'selfcare' })}
        />
        <ChatCard
          chatType="overall"
          title="Overall"
          subtitle="Big picture — coming soon."
          disabled
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
