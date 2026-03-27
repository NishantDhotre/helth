import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Modal } from 'react-native';
import { useChatStore } from '../store/chatStore';
import type { ChatType } from '../storage/types';
import { pickImage } from '../core/imageUtils';

interface Props {
  chatType: ChatType;
}

export const ImageInputBar: React.FC<Props> = ({ chatType }) => {
  const [text, setText] = useState('');
  const [sheetVisible, setSheetVisible] = useState(false);
  const pendingImageBase64 = useChatStore((s) => s.chats[chatType].pendingImageBase64);
  const setPendingImage = useChatStore((s) => s.setPendingImage);
  const send = useChatStore((s) => s.send);

  const handleSend = async () => {
    await send(chatType, text, pendingImageBase64);
    setText('');
  };

  const disabled = !text.trim() && !pendingImageBase64;

  const openPicker = (source: 'camera' | 'gallery') => {
    setSheetVisible(false);
    pickImage(source).then((base64) => {
      if (base64) {
        setPendingImage(chatType, base64);
      }
    });
  };

  return (
    <View style={styles.container}>
      <Modal transparent visible={sheetVisible} animationType="fade" onRequestClose={() => setSheetVisible(false)}>
        <View style={styles.sheetOverlay}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Add photo</Text>
            <TouchableOpacity style={styles.sheetButton} onPress={() => openPicker('camera')}>
              <Text style={styles.sheetButtonText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetButton} onPress={() => openPicker('gallery')}>
              <Text style={styles.sheetButtonText}>Choose from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetCancel} onPress={() => setSheetVisible(false)}>
              <Text style={styles.sheetCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.inner}>
        <TouchableOpacity onPress={() => setSheetVisible(true)} style={styles.iconButton}>
          <Text style={styles.iconLabel}>📷</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder={pendingImageBase64 ? 'Add context (optional)...' : 'Type a message (optional)...'}
          placeholderTextColor="#6b7280"
          value={text}
          onChangeText={setText}
          multiline
        />
        <TouchableOpacity onPress={handleSend} disabled={disabled} style={[styles.sendButton, disabled && styles.sendDisabled]}>
          <Text style={styles.sendLabel}>→</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#111827',
    backgroundColor: '#020617',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#020617',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1f2937',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  iconButton: {
    paddingRight: 4,
    paddingVertical: 4,
  },
  iconLabel: {
    fontSize: 20,
    color: '#e5e7eb',
  },
  input: {
    flex: 1,
    color: '#e5e7eb',
    fontSize: 14,
    maxHeight: 80,
    paddingVertical: 4,
  },
  sendButton: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  sendLabel: {
    fontSize: 20,
    color: '#22c55e',
  },
  sendDisabled: {
    opacity: 0.4,
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#020617',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e5e7eb',
    marginBottom: 8,
  },
  sheetButton: {
    paddingVertical: 10,
  },
  sheetButtonText: {
    fontSize: 15,
    color: '#e5e7eb',
  },
  sheetCancel: {
    paddingVertical: 10,
    marginTop: 4,
  },
  sheetCancelText: {
    fontSize: 15,
    color: '#9ca3af',
  },
});

