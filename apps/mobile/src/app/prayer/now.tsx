import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/emaus/primary-button';
import {
  getActiveJourneySummary,
  type ActiveJourneySummary,
} from '@/data/repositories/journey-repository';
import { logPrayer } from '@/data/repositories/prayer-repository';
import { colors, radius, spacing, typeScale } from '@/design/tokens';

type PrayerMode = 'daily' | 'psalm' | 'simple';

const modeCopy: Record<PrayerMode, { title: string; reference?: string; body: string }> = {
  daily: {
    title: 'Oración para este momento',
    reference: 'En la presencia de Dios',
    body:
      'Señor Jesús, Tú conoces mi corazón y sabes cuánto significa para mí {{name}}. Hoy vuelvo a confiar su vida a tu misericordia. Acompáñame en lo que estoy viviendo, sostén mi fe cuando me cueste comprender y enséñame a caminar este día sin perder la esperanza. Amén.',
  },
  psalm: {
    title: 'Con el Salmo 23',
    reference: 'El Señor camina conmigo aun en el valle oscuro',
    body:
      'Señor, sé mi Pastor en este camino. Cuando la ausencia me haga sentir que todo se oscurece, recuérdame que no camino solo. Condúceme hacia la paz, sostén mi corazón y recibe a {{name}} en tu infinita misericordia. Amén.',
  },
  simple: {
    title: 'Cuando no sé qué decir',
    body:
      'Señor, aquí estoy. Tú sabes lo que llevo dentro. Recibe mi oración por {{name}}, quédate conmigo y no me dejes caminar solo. Amén.',
  },
};

function normalizeMode(mode: string | string[] | undefined): PrayerMode {
  const value = Array.isArray(mode) ? mode[0] : mode;
  if (value === 'psalm' || value === 'simple') return value;
  return 'daily';
}

export default function PrayNowScreen() {
  const db = useSQLiteContext();
  const params = useLocalSearchParams<{ mode?: string }>();
  const mode = normalizeMode(params.mode);
  const [journey, setJourney] = useState<ActiveJourneySummary | null>(null);
  const [saving, setSaving] = useState(false);
  const [offered, setOffered] = useState(false);

  useEffect(() => {
    getActiveJourneySummary(db).then(setJourney);
  }, [db]);

  const name = journey?.name || 'tu ser querido';
  const content = modeCopy[mode];
  const prayer = content.body.replaceAll('{{name}}', name);

  async function finishPrayer() {
    if (saving) return;

    setSaving(true);
    try {
      await logPrayer(db, journey?.lovedOneId ?? null, mode);
      setOffered(true);
    } finally {
      setSaving(false);
    }
  }

  if (offered) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.completed}>
          <View style={styles.completedMark}>
            <Text style={styles.completedCross}>✝</Text>
          </View>
          <Text style={styles.completedTitle}>Tu oración queda confiada a Dios.</Text>
          <Text style={styles.completedText}>
            No necesitas hacer nada más. Continúa tu día con paz.
          </Text>
          <View style={styles.completedAction}>
            <PrimaryButton label="Volver" onPress={() => router.back()} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <Text style={styles.topTitle}>ORAR</Text>
          <View style={styles.backPlaceholder} />
        </View>

        <View style={styles.hero}>
          <Text style={styles.title}>{content.title}</Text>
          {content.reference && <Text style={styles.reference}>{content.reference}</Text>}
        </View>

        <View style={styles.silence}>
          <Text style={styles.silenceText}>Quédate unos segundos en silencio.</Text>
        </View>

        <View style={styles.prayerCard}>
          <Text style={styles.prayer}>{prayer}</Text>
        </View>

        <Text style={styles.note}>
          Esta oración no pretende afirmar el destino eterno de una persona concreta; la confiamos a la misericordia de Dios.
        </Text>

        <PrimaryButton
          disabled={saving}
          label="He terminado mi oración"
          onPress={finishPrayer}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.cream },
  content: { flexGrow: 1, paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: spacing.lg },
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
  hero: { alignItems: 'center', gap: spacing.sm, paddingTop: spacing.lg },
  title: {
    color: colors.navyDeep,
    fontFamily: 'serif',
    fontSize: typeScale.title,
    lineHeight: 39,
    textAlign: 'center',
    fontWeight: '700',
  },
  reference: {
    maxWidth: 320,
    color: colors.inkSoft,
    fontSize: typeScale.bodySmall,
    lineHeight: 21,
    textAlign: 'center',
  },
  silence: {
    minHeight: 72,
    borderRadius: radius.lg,
    backgroundColor: '#FFF8E9',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  silenceText: { color: colors.navy, fontSize: typeScale.bodySmall, fontStyle: 'italic' },
  prayerCard: {
    flex: 1,
    minHeight: 260,
    borderRadius: radius.lg,
    backgroundColor: colors.creamElevated,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  prayer: {
    color: colors.ink,
    fontFamily: 'serif',
    fontSize: typeScale.body,
    lineHeight: 29,
    textAlign: 'center',
  },
  note: { color: colors.inkSoft, fontSize: typeScale.caption, lineHeight: 19, textAlign: 'center' },
  completed: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  completedMark: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFF8E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  completedCross: { color: colors.gold, fontSize: 34 },
  completedTitle: {
    maxWidth: 330,
    color: colors.navyDeep,
    fontFamily: 'serif',
    fontSize: typeScale.title,
    lineHeight: 39,
    textAlign: 'center',
    fontWeight: '700',
  },
  completedText: {
    maxWidth: 320,
    color: colors.inkSoft,
    fontSize: typeScale.body,
    lineHeight: 25,
    textAlign: 'center',
  },
  completedAction: { width: '100%', marginTop: spacing.lg },
});
