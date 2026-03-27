import * as ImagePicker from 'expo-image-picker';
import type { ChatType } from '../storage/types';

export async function pickImage(source: 'camera' | 'gallery'): Promise<{ base64: string; uri: string } | null> {
  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.7,
          base64: true,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.7,
          base64: true,
        });

  if (result.canceled || !result.assets[0].base64) return null;
  return { base64: result.assets[0].base64, uri: result.assets[0].uri };
}

export function getDefaultPhotoPrompt(chatType: ChatType): string {
  const defaults: Record<ChatType, string> = {
    meals: 'I had this. Log it and tell me where I stand.',
    selfcare: 'Here is a product / my skin. Tell me what to do with this.',
    overall: 'Progress photo. Note this.',
  };
  return defaults[chatType];
}

