import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/emaus/primary-button';
import { colors, spacing, typeScale } from '@/design/tokens';

export default function WelcomeScreen() {
  return (
    <View style={styles.screen}>
      <View pointerEvents="none" style={styles.lightTop} />
      <View pointerEvents="none" style={styles.lightBottom} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.hero}>
          <View style={styles.crossWrap}>
            <Text style={styles.cross}>✝</Text>
          </View>

          <Text style={styles.wordmark}>EMAÚS</Text>
          <View style={styles.path} />

          <Text style={styles.tagline}>
            Un camino de esperanza cuando alguien que amas ha partido.
          </Text>
        </View>

        <View style={styles.actions}>
          <PrimaryButton label="Comenzar mi camino" onPress={() => router.push('/onboarding')} />
          <Text style={styles.note}>Puedes recorrer EMAÚS a tu propio ritmo.</Text>

          <View style={styles.dots} accessibilityLabel="Inicio del recorrido">
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.cream,
    overflow: 'hidden',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  lightTop: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: '#FFF7DC',
    top: -160,
    right: -110,
    opacity: 0.9,
  },
  lightBottom: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#E7EFE4',
    bottom: -190,
    left: -150,
    opacity: 0.7,
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  crossWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.creamElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.goldSoft,
    marginBottom: spacing.lg,
  },
  cross: {
    color: colors.gold,
    fontSize: 30,
  },
  wordmark: {
    color: colors.navyDeep,
    fontFamily: 'serif',
    fontSize: typeScale.display,
    fontWeight: '700',
    letterSpacing: 3,
  },
  path: {
    width: 74,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.gold,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    transform: [{ rotate: '-3deg' }],
  },
  tagline: {
    maxWidth: 320,
    color: colors.navyDeep,
    fontFamily: 'serif',
    fontSize: typeScale.heading,
    lineHeight: 30,
    textAlign: 'center',
    fontWeight: '600',
  },
  actions: {
    gap: spacing.md,
  },
  note: {
    color: colors.inkSoft,
    fontSize: typeScale.bodySmall,
    lineHeight: 21,
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.line,
  },
  dotActive: {
    width: 18,
    backgroundColor: colors.navy,
  },
});
