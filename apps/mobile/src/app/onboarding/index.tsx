import { useState } from 'react';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { setOnboardingRelationship } from '@/data/repositories/onboarding-repository';
import { colors, radius, shadows, spacing, typeScale } from '@/design/tokens';
import { relationshipOptions } from '@/domain/relationship-options';
import type { Relationship } from '@/domain/types';

export default function RelationshipScreen() {
  const db = useSQLiteContext();
  const [saving, setSaving] = useState<Relationship | null>(null);

  async function handleSelect(relationship: Relationship) {
    if (saving) return;

    setSaving(relationship);
    try {
      await setOnboardingRelationship(db, relationship);
      router.push('/onboarding/name');
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
            <View style={[styles.progressDot, styles.progressDotActive]} />
            {Array.from({ length: 6 }).map((_, index) => (
              <View key={index} style={styles.progressDot} />
            ))}
          </View>
          <View style={styles.backButtonPlaceholder} />
        </View>

        <View style={styles.headingBlock}>
          <Text style={styles.title}>¿A quién estás extrañando?</Text>
          <Text style={styles.subtitle}>Selecciona la opción que mejor describa tu relación.</Text>
        </View>

        <View style={styles.options}>
          {relationshipOptions.map((option) => (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              disabled={saving !== null}
              onPress={() => handleSelect(option.value)}
              style={({ pressed }) => [
                styles.option,
                pressed && styles.optionPressed,
                saving === option.value && styles.optionSaving,
              ]}>
              <Text style={styles.icon}>{option.icon}</Text>
              <Text style={styles.optionLabel}>{option.label}</Text>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.privacy}>No tienes que responder nada que no quieras compartir.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  topRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonPlaceholder: {
    width: 40,
    height: 40,
  },
  backText: {
    color: colors.navy,
    fontSize: 38,
    lineHeight: 40,
  },
  progress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.line,
  },
  progressDotActive: {
    width: 18,
    backgroundColor: colors.navy,
  },
  headingBlock: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
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
    maxWidth: 310,
    color: colors.inkSoft,
    fontSize: typeScale.bodySmall,
    lineHeight: 22,
    textAlign: 'center',
  },
  options: {
    gap: 10,
  },
  option: {
    minHeight: 58,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.creamElevated,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.soft,
  },
  optionPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.995 }],
  },
  optionSaving: {
    borderColor: colors.gold,
    backgroundColor: '#FFF8E9',
  },
  icon: {
    width: 36,
    color: colors.gold,
    fontSize: 21,
    textAlign: 'center',
  },
  optionLabel: {
    flex: 1,
    marginLeft: spacing.sm,
    color: colors.ink,
    fontSize: typeScale.body,
    fontWeight: '600',
  },
  chevron: {
    color: colors.navy,
    fontSize: 26,
  },
  privacy: {
    color: colors.inkSoft,
    fontSize: typeScale.caption,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
