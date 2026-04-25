# Contagion

A real-time, multiplayer social-deduction game that runs on its own
Initia Minimove appchain. One player is secretly patient zero.
Infection spreads by proximity. Every self-test you perform is
**auto-signed** to the appchain as a timestamped `Attestation`,
turning "when did you last test?" from vibes into on-chain truth.

## Initia Hackathon Submission

- **Project Name**: Contagion
- **Rollup Chain ID**: `contagion-1`
- **Deployed Module Address**: `init1dza02gfw0qlluw003yvaruwg6zapqrhsvrsdvy`
  (hex `0x68baf5212e783ffe39ef8919d1f1c8d0ba100ef0`)
- **VM**: Move (`minimove`)
- **Native Feature**: auto-signing

### Project Overview

Contagion is a paranoia engine. Dots on a shared map, silent infection,
public accusations, and a testing camp that only matters if the rest of
the room can verify *when* you tested. The Initia appchain anchors every
test as a signed `(session_id, tick, status, commitment)` record, so
accusations are settled by a permanent, on-chain trail instead of trust.
Built for players who enjoy social-deduction, streamers who want
receipts, and hackathon judges who want to see real on-chain activity in
a real game loop.

### Implementation Detail

- **The Custom Implementation**: The core of the submission is the
  `contagion::attestations` Move module
  (`contagion/sources/attestations.move`). Each player owns a `Ledger`
  resource with their full attestation history, plus healthy/infected
  counters. A module-level `Stats` resource tracks global totals and
  initialises itself automatically via the MoveVM `init_module` hook on
  publish. The frontend is a fully-custom isometric multiplayer game
  (WASD movement, proximity-based infection spread, cure-fragment
  collection, wave-defense mobs, accusation & voting flow, proximity
  logs, rebirth on elimination). Testing at a camp triggers a silent
  on-chain attestation signed by the player's session key — the
  "receipt" appears in the HUD and links back to the commitment and tx
  hash.

- **The Native Feature**: We use **auto-signing** (`autoSign` from
  `@initia/interwovenkit-react`). On first game load we call
  `autoSign.enable(chainId)` so the player approves the session key
  once. From that moment on, every test at the testing camp fires a
  `MsgExecute` call to `contagion::attestations::record_attestation`
  through `requestTxSync` without a confirmation prompt — the player
  never leaves the game to sign. This is critical: Contagion is a
  real-time game where breaking flow to pop a wallet modal every 20
  seconds would kill the experience. The wiring lives in
  `contagion-frontend/src/games/contagion/ContagionGame.tsx` and
  `contagion-frontend/src/games/contagion/attestationService.ts`.

### Live Deployment Evidence

The module has been deployed to a local Minimove rollup and the
attestation path has been smoke-tested end-to-end:

| Artefact | Value |
| --- | --- |
| Chain id | `contagion-1` |
| Publisher account | `init1dza02gfw0qlluw003yvaruwg6zapqrhsvrsdvy` |
| Publish tx | `357F8053695ED6276CC8168923AB74088402AF83EA1C1339AACF1CB15C7A9E07` (height 23, code 0) |
| First `record_attestation` tx | `C5480673D7E84F4AB3A92CFB9C9D7E2EDEDA0E19A5E363B9F28D0E96BDF432E0` (height 25, code 0) |
| Stats after smoke test | `{ total_attestations: 1, total_healthy: 1, total_infected: 0 }` |

Query the `Stats` resource at any time with:

```sh
minitiad query move resource init1dza02gfw0qlluw003yvaruwg6zapqrhsvrsdvy \
  0x68baf5212e783ffe39ef8919d1f1c8d0ba100ef0::attestations::Stats -o json
```

### How to Run Locally

1. **Install tooling**: Go 1.22+, Bun 1.1+, Docker, and the Initia CLIs.
   The `minitiad` (Minimove) binary is built from source:
   ```sh
   git clone --depth 1 https://github.com/initia-labs/minimove.git /tmp/minimove
   cd /tmp/minimove && GOBIN=$HOME/go/bin make install
   export PATH=$HOME/go/bin:$PATH
   minitiad version --long | grep '^name'   # expect: name: minimove
   ```
2. **Initialise a local rollup** (from an empty `~/.minitia`):
   ```sh
   rm -rf ~/.minitia
   minitiad init contagion --chain-id contagion-1 -o
   minitiad keys add deployer --keyring-backend test
   DEPLOYER=$(minitiad keys show deployer --keyring-backend test -a)
   minitiad genesis add-genesis-account deployer 1000000000000000umin --keyring-backend test
   minitiad genesis add-genesis-validator deployer --keyring-backend test
   sed -i '' 's/^chain-id = ""/chain-id = "contagion-1"/; s/^keyring-backend = "os"/keyring-backend = "test"/' \
     ~/.minitia/config/client.toml
   minitiad start --minimum-gas-prices=0umin &
   ```
3. **Publish the Move module** (using the deployer's hex address):
   ```sh
   DEPLOYER_HEX=$(minitiad keys parse $DEPLOYER --output json | jq -r '"0x"+.bytes' | tr 'A-Z' 'a-z')
   cd contagion
   minitiad move build --named-addresses contagion=$DEPLOYER_HEX --skip-fetch-latest-git-deps
   minitiad tx move publish build/contagion/bytecode_modules/attestations.mv \
     --from deployer --keyring-backend test \
     --chain-id contagion-1 --broadcast-mode sync \
     --gas auto --gas-adjustment 1.5 --fees 0umin -y
   ```
4. **Configure the frontend** by copying `.env.example` to `.env` and
   setting `VITE_CONTAGION_MODULE_ADDRESS` to the deployer's bech32
   address.
5. **Run the game**:
   ```sh
   cd contagion-frontend
   bun install
   bun run dev:server   # Bun WebSocket game server on :3001
   bun run dev          # Vite frontend on :3000
   ```
   Open two browser tabs at <http://localhost:3000>, connect with
   InterwovenKit, walk to a test camp, and watch the **Initia
   Attestation** HUD panel light up with a fresh tx hash.

## Repository Layout

```
contagion-initia/
├─ contagion/                       # Move package (the appchain logic)
│  ├─ Move.toml
│  └─ sources/attestations.move     # record_attestation / Ledger / Stats
├─ contagion-frontend/              # Vite + React client + Bun game server
│  ├─ server/index.ts               # Real-time multiplayer WebSocket server
│  └─ src/
│     ├─ games/contagion/           # Game UI, socket hook, attestation service
│     ├─ hooks/useWallet.ts         # InterwovenKit adapter
│     ├─ components/                # Layout, PixelTrail, WalletButton
│     ├─ pages/LandingPage.tsx      # Public landing page
│     ├─ utils/constants.ts         # Initia chain config
│     ├─ App.tsx                    # Router
│     └─ main.tsx                   # Wagmi → QueryClient → InterwovenKit
├─ .initia/submission.json          # Hackathon submission metadata
├─ .env.example                     # Frontend runtime config
└─ GAME_DESIGN.md                   # Single source of truth for game design
```

## License

MIT — see `LICENSE`.
