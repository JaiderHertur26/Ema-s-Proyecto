import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
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

import { PrimaryButton } from '@/components/emaus/primary-button';
import { getLetter, updateLetterPrayer } from '@/data/repositories/letter-repository';
import { logPrayer } from '@/data/repositories/prayer-repository';
import { colors, radius, spacing, typeScale } from '@/design/tokens';

const DEFAULT_PRAYER =
  'Señor Jesús, Tú conoces todo lo que acabo de escribir y sabes lo que llevo en el corazón. Recibe mis palabras, mis recuerdos y también aquello que todavía me cuesta comprender. Confío a quien amo a tu misericordia y te pido que me acompañes mientras sigo caminando. Amén.';

export default function PrayerFromLetterScreen() {
  const db = useSQLiteContext();
  const params = useLocalSearchParams<{ id?: string }>();
  const [letterBody, setLetterBody] = useState('');
  const [lovedOneId, setLovedOneId] = useState<string | null>(null);
  const [prayer, setPrayer] = useState(DEFAULT_PRAYER);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!params.id) return;

    getLetter(db, params.id).then((letter) => {
      if (!letter) return;
      setLetterBody(letter.body);
      setLovedOneId(letter.lovedOneId);
      if (letter.prayerBody) setPrayer(letter.prayerBody);
    });
  }, [db, params.id]);

  async function savePrayer() {
    if (!params.id || !prayer.trim() || saving) return;

    setSaving(true);
    try {
      await updateLetterPrayer(db, params.id, prayer.trim());
      await logPrayer(db, lovedOneId, 'letter_prayer');
      router.replace({ pathname: '/memories/letter', params: { id: params.id } });
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
            <Text style={styles.topTitle}>LLEVARLO A MI ORACIÓN</Text>
            <View style={styles.backPlaceholder} />
          </View>

          <Text style={styles.title}>Ponemos tus palabras delante de Dios</Text>
          <Text style={styles.subtitle}>
            EMAÚS no responde en nombre de quien murió. Esta oración está dirigida a Dios y puedes cambiarla libremente.
          </Text>

          <View style={styles.letterPreview}>
            <Text style={styles.previewEyebrow}>LO QUE ESCRIBISTE</Text>
            <Text numberOfLines={6} style={styles.previewText}>
              {letterBody || 'Cargando…'}
            </Text>
          </View>

          <Text style={styles.label}>Tu oración</Text>
          <TextInput
            multiline
            onChangeText={setPrayer}
            style={styles.editor}
            textAlignVertical="top"
            value={prayer}
          />

          <PrimaryButton
            disabled={saving || !prayer.trim()}
            label="Guardar esta oración"
            onPress={savePrayer}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
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
  topTitle: { color: colors.gold, fontSize: 11, fontWeight: '800', letterSpacing: 1.3 },
  title: {
    color: colors.navyDeep,
    fontFamily: 'serif',
    fontSize: typeScale.title,
    lineHeight: 39,
    fontWeight: '700',
    marginTop: spacing.md,
  },
  subtitle: { color: colors.inkSoft, fontSize: typeScale.bodySmall, lineHeight: 22 },
  letterPreview: {
    borderRadius: radius.md,
    backgroundColor: '#FFF8E9',
    borderWidth: 1,
    borderColor: colors.goldSoft,
    padding: spacing.md,
    gap: spacing.sm,
  },
  previewEyebrow: { color: colors.gold, fontSize: typeScale.caption, fontWeight: '800' },
  previewText: { color: colors.ink, fontFamily: 'serif', fontSize: typeScale.bodySmall, lineHeight: 23 },
  label: { color: colors.navyDeep, fontSize: typeScale.body, fontWeight: '700', marginTop: spacing.sm },
  editor: {
    minHeight: 260,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.creamElevated,
    color: colors.ink,
    fontFamily: 'serif',
    fontSize: typeScale.body,
    lineHeight: 28,
    padding: spacing.lg,
  },
});
