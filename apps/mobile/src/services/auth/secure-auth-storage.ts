import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

const PREFIX = 'emaus.auth';
const CHUNK_SIZE = 1500;

async function storageId(key: string) {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    key
  );
  return digest.slice(0, 32);
}

function chunkKey(id: string, index: number) {
  return `${PREFIX}.${id}.chunk.${index}`;
}

function manifestKey(id: string) {
  return `${PREFIX}.${id}.manifest`;
}

const options: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
};

export const secureAuthStorage = {
  async getItem(key: string): Promise<string | null> {
    const id = await storageId(key);
    const rawManifest = await SecureStore.getItemAsync(manifestKey(id));

    if (!rawManifest) return null;

    const count = Number(rawManifest);
    if (!Number.isInteger(count) || count < 1 || count > 32) {
      await this.removeItem(key);
      return null;
    }

    const chunks: string[] = [];

    for (let index = 0; index < count; index += 1) {
      const chunk = await SecureStore.getItemAsync(chunkKey(id, index));
      if (chunk == null) {
        await this.removeItem(key);
        return null;
      }
      chunks.push(chunk);
    }

    return chunks.join('');
  },

  async setItem(key: string, value: string): Promise<void> {
    const id = await storageId(key);
    const previousManifest = await SecureStore.getItemAsync(manifestKey(id));
    const previousCount = Number(previousManifest ?? 0);

    const chunks: string[] = [];
    for (let index = 0; index < value.length; index += CHUNK_SIZE) {
      chunks.push(value.slice(index, index + CHUNK_SIZE));
    }

    const normalizedChunks = chunks.length > 0 ? chunks : [''];

    for (let index = 0; index < normalizedChunks.length; index += 1) {
      await SecureStore.setItemAsync(
        chunkKey(id, index),
        normalizedChunks[index],
        options
      );
    }

    await SecureStore.setItemAsync(
      manifestKey(id),
      String(normalizedChunks.length),
      options
    );

    if (Number.isInteger(previousCount) && previousCount > normalizedChunks.length) {
      for (
        let index = normalizedChunks.length;
        index < previousCount;
        index += 1
      ) {
        await SecureStore.deleteItemAsync(chunkKey(id, index));
      }
    }
  },

  async removeItem(key: string): Promise<void> {
    const id = await storageId(key);
    const rawManifest = await SecureStore.getItemAsync(manifestKey(id));
    const count = Number(rawManifest ?? 0);

    if (Number.isInteger(count) && count > 0 && count <= 32) {
      for (let index = 0; index < count; index += 1) {
        await SecureStore.deleteItemAsync(chunkKey(id, index));
      }
    }

    await SecureStore.deleteItemAsync(manifestKey(id));
  },
};
