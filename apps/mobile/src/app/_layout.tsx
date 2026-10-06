import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { DatabaseProvider } from '@/data/database/database-provider';
import { colors } from '@/design/tokens';
import { AuthProvider } from '@/services/auth/auth-provider';

export default function RootLayout() {
  return (
    <DatabaseProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.cream },
            animation: 'fade',
          }}
        />
      </AuthProvider>
    </DatabaseProvider>
  );
}
