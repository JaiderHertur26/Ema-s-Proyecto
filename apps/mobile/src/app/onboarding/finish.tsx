import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/emaus/primary-button';
import { getOnboardingDraft } from '@/data/repositories/onboarding-repository';
import { completeOnboarding } from '@/data/repositories/onboarding-service';
import { colors, spacing, typeScale } from '@/design/tokens';

export default function FinishScreen() {
  const db = useSQLiteContext();
  const [name, setName] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getOnboardingDraft(db).then((draft) => setName(draft?.name ?? null));
  }, [db]);

  async function handleStart() {
    if (saving) return;

    setSaving(true);
    try {
      await completeOnboarding(db);
      router.replace('/today');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <View style={styles.progress}>
            {Array.from({ length: 6 }).map((_, index) => (
              <View key={index} style={styles.progressDot} />
            ))}
            <View style={[styles.progressDot, styles.progressDotActive]} />
          </View>
          <View style={styles.backPlaceholder} />
        </View>

        <View style={styles.body}>
          <Text style={styles.eyebrow}>EMAÚS</Text>
          <Text style={styles.title}>
            {name ? `${name} fue importante para ti.` : 'Esa persona fue importante para ti.'}
          </Text>
          <Text style={styles.paragraph}>Por eso su ausencia duele.</Text>

          <View style={styles.messageCard}>
            <Text style={styles.message}>
              Hoy no tienes que aprender a vivir toda una vida sin esa persona.
            </Text>
            <Text style={styles.messageStrong}>Solo tenemos que caminar este día.</Text>
          </View>

          <Text style={styles.paragraph}>Caminemos juntos.</Text>
        </View>

        <PrimaryButton disabled={saving} label="Comenzar" onPress={handleStart} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.cream },
  content: { flex: 1, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
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
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  eyebrow: { color: colors.gold, fontSize: typeScale.caption, fontWeight: '800', letterSpacing: 3 },
  title: {
    maxWidth: 340,
    color: colors.navyDeep,
    fontFamily: 'serif',
    fontSize: typeScale.title,
    lineHeight: 39,
    textAlign: 'center',
    fontWeight: '700',
  },
  paragraph: {
    maxWidth: 330,
    color: colors.inkSoft,
    fontSize: typeScale.body,
    lineHeight: 25,
    textAlign: 'center',
  },
  messageCard: {
    maxWidth: 350,
    marginVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderRadius: 24,
    backgroundColor: '#FFF8E9',
    borderWidth: 1,
    borderColor: colors.goldSoft,
    gap: spacing.md,
  },
  message: {
    color: colors.ink,
    fontSize: typeScale.body,
    lineHeight: 25,
    textAlign: 'center',
  },
  messageStrong: {
    color: colors.navyDeep,
    fontFamily: 'serif',
    fontSize: typeScale.heading,
    lineHeight: 30,
    textAlign: 'center',
    fontWeight: '700',
  },
});
