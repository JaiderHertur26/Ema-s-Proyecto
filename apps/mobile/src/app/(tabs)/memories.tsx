import { useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  getActiveJourneySummary,
  type ActiveJourneySummary,
} from '@/data/repositories/journey-repository';
import { colors, radius, spacing, typeScale } from '@/design/tokens';

const sections = [
  ['▣', 'Su historia', 'Su vida, sus huellas'],
  ['▧', 'Fotografías', 'Momentos para conservar'],
  ['♥', 'Lo que me enseñó', 'Su legado en mi vida'],
  ['★', 'Momentos que no quiero olvidar', 'Recuerdos especiales'],
  ['✎', 'Hoy quiero escribirle', 'Una carta desde mi corazón'],
  ['◉', 'Audios', 'Su voz, tus historias'],
  ['□', 'Fechas importantes', 'Cumpleaños y aniversarios'],
] as const;

export default function MemoriesScreen() {
  const db = useSQLiteContext();
  const [journey, setJourney] = useState<ActiveJourneySummary | null>(null);

  useEffect(() => {
    getActiveJourneySummary(db).then(setJourney);
  }, [db]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{journey?.name?.charAt(0).toUpperCase() || '♥'}</Text>
          </View>
          <Text style={styles.title}>{journey?.name || 'Tu ser querido'}</Text>
          <Text style={styles.subtitle}>Siempre parte de nuestra historia.</Text>
        </View>

        <View style={styles.list}>
          {sections.map(([icon, title, subtitle]) => (
            <View key={title} style={styles.row}>
              <Text style={styles.icon}>{icon}</Text>
              <View style={styles.copy}>
                <Text style={styles.rowTitle}>{title}</Text>
                <Text style={styles.rowSubtitle}>{subtitle}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.note}>
          En la siguiente fase activaremos escritura, fotografías y recuerdos privados sobre esta base.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.cream },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  hero: { alignItems: 'center', paddingTop: spacing.xl, paddingBottom: spacing.xl, gap: spacing.sm },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#FFF8E9',
    borderWidth: 2,
    borderColor: colors.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: { color: colors.navyDeep, fontFamily: 'serif', fontSize: 34, fontWeight: '700' },
  title: { color: colors.navyDeep, fontFamily: 'serif', fontSize: typeScale.title, fontWeight: '700' },
  subtitle: { color: colors.inkSoft, fontSize: typeScale.bodySmall },
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
  icon: { width: 30, color: colors.gold, fontSize: 22, textAlign: 'center' },
  copy: { flex: 1 },
  rowTitle: { color: colors.ink, fontSize: typeScale.bodySmall, fontWeight: '700' },
  rowSubtitle: { color: colors.inkSoft, fontSize: typeScale.caption, marginTop: 3 },
  note: { color: colors.inkSoft, fontSize: typeScale.caption, lineHeight: 19, textAlign: 'center', marginTop: spacing.lg },
});
