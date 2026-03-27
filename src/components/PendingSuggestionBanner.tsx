import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getPendingForChat } from '../storage/pendingSuggestions';
import type { ChatType, Suggestion } from '../storage/types';

interface Props {
  chatType: ChatType;
}

export const PendingSuggestionBanner: React.FC<Props> = ({ chatType }) => {
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);

  useEffect(() => {
    getPendingForChat(chatType).then(res => {
      if (res.length > 0) setSuggestion(res[0]);
    });
  }, [chatType]);

  if (!suggestion) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.title}>Pending Suggestion ❗️</Text>
      <Text style={styles.text}>{suggestion.suggestion}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#3730a3',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#4338ca',
  },
  title: { fontSize: 13, fontWeight: '700', color: '#e0e7ff', marginBottom: 4 },
  text: { fontSize: 14, color: '#c7d2fe' },
});
