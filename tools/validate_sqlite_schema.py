from __future__ import annotations

import re
import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MIGRATIONS = ROOT / "apps" / "mobile" / "src" / "data" / "database" / "migrations.ts"

text = MIGRATIONS.read_text(encoding="utf-8")
scripts = re.findall(r"sql:\s*\`(.*?)\`", text, flags=re.S)

if not scripts:
    raise SystemExit("No migration SQL blocks found.")

def apply_migrations(db: sqlite3.Connection, migration_scripts: list[str]) -> None:
    db.execute("PRAGMA foreign_keys = ON")
    for index, script in enumerate(migration_scripts, start=1):
        db.executescript(script)
        db.execute(f"PRAGMA user_version = {index}")

# Validación de instalación limpia.
db = sqlite3.connect(":memory:")
apply_migrations(db, scripts)

tables = [
    row[0]
    for row in db.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    )
]

indexes = [
    row[0]
    for row in db.execute(
        "SELECT name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    )
]

required_tables = {
    "profiles",
    "onboarding_draft",
    "loved_ones",
    "grief_journeys",
    "emotional_checkins",
    "memories",
    "letters",
    "support_contacts",
    "prayer_logs",
    "masses",
    "special_dates",
    "user_preferences",
    "content_cache",
    "sync_outbox",
    "sync_metadata",
    "journey_stage_visits",
}

missing = sorted(required_tables.difference(tables))
if missing:
    raise SystemExit(f"Missing required tables: {missing}")

draft = db.execute(
    "SELECT id, current_step FROM onboarding_draft WHERE id = 'current'"
).fetchone()

if draft != ("current", 0):
    raise SystemExit(f"Unexpected onboarding draft seed: {draft}")

# Validación de actualización V1 -> V2 conservando datos existentes.
if len(scripts) >= 2:
    upgrade = sqlite3.connect(":memory:")
    apply_migrations(upgrade, scripts[:1])

    upgrade.execute(
        "INSERT INTO profiles (id, created_at, updated_at) VALUES ('profile-test', '2026-01-01', '2026-01-01')"
    )
    upgrade.execute(
        """
        INSERT INTO loved_ones (
          id, owner_id, name, relationship, death_date,
          death_date_precision, created_at, updated_at
        ) VALUES (
          'loved-test', 'profile-test', 'Prueba', 'mother', '2026-01-01',
          'exact', '2026-01-01', '2026-01-01'
        )
        """
    )
    upgrade.execute(
        """
        INSERT INTO grief_journeys (
          id, owner_id, loved_one_id, started_at, active, created_at, updated_at
        ) VALUES (
          'journey-test', 'profile-test', 'loved-test',
          '2026-01-01', 1, '2026-01-01', '2026-01-01'
        )
        """
    )
    upgrade.commit()

    # Aplicar solo las migraciones pendientes.
    for index, script in enumerate(scripts[1:], start=2):
        upgrade.executescript(script)
        upgrade.execute(f"PRAGMA user_version = {index}")

    preserved = upgrade.execute(
        "SELECT name FROM loved_ones WHERE id = 'loved-test'"
    ).fetchone()
    if preserved != ("Prueba",):
        raise SystemExit("V1 -> V2 upgrade did not preserve existing loved_one data.")

    upgrade.execute(
        """
        INSERT INTO journey_stage_visits (
          id, owner_id, journey_id, stage_id,
          first_visited_at, last_visited_at, visit_count
        ) VALUES (
          'visit-test', 'profile-test', 'journey-test', 'first_days',
          '2026-01-01', '2026-01-01', 1
        )
        """
    )
    visit = upgrade.execute(
        "SELECT stage_id, visit_count FROM journey_stage_visits WHERE id = 'visit-test'"
    ).fetchone()

    if visit != ("first_days", 1):
        raise SystemExit(f"Unexpected stage visit after V2 migration: {visit}")

print(
    f"OK migrations={len(scripts)} tables={len(tables)} indexes={len(indexes)} "
    f"upgrade_v1_to_v2=OK"
)
print("TABLES:", ", ".join(tables))
