import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system/legacy';

const PHOTO_DIRECTORY = 'emaus-media/photos';

function getExtension(uri: string) {
  const match = uri.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
  const ext = match?.[1]?.toLowerCase();
  if (!ext) return 'jpg';
  if (ext === 'jpeg') return 'jpg';
  return ext;
}

export async function persistPhotoLocally(sourceUri: string) {
  if (!FileSystem.documentDirectory) {
    throw new Error('El almacenamiento privado no está disponible.');
  }

  const directory = `${FileSystem.documentDirectory}${PHOTO_DIRECTORY}`;
  const directoryInfo = await FileSystem.getInfoAsync(directory);

  if (!directoryInfo.exists) {
    await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
  }

  const extension = getExtension(sourceUri);
  const filename = `${Crypto.randomUUID()}.${extension}`;
  const destination = `${directory}/${filename}`;

  await FileSystem.copyAsync({
    from: sourceUri,
    to: destination,
  });

  return destination;
}
