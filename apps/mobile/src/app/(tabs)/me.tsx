import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typeScale } from '@/design/tokens';
import { useAuthIdentity } from '@/services/auth/auth-provider';
import type { CloudIdentityStatus } from '@/services/auth/auth-service';

const rows = [
  ['○', 'Mi perfil', 'Mis datos y preferencias'],
  ['●', 'Mi red de apoyo', 'Personas que me acompañan'],
  ['✝', 'Mi sacerdote o parroquia', 'Acompañamiento espiritual'],
  ['◇', 'Profesional de confianza', 'Apoyo psicológico'],
  ['♢', 'Notificaciones', 'Fechas y recordatorios'],
  ['▣', 'Privacidad y seguridad', 'Tu información está protegida'],
  ['⇩', 'Exportar mis recuerdos', 'Guardar una copia de tu historia'],
  ['?', 'Ayuda', 'Preguntas frecuentes'],
  ['i', 'Acerca de EMAÚS', 'Nuestra misión'],
] as const;

const identityCopy: Record<
  CloudIdentityStatus,
  { title: string; text: string; symbol: string }
> = {
  local_only: {
    title: 'Guardado en este dispositivo',
    text:
      'Puedes usar EMAÚS sin crear una cuenta. La conexión segura con la nube todavía no está activa.',
    symbol: '⌂',
  },
  anonymous: {
    title: 'Identidad privada preparada',
    text:
      'EMAÚS ya tiene una identidad anónima para ti, sin pedir correo ni otros datos personales. La sincronización llegará en la siguiente fase.',
    symbol: '◌',
  },
  permanent: {
    title: 'Cuenta vinculada',
    text:
      'Tu identidad ya puede recuperarse. La sincronización de tus datos se gestiona por separado.',
    symbol: '✓',
  },
  recovery_required: {
    title: 'Tus datos locales están protegidos',
    text:
      'La sesión de nube no está disponible. EMAÚS no creará otra identidad automáticamente ni tocará tus datos locales.',
    symbol: '!',
  },
  identity_conflict: {
    title: 'Protección de identidad activada',
    text:
      'Se detectó una identidad distinta y EMAÚS no la vinculó automáticamente a este perfil.',
    symbol: '!',
  },
};

export default function MeScreen() {
  const {
    status,
    isReady,
    refreshCloudIdentity,
  } = useAuthIdentity();

  const cloud = identityCopy[status];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>PARA MÍ</Text>
          <Text style={styles.title}>También tú necesitas cuidado.</Text>
          <Text style={styles.subtitle}>
            Este espacio reunirá tu red de apoyo, privacidad y preferencias personales.
          </Text>
        </View>

        <View style={styles.identityCard}>
          <View style={styles.identitySymbol}>
            <Text style={styles.identitySymbolText}>{isReady ? cloud.symbol : '·'}</Text>
          </View>
          <View style={styles.identityCopy}>
            <Text style={styles.identityEyebrow}>CUENTA Y RESPALDO</Text>
            <Text style={styles.identityTitle}>
              {isReady ? cloud.title : 'Preparando tu privacidad…'}
            </Text>
            <Text style={styles.identityText}>
              {isReady
                ? cloud.text
                : 'Tus datos locales siguen disponibles mientras verificamos la identidad segura.'}
            </Text>

            {(status === 'local_only' || status === 'recovery_required') && isReady && (
              <Pressable
                accessibilityRole="button"
                onPress={() => refreshCloudIdentity()}
                style={({ pressed }) => [styles.retry, pressed && styles.pressed]}>
                <Text style={styles.retryText}>Volver a comprobar</Text>
              </Pressable>
            )}
          </View>
        </View>

        <View style={styles.list}>
          {rows.map(([icon, title, subtitle]) => (
            <View key={title} style={styles.row}>
              <Text style={styles.icon}>{icon}</Text>
              <View style={styles.copy}>
                <Text style={styles.rowTitle}>{title}</Text>
                <Text style={styles.rowSubtitle}>{subtitle}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.cream },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  hero: { paddingTop: spacing.xl, paddingBottom: spacing.lg, gap: spacing.sm },
  eyebrow: { color: colors.gold, fontSize: typeScale.caption, fontWeight: '800', letterSpacing: 2 },
  title: {
    color: colors.navyDeep,
    fontFamily: 'serif',
    fontSize: typeScale.title,
    lineHeight: 39,
    fontWeight: '700',
  },
  subtitle: { color: colors.inkSoft, fontSize: typeScale.body, lineHeight: 25 },
  identityCard: {
    borderRadius: radius.lg,
    backgroundColor: '#FFF8E9',
    borderWidth: 1,
    borderColor: colors.goldSoft,
    padding: spacing.md,
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  identitySymbol: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.creamElevated,
    borderWidth: 1,
    borderColor: colors.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identitySymbolText: {
    color: colors.navy,
    fontSize: typeScale.heading,
    fontWeight: '800',
  },
  identityCopy: { flex: 1, gap: 4 },
  identityEyebrow: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.9,
  },
  identityTitle: {
    color: colors.navyDeep,
    fontSize: typeScale.bodySmall,
    fontWeight: '800',
  },
  identityText: {
    color: colors.inkSoft,
    fontSize: typeScale.caption,
    lineHeight: 19,
  },
  retry: {
    alignSelf: 'flex-start',
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    marginTop: spacing.xs,
  },
  retryText: {
    color: colors.navy,
    fontSize: typeScale.caption,
    fontWeight: '800',
  },
  pressed: { opacity: 0.75 },
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
  icon: { width: 30, color: colors.navy, fontSize: 21, textAlign: 'center' },
  copy: { flex: 1 },
  rowTitle: { color: colors.ink, fontSize: typeScale.bodySmall, fontWeight: '700' },
  rowSubtitle: { color: colors.inkSoft, fontSize: typeScale.caption, marginTop: 3 },
});
