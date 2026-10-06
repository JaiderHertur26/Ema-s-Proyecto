import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/emaus/primary-button';
import { getOnboardingDraft } from '@/data/repositories/onboarding-repository';
import { colors, spacing, typeScale } from '@/design/tokens';

export default function ThanksScreen() {
  const db = useSQLiteContext();
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    getOnboardingDraft(db).then((draft) => setName(draft?.name ?? null));
  }, [db]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <View style={styles.progress}>
            {Array.from({ length: 4 }).map((_, index) => (
              <View key={index} style={styles.progressDot} />
            ))}
            <View style={[styles.progressDot, styles.progressDotActive]} />
            <View style={styles.progressDot} />
            <View style={styles.progressDot} />
          </View>
          <View style={styles.backPlaceholder} />
        </View>

        <View style={styles.body}>
          <View style={styles.lightMark}>
            <Text style={styles.cross}>✝</Text>
          </View>

          <Text style={styles.title}>
            {name ? `Gracias por confiarme el nombre de ${name}.` : 'Gracias por confiar este momento a EMAÚS.'}
          </Text>

          <Text style={styles.message}>Cada duelo tiene su propio camino.</Text>
          <Text style={styles.paragraph}>
            No tienes que resolver hoy todo lo que estás sintiendo.
          </Text>
          <Text style={styles.paragraph}>EMAÚS caminará contigo día a día.</Text>
        </View>

        <PrimaryButton label="Continuar" onPress={() => router.push('/onboarding/emotion')} />
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
  lightMark: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFF7DC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  cross: { color: colors.gold, fontSize: 34 },
  title: {
    maxWidth: 340,
    color: colors.navyDeep,
    fontFamily: 'serif',
    fontSize: typeScale.title,
    lineHeight: 39,
    textAlign: 'center',
    fontWeight: '700',
  },
  message: {
    color: colors.navy,
    fontSize: typeScale.heading,
    fontFamily: 'serif',
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  paragraph: {
    maxWidth: 330,
    color: colors.inkSoft,
    fontSize: typeScale.body,
    lineHeight: 25,
    textAlign: 'center',
  },
});
