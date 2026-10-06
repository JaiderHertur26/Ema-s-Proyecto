import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  getActiveJourneySummary,
  type ActiveJourneySummary,
} from '@/data/repositories/journey-repository';
import { listLetters, type LetterRecord } from '@/data/repositories/letter-repository';
import { colors, radius, spacing, typeScale } from '@/design/tokens';

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
}

export default function LettersScreen() {
  const db = useSQLiteContext();
  const [journey, setJourney] = useState<ActiveJourneySummary | null>(null);
  const [letters, setLetters] = useState<LetterRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      const currentJourney = await getActiveJourneySummary(db);
      if (!active) return;

      setJourney(currentJourney);
      if (!currentJourney) {
        setLoading(false);
        return;
      }

      const result = await listLetters(db, currentJourney.lovedOneId);
      if (!active) return;

      setLetters(result);
      setLoading(false);
    }

    load();

    return () => {
      active = false;
    };
  }, [db]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <Text style={styles.topTitle}>CARTAS</Text>
          <View style={styles.backPlaceholder} />
        </View>

        <View style={styles.hero}>
          <Text style={styles.title}>Mis cartas</Text>
          <Text style={styles.subtitle}>
            {journey?.name
              ? `Palabras que has querido conservar para ${journey.name}.`
              : 'Palabras que has querido conservar.'}
          </Text>
        </View>

        {loading ? (
          <Text style={styles.empty}>Cargando…</Text>
        ) : letters.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Todavía no has escrito ninguna carta.</Text>
            <Text style={styles.emptyText}>
              Puedes comenzar cuando sientas que hay algo que necesita palabras.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {letters.map((letter) => (
              <Pressable
                key={letter.id}
                accessibilityRole="button"
                onPress={() => router.push({ pathname: '/memories/letter', params: { id: letter.id } })}
                style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.date}>{formatDate(letter.createdAt)}</Text>
                  {letter.prayerBody && <Text style={styles.prayerTag}>Con oración</Text>}
                </View>
                <Text numberOfLines={4} style={styles.body}>
                  {letter.body}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/memories/write')}
          style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}>
          <Text style={styles.addText}>+ Escribir una nueva carta</Text>
        </Pressable>
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
  list: { gap: spacing.sm },
  card: {
    borderRadius: radius.md,
    backgroundColor: colors.creamElevated,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  date: { color: colors.inkSoft, fontSize: typeScale.caption },
  prayerTag: {
    color: colors.navy,
    fontSize: 11,
    fontWeight: '700',
    backgroundColor: '#FFF8E9',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  body: { color: colors.ink, fontFamily: 'serif', fontSize: typeScale.bodySmall, lineHeight: 23 },
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
    borderWidth: 1,
    borderColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  addText: { color: colors.navy, fontSize: typeScale.bodySmall, fontWeight: '700' },
  pressed: { opacity: 0.84 },
});
