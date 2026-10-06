import { useEffect, useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { personalizeJourneyContent } from '@/content/journey/journey-content';
import {
  getActiveJourneySummary,
  type ActiveJourneySummary,
} from '@/data/repositories/journey-repository';
import { recordJourneyStageVisit } from '@/data/repositories/journey-stage-repository';
import { colors, radius, spacing, typeScale } from '@/design/tokens';
import {
  getCurrentJourneyStage,
  journeyStages,
  type JourneyStageId,
} from '@/domain/journey-path';

function normalizeStage(value: string | string[] | undefined): JourneyStageId {
  const raw = Array.isArray(value) ? value[0] : value;
  const match = journeyStages.find((stage) => stage.id === raw);
  return match?.id ?? 'first_days';
}

export default function JourneyStageScreen() {
  const db = useSQLiteContext();
  const params = useLocalSearchParams<{ stage?: string }>();
  const stageId = normalizeStage(params.stage);
  const [journey, setJourney] = useState<ActiveJourneySummary | null>(null);

  useEffect(() => {
    getActiveJourneySummary(db).then(setJourney);
  }, [db]);

  useEffect(() => {
    if (!journey) return;
    recordJourneyStageVisit(db, journey.journeyId, stageId).catch(() => undefined);
  }, [db, journey, stageId]);

  const currentStage = useMemo(() => {
    if (!journey) return null;

    return getCurrentJourneyStage({
      deathDate: journey.deathDate,
      precision: journey.deathDatePrecision,
    });
  }, [journey]);

  const content = useMemo(
    () => personalizeJourneyContent(stageId, journey?.name || 'tu ser querido'),
    [journey?.name, stageId]
  );

  const isCurrent = currentStage === stageId;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <Text style={styles.topTitle}>MI CAMINO</Text>
          <View style={styles.backPlaceholder} />
        </View>

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>{content.eyebrow}</Text>
          {isCurrent && (
            <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeText}>ESTÁS AQUÍ ACTUALMENTE</Text>
            </View>
          )}
          <Text style={styles.title}>{content.title}</Text>
          <Text style={styles.intro}>{content.intro}</Text>
        </View>

        <View style={[styles.card, styles.scriptureCard]}>
          <Text style={styles.cardEyebrow}>UNA PALABRA</Text>
          <Text style={styles.scripture}>{content.scripture}</Text>
          <Text style={styles.reference}>{content.reference}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardEyebrow}>CAMINEMOS</Text>
          <Text style={styles.body}>{content.reflection}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardEyebrow}>UN PEQUEÑO PASO</Text>
          <Text style={styles.body}>{content.smallStep}</Text>
        </View>

        <View style={[styles.card, styles.prayerCard]}>
          <Text style={styles.cardEyebrow}>OREMOS</Text>
          <Text style={styles.prayer}>{content.prayer}</Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/(tabs)/pray')}
            style={({ pressed }) => [styles.primary, pressed && styles.pressed]}>
            <Text style={styles.primaryText}>Quiero seguir orando</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/(tabs)/memories')}
            style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}>
            <Text style={styles.secondaryText}>Quiero recordar</Text>
          </Pressable>
        </View>

        <Text style={styles.note}>
          Puedes volver a este recorrido cuando quieras. EMAÚS no considera ninguna etapa “superada” ni “completada”.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.cream },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
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
  eyebrow: { color: colors.gold, fontSize: typeScale.caption, fontWeight: '800', letterSpacing: 1.5 },
  currentBadge: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    backgroundColor: '#FFF3D4',
    borderWidth: 1,
    borderColor: colors.goldSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  currentBadgeText: { color: colors.navy, fontSize: 10, fontWeight: '800', letterSpacing: 0.7 },
  title: {
    color: colors.navyDeep,
    fontFamily: 'serif',
    fontSize: typeScale.title,
    lineHeight: 39,
    fontWeight: '700',
  },
  intro: { color: colors.inkSoft, fontSize: typeScale.body, lineHeight: 26 },
  card: {
    borderRadius: radius.lg,
    backgroundColor: colors.creamElevated,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  scriptureCard: { backgroundColor: '#FFF8E9', borderColor: colors.goldSoft },
  prayerCard: { backgroundColor: '#F3F6F0', borderColor: '#CBD8C6' },
  cardEyebrow: { color: colors.navy, fontSize: typeScale.caption, fontWeight: '800', letterSpacing: 1 },
  scripture: {
    color: colors.navyDeep,
    fontFamily: 'serif',
    fontSize: typeScale.heading,
    lineHeight: 30,
  },
  reference: { color: colors.inkSoft, fontSize: typeScale.bodySmall },
  body: { color: colors.ink, fontSize: typeScale.body, lineHeight: 27 },
  prayer: { color: colors.ink, fontFamily: 'serif', fontSize: typeScale.body, lineHeight: 28 },
  actions: { gap: spacing.sm, marginTop: spacing.sm },
  primary: {
    minHeight: 54,
    borderRadius: radius.pill,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: { color: colors.white, fontSize: typeScale.bodySmall, fontWeight: '800' },
  secondary: {
    minHeight: 54,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: { color: colors.navy, fontSize: typeScale.bodySmall, fontWeight: '700' },
  pressed: { opacity: 0.84 },
  note: {
    color: colors.inkSoft,
    fontSize: typeScale.caption,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
