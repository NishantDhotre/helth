import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChatScreen } from './ChatScreen';

type ChatType = 'meals' | 'selfcare' | 'overall';

export const HomeScreen: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<ChatType | null>(null);

  if (selectedChat) {
    return <ChatScreen chatType={selectedChat} onBack={() => setSelectedChat(null)} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Helth</Text>
      <Text style={styles.subtitle}>Three specialised chats</Text>
      <View style={styles.cards}>
        <TouchableOpacity style={styles.card} onPress={() => setSelectedChat('meals')}>
          <Text style={styles.cardTitle}>Meals</Text>
          <Text style={styles.cardBody}>Plan and track your meals.</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.card, styles.cardDisabled]}>
          <Text style={styles.cardTitle}>Self Care</Text>
          <Text style={styles.cardBody}>Coming soon.</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.card, styles.cardDisabled]}>
          <Text style={styles.cardTitle}>Overall</Text>
          <Text style={styles.cardBody}>Coming soon.</Text>
        </TouchableOpacity>
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
    gap: 16,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#111827',
  },
  cardDisabled: {
    opacity: 0.5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#f9fafb',
  },
  cardBody: {
    marginTop: 4,
    fontSize: 14,
    color: '#9ca3af',
  },
});

