import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

type ChatType = 'meals' | 'selfcare' | 'overall';

interface ChatScreenProps {
  chatType: ChatType;
  onBack: () => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ chatType, onBack }) => {
  const title =
    chatType === 'meals' ? 'Meals Chat' : chatType === 'selfcare' ? 'Self Care Chat' : 'Overall Chat';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backLabel}>{'‹'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      <View style={styles.body}>
        {chatType === 'meals' ? (
          <Text style={styles.placeholder}>Meals chat UI will go here.</Text>
        ) : (
          <Text style={styles.placeholder}>This chat is coming soon.</Text>
        )}
      </View>
    </View>
  );
};

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
    padding: 16,
  },
  placeholder: {
    fontSize: 16,
    color: '#9ca3af',
  },
});

