import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  getActiveJourneySummary,
  type ActiveJourneySummary,
} from '@/data/repositories/journey-repository';
import { colors, radius, spacing, typeScale } from '@/design/tokens';

const available = [
  { mode: 'daily', icon: '▤', title: 'Oración del día', subtitle: 'Para el momento que estás viviendo' },
  { mode: 'psalm', icon: '≈', title: 'Un salmo', subtitle: 'Palabras de fe y consuelo' },
  { mode: 'simple', icon: '·', title: 'Cuando no sé qué decir', subtitle: 'Una oración muy breve' },
] as const;

const planned = [
  ['◌', 'Santo Rosario', 'Misterios y ofrecimiento'],
  ['✝', 'Santa Misa', 'Ofrecer y registrar una intención'],
  ['✦', 'Novenario', 'Nueve días de oración'],
  ['☾', 'Por los difuntos', 'Oraciones tradicionales'],
  ['◆', 'Fechas especiales', 'Mes, aniversario y cumpleaños'],
] as const;

export default function PrayScreen() {
  const db = useSQLiteContext();
  const [journey, setJourney] = useState<ActiveJourneySummary | null>(null);

  useEffect(() => {
    getActiveJourneySummary(db).then(setJourney);
  }, [db]);

  const lovedOneName = journey?.name || 'tu ser querido';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>ORAR</Text>
          <Text style={styles.title}>Orar por {lovedOneName}</Text>
          <Text style={styles.subtitle}>
            La oración nos permite confiar a quienes amamos a la misericordia de Dios.
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push({ pathname: '/prayer/now', params: { mode: 'daily' } })}
          style={({ pressed }) => [styles.primary, pressed && styles.pressed]}>
          <Text style={styles.primaryIcon}>🙏</Text>
          <View style={styles.primaryCopy}>
            <Text style={styles.primaryTitle}>Quiero rezar ahora</Text>
            <Text style={styles.primarySubtitle}>Un momento sencillo ante Dios</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>

        <Text style={styles.sectionLabel}>DISPONIBLE AHORA</Text>
        <View style={styles.list}>
          {available.map((item) => (
            <Pressable
              key={item.mode}
              accessibilityRole="button"
              onPress={() => router.push({ pathname: '/prayer/now', params: { mode: item.mode } })}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
              <Text style={styles.rowIcon}>{item.icon}</Text>
              <View style={styles.rowCopy}>
                <Text style={styles.rowTitle}>{item.title}</Text>
                <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
              </View>
              <Text style={styles.rowChevron}>›</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionLabel}>SIGUIENTES RECORRIDOS DE ORACIÓN</Text>
        <View style={styles.list}>
          {planned.map(([icon, title, subtitle]) => (
            <View key={title} style={[styles.row, styles.rowPlanned]}>
              <Text style={[styles.rowIcon, styles.plannedIcon]}>{icon}</Text>
              <View style={styles.rowCopy}>
                <Text style={styles.rowTitle}>{title}</Text>
                <Text style={styles.rowSubtitle}>{subtitle}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.note}>
          EMAÚS no convierte la oración en puntos, rachas ni recompensas. Orar no es una competencia.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.cream },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  hero: { paddingTop: spacing.lg, paddingBottom: spacing.md, gap: spacing.sm },
  eyebrow: { color: colors.gold, fontSize: typeScale.caption, fontWeight: '800', letterSpacing: 2 },
  title: {
    color: colors.navyDeep,
    fontFamily: 'serif',
    fontSize: typeScale.title,
    lineHeight: 38,
    fontWeight: '700',
  },
  subtitle: { color: colors.inkSoft, fontSize: typeScale.body, lineHeight: 25 },
  primary: {
    minHeight: 84,
    borderRadius: radius.lg,
    backgroundColor: colors.navy,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  primaryIcon: { fontSize: 30 },
  primaryCopy: { flex: 1 },
  primaryTitle: { color: colors.white, fontSize: typeScale.body, fontWeight: '800' },
  primarySubtitle: { color: '#DCE8F1', fontSize: typeScale.caption, marginTop: 3 },
  chevron: { color: colors.white, fontSize: 28 },
  pressed: { opacity: 0.84, transform: [{ scale: 0.995 }] },
  sectionLabel: {
    color: colors.navy,
    fontSize: typeScale.caption,
    fontWeight: '800',
    letterSpacing: 1.1,
    marginTop: spacing.md,
  },
  list: { gap: spacing.sm },
  row: {
    minHeight: 68,
    borderRadius: radius.md,
    backgroundColor: colors.creamElevated,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rowPlanned: { opacity: 0.72 },
  rowIcon: { width: 30, color: colors.navy, fontSize: 22, textAlign: 'center' },
  plannedIcon: { color: colors.gold },
  rowCopy: { flex: 1 },
  rowTitle: { color: colors.ink, fontSize: typeScale.bodySmall, fontWeight: '700' },
  rowSubtitle: { color: colors.inkSoft, fontSize: typeScale.caption, marginTop: 3 },
  rowChevron: { color: colors.navy, fontSize: 24 },
  note: { color: colors.inkSoft, fontSize: typeScale.caption, lineHeight: 19, textAlign: 'center', marginTop: spacing.md },
});
