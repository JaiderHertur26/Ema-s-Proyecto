import * as Crypto from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

import type { Emotion, EmotionIntensity, EmotionalCheckin } from '@/domain/types';

import { enqueueSync } from './sync-repository';

function getContext(): EmotionalCheckin['context'] {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  if (hour < 23) return 'night';
  return 'spontaneous';
}

export async function addEmotionalCheckin(
  db: SQLiteDatabase,
  journeyId: string,
  emotion: Emotion,
  intensity: EmotionIntensity = 'unknown'
) {
  const journey = await db.getFirstAsync<{ owner_id: string }>(
    'SELECT owner_id FROM grief_journeys WHERE id = ? AND deleted_at IS NULL',
    journeyId
  );

  if (!journey) {
    throw new Error('No se encontró el camino activo.');
  }

  const id = Crypto.randomUUID();
  const now = new Date().toISOString();
  const context = getContext();

  await db.withExclusiveTransactionAsync(async (txn) => {
    await txn.runAsync(
      `INSERT INTO emotional_checkins (
        id, owner_id, journey_id, emotion, intensity, context, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      id,
      journey.owner_id,
      journeyId,
      emotion,
      intensity,
      context,
      now
    );

    await txn.runAsync(
      'UPDATE grief_journeys SET last_checkin_at = ?, updated_at = ? WHERE id = ?',
      now,
      now,
      journeyId
    );

    await enqueueSync(txn, journey.owner_id, 'emotional_checkins', id, 'insert', {
      id,
      journeyId,
      emotion,
      intensity,
      context,
      createdAt: now,
    });

    await enqueueSync(txn, journey.owner_id, 'grief_journeys', journeyId, 'update', {
      id: journeyId,
      lastCheckinAt: now,
      updatedAt: now,
    });
  });

  return id;
}

export async function getLatestEmotionalCheckin(
  db: SQLiteDatabase,
  journeyId: string
): Promise<Pick<EmotionalCheckin, 'emotion' | 'intensity' | 'createdAt'> | null> {
  const row = await db.getFirstAsync<{
    emotion: Emotion;
    intensity: EmotionIntensity;
    created_at: string;
  }>(
    `SELECT emotion, intensity, created_at
       FROM emotional_checkins
      WHERE journey_id = ? AND deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT 1`,
    journeyId
  );

  if (!row) return null;

  return {
    emotion: row.emotion,
    intensity: row.intensity,
    createdAt: row.created_at,
  };
}
