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

type MemorySection = {
  icon: string;
  title: string;
  subtitle: string;
  onPress?: () => void;
  planned?: boolean;
};

export default function MemoriesScreen() {
  const db = useSQLiteContext();
  const [journey, setJourney] = useState<ActiveJourneySummary | null>(null);

  useEffect(() => {
    getActiveJourneySummary(db).then(setJourney);
  }, [db]);

  const sections: MemorySection[] = [
    {
      icon: '▣',
      title: 'Su historia',
      subtitle: 'Su vida, sus huellas',
      onPress: () => router.push({ pathname: '/memories/list', params: { category: 'story' } }),
    },
    {
      icon: '♥',
      title: 'Lo que me enseñó',
      subtitle: 'Su legado en mi vida',
      onPress: () => router.push({ pathname: '/memories/list', params: { category: 'legacy' } }),
    },
    {
      icon: '★',
      title: 'Momentos que no quiero olvidar',
      subtitle: 'Recuerdos especiales',
      onPress: () =>
        router.push({ pathname: '/memories/list', params: { category: 'special_moment' } }),
    },
    {
      icon: '✎',
      title: 'Hoy quiero escribirle',
      subtitle: 'Una carta desde mi corazón',
      onPress: () => router.push('/memories/write'),
    },
    {
      icon: '≡',
      title: 'Mis cartas',
      subtitle: 'Volver a lo que he escrito',
      onPress: () => router.push('/memories/letters'),
    },
    {
      icon: '▧',
      title: 'Fotografías',
      subtitle: 'Momentos para conservar',
      onPress: () => router.push('/memories/photos'),
    },
    {
      icon: '◉',
      title: 'Audios',
      subtitle: 'Tu voz contando sus historias',
      planned: true,
    },
    {
      icon: '□',
      title: 'Fechas importantes',
      subtitle: 'Cumpleaños y aniversarios',
      planned: true,
    },
  ];

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
          {sections.map((section) => {
            const content = (
              <>
                <Text style={[styles.icon, section.planned && styles.plannedIcon]}>{section.icon}</Text>
                <View style={styles.copy}>
                  <View style={styles.titleRow}>
                    <Text style={styles.rowTitle}>{section.title}</Text>
                    {section.planned && <Text style={styles.plannedTag}>PRÓXIMAMENTE</Text>}
                  </View>
                  <Text style={styles.rowSubtitle}>{section.subtitle}</Text>
                </View>
                {!section.planned && <Text style={styles.chevron}>›</Text>}
              </>
            );

            if (!section.onPress) {
              return (
                <View key={section.title} style={[styles.row, styles.rowPlanned]}>
                  {content}
                </View>
              );
            }

            return (
              <Pressable
                key={section.title}
                accessibilityRole="button"
                onPress={section.onPress}
                style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
                {content}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.memoryPrinciple}>
          <Text style={styles.memoryPrincipleTitle}>Recordar sin quedar atrapado.</Text>
          <Text style={styles.memoryPrincipleText}>
            EMAÚS busca ayudarte a conservar lo vivido y a integrar esa memoria dentro de la vida que continúa.
          </Text>
        </View>
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
    minHeight: 70,
    borderRadius: radius.md,
    backgroundColor: colors.creamElevated,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rowPlanned: { opacity: 0.7 },
  pressed: { opacity: 0.84, transform: [{ scale: 0.995 }] },
  icon: { width: 30, color: colors.gold, fontSize: 22, textAlign: 'center' },
  plannedIcon: { color: colors.inkSoft },
  copy: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  rowTitle: { color: colors.ink, fontSize: typeScale.bodySmall, fontWeight: '700' },
  rowSubtitle: { color: colors.inkSoft, fontSize: typeScale.caption, marginTop: 3 },
  plannedTag: {
    color: colors.inkSoft,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  chevron: { color: colors.navy, fontSize: 24 },
  memoryPrinciple: {
    marginTop: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: '#FFF8E9',
    borderWidth: 1,
    borderColor: colors.goldSoft,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  memoryPrincipleTitle: {
    color: colors.navyDeep,
    fontFamily: 'serif',
    fontSize: typeScale.heading,
    fontWeight: '700',
    textAlign: 'center',
  },
  memoryPrincipleText: {
    color: colors.inkSoft,
    fontSize: typeScale.bodySmall,
    lineHeight: 22,
    textAlign: 'center',
  },
});
