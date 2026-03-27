import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Markdown from 'react-native-markdown-display';
import type { ChatMessage } from '../store/chatStore';

interface Props {
  message: ChatMessage;
}

export const MessageBubble: React.FC<Props> = ({ message }) => {
  const isUser = message.role === 'user';
  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        {message.imageThumbnailUri && (
          <Image source={{ uri: message.imageThumbnailUri }} style={styles.image} />
        )}
        <Markdown style={markdownStyles}>{message.text}</Markdown>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    marginVertical: 4,
    paddingHorizontal: 4,
  },
  rowUser: {
    alignItems: 'flex-end',
  },
  rowAssistant: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '85%',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  userBubble: {
    backgroundColor: '#4f46e5',
  },
  assistantBubble: {
    backgroundColor: '#111827',
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
});

const markdownStyles = {
  body: {
    color: '#e5e7eb',
    fontSize: 14,
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 0,
  },
  list_item: {
    flexDirection: 'row' as const,
  },
};

