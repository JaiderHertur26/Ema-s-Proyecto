import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typeScale } from '@/design/tokens';
import { getDifficultMomentOption, normalizeDifficultMomentType } from '@/domain/difficult-moment';
import type { EmotionIntensity } from '@/domain/types';

const intensities: { value: EmotionIntensity; label: string; subtitle: string }[] = [
  { value: 'mild', label: 'Suave', subtitle: 'Está presente, pero puedo sostenerlo.' },
  { value: 'moderate', label: 'Moderado', subtitle: 'Me está costando bastante.' },
  { value: 'strong', label: 'Muy fuerte', subtitle: 'Siento que me sobrepasa.' },
  { value: 'unknown', label: 'No sé', subtitle: 'No puedo medirlo ahora.' },
];

export default function DifficultMomentIntensityScreen() {
  const params = useLocalSearchParams<{ type?: string }>();
  const type = normalizeDifficultMomentType(params.type);
  const option = getDifficultMomentOption(type);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <Text style={styles.topTitle}>ESTOY AQUÍ CONTIGO</Text>
          <View style={styles.backPlaceholder} />
        </View>

        <View style={styles.hero}>
          <Text style={styles.title}>¿Qué tan fuerte se siente ahora?</Text>
          <Text style={styles.subtitle}>
            {option?.label ?? 'Este momento'}
          </Text>
        </View>

        <View style={styles.list}>
          {intensities.map((item) => (
            <Pressable
              key={item.value}
              accessibilityRole="button"
              onPress={() =>
                router.replace({
                  pathname: '/difficult-moment/support',
                  params: { type, intensity: item.value },
                })
              }
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.note}>
          No es una evaluación clínica. Solo nos ayuda a decidir cuánto apoyo ofrecerte en este momento.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.cream },
  content: { flex: 1, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  topRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backPlaceholder: { width: 40, height: 40 },
  backText: { color: colors.navy, fontSize: 38, lineHeight: 40 },
  topTitle: { color: colors.gold, fontSize: 11, fontWeight: '800', letterSpacing: 1.1 },
  hero: { paddingTop: spacing.xl, paddingBottom: spacing.lg, gap: spacing.sm },
  title: {
    color: colors.navyDeep,
    fontFamily: 'serif',
    fontSize: typeScale.title,
    lineHeight: 39,
    fontWeight: '700',
  },
  subtitle: { color: colors.inkSoft, fontSize: typeScale.body, lineHeight: 25 },
  list: { gap: spacing.sm },
  card: {
    minHeight: 78,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.creamElevated,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    gap: 4,
  },
  pressed: { opacity: 0.84, transform: [{ scale: 0.995 }] },
  label: { color: colors.navyDeep, fontSize: typeScale.body, fontWeight: '700' },
  cardSubtitle: { color: colors.inkSoft, fontSize: typeScale.caption, lineHeight: 19 },
  note: {
    color: colors.inkSoft,
    fontSize: typeScale.caption,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 'auto',
    paddingTop: spacing.lg,
  },
});
