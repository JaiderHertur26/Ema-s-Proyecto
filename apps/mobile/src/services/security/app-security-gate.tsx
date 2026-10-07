import { type PropsWithChildren, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typeScale } from '@/design/tokens';

import { useSecurity } from './security-provider';

export function AppSecurityGate({ children }: PropsWithChildren) {
  const security = useSecurity();
  const [message, setMessage] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);

  async function handleUnlock() {
    if (unlocking) return;

    setUnlocking(true);
    setMessage(null);

    try {
      const result = await security.unlock();

      if (!result.ok) {
        setMessage(result.message);
      }
    } finally {
      setUnlocking(false);
    }
  }

  if (!security.isReady) {
    return <View style={styles.loading} />;
  }

  if (!security.isLocked) {
    return children;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.symbol}>
          <Text style={styles.symbolText}>✦</Text>
        </View>

        <Text style={styles.eyebrow}>EMAÚS ESTÁ PROTEGIDO</Text>
        <Text style={styles.title}>Tus recuerdos permanecen privados.</Text>
        <Text style={styles.body}>
          Verifica tu identidad con la seguridad de este dispositivo para continuar.
        </Text>

        <Pressable
          accessibilityRole="button"
          disabled={unlocking}
          onPress={handleUnlock}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.pressed,
            unlocking && styles.disabled,
          ]}>
          <Text style={styles.buttonText}>
            {unlocking ? 'Verificando…' : 'Desbloquear EMAÚS'}
          </Text>
        </Pressable>

        {message && <Text style={styles.message}>{message}</Text>}

        <Text style={styles.note}>
          EMAÚS no conoce ni almacena tu huella, rostro o código del dispositivo.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbol: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: colors.goldSoft,
    backgroundColor: '#FFF8E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  symbolText: {
    color: colors.gold,
    fontSize: 34,
  },
  eyebrow: {
    color: colors.gold,
    fontSize: typeScale.caption,
    fontWeight: '800',
    letterSpacing: 1.4,
    textAlign: 'center',
  },
  title: {
    color: colors.navyDeep,
    fontFamily: 'serif',
    fontSize: typeScale.title,
    lineHeight: 39,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  body: {
    color: colors.inkSoft,
    fontSize: typeScale.body,
    lineHeight: 25,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  button: {
    minHeight: 56,
    alignSelf: 'stretch',
    borderRadius: radius.pill,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  buttonText: {
    color: colors.white,
    fontSize: typeScale.bodySmall,
    fontWeight: '800',
  },
  message: {
    color: colors.danger,
    fontSize: typeScale.caption,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  note: {
    color: colors.inkSoft,
    fontSize: typeScale.caption,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  pressed: {
    opacity: 0.82,
  },
  disabled: {
    opacity: 0.6,
  },
});
