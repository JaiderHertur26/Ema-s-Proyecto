import type { SQLiteDatabase } from 'expo-sqlite';

import {
  attachRemoteUserId,
  getLocalIdentityProfile,
} from '@/data/repositories/profile-repository';

import { getSupabaseClient } from './supabase-client';

export type CloudIdentityStatus =
  | 'local_only'
  | 'anonymous'
  | 'permanent'
  | 'recovery_required'
  | 'identity_conflict';

export type CloudIdentityResult = {
  status: CloudIdentityStatus;
  remoteUserId: string | null;
  message: string | null;
};

async function reconcileRemoteUser(
  db: SQLiteDatabase,
  remoteUserId: string,
  isAnonymous: boolean
): Promise<CloudIdentityResult> {
  const attachResult = await attachRemoteUserId(db, remoteUserId);

  if (attachResult === 'conflict') {
    return {
      status: 'identity_conflict',
      remoteUserId: null,
      message:
        'La identidad remota no coincide con la que ya pertenece a este perfil local.',
    };
  }

  return {
    status: isAnonymous ? 'anonymous' : 'permanent',
    remoteUserId,
    message: null,
  };
}

export async function ensureCloudIdentity(
  db: SQLiteDatabase
): Promise<CloudIdentityResult> {
  const client = getSupabaseClient();

  if (!client) {
    return {
      status: 'local_only',
      remoteUserId: null,
      message: 'Supabase todavía no está configurado para EMAÚS.',
    };
  }

  const localProfile = await getLocalIdentityProfile(db);
  const {
    data: { session },
    error: sessionError,
  } = await client.auth.getSession();

  if (sessionError) {
    return {
      status: 'local_only',
      remoteUserId: localProfile.remoteUserId,
      message: sessionError.message,
    };
  }

  if (session?.user) {
    return reconcileRemoteUser(
      db,
      session.user.id,
      session.user.is_anonymous === true
    );
  }

  if (localProfile.remoteUserId) {
    return {
      status: 'recovery_required',
      remoteUserId: localProfile.remoteUserId,
      message:
        'El perfil local ya tiene una identidad remota, pero la sesión segura no está disponible.',
    };
  }

  const { data, error } = await client.auth.signInAnonymously();

  if (error || !data.user) {
    return {
      status: 'local_only',
      remoteUserId: null,
      message: error?.message ?? 'No fue posible crear la identidad anónima.',
    };
  }

  return reconcileRemoteUser(
    db,
    data.user.id,
    data.user.is_anonymous === true
  );
}
