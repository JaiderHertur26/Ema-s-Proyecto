import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

const subscribe = () => () => {};

/**
 * Keeps the server/static render stable as light, then reads the real client color scheme
 * after hydration without triggering state from an effect.
 */
export function useColorScheme() {
  const hasHydrated = useSyncExternalStore(subscribe, () => true, () => false);
  const colorScheme = useRNColorScheme();

  return hasHydrated ? colorScheme : 'light';
}
