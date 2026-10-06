import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getLetter, type LetterRecord } from '@/data/repositories/letter-repository';
import { colors, radius, spacing, typeScale } from '@/design/tokens';

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso));
}

export default function LetterScreen() {
  const db = useSQLiteContext();
  const params = useLocalSearchParams<{ id?: string }>();
  const [letter, setLetter] = useState<LetterRecord | null>(null);

  useEffect(() => {
    if (!params.id) return;
    getLetter(db, params.id).then(setLetter);
  }, [db, params.id]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <Text style={styles.topTitle}>MI CARTA</Text>
          <View style={styles.backPlaceholder} />
        </View>

        {letter ? (
          <>
            <Text style={styles.date}>{formatDate(letter.createdAt)}</Text>

            <View style={styles.card}>
              <Text style={styles.body}>{letter.body}</Text>
            </View>

            {letter.prayerBody && (
              <View style={styles.prayerCard}>
                <Text style={styles.prayerEyebrow}>MI ORACIÓN</Text>
                <Text style={styles.prayerBody}>{letter.prayerBody}</Text>
              </View>
            )}

            {!letter.prayerBody && (
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  router.push({ pathname: '/memories/prayer-from-letter', params: { id: letter.id } })
                }
                style={({ pressed }) => [styles.prayerButton, pressed && styles.pressed]}>
                <Text style={styles.prayerButtonText}>Llevar esta carta a mi oración</Text>
              </Pressable>
            )}
          </>
        ) : (
          <Text style={styles.empty}>Cargando tu carta…</Text>
        )}
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
  date: { color: colors.inkSoft, fontSize: typeScale.caption, textAlign: 'center', marginTop: spacing.sm },
  card: {
    minHeight: 300,
    borderRadius: radius.lg,
    backgroundColor: colors.creamElevated,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.lg,
  },
  body: { color: colors.ink, fontFamily: 'serif', fontSize: typeScale.body, lineHeight: 28 },
  prayerCard: {
    borderRadius: radius.lg,
    backgroundColor: '#FFF8E9',
    borderWidth: 1,
    borderColor: colors.goldSoft,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  prayerEyebrow: { color: colors.gold, fontSize: typeScale.caption, fontWeight: '800', letterSpacing: 1.2 },
  prayerBody: { color: colors.navyDeep, fontFamily: 'serif', fontSize: typeScale.body, lineHeight: 28 },
  prayerButton: {
    minHeight: 54,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prayerButtonText: { color: colors.navy, fontSize: typeScale.bodySmall, fontWeight: '700' },
  pressed: { opacity: 0.84 },
  empty: { color: colors.inkSoft, fontSize: typeScale.body, textAlign: 'center', marginTop: spacing.xxl },
});
