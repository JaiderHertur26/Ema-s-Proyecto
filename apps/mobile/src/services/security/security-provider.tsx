import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import * as ScreenCapture from 'expo-screen-capture';
import { useSQLiteContext } from 'expo-sqlite';
import { AppState, Platform } from 'react-native';

import {
  getSecurityPreferences,
  setBiometricLock as persistBiometricLock,
  setProtectScreenCapture as persistProtectScreenCapture,
} from '@/data/repositories/security-repository';

type SecurityActionResult = {
  ok: boolean;
  message: string | null;
};

type SecurityContextValue = {
  isReady: boolean;
  isLocked: boolean;
  biometricLock: boolean;
  protectScreenCapture: boolean;
  unlock: () => Promise<SecurityActionResult>;
  setBiometricLock: (enabled: boolean) => Promise<SecurityActionResult>;
  setProtectScreenCapture: (enabled: boolean) => Promise<SecurityActionResult>;
};

const SCREEN_CAPTURE_KEY = 'emaus-security';

const SecurityContext = createContext<SecurityContextValue>({
  isReady: false,
  isLocked: false,
  biometricLock: false,
  protectScreenCapture: false,
  unlock: async () => ({ ok: true, message: null }),
  setBiometricLock: async () => ({ ok: false, message: null }),
  setProtectScreenCapture: async () => ({ ok: false, message: null }),
});

async function authenticateDevice(): Promise<SecurityActionResult> {
  if (Platform.OS === 'web') {
    return {
      ok: false,
      message: 'El bloqueo del dispositivo no está disponible en la versión web.',
    };
  }

  const [hasHardware, enrolled] = await Promise.all([
    LocalAuthentication.hasHardwareAsync(),
    LocalAuthentication.isEnrolledAsync(),
  ]);

  if (!hasHardware || !enrolled) {
    return {
      ok: false,
      message:
        'Este dispositivo no tiene biometría registrada. Configúrala primero en los ajustes del sistema.',
    };
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Desbloquear EMAÚS',
    promptSubtitle: 'Protege tus recuerdos y datos privados',
    cancelLabel: 'Cancelar',
    fallbackLabel: 'Usar código del dispositivo',
    disableDeviceFallback: false,
    biometricsSecurityLevel: 'strong',
  });

  if (!result.success) {
    return {
      ok: false,
      message:
        result.error === 'user_cancel' || result.error === 'system_cancel'
          ? 'Autenticación cancelada.'
          : 'No fue posible verificar tu identidad.',
    };
  }

  return { ok: true, message: null };
}

export function SecurityProvider({ children }: PropsWithChildren) {
  const db = useSQLiteContext();
  const [isReady, setIsReady] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [biometricLock, setBiometricLockState] = useState(false);
  const [protectScreenCapture, setProtectScreenCaptureState] = useState(false);
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    let active = true;

    getSecurityPreferences(db)
      .then(async (preferences) => {
        if (!active) return;

        let effectiveBiometricLock = preferences.biometricLock;

        if (preferences.biometricLock && Platform.OS !== 'web') {
          const [hasHardware, enrolled] = await Promise.all([
            LocalAuthentication.hasHardwareAsync(),
            LocalAuthentication.isEnrolledAsync(),
          ]);

          if (!hasHardware || !enrolled) {
            effectiveBiometricLock = false;
            await persistBiometricLock(db, false);
          }
        }

        if (!active) return;

        setBiometricLockState(effectiveBiometricLock);
        setProtectScreenCaptureState(preferences.protectScreenCapture);
        setIsLocked(effectiveBiometricLock);
      })
      .finally(() => {
        if (active) setIsReady(true);
      });

    return () => {
      active = false;
    };
  }, [db]);

  useEffect(() => {
    if (!isReady || Platform.OS === 'web') return;

    async function applyCapturePolicy() {
      try {
        if (protectScreenCapture || isLocked) {
          await ScreenCapture.preventScreenCaptureAsync(SCREEN_CAPTURE_KEY);
        } else {
          await ScreenCapture.allowScreenCaptureAsync(SCREEN_CAPTURE_KEY);
        }

        if (Platform.OS === 'ios') {
          if (biometricLock || protectScreenCapture) {
            await ScreenCapture.enableAppSwitcherProtectionAsync(1);
          } else {
            await ScreenCapture.disableAppSwitcherProtectionAsync();
          }
        }
      } catch {
        // Esta protección adicional nunca debe impedir abrir EMAÚS.
      }
    }

    void applyCapturePolicy();
  }, [biometricLock, isLocked, isReady, protectScreenCapture]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const previous = appStateRef.current;
      appStateRef.current = nextState;

      if (
        biometricLock &&
        previous === 'active' &&
        nextState === 'background'
      ) {
        setIsLocked(true);
      }
    });

    return () => subscription.remove();
  }, [biometricLock]);

  const unlock = useCallback(async () => {
    if (!biometricLock) {
      setIsLocked(false);
      return { ok: true, message: null };
    }

    const result = await authenticateDevice();

    if (result.ok) {
      setIsLocked(false);
    }

    return result;
  }, [biometricLock]);

  const setBiometricLock = useCallback(
    async (enabled: boolean): Promise<SecurityActionResult> => {
      if (enabled === biometricLock) {
        return { ok: true, message: null };
      }

      const result = await authenticateDevice();
      if (!result.ok) return result;

      await persistBiometricLock(db, enabled);
      setBiometricLockState(enabled);
      setIsLocked(false);

      return { ok: true, message: null };
    },
    [biometricLock, db]
  );

  const setProtectScreenCapture = useCallback(
    async (enabled: boolean): Promise<SecurityActionResult> => {
      if (Platform.OS === 'web') {
        return {
          ok: false,
          message: 'La protección de capturas no está disponible en la versión web.',
        };
      }

      await persistProtectScreenCapture(db, enabled);
      setProtectScreenCaptureState(enabled);

      return { ok: true, message: null };
    },
    [db]
  );

  const value = useMemo<SecurityContextValue>(
    () => ({
      isReady,
      isLocked,
      biometricLock,
      protectScreenCapture,
      unlock,
      setBiometricLock,
      setProtectScreenCapture,
    }),
    [
      biometricLock,
      isLocked,
      isReady,
      protectScreenCapture,
      setBiometricLock,
      setProtectScreenCapture,
      unlock,
    ]
  );

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
}

export function useSecurity() {
  return useContext(SecurityContext);
}
