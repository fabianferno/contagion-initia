# Contagion — Game Design

A persistent, real-time, multiplayer social-deduction game played in the
browser. Players join a shared isometric map as dots. One player is
secretly patient zero. Infection spreads silently through proximity.
Players collect cure fragments, defend against waves of mobs, test at
camps to prove their health, and vote-kick suspects. Every health test
is auto-signed to an Initia Minimove appchain as a timestamped
attestation, turning "when did you last test?" from vibes into on-chain
truth.

This document is the single source of truth for game design. For
implementation pointers, see `CLAUDE.md`. For the on-chain logic, see
`contagion/sources/attestations.move`. For runtime constants, see the
top of `contagion-frontend/server/index.ts`.

---

## 1. Core Game Loop

The 30-second pitch: One persistent room. Everyone drops in as a dot on
a shared 2D isometric map. One player is secretly patient zero.
Infection spreads when an infected player presses Q near a healthy one.
Healthy players race to collect 5 cure fragments while surviving mob
waves and identifying the infected. Infected players want to spread and
hide.

### 1.1 Player Lifecycle

- **Join:** Player enters and is assigned a random `Adjective + Animal`
  name (e.g., `CrimsonBadger`, `SilentOwl`). They appear on the
  isometric map as a dot.
- **Play:** Move with WASD. Collect cure fragments. Defend farm patches
  from mobs. Investigate other players. Visit a testing camp.
  Accuse suspicious players.
- **Death & Respawn:** If vote-kicked, the player's true infection
  status is publicly revealed and they are killed. They respawn
  immediately near the map center with a new random name, healthy, with
  no link to their previous identity. Their old name persists in other
  players' proximity logs.

### 1.2 Game State

- **Public:** All player positions (real-time), names, vote results,
  eliminations, cure-fragment locations, mob positions, farm health,
  the leaderboard.
- **Private (per player):** Infection status. The infected player knows
  the moment they are infected. Healthy players can only confirm their
  status by testing at a camp.

> **Key principle:** Position is **public**. Infection status is
> **private**. This asymmetry is what makes the game social.

---

## 2. Infection Mechanics

### 2.1 Patient Zero Selection

- A game starts when **2+ players** are present
  (`MIN_PLAYERS_TO_START = 2`).
- Patient zero is selected randomly server-side once **3+ players** are
  present (`MIN_PLAYERS_FOR_PZ = 3`).
- The selected player is notified privately. No other player or system
  component is told.
- After selection, patient zero has a **5–10 second incubation window**
  (`INCUBATION_TICKS_MIN = 25`, `MAX = 50` at 5 ticks/sec) before they
  can spread.
- If all infected are vote-kicked and 3+ healthy players remain, the
  server selects a new patient zero.

### 2.2 How Infection Spreads (Active, Not Passive)

- Infection does **not** spread passively by standing near someone.
- An infected player presses **Q** to attempt to infect anyone within
  `INFECTION_RADIUS = 3` tiles. The hit is immediate and per-target.
- The newly infected player is notified instantly. Their goal flips
  from survival to spreading and hiding.
- The infected player earns `POINTS_PER_INFECTION = 15` per successful
  spread.

### 2.3 Infected vs. Healthy Behavior

**Infected:**
- Goal flips from survival to spreading and avoiding detection.
- Should act normal: collect fragments (note: cannot, see §3.2),
  accuse others, move casually.
- Cure-fragment collection is blocked, so infected need plausible
  reasons to be near healthy players — defending farms, walking to a
  test camp to bluff a stale proof, accusing.
- Can deflect by accusing healthy players.

**Healthy:**
- Survive, collect cure fragments, avoid suspected infected.
- Use proximity logs to trace contact chains. If a killed-and-revealed
  infected name appears in someone's proximity list, that player
  becomes a suspect.
- Test at a camp to mint a fresh, on-chain timestamped proof.
- Accuse carefully — failed accusations cost points.

---

## 3. The Map

A bounded isometric 2D grid. Three landmark types:

### 3.1 Testing Camps

- **3 camps per game.** One is anchored at a fantasy-house door
  (`60, 64`); one near map center; one randomly placed.
- Players must walk within `TEST_CAMP_RADIUS = 3` tiles to interact.
- Triggering a test asks the server to assemble a commitment, which is
  auto-signed to the appchain (see §7).
- Cooldown: `TEST_COOLDOWN_TICKS = 300` (60 seconds at 5 ticks/sec).
- The test result (`HEALTHY` or `INFECTED`) is **private** to the
  tester. They can choose to flash it publicly above their head.
- Design tension: camps are positioned in high-traffic zones so
  travelling to test exposes you to infection attempts.

### 3.2 Cure Fragments (Win Condition)

- **10 fragments** spawn across the map at game start
  (`CURE_FRAGMENT_COUNT = 10`).
- Only **healthy** players can collect them. Infected players cannot
  pick them up — this is a strong silent tell if observers notice
  someone walking through fragments without the count going up.
- Pickup requires being within `COLLECT_RADIUS = 1` tile.
- **Win:** the first healthy player to collect
  `CURE_FRAGMENTS_TO_WIN = 5` fragments wins the round. The win
  triggers a leaderboard event but the room continues.

### 3.3 Farm Patches & Wave Defense

- 3–5 large vegetable patches spawn radially around the map center each
  wave, each with **150 HP**.
- A wave starts ~5 seconds after the first eligible game state
  (`nextWaveTime = tick + 25`).
- Mobs target farms by default and aggro onto players within a
  10-tile radius.
- Mob count per wave: `8 + (3 × waveNumber) + (1 × extraPlayers)`.
- Mob types (HP / speed multiplier / damage):
  - **Normal** — 30 / 1× / 5
  - **Fast** — 15 / 2× / 3
  - **Tank** — 60 / 0.5× / 10
  - **Swarm** — 10 / 1.5× / 2
- Killing a mob: **+10 points**.
- If all farm patches are destroyed, every player loses **20% of
  their score** as a wave-failure penalty.
- Wave defense gives infected players a legitimate reason to fight
  alongside healthy players, providing cover and proximity.

---

## 4. Player Actions

### 4.1 Move

WASD movement. Position is always public.

### 4.2 Test Yourself (at a Testing Camp)

- Walk within 3 tiles of any camp.
- Server generates a random 31-byte nonce and computes a commitment
  hash: `SHA-256(playerIdHash : tick : status : nonce)`.
- Client auto-signs a Move `record_attestation` call carrying
  `(session_id, tick, status, commitment)` to the appchain (see §7).
- Cooldown: 60 seconds between tests.
- The result is private until the player chooses to flash it.

### 4.3 View Proximity List

- Click any player to see their last `PROXIMITY_LOG_SIZE = 6`
  proximate names.
- Names are added every tick for any player within `INFECTION_RADIUS`.
- **Dead names persist.** If `CrimsonBadger` was killed and revealed
  infected, and `SilentOwl` has `CrimsonBadger` in their log,
  `SilentOwl` is a suspect.
- This is the primary investigation mechanic.

### 4.4 Accuse & Vote

- Click a player and start an accusation.
- The accused player's most recent attestation (status + tick) is
  displayed above their head. If they have no attestation, that is
  shown too.
- Vote duration: `VOTE_DURATION_TICKS = 75` (15 seconds), or resolves
  immediately if every active player has voted.
- Threshold: **30%** of active players must vote yes
  (`VOTE_THRESHOLD_PCT = 0.30`) to kick. On kick, the accused's true
  status is revealed publicly and they respawn with a new name.
- **Successful accusation (kick + target was infected):** accuser
  gains `POINTS_SUCCESSFUL_ACCUSE = 25`.
- **Failed accusation (vote does not pass, or target was healthy):**
  accuser loses `POINTS_FAILED_ACCUSE_PENALTY = 10` and is on
  cooldown for `ACCUSE_COOLDOWN_TICKS = 300` (60 seconds).

### 4.5 Spread Infection (Q key, infected only)

Press Q to attempt to infect every healthy player within
`INFECTION_RADIUS = 3`. Awards 15 points per successful infection.

### 4.6 Collect Cure Fragments

Walk within 1 tile of a fragment. Healthy only.

---

## 5. Scoring

| Action                                       | Who          | Points        |
| -------------------------------------------- | ------------ | ------------- |
| Staying alive (per tick)                     | Healthy      | +1            |
| Successful accusation (kicked an infected)   | Accuser      | +25           |
| Failed accusation                            | Accuser      | −10           |
| Infecting another player                     | Infected     | +15           |
| Killing a wave mob                           | Any          | +10           |
| Wave failure (all farms destroyed)           | All players  | −20% of score |
| Collecting cure fragments toward win         | Healthy      | (win bonus)   |

Points carry across lives (respawns). The leaderboard is always
visible.

---

## 6. Social Dynamics

The mechanics are simple. The depth is behavioral:

- **Proximity history is public.** A killed-infected name in someone's
  log is the social pressure ignition point.
- **Test staleness creates tension.** A proof from 10 seconds ago
  carries strong weight. A proof from 90 seconds ago — while standing
  in a crowd — means very little. Never tested = strong signal, but
  ambiguous (maybe they just haven't reached a camp).
- **No proof is a signal, not proof.** Ambiguity is the game.
- **Infected act normal.** They defend farms, walk to camps, accuse.
  Cure fragments they walk past unpicked are the one silent tell — if
  anyone is watching closely.
- **The infection graph is hidden but deducible.** If A was revealed
  infected and A was near B and C, then B and C are suspects. The
  deduction tree gets messy fast.
- **Respawn breaks identity but not chains.** A killed player returns
  with a new name. Old names linger in proximity logs, so contact
  trails remain traceable.
- **Farm waves force movement.** Nobody can camp safely. Infected get
  legitimate cover; healthy must take risks for points.

---

## 7. On-Chain Attestations

This is the trustless layer. Scope is **deliberately narrow**: the
chain stores signed records of "player P claimed status S at tick T",
nothing else. Position, infection spread, voting, scoring, and
proximity tracking are all server-authoritative.

### 7.1 What Happens at a Test Camp

1. Client requests a test from the server.
2. Server returns `(playerIdHash, tick, status, nonce)` where `nonce`
   is a fresh 31-byte random value.
3. Client computes `commitment = SHA-256(playerIdHash:tick:status:nonce)`.
4. Client auto-signs a Move `MsgExecute` calling
   `contagion::attestations::record_attestation(session_id, tick,
   status, commitment)` via `requestTxSync` from
   `@initia/interwovenkit-react`. Auto-sign means no wallet popup.
5. The Move module appends the record to the player's `Ledger`
   resource, increments per-player and global healthy/infected
   counters, and emits the tx hash. The HUD shows the hash.

### 7.2 Why On-Chain

- The server cannot retroactively rewrite a player's claimed history;
  every attestation is timestamped, signed, and public.
- Other players see the attestation tick, so they can judge staleness.
- The commitment hides the nonce, so the proof reveals the status only
  when the holder chooses to surface it via UI.

### 7.3 What Is *Not* On-Chain

| Mechanic                  | Handled by | Rationale                                |
| ------------------------- | ---------- | ---------------------------------------- |
| Patient zero selection    | Server     | Random; trust acceptable.                |
| Infection spread (Q key)  | Server     | Real-time; latency-sensitive.            |
| Proximity tracking        | Server     | Rolling buffer per player.               |
| Voting & accusations      | Server     | Tally is straightforward.                |
| Cure-fragment / orb logic | Server     | Not trust-sensitive.                     |
| Wave / mob / farm logic   | Server     | Not trust-sensitive.                     |
| Respawn / name assignment | Server     | Random; no linkage needed.               |

> **Note:** The current implementation uses a SHA-256 commitment + Move
> attestation, not a SNARK. The design intentionally keeps the trust
> surface tiny; a future iteration could swap the commitment for a ZK
> proof without changing the rest of the system.

---

## 8. Technical Architecture

Three layers:

| Layer                | Responsibility                                                                  | Trust Level                          |
| -------------------- | ------------------------------------------------------------------------------- | ------------------------------------ |
| Client (browser)     | Isometric rendering, input, ZK-style commitment + auto-sign of attestations     | Untrusted (signatures verified)      |
| Game server (Bun)    | Real-time position sync, infection spread, proximity, voting, scoring, waves   | Trusted (server-authoritative)       |
| Initia appchain      | Stores `Ledger` and `Stats` resources with per-player attestation history       | Trustless (cryptographic settlement) |

### 8.1 Stack (As Built)

| Component        | Tool                                                |
| ---------------- | --------------------------------------------------- |
| Frontend         | Vite + React + custom isometric canvas              |
| Game server      | Bun WebSocket server (`server/index.ts`)            |
| Wallet / signing | `@initia/interwovenkit-react` with auto-sign        |
| On-chain layer   | Initia Minimove rollup, `contagion` Move package    |
| State            | In-memory on the server (no DB)                     |

### 8.2 Key WebSocket Events

| Event              | Direction                       | Payload                                                        |
| ------------------ | ------------------------------- | -------------------------------------------------------------- |
| `player:join`      | Client → Server                 | New connection; server assigns name.                           |
| `player:move`      | Client → Server                 | `{ x, y }` position update.                                    |
| `state:sync`       | Server → Client                 | All positions, fragments, mobs, farms, votes.                  |
| `infection:notify` | Server → Client (private)       | "You are infected".                                            |
| `infect_nearby`    | Client → Server (infected only) | Q-key spread attempt.                                          |
| `test:request`     | Client → Server                 | Player at a camp wants an attestation.                         |
| `test:proof`       | Server → Client (private)       | `(playerIdHash, tick, status, nonce)` for client to sign.      |
| `player:inspect`   | Client → Server                 | Request a target's proximity list.                             |
| `accuse:start`     | Client → Server                 | Begin accusation against target.                               |
| `vote:cast`        | Client → Server                 | Yes/no on active vote.                                         |
| `vote:result`      | Server → All                    | Outcome + accused's most recent attestation.                   |
| `player:killed`    | Server → All                    | Elimination + true status revealed.                            |
| `player:respawn`   | Server → Client (private)       | New name, healthy.                                             |
| `fragment:collect` | Client → Server                 | Cure-fragment pickup attempt.                                  |
| `wave:start`       | Server → All                    | New wave + mob spawn locations.                                |
| `mob:update`       | Server → All                    | Mob positions, HP, deaths.                                     |

---

## 9. Data Model

### 9.1 Player

| Field           | Type                                       | Notes                                 |
| --------------- | ------------------------------------------ | ------------------------------------- |
| `id`            | string (UUID)                              | Per session.                          |
| `name`          | string                                     | Random `Adjective+Animal`.            |
| `position`      | `{ x, y }`                                 | Real-time, public.                    |
| `isInfected`    | boolean                                    | Server-side private.                  |
| `infectedAt`    | `number \| null`                           | Tick of infection.                    |
| `lastProof`     | `{ status, tick, commitment, txHash }`     | Latest attestation.                   |
| `lastTestTick`  | number                                     | For 60s cooldown.                     |
| `proximityLog`  | `string[]` (max 6)                         | Rolling list.                         |
| `points`        | number                                     | Cumulative across lives.              |
| `isAlive`       | boolean                                    | False between death and respawn.      |
| `cureFragments` | number                                     | Healthy collection counter.           |

### 9.2 Game

| Field                 | Type                                                       | Notes                              |
| --------------------- | ---------------------------------------------------------- | ---------------------------------- |
| `players`             | `Map<id, Player>`                                          |                                    |
| `cureFragments`       | `Array<{ x, y, collected }>`                               | 10 spawned at start.               |
| `testCamps`           | `Array<{ x, y }>`                                          | 3 fixed/random spots.              |
| `farms`               | `Array<{ x, y, hp }>`                                      | 3–5 per wave, 150 HP each.         |
| `mobs`                | `Array<{ id, x, y, hp, type, target }>`                    |                                    |
| `currentTick`         | number                                                     | 5 ticks/sec.                       |
| `waveNumber`          | number                                                     |                                    |
| `nextWaveTime`        | number                                                     | Tick.                              |
| `activeAccusation`    | `{ accuser, accused, votes, expiresAt } \| null`           |                                    |
| `deadNames`           | `Map<name, infectionStatus>`                               | For proximity-log investigation.   |
| `patientZeroAssigned` | boolean                                                    |                                    |

### 9.3 On-Chain (`contagion::attestations`)

- `Ledger` (per player, owned resource): `history: vector<Record>`,
  `healthy_count`, `infected_count`.
- `Record`: `{ session_id, tick, status, commitment: vector<u8>,
  submitted_at_tick }`.
- `Stats` (module-level): global healthy / infected totals.

---

## 10. Configurable Parameters

Defaults are defined at the top of `contagion-frontend/server/index.ts`.

| Parameter                       | Default | Description                                          |
| ------------------------------- | ------- | ---------------------------------------------------- |
| `INFECTION_RADIUS`              | 3       | Tiles for Q-key infect and proximity logging.        |
| `INCUBATION_TICKS_MIN / MAX`    | 25 / 50 | Patient-zero spread delay (5–10s @ 5 ticks/sec).     |
| `TEST_COOLDOWN_TICKS`           | 300     | 60 s between tests.                                  |
| `TEST_CAMP_RADIUS`              | 3       | Tiles to interact with a camp.                       |
| `VOTE_THRESHOLD_PCT`            | 0.30    | Yes-votes needed to kick.                            |
| `VOTE_DURATION_TICKS`           | 75      | 15 s vote window.                                    |
| `ACCUSE_COOLDOWN_TICKS`         | 300     | 60 s after a failed accusation.                      |
| `MIN_PLAYERS_TO_START`          | 2       | Game start threshold.                                |
| `MIN_PLAYERS_FOR_PZ`            | 3       | Patient-zero selection threshold.                    |
| `PROXIMITY_LOG_SIZE`            | 6       | Names retained per player.                           |
| `CURE_FRAGMENT_COUNT`           | 10      | Spawned at start.                                    |
| `CURE_FRAGMENTS_TO_WIN`         | 5       | Healthy player win condition.                        |
| `COLLECT_RADIUS`                | 1       | Cure-fragment pickup distance.                       |
| `POINTS_PER_TICK_HEALTHY`       | 1       |                                                      |
| `POINTS_PER_INFECTION`          | 15      |                                                      |
| `POINTS_SUCCESSFUL_ACCUSE`      | 25      |                                                      |
| `POINTS_FAILED_ACCUSE_PENALTY`  | 10      |                                                      |
| `POINTS_PER_MOB_KILL`           | 10      |                                                      |
| `WAVE_FAILURE_SCORE_PENALTY`    | 0.20    | Fraction of score lost on total farm loss.           |

---

## 11. Open Questions

- Should accusation voting be anonymous or public?
- Can a player be accused while already under an active vote?
- Disconnect handling: grace period or immediate removal?
- Should cure-fragment value vary, or stay uniform?
- Should the testing camp show a visible cooldown indicator?
- How should proximity detection handle players moving in and out of
  range every few ticks (jitter)?
- Should there be a max player count per room? How does the map scale?
