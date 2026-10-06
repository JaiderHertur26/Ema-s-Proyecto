import { useEffect, useMemo, useRef, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getDifficultMomentContent } from '@/content/difficult-moments/content';
import { addEmotionalCheckin } from '@/data/repositories/checkin-repository';
import {
  getActiveJourneySummary,
  type ActiveJourneySummary,
} from '@/data/repositories/journey-repository';
import { colors, radius, spacing, typeScale } from '@/design/tokens';
import {
  getDifficultMomentOption,
  normalizeDifficultMomentType,
  type DifficultMomentType,
} from '@/domain/difficult-moment';
import type { EmotionIntensity } from '@/domain/types';

function normalizeIntensity(value: string | string[] | undefined): EmotionIntensity {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === 'mild' || raw === 'moderate' || raw === 'strong') return raw;
  return 'unknown';
}

export default function DifficultMomentSupportScreen() {
  const db = useSQLiteContext();
  const params = useLocalSearchParams<{ type?: string; intensity?: string }>();
  const type = normalizeDifficultMomentType(params.type);
  const intensity = normalizeIntensity(params.intensity);

  const [journey, setJourney] = useState<ActiveJourneySummary | null>(null);
  const recorded = useRef(false);

  useEffect(() => {
    if (type === 'unsafe') {
      router.replace('/difficult-moment/safety');
      return;
    }
    getActiveJourneySummary(db).then(setJourney);
  }, [db, type]);

  const safeType = (type === 'unsafe' ? 'unknown' : type) as Exclude<DifficultMomentType, 'unsafe'>;
  const option = getDifficultMomentOption(safeType);
  const content = useMemo(
    () => getDifficultMomentContent(safeType, intensity),
    [intensity, safeType]
  );

  useEffect(() => {
    if (!journey || recorded.current || !option?.emotion) return;

    recorded.current = true;
    addEmotionalCheckin(db, journey.journeyId, option.emotion, intensity).catch(() => {
      recorded.current = false;
    });
  }, [db, intensity, journey, option?.emotion]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <Text style={styles.topTitle}>ESTOY AQUÍ CONTIGO</Text>
          <View style={styles.backPlaceholder} />
        </View>

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>{option?.label?.toUpperCase() ?? 'ESTE MOMENTO'}</Text>
          <Text style={styles.title}>{content.title}</Text>
          <Text style={styles.intro}>{content.intro}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.body}>{content.body}</Text>
        </View>

        <View style={[styles.card, styles.stepCard]}>
          <Text style={styles.cardEyebrow}>AHORA MISMO</Text>
          <Text style={styles.step}>{content.immediateStep}</Text>
        </View>

        {content.prayer && (
          <View style={[styles.card, styles.prayerCard]}>
            <Text style={styles.cardEyebrow}>SI QUIERES, OREMOS</Text>
            <Text style={styles.prayer}>{content.prayer}</Text>
          </View>
        )}

        {content.encourageHumanSupport && (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/support/now')}
            style={({ pressed }) => [styles.primary, pressed && styles.pressed]}>
            <Text style={styles.primaryText}>Quiero buscar compañía humana</Text>
          </Pressable>
        )}

        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/(tabs)/today')}
          style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}>
          <Text style={styles.secondaryText}>Volver a Hoy</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/difficult-moment/safety')}
          style={({ pressed }) => [styles.safetyLink, pressed && styles.pressed]}>
          <Text style={styles.safetyLinkText}>No me siento seguro conmigo mismo</Text>
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
  topTitle: { color: colors.gold, fontSize: 11, fontWeight: '800', letterSpacing: 1.1 },
  hero: { paddingTop: spacing.lg, paddingBottom: spacing.sm, gap: spacing.sm },
  eyebrow: { color: colors.gold, fontSize: typeScale.caption, fontWeight: '800', letterSpacing: 1 },
  title: {
    color: colors.navyDeep,
    fontFamily: 'serif',
    fontSize: typeScale.title,
    lineHeight: 39,
    fontWeight: '700',
  },
  intro: { color: colors.inkSoft, fontSize: typeScale.body, lineHeight: 25 },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.creamElevated,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  stepCard: { backgroundColor: '#FFF8E9', borderColor: colors.goldSoft },
  prayerCard: { backgroundColor: '#F3F6F0', borderColor: '#CBD8C6' },
  cardEyebrow: { color: colors.navy, fontSize: typeScale.caption, fontWeight: '800', letterSpacing: 1 },
  body: { color: colors.ink, fontSize: typeScale.body, lineHeight: 27 },
  step: { color: colors.navyDeep, fontSize: typeScale.body, lineHeight: 27, fontWeight: '600' },
  prayer: { color: colors.ink, fontFamily: 'serif', fontSize: typeScale.body, lineHeight: 28 },
  primary: {
    minHeight: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
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
  safetyLink: { minHeight: 46, alignItems: 'center', justifyContent: 'center' },
  safetyLinkText: { color: colors.danger, fontSize: typeScale.caption, fontWeight: '700' },
  pressed: { opacity: 0.84 },
});
