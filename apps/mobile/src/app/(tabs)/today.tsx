import { useEffect, useMemo, useState } from 'react';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getAccompanimentCopy } from '@/content/accompaniment-copy';
import {
  addEmotionalCheckin,
  getLatestEmotionalCheckin,
} from '@/data/repositories/checkin-repository';
import {
  getActiveJourneySummary,
  type ActiveJourneySummary,
} from '@/data/repositories/journey-repository';
import { colors, radius, spacing, typeScale } from '@/design/tokens';
import {
  calculateDaySinceLoss,
  decideAccompaniment,
} from '@/domain/accompaniment-engine';
import type { Emotion } from '@/domain/types';

const emotions: { value: Emotion; label: string; icon: string }[] = [
  { value: 'sadness', label: 'Triste', icon: '😔' },
  { value: 'yearning', label: 'Lo extraño', icon: '🕯️' },
  { value: 'anxiety', label: 'Ansioso', icon: '😰' },
  { value: 'guilt', label: 'Culpable', icon: '💭' },
  { value: 'anger', label: 'Con rabia', icon: '😠' },
  { value: 'loneliness', label: 'Solo', icon: '🌙' },
  { value: 'peace', label: 'En paz', icon: '🌿' },
  { value: 'hope', label: 'Con esperanza', icon: '✨' },
  { value: 'unknown', label: 'No sé', icon: '…' },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

function journeySubtitle(journey: ActiveJourneySummary) {
  const days = calculateDaySinceLoss(journey.deathDate, journey.deathDatePrecision);

  if (days === null) {
    return 'Caminamos contigo en este momento de duelo.';
  }

  if (days === 0) return 'Su partida fue hoy.';
  if (days === 1) return 'Ha pasado 1 día desde su partida.';
  return `Han pasado ${days} días desde su partida.`;
}

export default function TodayScreen() {
  const db = useSQLiteContext();
  const [journey, setJourney] = useState<ActiveJourneySummary | null>(null);
  const [emotion, setEmotion] = useState<Emotion | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingEmotion, setSavingEmotion] = useState<Emotion | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      const result = await getActiveJourneySummary(db);
      if (!active) return;

      if (!result) {
        router.replace('/');
        return;
      }

      setJourney(result);

      const latest = await getLatestEmotionalCheckin(db, result.journeyId);
      if (!active) return;

      setEmotion(latest?.emotion ?? null);
      setLoading(false);
    }

    load().catch(() => {
      if (active) setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [db]);

  const greeting = useMemo(() => getGreeting(), []);

  const decision = useMemo(() => {
    if (!journey) return null;

    return decideAccompaniment({
      deathDate: journey.deathDate,
      deathDatePrecision: journey.deathDatePrecision,
      relationship: journey.relationship,
      emotion,
    });
  }, [emotion, journey]);

  const copy = useMemo(() => {
    if (!decision || !journey) return null;
    return getAccompanimentCopy(decision, journey.name || 'tu ser querido');
  }, [decision, journey]);

  async function handleEmotion(nextEmotion: Emotion) {
    if (!journey || savingEmotion) return;

    setSavingEmotion(nextEmotion);
    try {
      await addEmotionalCheckin(db, journey.journeyId, nextEmotion);
      setEmotion(nextEmotion);
    } finally {
      setSavingEmotion(null);
    }
  }

  if (loading || !journey || !copy) {
    return <View style={styles.loading} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>{greeting}.</Text>
          <Text style={styles.title}>Hoy caminamos contigo.</Text>
        </View>

        <View style={styles.personCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{journey.name?.charAt(0).toUpperCase() || '♥'}</Text>
          </View>
          <View style={styles.personCopy}>
            <Text style={styles.personName}>{journey.name || 'Tu ser querido'}</Text>
            <Text style={styles.personMeta}>{journeySubtitle(journey)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>¿Cómo está tu corazón hoy?</Text>
          <ScrollView
            horizontal
            contentContainerStyle={styles.emotionRow}
            showsHorizontalScrollIndicator={false}>
            {emotions.map((item) => {
              const selected = emotion === item.value;
              return (
                <Pressable
                  key={item.value}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  disabled={savingEmotion !== null}
                  onPress={() => handleEmotion(item.value)}
                  style={[styles.emotionChip, selected && styles.emotionChipSelected]}>
                  <Text style={styles.emotionIcon}>{item.icon}</Text>
                  <Text style={[styles.emotionLabel, selected && styles.emotionLabelSelected]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <Text style={styles.intro}>{copy.intro}</Text>
        </View>

        <Text style={styles.kicker}>PARA HOY</Text>

        <View style={styles.card}>
          <Text style={styles.cardEyebrow}>UNA PALABRA</Text>
          <Text style={styles.scripture}>{copy.scripture}</Text>
          <Text style={styles.reference}>{copy.reference}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardEyebrow}>CAMINEMOS</Text>
          <Text style={styles.cardText}>{copy.walking}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardEyebrow}>UN PEQUEÑO PASO</Text>
          <Text style={styles.cardText}>{copy.smallStep}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardEyebrow}>OREMOS</Text>
          <Text style={styles.cardText}>{copy.prayer}</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/difficult-moment')}
          style={styles.difficultButton}>
          <Text style={styles.difficultText}>Hoy me está costando mucho</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: colors.cream },
  safeArea: { flex: 1, backgroundColor: colors.cream },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  header: { paddingTop: spacing.md, paddingBottom: spacing.sm },
  greeting: {
    color: colors.navyDeep,
    fontFamily: 'serif',
    fontSize: typeScale.title,
    fontWeight: '700',
  },
  title: { color: colors.inkSoft, fontSize: typeScale.body, marginTop: 4 },
  personCard: {
    borderRadius: radius.lg,
    backgroundColor: '#FFF8E9',
    borderWidth: 1,
    borderColor: colors.goldSoft,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.creamElevated,
    borderWidth: 1,
    borderColor: colors.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.navyDeep, fontFamily: 'serif', fontSize: 24, fontWeight: '700' },
  personCopy: { flex: 1 },
  personName: { color: colors.navyDeep, fontSize: typeScale.body, fontWeight: '700' },
  personMeta: { color: colors.inkSoft, fontSize: typeScale.bodySmall, lineHeight: 20, marginTop: 3 },
  section: { paddingVertical: spacing.md, gap: spacing.md },
  sectionTitle: {
    color: colors.navyDeep,
    fontFamily: 'serif',
    fontSize: typeScale.heading,
    fontWeight: '700',
  },
  emotionRow: { gap: spacing.sm, paddingRight: spacing.md },
  emotionChip: {
    minWidth: 86,
    minHeight: 72,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.creamElevated,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  emotionChipSelected: { borderColor: colors.gold, backgroundColor: '#FFF8E9' },
  emotionIcon: { fontSize: 24 },
  emotionLabel: { color: colors.inkSoft, fontSize: typeScale.caption, fontWeight: '600' },
  emotionLabelSelected: { color: colors.navyDeep },
  intro: { color: colors.ink, fontSize: typeScale.body, lineHeight: 25 },
  kicker: { color: colors.navy, fontSize: typeScale.caption, fontWeight: '800', letterSpacing: 1.2 },
  card: {
    borderRadius: radius.md,
    backgroundColor: colors.creamElevated,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardEyebrow: { color: colors.navy, fontSize: typeScale.caption, fontWeight: '800' },
  scripture: {
    color: colors.navyDeep,
    fontFamily: 'serif',
    fontSize: typeScale.heading,
    lineHeight: 29,
  },
  reference: { color: colors.inkSoft, fontSize: typeScale.bodySmall },
  cardText: { color: colors.ink, fontSize: typeScale.body, lineHeight: 25 },
  difficultButton: {
    minHeight: 54,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  difficultText: { color: colors.navy, fontSize: typeScale.bodySmall, fontWeight: '700' },
});
