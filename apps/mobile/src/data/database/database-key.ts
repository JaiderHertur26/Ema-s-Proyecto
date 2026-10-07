import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const STORAGE_KEY = 'emaus.database.key.v1';
const HEX_KEY_PATTERN = /^[0-9a-f]{64}$/;

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function getOrCreateDatabaseKey(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return null;
  }

  const existing = await SecureStore.getItemAsync(STORAGE_KEY);
  if (existing && HEX_KEY_PATTERN.test(existing)) {
    return existing;
  }

  const bytes = await Crypto.getRandomBytesAsync(32);
  const generated = bytesToHex(bytes);

  await SecureStore.setItemAsync(STORAGE_KEY, generated, {
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
  });

  return generated;
}
