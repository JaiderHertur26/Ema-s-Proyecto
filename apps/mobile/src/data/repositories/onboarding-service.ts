import * as Crypto from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

import type { EmotionalCheckin } from '@/domain/types';

import { getOnboardingDraft, resetOnboardingDraft } from './onboarding-repository';
import { enqueueSync } from './sync-repository';

function getCheckinContext(): EmotionalCheckin['context'] {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  if (hour < 23) return 'night';
  return 'spontaneous';
}

export async function completeOnboarding(db: SQLiteDatabase) {
  const draft = await getOnboardingDraft(db);
  if (!draft?.relationship || !draft.deathDatePrecision) {
    throw new Error('El onboarding está incompleto.');
  }

  const profile = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM profiles LIMIT 1'
  );
  if (!profile) {
    throw new Error('No existe un perfil local.');
  }

  const lovedOneId = Crypto.randomUUID();
  const journeyId = Crypto.randomUUID();
  const checkinId = draft.currentEmotion ? Crypto.randomUUID() : null;
  const now = new Date().toISOString();

  await db.withExclusiveTransactionAsync(async (txn) => {
    await txn.runAsync(
      `UPDATE grief_journeys
         SET active = 0, updated_at = ?
       WHERE owner_id = ? AND active = 1 AND deleted_at IS NULL`,
      now,
      profile.id
    );

    await txn.runAsync(
      `INSERT INTO loved_ones (
        id, owner_id, name, relationship, death_date, death_date_precision,
        approximate_age, circumstance, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      lovedOneId,
      profile.id,
      draft.name,
      draft.relationship,
      draft.deathDate,
      draft.deathDatePrecision,
      draft.approximateAge,
      draft.circumstance,
      now,
      now
    );

    await txn.runAsync(
      `INSERT INTO grief_journeys (
        id, owner_id, loved_one_id, started_at,
        active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 1, ?, ?)`,
      journeyId,
      profile.id,
      lovedOneId,
      now,
      now,
      now
    );

    if (draft.currentEmotion && checkinId) {
      await txn.runAsync(
        `INSERT INTO emotional_checkins (
          id, owner_id, journey_id, emotion,
          intensity, context, created_at
        ) VALUES (?, ?, ?, ?, 'unknown', ?, ?)`,
        checkinId,
        profile.id,
        journeyId,
        draft.currentEmotion,
        getCheckinContext(),
        now
      );
    }

    await enqueueSync(txn, profile.id, 'loved_ones', lovedOneId, 'insert', {
      id: lovedOneId,
      name: draft.name,
      relationship: draft.relationship,
      deathDate: draft.deathDate,
      deathDatePrecision: draft.deathDatePrecision,
      approximateAge: draft.approximateAge,
      circumstance: draft.circumstance,
      createdAt: now,
      updatedAt: now,
    });

    await enqueueSync(txn, profile.id, 'grief_journeys', journeyId, 'insert', {
      id: journeyId,
      lovedOneId,
      startedAt: now,
      active: true,
      createdAt: now,
      updatedAt: now,
    });

    if (draft.currentEmotion && checkinId) {
      await enqueueSync(
        txn,
        profile.id,
        'emotional_checkins',
        checkinId,
        'insert',
        {
          id: checkinId,
          journeyId,
          emotion: draft.currentEmotion,
          intensity: 'unknown',
          context: getCheckinContext(),
          createdAt: now,
        }
      );
    }
  });

  await resetOnboardingDraft(db);

  return { lovedOneId, journeyId };
}
