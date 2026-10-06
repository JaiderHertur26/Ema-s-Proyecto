import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typeScale } from '@/design/tokens';
import { difficultMomentOptions } from '@/domain/difficult-moment';

export default function DifficultMomentScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <Text style={styles.topTitle}>ESTOY AQUÍ CONTIGO</Text>
          <View style={styles.backPlaceholder} />
        </View>

        <View style={styles.hero}>
          <Text style={styles.title}>¿Qué está pasando ahora?</Text>
          <Text style={styles.subtitle}>
            Elige lo que más se acerque a este momento. No necesitas explicarlo perfectamente.
          </Text>
        </View>

        <View style={styles.list}>
          {difficultMomentOptions.map((option) => (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              onPress={() =>
                router.push({
                  pathname: option.requiresIntensity
                    ? '/difficult-moment/intensity'
                    : '/difficult-moment/support',
                  params: { type: option.value },
                })
              }
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
              <Text style={styles.icon}>{option.icon}</Text>
              <Text style={styles.label}>{option.label}</Text>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/difficult-moment/safety')}
          style={({ pressed }) => [styles.safety, pressed && styles.pressed]}>
          <Text style={styles.safetyTitle}>No me siento seguro conmigo mismo</Text>
          <Text style={styles.safetyText}>
            Si temes hacerte daño o sientes que no puedes mantenerte seguro, entra aquí.
          </Text>
        </Pressable>

        <Text style={styles.note}>
          EMAÚS puede acompañarte, pero no reemplaza a una persona de confianza, un profesional ni un servicio de emergencia.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  topTitle: { color: colors.gold, fontSize: 11, fontWeight: '800', letterSpacing: 1.1 },
  hero: { paddingTop: spacing.lg, paddingBottom: spacing.sm, gap: spacing.sm },
  title: {
    color: colors.navyDeep,
    fontFamily: 'serif',
    fontSize: typeScale.title,
    lineHeight: 39,
    fontWeight: '700',
  },
  subtitle: { color: colors.inkSoft, fontSize: typeScale.body, lineHeight: 25 },
  list: { gap: spacing.sm },
  row: {
    minHeight: 64,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.creamElevated,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  pressed: { opacity: 0.84, transform: [{ scale: 0.995 }] },
  icon: { width: 30, color: colors.gold, fontSize: 22, textAlign: 'center' },
  label: { flex: 1, color: colors.ink, fontSize: typeScale.bodySmall, lineHeight: 21, fontWeight: '600' },
  chevron: { color: colors.navy, fontSize: 24 },
  safety: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#D7A1A1',
    backgroundColor: '#FFF2F2',
    padding: spacing.md,
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  safetyTitle: { color: colors.danger, fontSize: typeScale.bodySmall, fontWeight: '800' },
  safetyText: { color: '#7D4E4E', fontSize: typeScale.caption, lineHeight: 19 },
  note: {
    color: colors.inkSoft,
    fontSize: typeScale.caption,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
