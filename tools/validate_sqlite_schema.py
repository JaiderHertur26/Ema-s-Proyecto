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

db = sqlite3.connect(":memory:")
db.execute("PRAGMA foreign_keys = ON")

for index, script in enumerate(scripts, start=1):
    db.executescript(script)
    db.execute(f"PRAGMA user_version = {index}")

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
}

missing = sorted(required_tables.difference(tables))
if missing:
    raise SystemExit(f"Missing required tables: {missing}")

draft = db.execute(
    "SELECT id, current_step FROM onboarding_draft WHERE id = 'current'"
).fetchone()

if draft != ("current", 0):
    raise SystemExit(f"Unexpected onboarding draft seed: {draft}")

print(f"OK migrations={len(scripts)} tables={len(tables)} indexes={len(indexes)}")
print("TABLES:", ", ".join(tables))
