import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typeScale } from '@/design/tokens';

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

export default function MeScreen() {
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
  hero: { paddingTop: spacing.xl, paddingBottom: spacing.xl, gap: spacing.sm },
  eyebrow: { color: colors.gold, fontSize: typeScale.caption, fontWeight: '800', letterSpacing: 2 },
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
