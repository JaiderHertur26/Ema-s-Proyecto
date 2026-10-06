import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  getActiveJourneySummary,
  type ActiveJourneySummary,
} from '@/data/repositories/journey-repository';
import { saveLetter } from '@/data/repositories/letter-repository';
import { colors, radius, spacing, typeScale } from '@/design/tokens';

export default function WriteLetterScreen() {
  const db = useSQLiteContext();
  const [journey, setJourney] = useState<ActiveJourneySummary | null>(null);
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getActiveJourneySummary(db).then(setJourney);
  }, [db]);

  async function persistLetter(goToPrayer: boolean) {
    if (!journey || saving || !body.trim()) return;

    setSaving(true);
    try {
      const id = await saveLetter(db, journey.lovedOneId, body.trim());
      if (goToPrayer) {
        router.replace({ pathname: '/memories/prayer-from-letter', params: { id } });
      } else {
        router.replace({ pathname: '/memories/letter', params: { id } });
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.topRow}>
            <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backText}>‹</Text>
            </Pressable>
            <Text style={styles.topTitle}>RECUERDOS</Text>
            <View style={styles.backPlaceholder} />
          </View>

          <View style={styles.hero}>
            <Text style={styles.title}>Hoy quiero escribirle</Text>
            <Text style={styles.subtitle}>
              Puedes escribir aquello que hoy llevas en el corazón.
            </Text>
          </View>

          <TextInput
            accessibilityLabel="Carta"
            multiline
            onChangeText={setBody}
            placeholder={
              journey?.name
                ? `Hay algo que quisiera decirte, ${journey.name}…`
                : 'Hay algo que quisiera decirte…'
            }
            placeholderTextColor={colors.inkSoft}
            style={styles.editor}
            textAlignVertical="top"
            value={body}
          />

          <Text style={styles.privacy}>
            Esta carta es privada. EMAÚS no simulará una respuesta de la persona que ha fallecido.
          </Text>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              disabled={saving || !body.trim()}
              onPress={() => persistLetter(false)}
              style={({ pressed }) => [
                styles.primary,
                pressed && styles.pressed,
                (!body.trim() || saving) && styles.disabled,
              ]}>
              <Text style={styles.primaryText}>Guardar carta</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              disabled={saving || !body.trim()}
              onPress={() => persistLetter(true)}
              style={({ pressed }) => [
                styles.secondary,
                pressed && styles.pressed,
                (!body.trim() || saving) && styles.disabled,
              ]}>
              <Text style={styles.secondaryText}>Llevarlo a mi oración</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: colors.cream },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
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
  title: {
    color: colors.navyDeep,
    fontFamily: 'serif',
    fontSize: typeScale.title,
    lineHeight: 39,
    fontWeight: '700',
  },
  subtitle: { color: colors.inkSoft, fontSize: typeScale.body, lineHeight: 25 },
  editor: {
    minHeight: 330,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.creamElevated,
    color: colors.ink,
    fontFamily: 'serif',
    fontSize: typeScale.body,
    lineHeight: 28,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  privacy: {
    color: colors.inkSoft,
    fontSize: typeScale.caption,
    lineHeight: 19,
    textAlign: 'center',
  },
  actions: { gap: spacing.sm, marginTop: spacing.sm },
  primary: {
    minHeight: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  primaryText: { color: colors.white, fontSize: typeScale.body, fontWeight: '800' },
  secondary: {
    minHeight: 54,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  secondaryText: { color: colors.navy, fontSize: typeScale.bodySmall, fontWeight: '700' },
  pressed: { opacity: 0.84, transform: [{ scale: 0.995 }] },
  disabled: { opacity: 0.45 },
});
