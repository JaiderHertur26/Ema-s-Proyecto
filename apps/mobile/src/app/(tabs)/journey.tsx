import { useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  getActiveJourneySummary,
  type ActiveJourneySummary,
} from '@/data/repositories/journey-repository';
import { colors, radius, spacing, typeScale } from '@/design/tokens';

const milestones = [
  ['Primeros días', 'Acoger lo ocurrido'],
  ['Exequias', 'Despedir con fe'],
  ['Nueve días', 'Orar y recordar'],
  ['Primer mes', 'Seguir caminando'],
  ['Meses siguientes', 'Aprender a vivir con la ausencia'],
  ['Fechas importantes', 'Acompañamiento especial'],
  ['Primer aniversario', 'Recordar con esperanza'],
  ['Después del primer año', 'La vida continúa, el amor permanece'],
] as const;

export default function JourneyScreen() {
  const db = useSQLiteContext();
  const [journey, setJourney] = useState<ActiveJourneySummary | null>(null);

  useEffect(() => {
    getActiveJourneySummary(db).then(setJourney);
  }, [db]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>MI CAMINO</Text>
          <Text style={styles.title}>Tu camino con {journey?.name || 'tu ser querido'}</Text>
          <Text style={styles.subtitle}>
            No es una barra de progreso. Cada momento tiene su propio sentido y puedes volver cuando lo necesites.
          </Text>
        </View>

        <View style={styles.path}>
          {milestones.map(([title, subtitle], index) => (
            <View key={title} style={styles.milestone}>
              <View style={styles.markerColumn}>
                <View style={[styles.marker, index === 0 && styles.markerActive]} />
                {index < milestones.length - 1 && <View style={styles.line} />}
              </View>
              <View style={[styles.milestoneCard, index === 0 && styles.milestoneCardActive]}>
                <Text style={styles.milestoneTitle}>{title}</Text>
                <Text style={styles.milestoneSubtitle}>{subtitle}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.note}>
          La posición actual se calculará con el motor temporal cuando la fecha de partida sea conocida.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.cream },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  hero: { paddingTop: spacing.lg, paddingBottom: spacing.xl, gap: spacing.sm },
  eyebrow: { color: colors.gold, fontSize: typeScale.caption, fontWeight: '800', letterSpacing: 2 },
  title: {
    color: colors.navyDeep,
    fontFamily: 'serif',
    fontSize: typeScale.title,
    lineHeight: 39,
    fontWeight: '700',
  },
  subtitle: { color: colors.inkSoft, fontSize: typeScale.bodySmall, lineHeight: 22 },
  path: { gap: 0 },
  milestone: { flexDirection: 'row', minHeight: 86 },
  markerColumn: { width: 32, alignItems: 'center' },
  marker: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.goldSoft,
    backgroundColor: colors.cream,
    marginTop: 22,
  },
  markerActive: { borderColor: colors.gold, backgroundColor: colors.gold },
  line: { width: 2, flex: 1, backgroundColor: colors.goldSoft },
  milestoneCard: {
    flex: 1,
    marginLeft: spacing.sm,
    marginBottom: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.creamElevated,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  milestoneCardActive: { borderColor: colors.goldSoft, backgroundColor: '#FFF8E9' },
  milestoneTitle: { color: colors.navyDeep, fontSize: typeScale.bodySmall, fontWeight: '700' },
  milestoneSubtitle: { color: colors.inkSoft, fontSize: typeScale.caption, marginTop: 4 },
  note: { color: colors.inkSoft, fontSize: typeScale.caption, lineHeight: 19, textAlign: 'center', marginTop: spacing.lg },
});
