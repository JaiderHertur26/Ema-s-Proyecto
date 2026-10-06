import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { DatabaseProvider } from '@/data/database/database-provider';
import { colors } from '@/design/tokens';

export default function RootLayout() {
  return (
    <DatabaseProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.cream },
          animation: 'fade',
        }}
      />
    </DatabaseProvider>
  );
}
