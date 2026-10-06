import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typeScale } from '@/design/tokens';

export default function SafetyScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>TU SEGURIDAD ES LO PRIMERO</Text>
          <Text style={styles.title}>No quiero que atravieses esto solo.</Text>
          <Text style={styles.subtitle}>
            Si crees que podrías hacerte daño, tienes un plan para hacerlo o sientes que no puedes mantenerte seguro, necesitas compañía humana inmediata.
          </Text>
        </View>

        <View style={styles.priorityCard}>
          <Text style={styles.priorityTitle}>Haz esto ahora</Text>

          <View style={styles.step}>
            <Text style={styles.number}>1</Text>
            <Text style={styles.stepText}>
              Ve hacia donde haya otra persona. Si puedes, no permanezcas solo.
            </Text>
          </View>

          <View style={styles.step}>
            <Text style={styles.number}>2</Text>
            <Text style={styles.stepText}>
              Dile claramente a alguien de confianza: “No me siento seguro y necesito que te quedes conmigo”.
            </Text>
          </View>

          <View style={styles.step}>
            <Text style={styles.number}>3</Text>
            <Text style={styles.stepText}>
              Aléjate, si puedes hacerlo con seguridad, de objetos, armas o medicamentos que pudieras usar para hacerte daño.
            </Text>
          </View>

          <View style={styles.step}>
            <Text style={styles.number}>4</Text>
            <Text style={styles.stepText}>
              Contacta un servicio de emergencia, una línea de crisis o un profesional de tu país si el riesgo es inmediato.
            </Text>
          </View>
        </View>

        <View style={styles.warning}>
          <Text style={styles.warningTitle}>EMAÚS no es un servicio de emergencia.</Text>
          <Text style={styles.warningText}>
            Una oración puede acompañarte, pero no sustituye la ayuda humana y profesional que necesitas en una crisis.
          </Text>
        </View>

        <View style={styles.prayerCard}>
          <Text style={styles.prayerEyebrow}>SI QUIERES, MIENTRAS BUSCAS AYUDA</Text>
          <Text style={styles.prayer}>
            Señor Jesús, estoy atravesando un momento muy difícil. Pon personas a mi lado, dame fuerzas para pedir ayuda y acompáñame mientras doy el siguiente paso para estar seguro. Amén.
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/support/now')}
          style={({ pressed }) => [styles.primary, pressed && styles.pressed]}>
          <Text style={styles.primaryText}>Ayúdame a buscar compañía</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/(tabs)/today')}
          style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}>
          <Text style={styles.secondaryText}>Volver a la aplicación</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF7F7' },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: spacing.md },
  hero: { paddingTop: spacing.xl, paddingBottom: spacing.sm, gap: spacing.sm },
  eyebrow: { color: colors.danger, fontSize: typeScale.caption, fontWeight: '900', letterSpacing: 1.2 },
  title: {
    color: colors.navyDeep,
    fontFamily: 'serif',
    fontSize: typeScale.title,
    lineHeight: 39,
    fontWeight: '700',
  },
  subtitle: { color: '#6E5050', fontSize: typeScale.body, lineHeight: 25 },
  priorityCard: {
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: '#D7A1A1',
    padding: spacing.lg,
    gap: spacing.md,
  },
  priorityTitle: { color: colors.danger, fontSize: typeScale.heading, fontWeight: '800' },
  step: { flexDirection: 'row', gap: spacing.md },
  number: {
    width: 28,
    color: colors.danger,
    fontFamily: 'serif',
    fontSize: typeScale.heading,
    fontWeight: '700',
  },
  stepText: { flex: 1, color: colors.ink, fontSize: typeScale.bodySmall, lineHeight: 22 },
  warning: {
    borderRadius: radius.md,
    backgroundColor: '#FDEAEA',
    padding: spacing.md,
    gap: spacing.xs,
  },
  warningTitle: { color: colors.danger, fontSize: typeScale.bodySmall, fontWeight: '800' },
  warningText: { color: '#7D4E4E', fontSize: typeScale.caption, lineHeight: 19 },
  prayerCard: {
    borderRadius: radius.lg,
    backgroundColor: colors.creamElevated,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  prayerEyebrow: { color: colors.navy, fontSize: typeScale.caption, fontWeight: '800', letterSpacing: 0.8 },
  prayer: { color: colors.ink, fontFamily: 'serif', fontSize: typeScale.body, lineHeight: 28 },
  primary: {
    minHeight: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  primaryText: { color: colors.white, fontSize: typeScale.bodySmall, fontWeight: '800' },
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
