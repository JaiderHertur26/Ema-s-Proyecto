import { useCallback, useMemo, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  getActiveJourneySummary,
  type ActiveJourneySummary,
} from '@/data/repositories/journey-repository';
import {
  listJourneyStageVisits,
  type JourneyStageVisit,
} from '@/data/repositories/journey-stage-repository';
import { colors, radius, spacing, typeScale } from '@/design/tokens';
import { calculateDaySinceLoss } from '@/domain/accompaniment-engine';
import {
  getCurrentJourneyStage,
  getStageStatus,
  journeyStages,
} from '@/domain/journey-path';

function formatCurrentMoment(journey: ActiveJourneySummary) {
  const day = calculateDaySinceLoss(journey.deathDate, journey.deathDatePrecision);

  if (day === null) {
    return 'No necesitamos una fecha exacta para caminar contigo.';
  }

  if (day === 0) return 'Hoy ocurrió su partida.';
  if (day === 1) return 'Ha pasado 1 día desde su partida.';
  if (day < 30) return `Han pasado ${day} días desde su partida.`;

  if (day < 365) {
    const months = Math.max(1, Math.floor(day / 30));
    return `Han pasado aproximadamente ${months} ${months === 1 ? 'mes' : 'meses'} desde su partida.`;
  }

  const years = Math.floor(day / 365);
  return `Ha pasado aproximadamente ${years} ${years === 1 ? 'año' : 'años'} desde su partida.`;
}

export default function JourneyScreen() {
  const db = useSQLiteContext();
  const [journey, setJourney] = useState<ActiveJourneySummary | null>(null);
  const [visits, setVisits] = useState<JourneyStageVisit[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function load() {
        const currentJourney = await getActiveJourneySummary(db);
        if (!active) return;

        setJourney(currentJourney);

        if (!currentJourney) {
          setVisits([]);
          return;
        }

        const result = await listJourneyStageVisits(db, currentJourney.journeyId);
        if (!active) return;
        setVisits(result);
      }

      load();

      return () => {
        active = false;
      };
    }, [db])
  );

  const currentStageId = useMemo(() => {
    if (!journey) return null;

    return getCurrentJourneyStage({
      deathDate: journey.deathDate,
      precision: journey.deathDatePrecision,
    });
  }, [journey]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>MI CAMINO</Text>
          <Text style={styles.title}>Tu camino con {journey?.name || 'tu ser querido'}</Text>
          <Text style={styles.subtitle}>
            No es una barra de progreso. Cada momento tiene su propio sentido y puedes volver a cualquier recorrido cuando lo necesites.
          </Text>
        </View>

        {journey && (
          <View style={styles.currentMoment}>
            <Text style={styles.currentMomentEyebrow}>TU MOMENTO ACTUAL</Text>
            <Text style={styles.currentMomentText}>{formatCurrentMoment(journey)}</Text>
            {!currentStageId && (
              <Text style={styles.currentMomentNote}>
                Como la fecha exacta no está disponible, EMAÚS no inventará en qué etapa estás. Todos los recorridos siguen abiertos para ti.
              </Text>
            )}
          </View>
        )}

        <View style={styles.path}>
          {journeyStages.map((stage, index) => {
            const status = getStageStatus(stage.id, currentStageId);
            const isCurrent = status === 'current';
            const hasVisited = visits.some((visit) => visit.stageId === stage.id);

            return (
              <View key={stage.id} style={styles.milestone}>
                <View style={styles.markerColumn}>
                  <View style={[styles.marker, isCurrent && styles.markerActive]}>
                    {isCurrent && <View style={styles.markerInner} />}
                  </View>
                  {index < journeyStages.length - 1 && (
                    <View style={[styles.line, isCurrent && styles.lineActive]} />
                  )}
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={stage.title}
                  onPress={() =>
                    router.push({
                      pathname: '/journey/stage',
                      params: { stage: stage.id },
                    })
                  }
                  style={({ pressed }) => [
                    styles.milestoneCard,
                    isCurrent && styles.milestoneCardActive,
                    pressed && styles.pressed,
                  ]}>
                  <View style={styles.milestoneHeader}>
                    <View style={styles.milestoneCopy}>
                      <Text style={styles.milestoneTitle}>{stage.title}</Text>
                      <Text style={styles.milestoneSubtitle}>{stage.subtitle}</Text>
                    </View>
                    <Text style={styles.chevron}>›</Text>
                  </View>

                  {isCurrent && (
                    <Text style={styles.currentTag}>ESTÁS AQUÍ ACTUALMENTE</Text>
                  )}

                  {hasVisited && !isCurrent && (
                    <Text style={styles.visitedTag}>YA RECORRISTE ESTE CONTENIDO · PUEDES VOLVER</Text>
                  )}

                  {!stage.timeBased && !hasVisited && (
                    <Text style={styles.availableTag}>DISPONIBLE CUANDO LO NECESITES</Text>
                  )}
                </Pressable>
              </View>
            );
          })}
        </View>

        <View style={styles.principleCard}>
          <Text style={styles.principleTitle}>No existe un porcentaje de duelo.</Text>
          <Text style={styles.principleText}>
            EMAÚS utiliza el tiempo solamente para orientarte. No mide cuánto has “avanzado” ni espera que una etapa esté terminada antes de entrar en otra.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.cream },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  hero: { paddingTop: spacing.lg, paddingBottom: spacing.lg, gap: spacing.sm },
  eyebrow: { color: colors.gold, fontSize: typeScale.caption, fontWeight: '800', letterSpacing: 2 },
  title: {
    color: colors.navyDeep,
    fontFamily: 'serif',
    fontSize: typeScale.title,
    lineHeight: 39,
    fontWeight: '700',
  },
  subtitle: { color: colors.inkSoft, fontSize: typeScale.bodySmall, lineHeight: 22 },
  currentMoment: {
    borderRadius: radius.lg,
    backgroundColor: '#FFF8E9',
    borderWidth: 1,
    borderColor: colors.goldSoft,
    padding: spacing.md,
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  currentMomentEyebrow: {
    color: colors.gold,
    fontSize: typeScale.caption,
    fontWeight: '800',
    letterSpacing: 1,
  },
  currentMomentText: {
    color: colors.navyDeep,
    fontFamily: 'serif',
    fontSize: typeScale.body,
    lineHeight: 26,
    fontWeight: '700',
  },
  currentMomentNote: {
    color: colors.inkSoft,
    fontSize: typeScale.caption,
    lineHeight: 19,
    marginTop: spacing.xs,
  },
  path: { gap: 0 },
  milestone: { flexDirection: 'row', minHeight: 102 },
  markerColumn: { width: 32, alignItems: 'center' },
  marker: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.goldSoft,
    backgroundColor: colors.cream,
    marginTop: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerActive: { borderColor: colors.gold, backgroundColor: '#FFF3D4' },
  markerInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.gold },
  line: { width: 2, flex: 1, backgroundColor: colors.goldSoft },
  lineActive: { backgroundColor: colors.gold },
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
    gap: spacing.sm,
  },
  milestoneCardActive: { borderColor: colors.gold, backgroundColor: '#FFF8E9' },
  pressed: { opacity: 0.84, transform: [{ scale: 0.995 }] },
  milestoneHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  milestoneCopy: { flex: 1 },
  milestoneTitle: { color: colors.navyDeep, fontSize: typeScale.bodySmall, fontWeight: '700' },
  milestoneSubtitle: { color: colors.inkSoft, fontSize: typeScale.caption, marginTop: 4 },
  chevron: { color: colors.navy, fontSize: 24 },
  currentTag: { color: colors.navy, fontSize: 10, fontWeight: '800', letterSpacing: 0.7 },
  visitedTag: { color: colors.hope, fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  availableTag: { color: colors.inkSoft, fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  principleCard: {
    marginTop: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: '#F3F6F0',
    borderWidth: 1,
    borderColor: '#CBD8C6',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  principleTitle: {
    color: colors.navyDeep,
    fontFamily: 'serif',
    fontSize: typeScale.heading,
    fontWeight: '700',
    textAlign: 'center',
  },
  principleText: {
    color: colors.inkSoft,
    fontSize: typeScale.bodySmall,
    lineHeight: 22,
    textAlign: 'center',
  },
});
