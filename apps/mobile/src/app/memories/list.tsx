import { useEffect, useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  getActiveJourneySummary,
  type ActiveJourneySummary,
} from '@/data/repositories/journey-repository';
import {
  listMemoriesByCategory,
  type MemoryCategory,
  type MemoryRecord,
} from '@/data/repositories/memory-repository';
import { colors, radius, spacing, typeScale } from '@/design/tokens';

const labels: Record<MemoryCategory, string> = {
  story: 'Su historia',
  legacy: 'Lo que me enseñó',
  special_moment: 'Momentos que no quiero olvidar',
  gratitude: 'Agradecimientos',
  photo: 'Fotografías',
  other: 'Recuerdos',
};

function normalizeCategory(value: string | string[] | undefined): MemoryCategory {
  const category = Array.isArray(value) ? value[0] : value;
  if (
    category === 'story' ||
    category === 'legacy' ||
    category === 'special_moment' ||
    category === 'gratitude'
  ) {
    return category;
  }
  return 'other';
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
}

export default function MemoryListScreen() {
  const db = useSQLiteContext();
  const params = useLocalSearchParams<{ category?: string }>();
  const category = normalizeCategory(params.category);

  const [journey, setJourney] = useState<ActiveJourneySummary | null>(null);
  const [items, setItems] = useState<MemoryRecord[]>([]);
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

      const result = await listMemoriesByCategory(db, currentJourney.lovedOneId, category);
      if (!active) return;

      setItems(result);
      setLoading(false);
    }

    load();

    return () => {
      active = false;
    };
  }, [category, db]);

  const title = useMemo(() => labels[category], [category]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <Text style={styles.topTitle}>RECUERDOS</Text>
          <View style={styles.backPlaceholder} />
        </View>

        <View style={styles.hero}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>
            {journey?.name ? `Recuerdos de ${journey.name}` : 'Tu memoria agradecida'}
          </Text>
        </View>

        {loading ? (
          <Text style={styles.empty}>Cargando…</Text>
        ) : items.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Todavía no has guardado nada aquí.</Text>
            <Text style={styles.emptyText}>
              No hay prisa. Cuando quieras, puedes comenzar con un recuerdo sencillo.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {items.map((item) => (
              <View key={item.id} style={styles.card}>
                <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
                {item.title && <Text style={styles.itemTitle}>{item.title}</Text>}
                <Text style={styles.itemContent}>{item.content}</Text>
              </View>
            ))}
          </View>
        )}

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push({ pathname: '/memories/new', params: { category } })}
          style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}>
          <Text style={styles.addText}>+ Guardar un nuevo recuerdo</Text>
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
  hero: { paddingTop: spacing.lg, paddingBottom: spacing.sm, gap: spacing.xs },
  title: {
    color: colors.navyDeep,
    fontFamily: 'serif',
    fontSize: typeScale.title,
    lineHeight: 39,
    fontWeight: '700',
  },
  subtitle: { color: colors.inkSoft, fontSize: typeScale.bodySmall },
  list: { gap: spacing.sm },
  card: {
    borderRadius: radius.md,
    backgroundColor: colors.creamElevated,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.md,
    gap: spacing.sm,
  },
  date: { color: colors.inkSoft, fontSize: typeScale.caption },
  itemTitle: { color: colors.navyDeep, fontSize: typeScale.bodySmall, fontWeight: '700' },
  itemContent: { color: colors.ink, fontFamily: 'serif', fontSize: typeScale.body, lineHeight: 26 },
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
