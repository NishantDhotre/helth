import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import type { ChatType } from '../storage/types';

interface Props {
  chatType: ChatType;
  title: string;
  subtitle: string;
  disabled?: boolean;
  hasPendingSuggestion?: boolean;
  onPress?: () => void;
}

export const ChatCard: React.FC<Props> = ({
  chatType,
  title,
  subtitle,
  disabled,
  hasPendingSuggestion,
  onPress,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={disabled}
      onPress={onPress}
      style={[styles.card, disabled && styles.cardDisabled]}
    >
      <View style={styles.row}>
        <View style={styles.textCol}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <View style={styles.metaCol}>
          <Text style={styles.pill}>{chatType.toUpperCase()}</Text>
          {hasPendingSuggestion ? <View style={styles.dot} /> : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  cardDisabled: {
    opacity: 0.4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textCol: {
    flex: 1,
  },
  metaCol: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f9fafb',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#9ca3af',
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 10,
    letterSpacing: 1,
    color: '#e5e7eb',
    backgroundColor: '#111827',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#f97316',
  },
});

