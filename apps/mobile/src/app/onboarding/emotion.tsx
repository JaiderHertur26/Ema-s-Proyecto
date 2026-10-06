import { useState } from 'react';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { setOnboardingEmotion } from '@/data/repositories/onboarding-repository';
import { colors, radius, spacing, typeScale } from '@/design/tokens';
import type { Emotion } from '@/domain/types';

const emotions: { value: Emotion; label: string; icon: string }[] = [
  { value: 'sadness', label: 'Estoy triste', icon: '😔' },
  { value: 'yearning', label: 'Lo extraño mucho', icon: '🕯️' },
  { value: 'anxiety', label: 'Estoy angustiado', icon: '😰' },
  { value: 'guilt', label: 'Me siento culpable', icon: '💭' },
  { value: 'anger', label: 'Siento rabia', icon: '😠' },
  { value: 'loneliness', label: 'Me siento solo', icon: '🌙' },
  { value: 'fear', label: 'Tengo miedo', icon: '🤍' },
  { value: 'peace', label: 'Hoy estoy en paz', icon: '🌿' },
  { value: 'hope', label: 'Siento esperanza', icon: '✨' },
  { value: 'unknown', label: 'No sé qué siento', icon: '…' },
];

export default function EmotionScreen() {
  const db = useSQLiteContext();
  const [saving, setSaving] = useState<Emotion | null>(null);

  async function handleSelect(emotion: Emotion) {
    if (saving) return;

    setSaving(emotion);
    try {
      await setOnboardingEmotion(db, emotion);
      router.push('/onboarding/finish');
    } finally {
      setSaving(null);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <View style={styles.progress}>
            {Array.from({ length: 5 }).map((_, index) => (
              <View key={index} style={styles.progressDot} />
            ))}
            <View style={[styles.progressDot, styles.progressDotActive]} />
            <View style={styles.progressDot} />
          </View>
          <View style={styles.backPlaceholder} />
        </View>

        <View style={styles.headingBlock}>
          <Text style={styles.title}>¿Cómo está tu corazón hoy?</Text>
          <Text style={styles.subtitle}>
            No hay una respuesta correcta. Elige lo que más se acerque a este momento.
          </Text>
        </View>

        <View style={styles.grid}>
          {emotions.map((emotion) => (
            <Pressable
              key={emotion.value}
              accessibilityRole="button"
              disabled={saving !== null}
              onPress={() => handleSelect(emotion.value)}
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
                saving === emotion.value && styles.cardSelected,
              ]}>
              <Text style={styles.icon}>{emotion.icon}</Text>
              <Text style={styles.label}>{emotion.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.helper}>
          Puedes cambiar cómo te sientes todas las veces que lo necesites. Un día no define tu duelo.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.cream },
  content: { flexGrow: 1, paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  topRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backPlaceholder: { width: 40, height: 40 },
  backText: { color: colors.navy, fontSize: 38, lineHeight: 40 },
  progress: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  progressDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.line },
  progressDotActive: { width: 18, backgroundColor: colors.navy },
  headingBlock: { alignItems: 'center', paddingTop: spacing.lg, paddingBottom: spacing.xl, gap: spacing.sm },
  title: {
    maxWidth: 330,
    color: colors.navyDeep,
    fontFamily: 'serif',
    fontSize: typeScale.title,
    lineHeight: 38,
    textAlign: 'center',
    fontWeight: '700',
  },
  subtitle: {
    maxWidth: 320,
    color: colors.inkSoft,
    fontSize: typeScale.bodySmall,
    lineHeight: 22,
    textAlign: 'center',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: spacing.sm },
  card: {
    width: '48%',
    minHeight: 112,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.creamElevated,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  cardPressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  cardSelected: { borderColor: colors.gold, backgroundColor: '#FFF8E9' },
  icon: { fontSize: 30 },
  label: { color: colors.ink, fontSize: typeScale.bodySmall, lineHeight: 20, textAlign: 'center', fontWeight: '600' },
  helper: {
    color: colors.inkSoft,
    fontSize: typeScale.caption,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
