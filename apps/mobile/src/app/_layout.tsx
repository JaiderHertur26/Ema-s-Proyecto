import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { DatabaseProvider } from '@/data/database/database-provider';
import { colors } from '@/design/tokens';
import { AuthProvider } from '@/services/auth/auth-provider';
import { AppSecurityGate } from '@/services/security/app-security-gate';
import { SecurityProvider } from '@/services/security/security-provider';
import { SyncProvider } from '@/services/sync/sync-provider';

export default function RootLayout() {
  return (
    <DatabaseProvider>
      <SecurityProvider>
        <AuthProvider>
          <SyncProvider>
            <AppSecurityGate>
              <StatusBar style="dark" />
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: colors.cream },
                  animation: 'fade',
                }}
              />
            </AppSecurityGate>
          </SyncProvider>
        </AuthProvider>
      </SecurityProvider>
    </DatabaseProvider>
  );
}
