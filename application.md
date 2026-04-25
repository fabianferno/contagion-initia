# Hackathon Submission Form — Answers

Paste-ready answers for each field on the Initia hackathon submission form.

---

## 1. A valid rollup chain ID, txn link, or deployment link

**Rollup chain ID:**

```
contagion-1
```

**Publish tx (alternative):**

```
357F8053695ED6276CC8168923AB74088402AF83EA1C1339AACF1CB15C7A9E07
```

**First `record_attestation` tx (alternative):**

```
C5480673D7E84F4AB3A92CFB9C9D7E2EDEDA0E19A5E363B9F28D0E96BDF432E0
```

**Deployer / module account (bech32):**

```
init1dza02gfw0qlluw003yvaruwg6zapqrhsvrsdvy
```

**Module account (hex):**

```
0x68baf5212e783ffe39ef8919d1f1c8d0ba100ef0
```

---

## 2. `.initia/submission.json`

Already committed at `/.initia/submission.json` in the repo. Current contents:

```json
{
  "project_name": "Contagion",
  "repo_url": "https://github.com/fabianferno/contagion-initia",
  "commit_sha": "1dbd3839191ea784083a50499da00ee1c13f3962",
  "rollup_chain_id": "contagion-1",
  "deployed_address": "init1dza02gfw0qlluw003yvaruwg6zapqrhsvrsdvy",
  "vm": "move",
  "native_feature": "auto-signing",
  "core_logic_path": "contagion/sources/attestations.move",
  "native_feature_frontend_path": "contagion-frontend/src/games/contagion/ContagionGame.tsx",
  "demo_video_url": "https://www.canva.com/design/DAHCJrlIIkU/nIzojc3egYutAX7w4VumVw/watch?utm_content=DAHCJrlIIkU&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h9eb9a29aef"
}
```

> Before submitting: confirm `commit_sha` is the latest commit you want
> judged with `git rev-parse HEAD`.

---

## 3. Human-readable BUIDL summary (README.md format)

```markdown
# Contagion

A real-time, multiplayer social-deduction .io game on its own
**Initia Minimove appchain**. One player is secretly Patient Zero.
Infection spreads silently by proximity. The only defence is *proof
that you tested* — and every self-test you perform is **auto-signed**
to the appchain as a timestamped `Attestation`, turning "when did you
last test?" from vibes into on-chain truth.

**Demo video:** https://www.canva.com/design/DAHCJrlIIkU/nIzojc3egYutAX7w4VumVw/watch?utm_content=DAHCJrlIIkU&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h9eb9a29aef

## What's on-chain

A single Move module, `contagion::attestations`
(`contagion/sources/attestations.move`), holds:

- A per-player **`Ledger`** resource — `latest`, full `history`,
  healthy/infected counters.
- A module-level **`Stats`** resource — global totals, auto-initialised
  via the MoveVM `init_module` hook on publish.
- An entry function `record_attestation(player, module_owner,
  session_id, tick, infected, commitment)` that the game calls every
  time a player tests at the camp.

## Native Feature: Auto-Signing

Contagion is real-time — popping a wallet modal every 20 seconds
would kill the game. We use **`autoSign` from
`@initia/interwovenkit-react`**: on first connect we call
`autoSign.enable(chainId)`, the player approves a session key once,
and from then on every test fires a `MsgExecute` to
`contagion::attestations::record_attestation` through `requestTxSync`
with **zero confirmation prompts**. The HUD lights up with the tx
hash the moment it's included.

Wiring lives in:
- `contagion-frontend/src/games/contagion/ContagionGame.tsx`
- `contagion-frontend/src/games/contagion/attestationService.ts`

## Deployment

| Field | Value |
| --- | --- |
| Rollup chain id | `contagion-1` |
| VM | Move (`minimove`) |
| Module address (bech32) | `init1dza02gfw0qlluw003yvaruwg6zapqrhsvrsdvy` |
| Module address (hex) | `0x68baf5212e783ffe39ef8919d1f1c8d0ba100ef0` |
| Publish tx | `357F8053695ED6276CC8168923AB74088402AF83EA1C1339AACF1CB15C7A9E07` (height 23) |
| First `record_attestation` tx | `C5480673D7E84F4AB3A92CFB9C9D7E2EDEDA0E19A5E363B9F28D0E96BDF432E0` (height 25) |
| `Stats` after smoke test | `total_attestations: 1, total_healthy: 1, total_infected: 0` |

Verify the global `Stats` resource any time:

\`\`\`sh
minitiad query move resource init1dza02gfw0qlluw003yvaruwg6zapqrhsvrsdvy \
  0x68baf5212e783ffe39ef8919d1f1c8d0ba100ef0::attestations::Stats -o json
\`\`\`

## Repo layout

\`\`\`
contagion-initia/
├─ contagion/sources/attestations.move    # Move module — core logic
├─ contagion-frontend/                    # Vite + React + Bun game server
│  ├─ server/index.ts                     # Real-time WebSocket game server
│  └─ src/games/contagion/
│     ├─ ContagionGame.tsx                # autoSign.enable + requestTxSync
│     └─ attestationService.ts            # MsgExecute builder
└─ .initia/submission.json                # Hackathon metadata
\`\`\`

## Run locally

See full instructions in `README.md`. TL;DR:

\`\`\`sh
# 1. Local Minimove rollup
minitiad init contagion --chain-id contagion-1 -o
minitiad start --minimum-gas-prices=0umin &

# 2. Publish the module
cd contagion
minitiad move build --named-addresses contagion=$DEPLOYER_HEX
minitiad tx move publish build/contagion/bytecode_modules/attestations.mv \
  --from deployer --keyring-backend test --chain-id contagion-1 \
  --broadcast-mode sync --gas auto --gas-adjustment 1.5 --fees 0umin -y

# 3. Game
cd ../contagion-frontend
bun install
bun run dev:server   # WebSocket game server :3001
bun run dev          # Vite client       :3000
\`\`\`

Open two tabs, connect with InterwovenKit, walk to a test camp, and
watch the **Initia Attestation** HUD panel light up with a fresh tx
hash on every test.

## Repo

https://github.com/fabianferno/contagion-initia
```

> The escaped backticks (`\`\`\``) above are only escaped so they render
> inside this answers doc. When pasting into the form, replace each
> `\`\`\`` with a real triple-backtick fence.

---

## Pre-submit checklist

- [x] `demo_video_url` populated in `.initia/submission.json`
- [ ] `commit_sha` matches latest commit you want judged
      (`git rev-parse HEAD`)
- [ ] GitHub repo is public
- [x] README.md and submission.md both reference the demo video
- [x] Module deployed and smoke-tested on `contagion-1`
