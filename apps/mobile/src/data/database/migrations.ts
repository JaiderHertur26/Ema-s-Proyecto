export type Migration = {
  version: number;
  sql: string;
};

export const migrations: Migration[] = [
  {
    version: 1,
    sql: `
      CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY NOT NULL,
        remote_user_id TEXT UNIQUE,
        display_name TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS onboarding_draft (
        id TEXT PRIMARY KEY NOT NULL CHECK (id = 'current'),
        relationship TEXT,
        name TEXT,
        death_date TEXT,
        death_date_precision TEXT,
        approximate_age INTEGER,
        circumstance TEXT,
        current_emotion TEXT,
        current_step INTEGER NOT NULL DEFAULT 0,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS loved_ones (
        id TEXT PRIMARY KEY NOT NULL,
        owner_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        name TEXT,
        relationship TEXT NOT NULL,
        birth_date TEXT,
        death_date TEXT,
        death_date_precision TEXT NOT NULL DEFAULT 'unknown',
        approximate_age INTEGER,
        circumstance TEXT,
        photo_uri TEXT,
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT
      );

      CREATE TABLE IF NOT EXISTS grief_journeys (
        id TEXT PRIMARY KEY NOT NULL,
        owner_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        loved_one_id TEXT NOT NULL REFERENCES loved_ones(id) ON DELETE CASCADE,
        started_at TEXT NOT NULL,
        active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
        last_checkin_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT
      );

      CREATE UNIQUE INDEX IF NOT EXISTS uq_active_journey_per_owner
        ON grief_journeys(owner_id)
        WHERE active = 1 AND deleted_at IS NULL;

      CREATE INDEX IF NOT EXISTS idx_journeys_loved_one
        ON grief_journeys(loved_one_id);

      CREATE TABLE IF NOT EXISTS emotional_checkins (
        id TEXT PRIMARY KEY NOT NULL,
        owner_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        journey_id TEXT NOT NULL REFERENCES grief_journeys(id) ON DELETE CASCADE,
        emotion TEXT NOT NULL,
        intensity TEXT NOT NULL,
        trigger TEXT,
        note TEXT,
        context TEXT NOT NULL,
        created_at TEXT NOT NULL,
        deleted_at TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_checkins_journey_created
        ON emotional_checkins(journey_id, created_at DESC);

      CREATE TABLE IF NOT EXISTS memories (
        id TEXT PRIMARY KEY NOT NULL,
        owner_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        loved_one_id TEXT NOT NULL REFERENCES loved_ones(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        title TEXT,
        content TEXT,
        media_uri TEXT,
        memory_date TEXT,
        category TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_memories_loved_one
        ON memories(loved_one_id, created_at DESC);

      CREATE TABLE IF NOT EXISTS letters (
        id TEXT PRIMARY KEY NOT NULL,
        owner_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        loved_one_id TEXT NOT NULL REFERENCES loved_ones(id) ON DELETE CASCADE,
        body TEXT NOT NULL,
        prayer_body TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT
      );

      CREATE TABLE IF NOT EXISTS support_contacts (
        id TEXT PRIMARY KEY NOT NULL,
        owner_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        relationship TEXT,
        phone TEXT,
        support_type TEXT,
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT
      );

      CREATE TABLE IF NOT EXISTS prayer_logs (
        id TEXT PRIMARY KEY NOT NULL,
        owner_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        loved_one_id TEXT REFERENCES loved_ones(id) ON DELETE SET NULL,
        prayer_type TEXT NOT NULL,
        note TEXT,
        offered_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        deleted_at TEXT
      );

      CREATE TABLE IF NOT EXISTS masses (
        id TEXT PRIMARY KEY NOT NULL,
        owner_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        loved_one_id TEXT REFERENCES loved_ones(id) ON DELETE SET NULL,
        mass_date TEXT NOT NULL,
        parish TEXT,
        intention TEXT,
        note TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT
      );

      CREATE TABLE IF NOT EXISTS special_dates (
        id TEXT PRIMARY KEY NOT NULL,
        owner_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        loved_one_id TEXT NOT NULL REFERENCES loved_ones(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        date TEXT NOT NULL,
        label TEXT,
        notify INTEGER NOT NULL DEFAULT 1 CHECK (notify IN (0, 1)),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_special_dates_date
        ON special_dates(owner_id, date);

      CREATE TABLE IF NOT EXISTS user_preferences (
        owner_id TEXT PRIMARY KEY NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        show_time_since_loss INTEGER NOT NULL DEFAULT 1 CHECK (show_time_since_loss IN (0, 1)),
        daily_notifications INTEGER NOT NULL DEFAULT 0 CHECK (daily_notifications IN (0, 1)),
        special_date_notifications INTEGER NOT NULL DEFAULT 1 CHECK (special_date_notifications IN (0, 1)),
        biometric_lock INTEGER NOT NULL DEFAULT 0 CHECK (biometric_lock IN (0, 1)),
        locale TEXT NOT NULL DEFAULT 'es-CO',
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS content_cache (
        content_id TEXT NOT NULL,
        locale TEXT NOT NULL,
        version INTEGER NOT NULL,
        content_type TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        published_at TEXT,
        cached_at TEXT NOT NULL,
        PRIMARY KEY (content_id, locale)
      );

      CREATE TABLE IF NOT EXISTS sync_outbox (
        id TEXT PRIMARY KEY NOT NULL,
        owner_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
        entity_table TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        operation TEXT NOT NULL,
        payload_json TEXT,
        attempt_count INTEGER NOT NULL DEFAULT 0,
        last_error TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_sync_outbox_created
        ON sync_outbox(created_at);

      CREATE TABLE IF NOT EXISTS sync_metadata (
        entity_table TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        local_updated_at TEXT,
        remote_updated_at TEXT,
        sync_state TEXT NOT NULL DEFAULT 'pending',
        PRIMARY KEY (entity_table, entity_id)
      );

      INSERT OR IGNORE INTO onboarding_draft (
        id,
        updated_at
      ) VALUES (
        'current',
        strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
      );
    `,
  },
  {
    version: 2,
    sql: `
      CREATE TABLE IF NOT EXISTS journey_stage_visits (
        id TEXT PRIMARY KEY NOT NULL,
        owner_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        journey_id TEXT NOT NULL REFERENCES grief_journeys(id) ON DELETE CASCADE,
        stage_id TEXT NOT NULL,
        first_visited_at TEXT NOT NULL,
        last_visited_at TEXT NOT NULL,
        visit_count INTEGER NOT NULL DEFAULT 1 CHECK (visit_count >= 1),
        UNIQUE (journey_id, stage_id)
      );

      CREATE INDEX IF NOT EXISTS idx_stage_visits_journey
        ON journey_stage_visits(journey_id, last_visited_at DESC);
    `,
  },
  {
    version: 3,
    sql: `
      CREATE TABLE IF NOT EXISTS sync_runtime_state (
        id TEXT PRIMARY KEY NOT NULL CHECK (id = 'current'),
        last_attempt_at TEXT,
        last_success_at TEXT,
        last_error TEXT,
        pending_count INTEGER NOT NULL DEFAULT 0 CHECK (pending_count >= 0),
        updated_at TEXT NOT NULL
      );

      INSERT OR IGNORE INTO sync_runtime_state (
        id,
        pending_count,
        updated_at
      ) VALUES (
        'current',
        0,
        strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
      );

      CREATE INDEX IF NOT EXISTS idx_sync_outbox_entity
        ON sync_outbox(entity_table, entity_id, created_at);

      CREATE TABLE IF NOT EXISTS sync_conflicts (
        id TEXT PRIMARY KEY NOT NULL,
        entity_table TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        local_payload_json TEXT NOT NULL,
        remote_payload_json TEXT NOT NULL,
        detected_at TEXT NOT NULL,
        resolved_at TEXT,
        resolution TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_sync_conflicts_entity
        ON sync_conflicts(entity_table, entity_id, detected_at DESC);
    `,
  },
  {
    version: 4,
    sql: `
      ALTER TABLE memories ADD COLUMN media_object_path TEXT;
      ALTER TABLE memories ADD COLUMN media_mime_type TEXT;
      ALTER TABLE memories ADD COLUMN media_size_bytes INTEGER
        CHECK (media_size_bytes IS NULL OR media_size_bytes >= 0);

      CREATE INDEX IF NOT EXISTS idx_memories_media_object_path
        ON memories(media_object_path)
        WHERE media_object_path IS NOT NULL;
    `,
  },
  {
    version: 5,
    sql: `
      ALTER TABLE user_preferences
        ADD COLUMN protect_screen_capture INTEGER NOT NULL DEFAULT 0
        CHECK (protect_screen_capture IN (0, 1));
    `,
  },
  {
    version: 6,
    sql: `
      ALTER TABLE user_preferences
        ADD COLUMN daily_notification_hour INTEGER NOT NULL DEFAULT 8
        CHECK (daily_notification_hour BETWEEN 0 AND 23);

      ALTER TABLE user_preferences
        ADD COLUMN daily_notification_minute INTEGER NOT NULL DEFAULT 0
        CHECK (daily_notification_minute BETWEEN 0 AND 59);

      ALTER TABLE user_preferences
        ADD COLUMN notification_show_loved_one_name INTEGER NOT NULL DEFAULT 0
        CHECK (notification_show_loved_one_name IN (0, 1));

      UPDATE user_preferences
         SET special_date_notifications = 0;
    `,
  },
];
