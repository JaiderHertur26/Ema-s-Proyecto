import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typeScale } from '@/design/tokens';

export default function SupportNowScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <Text style={styles.topTitle}>COMPAÑÍA HUMANA</Text>
          <View style={styles.backPlaceholder} />
        </View>

        <View style={styles.hero}>
          <Text style={styles.title}>No tienes que sostener esto solo</Text>
          <Text style={styles.subtitle}>
            La aplicación puede acompañarte unos minutos, pero hay momentos en que una voz o una presencia real es lo más importante.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.number}>1</Text>
          <View style={styles.copy}>
            <Text style={styles.cardTitle}>Piensa en una persona concreta</Text>
            <Text style={styles.cardText}>
              Familiar, amigo, sacerdote, vecino o alguien con quien puedas estar sin tener que explicar demasiado.
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.number}>2</Text>
          <View style={styles.copy}>
            <Text style={styles.cardTitle}>Haz el contacto sencillo</Text>
            <Text style={styles.cardText}>
              Puedes decir: “Hoy me está costando. ¿Puedes hablar conmigo o acompañarme un rato?”
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.number}>3</Text>
          <View style={styles.copy}>
            <Text style={styles.cardTitle}>Si esto se repite o te desborda</Text>
            <Text style={styles.cardText}>
              Considera hablar con un profesional de salud mental o con un acompañante pastoral de confianza.
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/difficult-moment/safety')}
          style={({ pressed }) => [styles.safety, pressed && styles.pressed]}>
          <Text style={styles.safetyTitle}>Necesito ayuda urgente</Text>
          <Text style={styles.safetyText}>
            Entra aquí si temes hacerte daño o no puedes mantenerte seguro.
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/(tabs)/today')}
          style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}>
          <Text style={styles.secondaryText}>Volver a Hoy</Text>
        </Pressable>
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
  card: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.creamElevated,
    padding: spacing.md,
    flexDirection: 'row',
    gap: spacing.md,
  },
  number: {
    color: colors.gold,
    fontFamily: 'serif',
    fontSize: typeScale.heading,
    fontWeight: '700',
    width: 28,
  },
  copy: { flex: 1, gap: spacing.xs },
  cardTitle: { color: colors.navyDeep, fontSize: typeScale.bodySmall, fontWeight: '800' },
  cardText: { color: colors.inkSoft, fontSize: typeScale.bodySmall, lineHeight: 22 },
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
  secondary: {
    minHeight: 54,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: { color: colors.navy, fontSize: typeScale.bodySmall, fontWeight: '700' },
  pressed: { opacity: 0.84 },
});
