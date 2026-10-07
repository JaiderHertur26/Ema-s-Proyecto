import { useCallback, useState } from 'react';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  getNotificationPreferences,
  setDailyNotifications,
  setDailyNotificationTime,
  setNotificationShowLovedOneName,
  setSpecialDateNotifications,
  type NotificationPreferences,
} from '@/data/repositories/notification-repository';
import { colors, radius, spacing, typeScale } from '@/design/tokens';
import {
  getNotificationPermissionState,
  getScheduledNotificationCount,
  rebuildNotificationSchedule,
  requestNotificationPermission,
  scheduleTestNotification,
} from '@/services/notifications/notification-service';

const defaultPreferences: NotificationPreferences = {
  dailyNotifications: false,
  specialDateNotifications: false,
  dailyHour: 8,
  dailyMinute: 0,
  showLovedOneName: false,
};

function formatTime(hour: number, minute: number) {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);

  return new Intl.DateTimeFormat('es-CO', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export default function NotificationsSettingsScreen() {
  const db = useSQLiteContext();
  const [preferences, setPreferences] =
    useState<NotificationPreferences>(defaultPreferences);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [canAskAgain, setCanAskAgain] = useState(true);
  const [scheduledCount, setScheduledCount] = useState(0);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [nextPreferences, permission, count] = await Promise.all([
      getNotificationPreferences(db),
      getNotificationPermissionState(),
      getScheduledNotificationCount(),
    ]);

    setPreferences(nextPreferences);
    setPermissionGranted(permission.granted);
    setCanAskAgain(permission.canAskAgain);
    setScheduledCount(count);
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      load().catch(() => undefined);
    }, [load])
  );

  async function rebuild() {
    const result = await rebuildNotificationSchedule(db, {
      requestPermission: false,
    });

    setPermissionGranted(result.permission.granted);
    setCanAskAgain(result.permission.canAskAgain);
    setScheduledCount(result.scheduledCount);
  }

  async function ensurePermission() {
    const permission = await requestNotificationPermission();

    setPermissionGranted(permission.granted);
    setCanAskAgain(permission.canAskAgain);

    if (!permission.granted) {
      setMessage(
        permission.canAskAgain
          ? 'No se concedió permiso. Puedes intentarlo de nuevo cuando quieras.'
          : 'Las notificaciones están desactivadas en los ajustes del dispositivo.'
      );
      return false;
    }

    return true;
  }

  async function changeDailyNotifications(enabled: boolean) {
    if (busy) return;
    setBusy(true);
    setMessage(null);

    try {
      if (enabled && !(await ensurePermission())) return;

      await setDailyNotifications(db, enabled);
      setPreferences((current) => ({
        ...current,
        dailyNotifications: enabled,
      }));
      await rebuild();
    } finally {
      setBusy(false);
    }
  }

  async function changeSpecialDateNotifications(enabled: boolean) {
    if (busy) return;
    setBusy(true);
    setMessage(null);

    try {
      if (enabled && !(await ensurePermission())) return;

      await setSpecialDateNotifications(db, enabled);
      setPreferences((current) => ({
        ...current,
        specialDateNotifications: enabled,
      }));
      await rebuild();
    } finally {
      setBusy(false);
    }
  }

  async function changeShowName(enabled: boolean) {
    if (busy) return;
    setBusy(true);
    setMessage(null);

    try {
      await setNotificationShowLovedOneName(db, enabled);
      setPreferences((current) => ({
        ...current,
        showLovedOneName: enabled,
      }));
      await rebuild();
    } finally {
      setBusy(false);
    }
  }

  async function changeTime(
    event: DateTimePickerEvent,
    value?: Date
  ) {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }

    if (event.type !== 'set' || !value || busy) return;

    const hour = value.getHours();
    const minute = value.getMinutes();

    setBusy(true);
    setMessage(null);

    try {
      await setDailyNotificationTime(db, hour, minute);
      setPreferences((current) => ({
        ...current,
        dailyHour: hour,
        dailyMinute: minute,
      }));
      await rebuild();
    } finally {
      setBusy(false);
    }
  }

  async function sendTest() {
    if (busy) return;
    setBusy(true);
    setMessage(null);

    try {
      const result = await scheduleTestNotification();

      if (!result.ok) {
        setMessage(result.message);
        await load();
        return;
      }

      setMessage(
        'Prueba programada. Debe aparecer en unos segundos sin sonido ni vibración.'
      );
      await load();
    } finally {
      setBusy(false);
    }
  }

  const pickerValue = new Date();
  pickerValue.setHours(
    preferences.dailyHour,
    preferences.dailyMinute,
    0,
    0
  );

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
          <Text style={styles.topTitle}>NOTIFICACIONES</Text>
          <View style={styles.backPlaceholder} />
        </View>

        <View style={styles.hero}>
          <Text style={styles.title}>Acompañar sin invadir.</Text>
          <Text style={styles.subtitle}>
            EMAÚS solo te recordará aquello que tú decidas. No pedirá permiso
            hasta que actives una opción.
          </Text>
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Permiso del dispositivo</Text>
            <Text
              style={[
                styles.statusValue,
                permissionGranted
                  ? styles.statusGood
                  : styles.statusMuted,
              ]}>
              {permissionGranted ? 'Concedido' : 'No concedido'}
            </Text>
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Programados actualmente</Text>
            <Text style={styles.statusValue}>{scheduledCount}</Text>
          </View>

          {!permissionGranted && !canAskAgain && (
            <Pressable
              accessibilityRole="button"
              onPress={() => Linking.openSettings()}
              style={({ pressed }) => [
                styles.settingsButton,
                pressed && styles.pressed,
              ]}>
              <Text style={styles.settingsButtonText}>
                Abrir ajustes del dispositivo
              </Text>
            </Pressable>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingCopy}>
              <Text style={styles.settingTitle}>Un momento cada día</Text>
              <Text style={styles.settingText}>
                Un recordatorio discreto para oración, memoria o cuidado
                personal. Viene apagado por defecto.
              </Text>
            </View>
            <Switch
              accessibilityLabel="Un momento cada día"
              disabled={busy}
              onValueChange={changeDailyNotifications}
              value={preferences.dailyNotifications}
            />
          </View>

          <View style={styles.divider} />

          <Pressable
            accessibilityRole="button"
            disabled={busy}
            onPress={() => setShowTimePicker((current) => !current)}
            style={({ pressed }) => [
              styles.timeRow,
              pressed && styles.pressed,
            ]}>
            <View style={styles.settingCopy}>
              <Text style={styles.settingTitle}>Hora de los recordatorios</Text>
              <Text style={styles.settingText}>
                También se usa para fechas importantes.
              </Text>
            </View>
            <Text style={styles.timeValue}>
              {formatTime(
                preferences.dailyHour,
                preferences.dailyMinute
              )}
            </Text>
          </Pressable>

          {showTimePicker && (
            <View style={styles.pickerWrap}>
              <DateTimePicker
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                is24Hour={false}
                mode="time"
                onChange={changeTime}
                value={pickerValue}
              />
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingCopy}>
              <Text style={styles.settingTitle}>Fechas importantes</Text>
              <Text style={styles.settingText}>
                Puede recordar nueve días, primer mes, aniversario, cumpleaños
                si está disponible y fechas que tú agregues.
              </Text>
            </View>
            <Switch
              accessibilityLabel="Fechas importantes"
              disabled={busy}
              onValueChange={changeSpecialDateNotifications}
              value={preferences.specialDateNotifications}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingCopy}>
              <Text style={styles.settingTitle}>
                Mostrar nombre en la notificación
              </Text>
              <Text style={styles.settingText}>
                Viene apagado por privacidad. Si lo activas, algunas
                notificaciones podrán mencionar a tu ser querido.
              </Text>
            </View>
            <Switch
              accessibilityLabel="Mostrar nombre en la notificación"
              disabled={busy}
              onValueChange={changeShowName}
              value={preferences.showLovedOneName}
            />
          </View>
        </View>

        {message && (
          <View style={styles.messageCard}>
            <Text style={styles.messageText}>{message}</Text>
          </View>
        )}

        <Pressable
          accessibilityRole="button"
          disabled={busy}
          onPress={sendTest}
          style={({ pressed }) => [
            styles.testButton,
            pressed && styles.pressed,
            busy && styles.disabled,
          ]}>
          <Text style={styles.testButtonText}>Probar una notificación</Text>
        </Pressable>

        <View style={styles.privacyCard}>
          <Text style={styles.privacyTitle}>Privacidad por diseño</Text>
          <Text style={styles.privacyText}>
            Los recordatorios son locales. EMAÚS no necesita enviar tu duelo a
            un servidor de push para programarlos. En Android se usa un canal
            discreto sin sonido ni vibración y oculto en la pantalla bloqueada.
          </Text>
        </View>

        <Text style={styles.note}>
          Puedes apagar todo en cualquier momento. Desactivar una opción cancela
          y reconstruye el calendario local de EMAÚS.
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
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.3,
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
  statusCard: {
    borderRadius: radius.lg,
    backgroundColor: '#FFF8E9',
    borderWidth: 1,
    borderColor: colors.goldSoft,
    padding: spacing.md,
    gap: spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  statusLabel: {
    flex: 1,
    color: colors.inkSoft,
    fontSize: typeScale.caption,
  },
  statusValue: {
    color: colors.navyDeep,
    fontSize: typeScale.caption,
    fontWeight: '800',
  },
  statusGood: {
    color: colors.hope,
  },
  statusMuted: {
    color: colors.inkSoft,
  },
  settingsButton: {
    alignSelf: 'flex-start',
    minHeight: 38,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.navy,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsButtonText: {
    color: colors.navy,
    fontSize: typeScale.caption,
    fontWeight: '800',
  },
  card: {
    borderRadius: radius.lg,
    backgroundColor: colors.creamElevated,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: spacing.md,
  },
  settingRow: {
    minHeight: 108,
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
    fontSize: typeScale.bodySmall,
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
  timeRow: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  timeValue: {
    color: colors.navy,
    fontSize: typeScale.body,
    fontWeight: '800',
  },
  pickerWrap: {
    paddingBottom: spacing.md,
    alignItems: 'center',
  },
  messageCard: {
    borderRadius: radius.md,
    backgroundColor: '#FFF8E9',
    borderWidth: 1,
    borderColor: colors.goldSoft,
    padding: spacing.md,
  },
  messageText: {
    color: colors.ink,
    fontSize: typeScale.caption,
    lineHeight: 19,
  },
  testButton: {
    minHeight: 54,
    borderRadius: radius.pill,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testButtonText: {
    color: colors.white,
    fontSize: typeScale.bodySmall,
    fontWeight: '800',
  },
  privacyCard: {
    borderRadius: radius.lg,
    backgroundColor: '#F3F6F0',
    borderWidth: 1,
    borderColor: '#CBD8C6',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  privacyTitle: {
    color: colors.navyDeep,
    fontSize: typeScale.bodySmall,
    fontWeight: '800',
  },
  privacyText: {
    color: colors.inkSoft,
    fontSize: typeScale.caption,
    lineHeight: 20,
  },
  note: {
    color: colors.inkSoft,
    fontSize: typeScale.caption,
    lineHeight: 19,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.6,
  },
});
