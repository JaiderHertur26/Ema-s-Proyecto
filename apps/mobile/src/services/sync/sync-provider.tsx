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
import { AppState } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';

import { supabaseConfig } from '@/config/supabase';
import {
  countPendingSync,
  getSyncRuntimeState,
  type SyncRuntimeState,
} from '@/data/repositories/sync-runtime-repository';
import { useAuthIdentity } from '@/services/auth/auth-provider';

import { syncNow as runSync, type SyncRunResult } from './sync-engine';

type SyncContextValue = {
  isEnabled: boolean;
  isSyncing: boolean;
  state: SyncRuntimeState;
  lastResult: SyncRunResult | null;
  syncNow: () => Promise<SyncRunResult>;
  refreshState: () => Promise<void>;
};

const emptyState: SyncRuntimeState = {
  lastAttemptAt: null,
  lastSuccessAt: null,
  lastError: null,
  pendingCount: 0,
};

const SyncContext = createContext<SyncContextValue>({
  isEnabled: false,
  isSyncing: false,
  state: emptyState,
  lastResult: null,
  syncNow: async () => ({
    status: 'disabled',
    pushed: 0,
    pulled: 0,
    conflicts: 0,
    pending: 0,
    message: null,
  }),
  refreshState: async () => undefined,
});

export function SyncProvider({ children }: PropsWithChildren) {
  const db = useSQLiteContext();
  const auth = useAuthIdentity();

  const [state, setState] = useState<SyncRuntimeState>(emptyState);
  const [lastResult, setLastResult] = useState<SyncRunResult | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const runningRef = useRef<Promise<SyncRunResult> | null>(null);

  const refreshState = useCallback(async () => {
    const [runtime, pendingCount] = await Promise.all([
      getSyncRuntimeState(db),
      countPendingSync(db),
    ]);

    setState({
      ...runtime,
      pendingCount,
    });
  }, [db]);

  const syncNow = useCallback(async () => {
    if (runningRef.current) {
      return runningRef.current;
    }

    const task = (async () => {
      setIsSyncing(true);

      try {
        const result = await runSync(db);
        setLastResult(result);
        await refreshState();
        return result;
      } finally {
        setIsSyncing(false);
        runningRef.current = null;
      }
    })();

    runningRef.current = task;
    return task;
  }, [db, refreshState]);

  useEffect(() => {
    let active = true;

    Promise.all([
      getSyncRuntimeState(db),
      countPendingSync(db),
    ]).then(([runtime, pendingCount]) => {
      if (!active) return;

      setState({
        ...runtime,
        pendingCount,
      });
    });

    return () => {
      active = false;
    };
  }, [db]);

  useEffect(() => {
    if (
      !supabaseConfig.syncEnabled ||
      !auth.isReady ||
      (auth.status !== 'anonymous' && auth.status !== 'permanent')
    ) {
      return;
    }

    syncNow().catch(() => undefined);
  }, [auth.isReady, auth.status, syncNow]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (
        nextState === 'active' &&
        supabaseConfig.syncEnabled &&
        (auth.status === 'anonymous' || auth.status === 'permanent')
      ) {
        syncNow().catch(() => undefined);
      }
    });

    return () => subscription.remove();
  }, [auth.status, syncNow]);

  const value = useMemo<SyncContextValue>(
    () => ({
      isEnabled: supabaseConfig.syncEnabled,
      isSyncing,
      state,
      lastResult,
      syncNow,
      refreshState,
    }),
    [isSyncing, lastResult, refreshState, state, syncNow]
  );

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export function useSyncStatus() {
  return useContext(SyncContext);
}
