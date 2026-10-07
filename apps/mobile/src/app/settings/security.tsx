import { useState } from 'react';
import { router } from 'expo-router';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typeScale } from '@/design/tokens';
import { useSecurity } from '@/services/security/security-provider';

export default function SecuritySettingsScreen() {
  const security = useSecurity();
  const [message, setMessage] = useState<string | null>(null);
  const [changingLock, setChangingLock] = useState(false);
  const [changingCapture, setChangingCapture] = useState(false);

  async function changeBiometricLock(enabled: boolean) {
    if (changingLock) return;

    setChangingLock(true);
    setMessage(null);

    try {
      const result = await security.setBiometricLock(enabled);
      if (!result.ok) setMessage(result.message);
    } finally {
      setChangingLock(false);
    }
  }

  async function changeScreenCapture(enabled: boolean) {
    if (changingCapture) return;

    setChangingCapture(true);
    setMessage(null);

    try {
      const result = await security.setProtectScreenCapture(enabled);
      if (!result.ok) setMessage(result.message);
    } finally {
      setChangingCapture(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            style={styles.backButton}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <Text style={styles.topTitle}>PRIVACIDAD Y SEGURIDAD</Text>
          <View style={styles.backPlaceholder} />
        </View>

        <View style={styles.hero}>
          <Text style={styles.title}>Tu historia merece cuidado.</Text>
          <Text style={styles.subtitle}>
            Estas opciones protegen este dispositivo. No cambian tu experiencia
            espiritual ni comparten información con terceros.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingCopy}>
              <Text style={styles.settingTitle}>Bloquear EMAÚS</Text>
              <Text style={styles.settingText}>
                Pide biometría y permite el código del dispositivo como respaldo
                cuando el sistema lo ofrece.
              </Text>
            </View>
            <Switch
              accessibilityLabel="Bloquear EMAÚS"
              disabled={!security.isReady || changingLock}
              onValueChange={changeBiometricLock}
              value={security.biometricLock}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingCopy}>
              <Text style={styles.settingTitle}>Proteger capturas de pantalla</Text>
              <Text style={styles.settingText}>
                Impide capturas y grabaciones mientras EMAÚS está visible. En iPhone
                también oculta el contenido en el selector de aplicaciones.
              </Text>
            </View>
            <Switch
              accessibilityLabel="Proteger capturas de pantalla"
              disabled={!security.isReady || changingCapture}
              onValueChange={changeScreenCapture}
              value={security.protectScreenCapture}
            />
          </View>
        </View>

        {message && (
          <View style={styles.messageCard}>
            <Text style={styles.messageText}>{message}</Text>
          </View>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoEyebrow}>PROTECCIONES ACTIVAS DE EMAÚS</Text>

          <View style={styles.infoRow}>
            <Text style={styles.check}>✓</Text>
            <View style={styles.infoCopy}>
              <Text style={styles.infoTitle}>Base local cifrada</Text>
              <Text style={styles.infoText}>
                SQLite usa SQLCipher con una clave aleatoria guardada en SecureStore
                y vinculada a este dispositivo.
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.check}>✓</Text>
            <View style={styles.infoCopy}>
              <Text style={styles.infoTitle}>Sesión protegida</Text>
              <Text style={styles.infoText}>
                La sesión de Supabase se guarda en SecureStore; EMAÚS no almacena
                contraseñas biométricas.
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.check}>✓</Text>
            <View style={styles.infoCopy}>
              <Text style={styles.infoTitle}>Nube aislada por usuario</Text>
              <Text style={styles.infoText}>
                Base de datos y fotografías usan RLS. Un usuario no puede leer,
                modificar ni enlazar datos pertenecientes a otro.
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.check}>✓</Text>
            <View style={styles.infoCopy}>
              <Text style={styles.infoTitle}>Fotografías privadas</Text>
              <Text style={styles.infoText}>
                No existen URLs públicas permanentes para tus fotografías guardadas
                en EMAÚS.
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.note}>
          Estas protecciones reducen riesgos, pero ningún sistema puede garantizar
          seguridad absoluta. Mantén también protegido tu teléfono.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  topRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backPlaceholder: {
    width: 40,
    height: 40,
  },
  backText: {
    color: colors.navy,
    fontSize: 38,
    lineHeight: 40,
  },
  topTitle: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  hero: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  title: {
    color: colors.navyDeep,
    fontFamily: 'serif',
    fontSize: typeScale.title,
    lineHeight: 39,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.inkSoft,
    fontSize: typeScale.bodySmall,
    lineHeight: 22,
  },
  card: {
    borderRadius: radius.lg,
    backgroundColor: colors.creamElevated,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: spacing.md,
  },
  settingRow: {
    minHeight: 104,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  settingCopy: {
    flex: 1,
    gap: 5,
  },
  settingTitle: {
    color: colors.navyDeep,
    fontSize: typeScale.body,
    fontWeight: '800',
  },
  settingText: {
    color: colors.inkSoft,
    fontSize: typeScale.caption,
    lineHeight: 19,
  },
  divider: {
    height: 1,
    backgroundColor: colors.line,
  },
  messageCard: {
    borderRadius: radius.md,
    backgroundColor: '#FFF2F2',
    borderWidth: 1,
    borderColor: '#D7A1A1',
    padding: spacing.md,
  },
  messageText: {
    color: colors.danger,
    fontSize: typeScale.caption,
    lineHeight: 19,
  },
  infoCard: {
    borderRadius: radius.lg,
    backgroundColor: '#F3F6F0',
    borderWidth: 1,
    borderColor: '#CBD8C6',
    padding: spacing.lg,
    gap: spacing.md,
  },
  infoEyebrow: {
    color: colors.navy,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  infoRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  check: {
    width: 22,
    color: colors.hope,
    fontSize: typeScale.body,
    fontWeight: '900',
  },
  infoCopy: {
    flex: 1,
    gap: 3,
  },
  infoTitle: {
    color: colors.navyDeep,
    fontSize: typeScale.bodySmall,
    fontWeight: '800',
  },
  infoText: {
    color: colors.inkSoft,
    fontSize: typeScale.caption,
    lineHeight: 19,
  },
  note: {
    color: colors.inkSoft,
    fontSize: typeScale.caption,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
