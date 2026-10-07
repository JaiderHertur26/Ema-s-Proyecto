import { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/emaus/primary-button';
import {
  getActiveJourneySummary,
  type ActiveJourneySummary,
} from '@/data/repositories/journey-repository';
import { createPhotoMemory } from '@/data/repositories/memory-repository';
import { colors, radius, spacing, typeScale } from '@/design/tokens';
import { persistPhotoLocally } from '@/services/media/photo-storage';

export default function AddPhotoScreen() {
  const db = useSQLiteContext();
  const [journey, setJourney] = useState<ActiveJourneySummary | null>(null);
  const [selectedUri, setSelectedUri] = useState<string | null>(null);
  const [selectedMimeType, setSelectedMimeType] = useState<string | null>(null);
  const [selectedSizeBytes, setSelectedSizeBytes] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [permissionMessage, setPermissionMessage] = useState<string | null>(null);

  useEffect(() => {
    getActiveJourneySummary(db).then(setJourney);
  }, [db]);

  async function choosePhoto() {
    setPermissionMessage(null);

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setPermissionMessage(
        'EMAÚS necesita permiso para que tú elijas una fotografía. No accede ni publica otras imágenes por su cuenta.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.9,
      selectionLimit: 1,
    });

    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    setSelectedUri(asset.uri);
    setSelectedMimeType(asset.mimeType ?? null);
    setSelectedSizeBytes(asset.fileSize ?? null);
  }

  async function savePhoto() {
    if (!journey || !selectedUri || saving) return;

    setSaving(true);
    try {
      const privateUri = await persistPhotoLocally(selectedUri);
      await createPhotoMemory(db, {
        lovedOneId: journey.lovedOneId,
        mediaUri: privateUri,
        mediaMimeType: selectedMimeType,
        mediaSizeBytes: selectedSizeBytes,
        title,
        note,
      });
      router.replace('/memories/photos');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.topRow}>
            <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backText}>‹</Text>
            </Pressable>
            <Text style={styles.topTitle}>NUEVA FOTOGRAFÍA</Text>
            <View style={styles.backPlaceholder} />
          </View>

          <View style={styles.hero}>
            <Text style={styles.title}>Guardar una fotografía</Text>
            <Text style={styles.subtitle}>
              Elige una imagen que tenga un significado especial. El título y la nota son opcionales.
            </Text>
          </View>

          {selectedUri ? (
            <Pressable accessibilityRole="button" onPress={choosePhoto} style={styles.previewWrap}>
              <Image contentFit="cover" source={{ uri: selectedUri }} style={styles.preview} transition={180} />
              <View style={styles.changeBadge}>
                <Text style={styles.changeText}>Cambiar foto</Text>
              </View>
            </Pressable>
          ) : (
            <Pressable
              accessibilityRole="button"
              onPress={choosePhoto}
              style={({ pressed }) => [styles.picker, pressed && styles.pressed]}>
              <Text style={styles.pickerIcon}>▧</Text>
              <Text style={styles.pickerTitle}>Elegir de mi galería</Text>
              <Text style={styles.pickerText}>Tú decides qué imagen compartir con EMAÚS.</Text>
            </Pressable>
          )}

          {permissionMessage && <Text style={styles.permission}>{permissionMessage}</Text>}

          <TextInput
            maxLength={100}
            onChangeText={setTitle}
            placeholder="Título opcional"
            placeholderTextColor={colors.inkSoft}
            style={styles.input}
            value={title}
          />

          <TextInput
            maxLength={500}
            multiline
            onChangeText={setNote}
            placeholder="¿Qué quieres recordar de esta fotografía?"
            placeholderTextColor={colors.inkSoft}
            style={styles.noteInput}
            textAlignVertical="top"
            value={note}
          />

          <Text style={styles.privacy}>
            La copia se guarda dentro del espacio privado de la aplicación. La foto original de tu galería no se modifica.
          </Text>

          <PrimaryButton
            disabled={!selectedUri || saving}
            label="Guardar fotografía"
            onPress={savePhoto}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: colors.cream },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: spacing.md },
  topRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backPlaceholder: { width: 40, height: 40 },
  backText: { color: colors.navy, fontSize: 38, lineHeight: 40 },
  topTitle: { color: colors.gold, fontSize: 11, fontWeight: '800', letterSpacing: 1.3 },
  hero: { paddingTop: spacing.lg, paddingBottom: spacing.sm, gap: spacing.sm },
  title: {
    color: colors.navyDeep,
    fontFamily: 'serif',
    fontSize: typeScale.title,
    lineHeight: 39,
    fontWeight: '700',
  },
  subtitle: { color: colors.inkSoft, fontSize: typeScale.bodySmall, lineHeight: 22 },
  picker: {
    minHeight: 220,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.goldSoft,
    backgroundColor: '#FFF8E9',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  pickerIcon: { color: colors.gold, fontSize: 38 },
  pickerTitle: { color: colors.navyDeep, fontSize: typeScale.body, fontWeight: '700' },
  pickerText: { color: colors.inkSoft, fontSize: typeScale.caption, textAlign: 'center' },
  previewWrap: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.creamElevated,
    borderWidth: 1,
    borderColor: colors.line,
  },
  preview: { width: '100%', aspectRatio: 4 / 3 },
  changeBadge: {
    position: 'absolute',
    right: spacing.sm,
    bottom: spacing.sm,
    backgroundColor: 'rgba(11,46,79,0.88)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  changeText: { color: colors.white, fontSize: typeScale.caption, fontWeight: '700' },
  input: {
    minHeight: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.creamElevated,
    color: colors.ink,
    fontSize: typeScale.body,
    paddingHorizontal: spacing.md,
  },
  noteInput: {
    minHeight: 120,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.creamElevated,
    color: colors.ink,
    fontSize: typeScale.bodySmall,
    lineHeight: 22,
    padding: spacing.md,
  },
  permission: {
    color: colors.danger,
    fontSize: typeScale.caption,
    lineHeight: 19,
    textAlign: 'center',
  },
  privacy: {
    color: colors.inkSoft,
    fontSize: typeScale.caption,
    lineHeight: 19,
    textAlign: 'center',
  },
  pressed: { opacity: 0.84 },
});
