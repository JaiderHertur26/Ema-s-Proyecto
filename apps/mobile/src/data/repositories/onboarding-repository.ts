import type { SQLiteDatabase } from 'expo-sqlite';

import type {
  DeathDatePrecision,
  Emotion,
  LossCircumstance,
  OnboardingDraft,
  Relationship,
} from '@/domain/types';

type DraftRow = {
  id: 'current';
  relationship: Relationship | null;
  name: string | null;
  death_date: string | null;
  death_date_precision: DeathDatePrecision | null;
  approximate_age: number | null;
  circumstance: LossCircumstance | null;
  current_emotion: Emotion | null;
  current_step: number;
  updated_at: string;
};

function mapDraft(row: DraftRow): OnboardingDraft {
  return {
    id: row.id,
    relationship: row.relationship,
    name: row.name,
    deathDate: row.death_date,
    deathDatePrecision: row.death_date_precision,
    approximateAge: row.approximate_age,
    circumstance: row.circumstance,
    currentEmotion: row.current_emotion,
    currentStep: row.current_step,
    updatedAt: row.updated_at,
  };
}

export async function getOnboardingDraft(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<DraftRow>(
    'SELECT * FROM onboarding_draft WHERE id = ?',
    'current'
  );

  return row ? mapDraft(row) : null;
}

export async function setOnboardingRelationship(
  db: SQLiteDatabase,
  relationship: Relationship
) {
  await db.runAsync(
    `UPDATE onboarding_draft
       SET relationship = ?, current_step = 1, updated_at = ?
     WHERE id = 'current'`,
    relationship,
    new Date().toISOString()
  );
}

export async function setOnboardingName(db: SQLiteDatabase, name: string | null) {
  await db.runAsync(
    `UPDATE onboarding_draft
       SET name = ?, current_step = 2, updated_at = ?
     WHERE id = 'current'`,
    name,
    new Date().toISOString()
  );
}

export async function setOnboardingDeathDate(
  db: SQLiteDatabase,
  deathDate: string | null,
  precision: DeathDatePrecision
) {
  await db.runAsync(
    `UPDATE onboarding_draft
       SET death_date = ?, death_date_precision = ?, current_step = 3, updated_at = ?
     WHERE id = 'current'`,
    deathDate,
    precision,
    new Date().toISOString()
  );
}

export async function setOnboardingDetails(
  db: SQLiteDatabase,
  approximateAge: number | null,
  circumstance: LossCircumstance | null
) {
  await db.runAsync(
    `UPDATE onboarding_draft
       SET approximate_age = ?, circumstance = ?, current_step = 4, updated_at = ?
     WHERE id = 'current'`,
    approximateAge,
    circumstance,
    new Date().toISOString()
  );
}

export async function setOnboardingEmotion(db: SQLiteDatabase, emotion: Emotion) {
  await db.runAsync(
    `UPDATE onboarding_draft
       SET current_emotion = ?, current_step = 6, updated_at = ?
     WHERE id = 'current'`,
    emotion,
    new Date().toISOString()
  );
}

export async function resetOnboardingDraft(db: SQLiteDatabase) {
  await db.runAsync(
    `UPDATE onboarding_draft
       SET relationship = NULL,
           name = NULL,
           death_date = NULL,
           death_date_precision = NULL,
           approximate_age = NULL,
           circumstance = NULL,
           current_emotion = NULL,
           current_step = 0,
           updated_at = ?
     WHERE id = 'current'`,
    new Date().toISOString()
  );
}
