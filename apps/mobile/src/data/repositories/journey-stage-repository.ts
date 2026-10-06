import * as Crypto from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

import type { JourneyStageId } from '@/domain/journey-path';

export type JourneyStageVisit = {
  stageId: JourneyStageId;
  firstVisitedAt: string;
  lastVisitedAt: string;
  visitCount: number;
};

type VisitRow = {
  stage_id: JourneyStageId;
  first_visited_at: string;
  last_visited_at: string;
  visit_count: number;
};

export async function recordJourneyStageVisit(
  db: SQLiteDatabase,
  journeyId: string,
  stageId: JourneyStageId
) {
  const journey = await db.getFirstAsync<{ owner_id: string }>(
    'SELECT owner_id FROM grief_journeys WHERE id = ? AND deleted_at IS NULL',
    journeyId
  );

  if (!journey) {
    throw new Error('No se encontró el camino activo.');
  }

  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO journey_stage_visits (
       id, owner_id, journey_id, stage_id,
       first_visited_at, last_visited_at, visit_count
     ) VALUES (?, ?, ?, ?, ?, ?, 1)
     ON CONFLICT(journey_id, stage_id)
     DO UPDATE SET
       last_visited_at = excluded.last_visited_at,
       visit_count = journey_stage_visits.visit_count + 1`,
    Crypto.randomUUID(),
    journey.owner_id,
    journeyId,
    stageId,
    now,
    now
  );
}

export async function listJourneyStageVisits(
  db: SQLiteDatabase,
  journeyId: string
): Promise<JourneyStageVisit[]> {
  const rows = await db.getAllAsync<VisitRow>(
    `SELECT stage_id, first_visited_at, last_visited_at, visit_count
       FROM journey_stage_visits
      WHERE journey_id = ?
      ORDER BY first_visited_at ASC`,
    journeyId
  );

  return rows.map((row) => ({
    stageId: row.stage_id,
    firstVisitedAt: row.first_visited_at,
    lastVisitedAt: row.last_visited_at,
    visitCount: row.visit_count,
  }));
}
