# Contagion — Hackathon Submission

**A Real-Time Social Deduction .io Game on an Initia Minimove Appchain**

---

## Project Overview

**Contagion** is a persistent, real-time multiplayer browser game where one player is secretly *Patient Zero*. Infection spreads silently through proximity, accusations are public, and the only way to defend yourself is to prove *when* you last tested. Every self-test at the testing camp is **auto-signed** to the appchain as a timestamped `Attestation`, turning "when did you last test?" from vibes into on-chain truth.

| Category | Details |
|----------|---------|
| **Genre** | Social deduction / .io-style multiplayer |
| **Platform** | Web (React + Vite), Initia Minimove appchain |
| **VM** | Move (`minimove`) |
| **Native Feature** | **Auto-signing** via `@initia/interwovenkit-react` |
| **Rollup Chain ID** | `contagion-1` |
| **Deployed Module Address** | `init1dza02gfw0qlluw003yvaruwg6zapqrhsvrsdvy` (hex `0x68baf5212e783ffe39ef8919d1f1c8d0ba100ef0`) |
| **Demo Video** | [Watch on Canva](https://www.canva.com/design/DAHCJrlIIkU/nIzojc3egYutAX7w4VumVw/watch?utm_content=DAHCJrlIIkU&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h9eb9a29aef) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          BROWSER CLIENT                                     │
│  React + Vite + Tailwind │ IsometricMapCanvas │ InterwovenKit (auto-sign)   │
│  @initia/interwovenkit-react │ @initia/initia.js │ wagmi + viem             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    WebSocket ◀────▶│
                                    │
┌─────────────────────────────────────────────────────────────────────────────┐
│                     GAME SERVER (Bun WebSocket)                             │
│  Real-time sync │ Infection spread │ Patient Zero selection │ Accusation    │
│  Tick clock │ Test camp results + per-player commitments                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    Cosmos RPC ◀────│───▶  (MsgExecute, signed by session key)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    INITIA MINIMOVE APPCHAIN                                 │
│  contagion::attestations — record_attestation / Ledger / Stats              │
│  Per-player history + global counters, all in Move resources                │
└─────────────────────────────────────────────────────────────────────────────┘
```

- **Client**: React UI, isometric map, InterwovenKit wallet adapter, Initia SDK for `MsgExecute` calls.
- **Server**: Bun WebSocket server is authoritative for infection state, tick clock, and test results. The chain never holds raw game state — only signed attestations.
- **On-chain**: A single Move module (`contagion::attestations`) stores each player's signed attestation history and module-level totals.

---

## 1. Native Feature — Auto-Signing

### Summary

Auto-signing is **not a demo slide** — it is the **core UX mechanic** of the game. Contagion is a real-time game where breaking flow to pop a wallet modal every 20 seconds would kill the experience. With auto-signing, every test at the testing camp fires a `MsgExecute` to `contagion::attestations::record_attestation` through `requestTxSync` *without* a confirmation prompt — the player approves the session key once and never leaves the game to sign again.

### How It Powers Gameplay

| Game Element | Auto-Sign Role |
|--------------|---------------|
| **Session connect** | On first wallet connect, the client calls `autoSign.enable(chainId)`. The player approves the session key once. |
| **Testing Camp** | Walk to a camp and press `T`. The server returns `(status, tick, commitment)`. The client immediately submits an attestation tx — **no modal**. |
| **HUD receipt** | The HUD lights up with `Signed · <txhash>` the moment the tx is included; players see a live, on-chain receipt for every test. |
| **Accusation** | When a suspect is challenged, their on-chain attestation history is the source of truth — when did they last test, and what did they claim? |

### Technical Flow

1. **Client** (`ContagionGame.tsx`): On mount, calls `autoSign.enable(INITIA_CHAIN_ID)` if not already enabled.
2. **Server** (Bun WebSocket): On `T` press at a testing camp, issues `{ status, tick, commitment }` privately to the player.
3. **Client** (`attestationService.ts`): Builds a `MsgExecute` for `contagion::attestations::record_attestation` with `(module_owner, session_id, tick, infected, commitment)` BCS-encoded args.
4. **Client** → **Initia**: `requestTxSync({ chainId, messages: [msg] })` signs and broadcasts using the session key — no user prompt.
5. **Chain**: Move module updates the player's `Ledger` resource (latest + history + counts) and bumps the module-level `Stats`.
6. **Client**: HUD displays the returned tx hash and flips state to `synced`.

### Move Module — `contagion::attestations`

Located at `contagion/sources/attestations.move`:

- **Resources**:
  - `Ledger` (per-player) — `latest: Attestation`, `history: vector<Attestation>`, `infected_count`, `healthy_count`.
  - `Stats` (under publisher address) — `total_attestations`, `total_infected`, `total_healthy`. Auto-initialised via the MoveVM `init_module` hook on publish.
- **Entry function**: `record_attestation(player, module_owner, session_id, tick, infected, commitment)` — asserts the commitment is exactly 32 bytes, appends to the caller's `Ledger`, and increments `Stats`.
- **View functions**: `latest_attestation`, `history_len`, `player_counts`, `global_stats`.

```move
public entry fun record_attestation(
    player: &signer,
    module_owner: address,
    session_id: u64,
    tick: u64,
    infected: bool,
    commitment: vector<u8>,
) acquires Ledger, Stats { /* ... */ }
```

### Why This Matters

- **Real-time UX**: Auto-signing removes every modal between player intent and on-chain commit. The game never stalls for a wallet pop-up.
- **Verifiable history**: Every test the player has ever performed lives in their `Ledger` — accusations can be settled by inspecting on-chain history, not screenshots.
- **Tamper-proof timestamps**: Attestations are bound to a server-issued `tick` and a `commitment`; stale or missing attestations are immediate social signals.
- **Module-level analytics**: The `Stats` resource gives judges a single read to verify the game is producing real on-chain activity.

---

## 2. Deployed Onchain Component

### Module Address

| Component | Value |
|-----------|-------|
| **Module account (bech32)** | `init1dza02gfw0qlluw003yvaruwg6zapqrhsvrsdvy` |
| **Module account (hex)** | `0x68baf5212e783ffe39ef8919d1f1c8d0ba100ef0` |
| **Module path** | `0x68baf5212e783ffe39ef8919d1f1c8d0ba100ef0::attestations` |
| **Rollup** | Local Minimove rollup, chain id `contagion-1` |

### Live Deployment Evidence

The module has been deployed to a local Minimove rollup and the attestation path has been smoke-tested end-to-end.

| Artefact | Value |
| --- | --- |
| Publish tx | `357F8053695ED6276CC8168923AB74088402AF83EA1C1339AACF1CB15C7A9E07` (height 23, code 0) |
| First `record_attestation` tx | `C5480673D7E84F4AB3A92CFB9C9D7E2EDEDA0E19A5E363B9F28D0E96BDF432E0` (height 25, code 0) |
| `Stats` after smoke test | `{ total_attestations: 1, total_healthy: 1, total_infected: 0 }` |

Verify the global `Stats` resource at any time:

```sh
minitiad query move resource init1dza02gfw0qlluw003yvaruwg6zapqrhsvrsdvy \
  0x68baf5212e783ffe39ef8919d1f1c8d0ba100ef0::attestations::Stats -o json
```

### Module Interface

| Function | Kind | Description |
|----------|------|-------------|
| `init_module(publisher)` | `fun` (auto) | Initialises the global `Stats` resource on publish |
| `record_attestation(player, module_owner, session_id, tick, infected, commitment)` | `entry` | Appends a signed attestation; updates `Ledger` + `Stats` |
| `latest_attestation(player)` | `#[view]` | Returns the player's most recent `Attestation` |
| `history_len(player)` | `#[view]` | Total attestations ever signed by `player` |
| `player_counts(player)` | `#[view]` | `(healthy_count, infected_count)` for `player` |
| `global_stats(module_owner)` | `#[view]` | `(total_attestations, total_healthy, total_infected)` |

### Storage

- **Per-player `Ledger`** — published under the player's own address; players carry their own history.
- **Module-level `Stats`** — published under the deployer address; serves as a single source of truth for global activity.
- All state lives natively in Move resources; no off-chain mirror.

### Compliance Checklist

- ✅ Module deployed to an Initia Minimove appchain (`contagion-1`)
- ✅ Real on-chain activity from the game loop (tested end-to-end)
- ✅ Native feature (auto-signing) is wired into the core game loop, not a side demo
- ✅ All on-chain calls go through InterwovenKit's `requestTxSync` with auto-sign enabled
- ✅ `.initia/submission.json` populated with `commit_sha`, `deployed_address`, `rollup_chain_id`

---

## Gameplay Summary

- **Win conditions**: Healthy players collect 5 Cure Fragments; infected players win if all healthy players are infected.
- **Patient Zero**: Secretly chosen when 2+ players join; holds `Q` near a healthy player for 2 seconds to infect.
- **Testing Camp**: Press `T` to run a self-test. The result is auto-signed to the appchain as an `Attestation`.
- **Accusation**: Vote to eliminate suspected infected players; on-chain attestation history is the receipt.
- **Live HUD**: Every test surfaces its tx hash in the HUD — players literally watch the chain commit their claim.

---

## Repository Structure

```
contagion-initia/
├── contagion/                              # Move package (the appchain logic)
│   ├── Move.toml
│   └── sources/attestations.move           # record_attestation / Ledger / Stats
├── contagion-frontend/                     # Vite + React client + Bun game server
│   ├── server/index.ts                     # Real-time WebSocket game server
│   └── src/
│       ├── games/contagion/
│       │   ├── ContagionGame.tsx           # Auto-sign wiring lives here
│       │   ├── attestationService.ts       # MsgExecute builder
│       │   ├── hooks/useGameSocket.ts
│       │   └── components/                 # Isometric map + HUD
│       ├── hooks/useWallet.ts              # InterwovenKit adapter
│       ├── utils/constants.ts              # Initia chain config
│       └── main.tsx                        # Wagmi → QueryClient → InterwovenKit
├── .initia/submission.json                 # Hackathon submission metadata
└── README.md
```

---

## Links

- **Demo Video**: [Watch on Canva](https://www.canva.com/design/DAHCJrlIIkU/nIzojc3egYutAX7w4VumVw/watch?utm_content=DAHCJrlIIkU&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h9eb9a29aef)
- **Repo**: <https://github.com/fabianferno/contagion-initia>
- **Core Move logic**: `contagion/sources/attestations.move`
- **Auto-sign integration**: `contagion-frontend/src/games/contagion/ContagionGame.tsx`
- **`MsgExecute` builder**: `contagion-frontend/src/games/contagion/attestationService.ts`

---

*Built for the Initia Hackathon — Move + Auto-Signing on a Minimove appchain.*
