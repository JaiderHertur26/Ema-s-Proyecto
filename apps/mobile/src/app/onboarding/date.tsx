import { useState } from 'react';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/emaus/primary-button';
import { setOnboardingDeathDate } from '@/data/repositories/onboarding-repository';
import { colors, radius, spacing, typeScale } from '@/design/tokens';

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export default function DateScreen() {
  const db = useSQLiteContext();
  const [date, setDate] = useState(new Date());
  const [selected, setSelected] = useState(false);
  const [showPicker, setShowPicker] = useState(Platform.OS === 'ios');
  const [saving, setSaving] = useState(false);

  function handleDateChange(_: DateTimePickerEvent, value?: Date) {
    if (Platform.OS === 'android') setShowPicker(false);
    if (!value) return;

    setDate(value);
    setSelected(true);
  }

  async function saveExactDate() {
    if (!selected || saving) return;
    setSaving(true);
    try {
      await setOnboardingDeathDate(db, toIsoDate(date), 'exact');
      router.push('/onboarding/details');
    } finally {
      setSaving(false);
    }
  }

  async function saveUnknownDate() {
    if (saving) return;
    setSaving(true);
    try {
      await setOnboardingDeathDate(db, null, 'unknown');
      router.push('/onboarding/details');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <View style={styles.progress}>
            <View style={styles.progressDot} />
            <View style={styles.progressDot} />
            <View style={[styles.progressDot, styles.progressDotActive]} />
            {Array.from({ length: 4 }).map((_, index) => (
              <View key={index} style={styles.progressDot} />
            ))}
          </View>
          <View style={styles.backPlaceholder} />
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>¿Cuándo partió?</Text>
          <Text style={styles.subtitle}>
            Esta fecha nos ayuda a ofrecerte un acompañamiento adecuado al momento que estás viviendo.
          </Text>

          <Pressable onPress={() => setShowPicker(true)} style={styles.dateCard}>
            <Text style={styles.dateLabel}>{selected ? 'Fecha seleccionada' : 'Seleccionar fecha'}</Text>
            <Text style={styles.dateValue}>{selected ? formatDate(date) : 'Toca aquí para elegirla'}</Text>
          </Pressable>

          {showPicker && (
            <DateTimePicker
              maximumDate={new Date()}
              mode="date"
              onChange={handleDateChange}
              value={date}
            />
          )}

          <Text style={styles.helper}>
            Si no recuerdas el día exacto, puedes continuar sin indicarlo. EMAÚS no inventará una fecha.
          </Text>
        </View>

        <View style={styles.actions}>
          <PrimaryButton disabled={!selected || saving} label="Continuar" onPress={saveExactDate} />
          <Pressable
            accessibilityRole="button"
            disabled={saving}
            onPress={saveUnknownDate}
            style={styles.secondaryButton}>
            <Text style={styles.secondaryText}>No recuerdo la fecha exacta</Text>
          </Pressable>
        </View>
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
  progress: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  progressDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.line },
  progressDotActive: { width: 18, backgroundColor: colors.navy },
  body: { flex: 1, justifyContent: 'center', gap: spacing.md },
  title: {
    color: colors.navyDeep,
    fontFamily: 'serif',
    fontSize: typeScale.title,
    lineHeight: 38,
    textAlign: 'center',
    fontWeight: '700',
  },
  subtitle: {
    color: colors.inkSoft,
    fontSize: typeScale.body,
    lineHeight: 25,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  dateCard: {
    minHeight: 88,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.creamElevated,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    justifyContent: 'center',
    gap: 4,
  },
  dateLabel: { color: colors.inkSoft, fontSize: typeScale.caption },
  dateValue: { color: colors.navyDeep, fontSize: typeScale.body, fontWeight: '700' },
  helper: { color: colors.inkSoft, fontSize: typeScale.caption, lineHeight: 19, textAlign: 'center' },
  actions: { gap: spacing.sm },
  secondaryButton: { minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { color: colors.navy, fontSize: typeScale.bodySmall, fontWeight: '600' },
});
