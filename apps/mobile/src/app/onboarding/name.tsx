import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/emaus/primary-button';
import {
  getOnboardingDraft,
  setOnboardingName,
} from '@/data/repositories/onboarding-repository';
import { colors, radius, spacing, typeScale } from '@/design/tokens';

export default function NameScreen() {
  const db = useSQLiteContext();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getOnboardingDraft(db).then((draft) => {
      if (draft?.name) setName(draft.name);
    });
  }, [db]);

  async function continueWith(value: string | null) {
    if (saving) return;

    setSaving(true);
    try {
      await setOnboardingName(db, value);
      router.push('/onboarding/date');
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
            <View style={styles.progressDot} />
            <View style={[styles.progressDot, styles.progressDotActive]} />
            {Array.from({ length: 5 }).map((_, index) => (
              <View key={index} style={styles.progressDot} />
            ))}
          </View>
          <View style={styles.backPlaceholder} />
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>¿Cómo se llamaba?</Text>
          <Text style={styles.subtitle}>
            Usaremos su nombre para acompañarte de una manera más cercana.
          </Text>

          <TextInput
            autoCapitalize="words"
            autoCorrect={false}
            maxLength={80}
            onChangeText={setName}
            placeholder="Nombre"
            placeholderTextColor={colors.inkSoft}
            style={styles.input}
            value={name}
          />

          <Text style={styles.helper}>
            Este dato queda guardado de forma privada en tu dispositivo.
          </Text>
        </View>

        <View style={styles.actions}>
          <PrimaryButton
            disabled={saving}
            label="Continuar"
            onPress={() => continueWith(name.trim() || null)}
          />
          <Pressable
            accessibilityRole="button"
            disabled={saving}
            onPress={() => continueWith(null)}
            style={styles.secondaryButton}>
            <Text style={styles.secondaryText}>Prefiero no escribirlo</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
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
  backPlaceholder: {
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
  body: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md,
  },
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
    fontSize: typeScale.body,
    lineHeight: 25,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  input: {
    minHeight: 60,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.creamElevated,
    color: colors.ink,
    fontSize: typeScale.body,
    paddingHorizontal: spacing.md,
  },
  helper: {
    color: colors.inkSoft,
    fontSize: typeScale.caption,
    lineHeight: 19,
    textAlign: 'center',
  },
  actions: {
    gap: spacing.sm,
  },
  secondaryButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    color: colors.navy,
    fontSize: typeScale.bodySmall,
    fontWeight: '600',
  },
});
