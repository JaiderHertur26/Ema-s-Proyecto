import type { SQLiteDatabase } from 'expo-sqlite';

import type { DeathDatePrecision, Relationship } from '@/domain/types';

export type ActiveJourneySummary = {
  journeyId: string;
  lovedOneId: string;
  name: string | null;
  relationship: Relationship;
  deathDate: string | null;
  deathDatePrecision: DeathDatePrecision;
  startedAt: string;
};

type ActiveJourneyRow = {
  journey_id: string;
  loved_one_id: string;
  name: string | null;
  relationship: Relationship;
  death_date: string | null;
  death_date_precision: DeathDatePrecision;
  started_at: string;
};

export async function getActiveJourneySummary(
  db: SQLiteDatabase
): Promise<ActiveJourneySummary | null> {
  const row = await db.getFirstAsync<ActiveJourneyRow>(
    `SELECT
       g.id AS journey_id,
       g.loved_one_id,
       l.name,
       l.relationship,
       l.death_date,
       l.death_date_precision,
       g.started_at
     FROM grief_journeys g
     INNER JOIN loved_ones l ON l.id = g.loved_one_id
     WHERE g.active = 1
       AND g.deleted_at IS NULL
       AND l.deleted_at IS NULL
     ORDER BY g.created_at DESC
     LIMIT 1`
  );

  if (!row) return null;

  return {
    journeyId: row.journey_id,
    lovedOneId: row.loved_one_id,
    name: row.name,
    relationship: row.relationship,
    deathDate: row.death_date,
    deathDatePrecision: row.death_date_precision,
    startedAt: row.started_at,
  };
}
