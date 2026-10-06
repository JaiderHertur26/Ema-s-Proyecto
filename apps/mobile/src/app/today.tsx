import { useEffect, useMemo, useState } from 'react';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  getActiveJourneySummary,
  type ActiveJourneySummary,
} from '@/data/repositories/journey-repository';
import { colors, radius, spacing, typeScale } from '@/design/tokens';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

function daysSince(dateString: string) {
  const [year, month, day] = dateString.split('-').map(Number);
  const start = Date.UTC(year, month - 1, day);
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(0, Math.floor((today - start) / 86_400_000));
}

function journeySubtitle(journey: ActiveJourneySummary) {
  if (journey.deathDatePrecision !== 'exact' || !journey.deathDate) {
    return 'Caminamos contigo en este momento de duelo.';
  }

  const days = daysSince(journey.deathDate);
  if (days === 0) return 'Su partida fue hoy.';
  if (days === 1) return 'Ha pasado 1 día desde su partida.';
  return `Han pasado ${days} días desde su partida.`;
}

export default function TodayScreen() {
  const db = useSQLiteContext();
  const [journey, setJourney] = useState<ActiveJourneySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getActiveJourneySummary(db)
      .then((result) => {
        if (!active) return;
        if (!result) {
          router.replace('/');
          return;
        }
        setJourney(result);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [db]);

  const greeting = useMemo(() => getGreeting(), []);

  if (loading || !journey) {
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
          <Text style={styles.sectionText}>
            En el siguiente paso conectaremos aquí el motor emocional que ya definimos.
          </Text>
        </View>

        <Text style={styles.kicker}>PARA HOY</Text>

        <View style={styles.card}>
          <Text style={styles.cardEyebrow}>UNA PALABRA</Text>
          <Text style={styles.scripture}>“Yo soy la resurrección y la vida.”</Text>
          <Text style={styles.reference}>Jn 11,25</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardEyebrow}>CAMINEMOS</Text>
          <Text style={styles.cardText}>
            No necesitas resolver hoy todo lo que estás sintiendo. Por ahora, solo caminemos este día.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardEyebrow}>UN PEQUEÑO PASO</Text>
          <Text style={styles.cardText}>
            Regálate unos minutos sin exigirte estar bien. Reconoce simplemente cómo llegaste hasta aquí.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardEyebrow}>OREMOS</Text>
          <Text style={styles.cardText}>
            Señor Jesús, acompáñame en este día y recibe en tu misericordia a quien tanto amo. Amén.
          </Text>
        </View>

        <Pressable accessibilityRole="button" style={styles.difficultButton}>
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
  section: { paddingVertical: spacing.md },
  sectionTitle: {
    color: colors.navyDeep,
    fontFamily: 'serif',
    fontSize: typeScale.heading,
    fontWeight: '700',
  },
  sectionText: { color: colors.inkSoft, fontSize: typeScale.bodySmall, lineHeight: 21, marginTop: 6 },
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
