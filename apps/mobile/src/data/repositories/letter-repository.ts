import * as Crypto from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

import { enqueueSync } from './sync-repository';

export type LetterRecord = {
  id: string;
  lovedOneId: string;
  body: string;
  prayerBody: string | null;
  createdAt: string;
  updatedAt: string;
};

type LetterRow = {
  id: string;
  loved_one_id: string;
  body: string;
  prayer_body: string | null;
  created_at: string;
  updated_at: string;
};

function mapLetter(row: LetterRow): LetterRecord {
  return {
    id: row.id,
    lovedOneId: row.loved_one_id,
    body: row.body,
    prayerBody: row.prayer_body,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function saveLetter(
  db: SQLiteDatabase,
  lovedOneId: string,
  body: string
): Promise<string> {
  const profile = await db.getFirstAsync<{ id: string }>('SELECT id FROM profiles LIMIT 1');
  if (!profile) {
    throw new Error('No existe un perfil local.');
  }

  const id = Crypto.randomUUID();
  const now = new Date().toISOString();

  await db.withExclusiveTransactionAsync(async (txn) => {
    await txn.runAsync(
      `INSERT INTO letters (
        id, owner_id, loved_one_id, body, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      id,
      profile.id,
      lovedOneId,
      body,
      now,
      now
    );

    await enqueueSync(txn, profile.id, 'letters', id, 'insert', {
      id,
      lovedOneId,
      body,
      prayerBody: null,
      createdAt: now,
      updatedAt: now,
    });
  });

  return id;
}

export async function getLetter(
  db: SQLiteDatabase,
  id: string
): Promise<LetterRecord | null> {
  const row = await db.getFirstAsync<LetterRow>(
    `SELECT id, loved_one_id, body, prayer_body, created_at, updated_at
       FROM letters
      WHERE id = ? AND deleted_at IS NULL`,
    id
  );

  return row ? mapLetter(row) : null;
}

export async function listLetters(
  db: SQLiteDatabase,
  lovedOneId: string
): Promise<LetterRecord[]> {
  const rows = await db.getAllAsync<LetterRow>(
    `SELECT id, loved_one_id, body, prayer_body, created_at, updated_at
       FROM letters
      WHERE loved_one_id = ? AND deleted_at IS NULL
      ORDER BY created_at DESC`,
    lovedOneId
  );

  return rows.map(mapLetter);
}

export async function updateLetterPrayer(
  db: SQLiteDatabase,
  id: string,
  prayerBody: string
) {
  const letter = await db.getFirstAsync<{ owner_id: string }>(
    'SELECT owner_id FROM letters WHERE id = ? AND deleted_at IS NULL',
    id
  );
  if (!letter) {
    throw new Error('No se encontró la carta.');
  }

  const now = new Date().toISOString();

  await db.withExclusiveTransactionAsync(async (txn) => {
    await txn.runAsync(
      'UPDATE letters SET prayer_body = ?, updated_at = ? WHERE id = ?',
      prayerBody,
      now,
      id
    );

    await enqueueSync(txn, letter.owner_id, 'letters', id, 'update', {
      id,
      prayerBody,
      updatedAt: now,
    });
  });
}
