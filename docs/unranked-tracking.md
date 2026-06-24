# Unranked map tracking — data collection design (draft)

## The core difference

Ranked tracking is **leaderboard-driven**. osu! hosts a country leaderboard per
ranked map, so the app just *reads* the current #1:

```
RecentScoreJob (notices map changed)  ->  UpdateLazerBeatmapJob
    -> osu beatmaps/{id}/solo-scores?type=country
    -> AddScoreFromOsuResponse  (stores ONE active #1 per map, sniped_at chain)
```

Every existing assumption — "one row per beatmap with `sniped_at IS NULL`",
the `sniped_by_*` history chain, the pp leaderboard view — depends on that single
authoritative #1 coming from osu!.

**Unranked maps have no leaderboard endpoint.** We can't read a #1; we can only
*observe passes* as they show up in tracked players' recent scores and build the
leaderboard ourselves. So unranked tracking is **score-driven**:

| | Ranked (today) | Unranked (new) |
|---|---|---|
| Source of truth | osu! country leaderboard | passes seen in player recent scores |
| Rows per map | 1 active #1 + historic chain | top-10 per player, many players |
| Ranking metric | `pp` | `total_score` (unranked maps have **no pp**) |
| #1 | stored explicitly (`sniped_at`) | **derived** by querying |
| Snipes | yes | **no** (out of scope) |
| Versioning | n/a (ranked maps frozen) | md5 changes -> old scores set aside |

## Verified payload facts (probed against live API, June 2026)

The recent-scores endpoint (`/users/{id}/scores/recent`) returns **legacy-format**
scores by default, where an unranked pass has **`id: 0`** and **no `total_score`** —
unusable. Sending an **`x-api-version` header** (`20220705`+, use `20240529`)
switches it to the lazer `solo_score` format. For the *same* graveyard pass:

```jsonc
// with x-api-version: 20240529
{
  "id": 6941851177,            // real, unique solo-score id  (was 0 in legacy)
  "beatmap_id": 4566059,
  "ranked": false,
  "total_score": 679366,       // ranking metric  (absent in legacy)
  "classic_total_score": 6883591,
  "legacy_total_score": 3248864,
  "legacy_score_id": 0,        // unranked => no legacy id; do NOT key on this
  "pp": null,                  // unranked => never any pp
  "mods": [{"acronym":"CL"}],  // lazer objects (matches how the app stores mods)
  "statistics": {...}, "maximum_statistics": {...},
  "accuracy": 0.963063, "max_combo": 253, "is_perfect_combo": false,
  "ended_at": "2026-06-24T06:10:18Z", "passed": true, "ruleset_id": 0
}
```

The nested `beatmap` object carries **`checksum`** (md5) and the nested
`beatmapset` carries **`status`** — confirmed present — so we can branch
ranked/unranked and run the md5 check **without any extra API call**.

**Consequence:** with the header, an unranked pass arrives in the *exact shape
`AddScoreFromOsuResponse` already maps into `lazer_scores`*, with a real unique
`id`. The unranked path therefore reuses that column mapping almost verbatim and
only diverges on storage rules (keep top-10, rank by score, md5 versioning).

> **Action:** add `x-api-version: 20240529` to the recent-scores request in
> `UserBuilder::fetchScores()`. Side benefit: the ranked path's id comparison in
> `RecentScoreJob` (`$existing->id !== $score['id']`) currently compares a lazer id
> to a legacy id and never matches; the header normalizes both to the lazer id.
> Only `RecentScoreJob` consumes recent scores, and it uses `id` + `beatmap.id`,
> so the format switch is safe.

## Where collection hooks in

`RecentScoreJob::handle()` is the single collector (manual `!r` + the 15-min
online sweep via `update:online` -> `CheckRankingPageJob`). Today it loops a
player's recent passes and decides whether to refresh that map's country
leaderboard. Add a branch:

```php
foreach ($res['scores'] as $score) {
    if (! ($score['id'] ?? false)) continue;          // now safe: unranked has a real id w/ header
    if (\Cache::has("recent_score_{$score['id']}")) continue;

    $status = $score['beatmapset']['status'] ?? null; // ranked|approved|loved|qualified|pending|wip|graveyard

    if (in_array($status, ['pending', 'wip', 'graveyard'], true)) {
        dispatch(new RecordUnrankedPassJob($score))->onQueue('osu');   // NEW
    } else {
        // EXISTING ranked path — unchanged
        ... existing logic that dispatches UpdateLazerBeatmapJob ...
    }

    \Cache::put("recent_score_{$score['id']}", true, now()->addDay());
}
```

`include_fails=0` is already set, so we only ever see passes. (`ranked|approved|
loved|qualified` keep their leaderboard-driven path; only `pending|wip|graveyard`
are tracked as unranked.)

## Schema changes

### 1. Allow unranked beatmaps/sets to be stored

`AddBeatmapFromOsuResponse` currently hard-rejects anything not
`ranked|approved|loved` (line ~25), and unranked sets are never inserted. Add an
`allowUnranked` path so we can persist the beatmap row — we need its difficulty
attributes and, critically, its current **`checksum` (md5)**, which already exists
as a column. Persist `beatmap_sets.status` (already a column) so ranked-ness is a
local lookup.

### 2. New `unranked_scores` table

Recommended over reusing `lazer_scores`: the lazer table assumes one active
`sniped_at IS NULL` row per map and is read that way by the "Country #1s"
component and others. Unranked has many active rows per map and must not leak into
those queries. A separate table mirrors the lazer columns (reuse the mapping) but
isolates the rules:

```
id                 bigint PK        -- osu solo_score id (real, unique; natural dedupe)
user_id            bigint
beatmap_id         bigint
beatmapset_id      bigint
beatmap_checksum   string           -- md5 the score was set on   <-- key field
total_score        bigint           -- ranking metric
classic_total_score bigint
legacy_total_score bigint
accuracy           decimal
max_combo          int
mods               jsonb
rank               string
statistics         jsonb
maximum_statistics jsonb
is_perfect_combo   boolean
pp                 decimal nullable -- always null for unranked today; store if ever present
started_at         datetime nullable
ended_at           datetime
ruleset_id         int
created_at / updated_at

indexes:
  (beatmap_id, beatmap_checksum, total_score)  -- leaderboard + "worst score" lookup
  (beatmap_id, user_id)                         -- per-player cap
```

A score is "current-version valid" iff `beatmap_checksum == beatmaps.checksum`.
That comparison *is* the "invalidate on update" mechanism — no extra flag needed
(optional `stale boolean` only as a query convenience; md5 stays source of truth).

## Collection flow (per observed unranked pass)

`RecordUnrankedPassJob` / `RecordUnrankedPass` action:

```
1. id  = $score['id'];  bmId = $score['beatmap']['id'];  md5 = $score['beatmap']['checksum']

2. Resolve the beatmap — md5 short-circuit avoids refetching:
     local = Beatmap::find(bmId)
     if   !local                -> fetch beatmaps/{id}, upsert (allow unranked)
     elif local.checksum == md5 -> up to date, NO fetch            <-- common case
     else                       -> map UPDATED: fetch beatmaps/{id}, update row
                                   (new checksum + difficulty). Existing scores keep
                                   their old beatmap_checksum, so they stop matching
                                   beatmaps.checksum -> excluded from the current
                                   leaderboard but retained (old-version history).

3. Upsert player (same as ranked path).

4. Cap-aware insert for (user_id, bmId, md5):
     if exists(id) -> done (idempotent; PK + recent_score cache already guard this)
     mine = unranked_scores where beatmap_id=bmId, user_id, beatmap_checksum=md5
     if count(mine) >= 10:
         worst = min(mine.total_score)
         if new.total_score <= worst -> skip insert (cheap reject)
         else insert new, then delete worst
     else insert new
```

Storing md5 **on the score** makes step 2 robust: a score always carries the
version it was set on, so even if a player is first to hit a freshly-updated map,
we record the correct md5 and detect the change then.

### The cap

Per `(player, beatmap, current md5)`, keep **top 10 by `total_score`**; a better
score evicts that player's worst. Bounds growth to `10 × players × maps`. Old
versions (different md5) are kept as-is (map updates are rare; matches the
"iconic map" point) — revisit only if it ever grows.

## Deriving the unranked leaderboard / #1

Nothing is stored as "#1". It's a query:

```sql
-- current leaderboard for an unranked map (best per player, current version)
SELECT DISTINCT ON (user_id) *
FROM unranked_scores
WHERE beatmap_id = :id
  AND beatmap_checksum = (SELECT checksum FROM beatmaps WHERE id = :id)
ORDER BY user_id, total_score DESC;
-- then ORDER BY total_score DESC; row 1 = the unranked #1
```

No snipe detection, no Activity rows, no Discord embeds for unranked (out of
scope). Unranked scores never enter the pp `leaderboard` materialized view.

## Touch list

- `app/Services/Osu/Builders/UserBuilder.php` — add `x-api-version: 20240529` header.
- `app/Jobs/RecentScoreJob.php` — add the pending/wip/graveyard branch.
- `app/Actions/AddBeatmapFromOsuResponse.php` — allow unranked statuses (flagged).
- **new** `app/Jobs/RecordUnrankedPassJob.php` + `app/Actions/RecordUnrankedPass.php`.
- **new** migration: `unranked_scores` table (+ indexes).
- **new** `app/Models/UnrankedScore.php` (relations to Beatmap/Player).
- Display (later): a separate unranked leaderboard/profile section; does not reuse
  the "Country #1s" component (different semantics).

## Decisions locked

- Trackable-unranked statuses: **pending, wip, graveyard**.
- Ranking metric: **total_score** (no pp on unranked).
- Cap: **N = 10** per (player, map, version).
- **No snipe tracking** for unranked.
- Recent-scores payload carries id (with header) + beatmap.checksum +
  beatmapset.status — **verified live**, so the md5 short-circuit needs no fetch.
```
