import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import type { ChatType } from '../storage/types';
import { useChatStore } from '../store/chatStore';
import { DailyCard } from '../components/DailyCard';
import { MessageBubble } from '../components/MessageBubble';
import { ImageInputBar } from '../components/ImageInputBar';
import { PendingSuggestionBanner } from '../components/PendingSuggestionBanner';

interface ChatScreenProps {
  chatType: ChatType;
  initialAction?: string;
  onBack: () => void;
  onSettings?: () => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ chatType, initialAction, onBack, onSettings }) => {
  const title =
    chatType === 'meals' ? 'Meals Chat' : chatType === 'selfcare' ? 'Self Care Chat' : 'Overall Chat';

  const messages = useChatStore((s) => s.chats[chatType].messages);
  const isLoading = useChatStore((s) => s.chats[chatType].isLoading);
  const dailyCardData = useChatStore((s) => s.chats[chatType].dailyCardData);
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');

  const hasSentInitialRef = React.useRef(false);

  useEffect(() => {
    useChatStore.getState().fetchDailyCard(chatType);
    SecureStore.getItemAsync('gemini_api_key').then((val) => {
      if (!val) {
        setApiKeyVisible(true);
      }
    });

    if (initialAction && !hasSentInitialRef.current) {
      hasSentInitialRef.current = true;
      useChatStore.getState().send(chatType, initialAction);
    }
  }, [chatType, initialAction]);

  const handleSaveApiKey = async () => {
    const trimmed = apiKeyInput.trim();
    if (!trimmed) return;
    await SecureStore.setItemAsync('gemini_api_key', trimmed);
    setApiKeyVisible(false);
    setApiKeyInput('');
  };

  const isChatEnabled = chatType === 'meals' || chatType === 'selfcare' || chatType === 'overall';

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior="padding"
    >
      <Modal transparent visible={apiKeyVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Gemini API key</Text>
            <Text style={styles.modalSubtitle}>Paste your Gemini API key to start chatting.</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="AIza..."
              placeholderTextColor="#6b7280"
              value={apiKeyInput}
              onChangeText={setApiKeyInput}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity style={styles.modalButton} onPress={handleSaveApiKey}>
              <Text style={styles.modalButtonLabel}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backLabel}>{'‹'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.headerSpacer} />
        {onSettings && (
          <TouchableOpacity onPress={onSettings} style={styles.settingsButton}>
            <Text style={styles.settingsLabel}>⚙</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.body}>
        {isChatEnabled ? (
          <>
            <DailyCard data={dailyCardData} />
            <PendingSuggestionBanner chatType={chatType} />
            <FlatList
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <MessageBubble message={item} />}
              contentContainerStyle={styles.listContent}
            />
            {isLoading && (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color="#9ca3af" />
                <Text style={styles.loadingText}>Thinking...</Text>
              </View>
            )}
            <ImageInputBar chatType={chatType} />
          </>
        ) : (
          <View style={styles.centerPlaceholder}>
            <Text style={styles.placeholder}>This chat is coming soon.</Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
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
  headerSpacer: {
    flex: 1,
  },
  settingsButton: {
    padding: 8,
  },
  settingsLabel: {
    fontSize: 20,
    color: '#9ca3af',
  },
  body: {
    flex: 1,
    padding: 16,
  },
  listContent: {
    paddingBottom: 16,
  },
  centerPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    fontSize: 16,
    color: '#9ca3af',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#6b7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '86%',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e5e7eb',
  },
  modalSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#9ca3af',
  },
  modalInput: {
    marginTop: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1f2937',
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#e5e7eb',
    fontSize: 14,
    backgroundColor: '#020617',
  },
  modalButton: {
    marginTop: 12,
    borderRadius: 999,
    backgroundColor: '#4f46e5',
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e5e7eb',
  },
});
