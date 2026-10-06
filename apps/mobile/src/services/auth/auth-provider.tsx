import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AppState, Platform } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';

import { attachRemoteUserId } from '@/data/repositories/profile-repository';

import {
  ensureCloudIdentity,
  type CloudIdentityResult,
} from './auth-service';
import { getSupabaseClient } from './supabase-client';

type AuthContextValue = CloudIdentityResult & {
  isReady: boolean;
  refreshCloudIdentity: () => Promise<void>;
};

const initialState: AuthContextValue = {
  isReady: false,
  status: 'local_only',
  remoteUserId: null,
  message: null,
  refreshCloudIdentity: async () => undefined,
};

const AuthContext = createContext<AuthContextValue>(initialState);

export function AuthProvider({ children }: PropsWithChildren) {
  const db = useSQLiteContext();
  const [identity, setIdentity] = useState<CloudIdentityResult>({
    status: 'local_only',
    remoteUserId: null,
    message: null,
  });
  const [isReady, setIsReady] = useState(false);

  const refreshCloudIdentity = useCallback(async () => {
    try {
      const result = await ensureCloudIdentity(db);
      setIdentity(result);
    } catch (error) {
      setIdentity({
        status: 'local_only',
        remoteUserId: null,
        message:
          error instanceof Error
            ? error.message
            : 'No fue posible preparar la identidad en la nube.',
      });
    } finally {
      setIsReady(true);
    }
  }, [db]);

  useEffect(() => {
    let active = true;

    ensureCloudIdentity(db)
      .then((result) => {
        if (active) setIdentity(result);
      })
      .catch((error) => {
        if (!active) return;

        setIdentity({
          status: 'local_only',
          remoteUserId: null,
          message:
            error instanceof Error
              ? error.message
              : 'No fue posible preparar la identidad en la nube.',
        });
      })
      .finally(() => {
        if (active) setIsReady(true);
      });

    return () => {
      active = false;
    };
  }, [db]);

  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) return;

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) return;

      const user = session.user;

      attachRemoteUserId(db, user.id)
        .then((result) => {
          if (result === 'conflict') {
            setIdentity({
              status: 'identity_conflict',
              remoteUserId: null,
              message:
                'La sesión recibida no coincide con la identidad que ya pertenece a este perfil.',
            });
            return;
          }

          setIdentity({
            status: user.is_anonymous === true ? 'anonymous' : 'permanent',
            remoteUserId: user.id,
            message: null,
          });
        })
        .catch(() => undefined);
    });

    return () => subscription.unsubscribe();
  }, [db]);

  useEffect(() => {
    const client = getSupabaseClient();
    if (!client || Platform.OS === 'web') return;

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        client.auth.startAutoRefresh();
      } else {
        client.auth.stopAutoRefresh();
      }
    });

    return () => {
      subscription.remove();
      client.auth.stopAutoRefresh();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...identity,
      isReady,
      refreshCloudIdentity,
    }),
    [identity, isReady, refreshCloudIdentity]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthIdentity() {
  return useContext(AuthContext);
}
