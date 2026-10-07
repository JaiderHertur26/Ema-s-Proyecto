import { useCallback, useState } from 'react';
import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  getActiveJourneySummary,
  type ActiveJourneySummary,
} from '@/data/repositories/journey-repository';
import {
  listMemoriesByCategory,
  type MemoryRecord,
} from '@/data/repositories/memory-repository';
import { colors, radius, spacing, typeScale } from '@/design/tokens';
import { useAuthIdentity } from '@/services/auth/auth-provider';
import { ensureMemoryPhotoCached } from '@/services/media/cloud-photo-storage';

export default function PhotosScreen() {
  const db = useSQLiteContext();
  const auth = useAuthIdentity();
  const [journey, setJourney] = useState<ActiveJourneySummary | null>(null);
  const [photos, setPhotos] = useState<MemoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const currentJourney = await getActiveJourneySummary(db);
    setJourney(currentJourney);

    if (!currentJourney) {
      setPhotos([]);
      setLoading(false);
      return;
    }

    const result = await listMemoriesByCategory(db, currentJourney.lovedOneId, 'photo');

    const remoteUserId = auth.remoteUserId;

    if (remoteUserId) {
      const hydrated = await Promise.all(
        result.map(async (photo) => {
          if (photo.mediaUri || !photo.mediaObjectPath) return photo;

          try {
            const localUri = await ensureMemoryPhotoCached(
              db,
              photo,
              remoteUserId
            );

            return localUri ? { ...photo, mediaUri: localUri } : photo;
          } catch {
            return photo;
          }
        })
      );

      setPhotos(hydrated);
    } else {
      setPhotos(result);
    }

    setLoading(false);
  }, [auth.remoteUserId, db]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <Text style={styles.topTitle}>FOTOGRAFÍAS</Text>
          <View style={styles.backPlaceholder} />
        </View>

        <View style={styles.hero}>
          <Text style={styles.title}>
            {journey?.name ? `Fotografías de ${journey.name}` : 'Fotografías'}
          </Text>
          <Text style={styles.subtitle}>
            Guarda imágenes significativas sin convertir la memoria en una obligación.
          </Text>
        </View>

        {loading ? (
          <Text style={styles.empty}>Cargando…</Text>
        ) : photos.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Todavía no hay fotografías guardadas.</Text>
            <Text style={styles.emptyText}>
              Puedes comenzar con una sola imagen que tenga un significado especial para ti.
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {photos.map((photo) => (
              <View key={photo.id} style={styles.photoCard}>
                {photo.mediaUri && (
                  <Image
                    contentFit="cover"
                    source={{ uri: photo.mediaUri }}
                    style={styles.image}
                    transition={180}
                  />
                )}
                {(photo.title || photo.content) && (
                  <View style={styles.caption}>
                    {photo.title && <Text style={styles.captionTitle}>{photo.title}</Text>}
                    {photo.content && (
                      <Text numberOfLines={2} style={styles.captionText}>
                        {photo.content}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/memories/add-photo')}
          style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}>
          <Text style={styles.addText}>+ Añadir una fotografía</Text>
        </Pressable>

        <Text style={styles.privacy}>
          Las fotos se copian al almacenamiento privado de EMAÚS en tu dispositivo. No se publican ni se comparten automáticamente.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  topTitle: { color: colors.gold, fontSize: typeScale.caption, fontWeight: '800', letterSpacing: 2 },
  hero: { paddingTop: spacing.lg, paddingBottom: spacing.sm, gap: spacing.sm },
  title: {
    color: colors.navyDeep,
    fontFamily: 'serif',
    fontSize: typeScale.title,
    lineHeight: 39,
    fontWeight: '700',
  },
  subtitle: { color: colors.inkSoft, fontSize: typeScale.bodySmall, lineHeight: 22 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  photoCard: {
    width: '48%',
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.creamElevated,
    borderWidth: 1,
    borderColor: colors.line,
  },
  image: { width: '100%', aspectRatio: 1 },
  caption: { padding: spacing.sm, gap: 3 },
  captionTitle: { color: colors.navyDeep, fontSize: typeScale.caption, fontWeight: '700' },
  captionText: { color: colors.inkSoft, fontSize: 11, lineHeight: 15 },
  emptyCard: {
    borderRadius: radius.lg,
    backgroundColor: '#FFF8E9',
    borderWidth: 1,
    borderColor: colors.goldSoft,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  emptyTitle: { color: colors.navyDeep, fontSize: typeScale.body, fontWeight: '700', textAlign: 'center' },
  emptyText: { color: colors.inkSoft, fontSize: typeScale.bodySmall, lineHeight: 21, textAlign: 'center' },
  empty: { color: colors.inkSoft, fontSize: typeScale.body, textAlign: 'center', marginTop: spacing.xl },
  addButton: {
    minHeight: 54,
    borderRadius: radius.pill,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  addText: { color: colors.white, fontSize: typeScale.bodySmall, fontWeight: '800' },
  pressed: { opacity: 0.84 },
  privacy: { color: colors.inkSoft, fontSize: typeScale.caption, lineHeight: 19, textAlign: 'center' },
});
