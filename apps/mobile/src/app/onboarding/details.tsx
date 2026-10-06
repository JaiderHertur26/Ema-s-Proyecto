import { useState } from 'react';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/emaus/primary-button';
import { setOnboardingDetails } from '@/data/repositories/onboarding-repository';
import { colors, radius, spacing, typeScale } from '@/design/tokens';
import type { LossCircumstance } from '@/domain/types';

const circumstances: { value: LossCircumstance; label: string }[] = [
  { value: 'illness', label: 'Después de una enfermedad' },
  { value: 'sudden', label: 'De manera repentina' },
  { value: 'accident', label: 'Accidente' },
  { value: 'pregnancy_or_birth', label: 'Durante el embarazo o al nacer' },
  { value: 'other', label: 'Otra circunstancia' },
  { value: 'prefer_not_to_say', label: 'Prefiero no responder' },
];

export default function DetailsScreen() {
  const db = useSQLiteContext();
  const [age, setAge] = useState('');
  const [circumstance, setCircumstance] = useState<LossCircumstance | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleContinue() {
    if (saving) return;

    const parsedAge = age.trim() ? Number(age) : null;
    const validAge =
      parsedAge !== null && Number.isFinite(parsedAge) && parsedAge >= 0 && parsedAge <= 130
        ? Math.round(parsedAge)
        : null;

    setSaving(true);
    try {
      await setOnboardingDetails(db, validAge, circumstance);
      router.push('/onboarding/thanks');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <View style={styles.progress}>
            {Array.from({ length: 3 }).map((_, index) => (
              <View key={index} style={styles.progressDot} />
            ))}
            <View style={[styles.progressDot, styles.progressDotActive]} />
            {Array.from({ length: 3 }).map((_, index) => (
              <View key={index} style={styles.progressDot} />
            ))}
          </View>
          <View style={styles.backPlaceholder} />
        </View>

        <View style={styles.headingBlock}>
          <Text style={styles.title}>Cuéntanos un poquito más</Text>
          <Text style={styles.subtitle}>
            Todo en esta pantalla es opcional. Responde solo lo que quieras compartir.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Edad aproximada</Text>
        <TextInput
          keyboardType="number-pad"
          maxLength={3}
          onChangeText={setAge}
          placeholder="Ej. 72"
          placeholderTextColor={colors.inkSoft}
          style={styles.input}
          value={age}
        />

        <Text style={[styles.sectionLabel, styles.sectionSpacing]}>
          ¿Cómo ocurrió su partida?
        </Text>
        <View style={styles.options}>
          {circumstances.map((option) => {
            const selected = circumstance === option.value;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setCircumstance(option.value)}
                style={[styles.option, selected && styles.optionSelected]}>
                <View style={[styles.radio, selected && styles.radioSelected]}>
                  {selected && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.optionLabel}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.actions}>
          <PrimaryButton disabled={saving} label="Continuar" onPress={handleContinue} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.cream },
  content: { flexGrow: 1, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
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
    color: colors.navyDeep,
    fontFamily: 'serif',
    fontSize: typeScale.title,
    lineHeight: 38,
    textAlign: 'center',
    fontWeight: '700',
  },
  subtitle: {
    color: colors.inkSoft,
    fontSize: typeScale.bodySmall,
    lineHeight: 22,
    textAlign: 'center',
  },
  sectionLabel: {
    color: colors.ink,
    fontSize: typeScale.body,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  sectionSpacing: { marginTop: spacing.xl },
  input: {
    minHeight: 58,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.creamElevated,
    color: colors.ink,
    fontSize: typeScale.body,
    paddingHorizontal: spacing.md,
  },
  options: { gap: spacing.sm },
  option: {
    minHeight: 54,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.creamElevated,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  optionSelected: { borderColor: colors.gold, backgroundColor: '#FFF8E9' },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.inkSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: colors.gold },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.gold },
  optionLabel: { flex: 1, color: colors.ink, fontSize: typeScale.bodySmall, lineHeight: 21 },
  actions: { marginTop: spacing.xl },
});
