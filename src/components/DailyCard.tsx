import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { DailyCardData } from '../store/chatStore';

interface Props {
  data: DailyCardData | null;
}

export const DailyCard: React.FC<Props> = ({ data }) => {
  if (!data) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{data.titleLine}</Text>
      {data.caloriesLine ? <Text style={styles.line}>{data.caloriesLine}</Text> : null}
      {data.proteinLine ? <Text style={styles.line}>{data.proteinLine}</Text> : null}
      {data.nextLine ? <Text style={styles.next}>{data.nextLine}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 14,
    backgroundColor: '#0b1120',
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e5e7eb',
  },
  line: {
    marginTop: 4,
    fontSize: 13,
    color: '#9ca3af',
  },
  next: {
    marginTop: 8,
    fontSize: 13,
    color: '#fbbf24',
  },
});

