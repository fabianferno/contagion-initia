# CLAUDE.md

Contagion is a real-time multiplayer social-deduction game shipped as an
Initia Minimove appchain + a Vite/React client. Use this guide when
navigating the repo.

## Repo Map
- `contagion/` — Move package (published to the appchain)
  - `sources/attestations.move` — the submission's core logic
- `contagion-frontend/` — Vite + React + Bun game server
  - `server/index.ts` — WebSocket server for real-time gameplay
  - `src/games/contagion/` — isometric game UI, socket hook, attestation helper
  - `src/hooks/useWallet.ts` — InterwovenKit adapter
  - `src/main.tsx` — Wagmi → QueryClient → InterwovenKitProvider stack
- `.initia/submission.json` — hackathon metadata
- `.claude/skills/initia-appchain-dev/` — detailed Initia dev skill

## Golden Rules
- Every on-chain interaction goes through InterwovenKit's `requestTxSync`
  with auto-sign enabled — the game is real-time and cannot afford modal
  prompts mid-play.
- Health attestations must encode `(session_id, tick, status, commitment)`
  as a Move `MsgExecute` against `contagion::attestations::record_attestation`.
- The Bun WebSocket server is authoritative for infection state and tick;
  the chain only stores signed attestations, never raw game state.
- Use `initiaAddress` (bech32) as the `sender` for every Move message; hex
  addresses are for the EVM world.

## Common Commands
```bash
# Frontend
cd contagion-frontend
bun install
bun run dev:server            # game server on :3001
bun run dev                   # Vite client on :3000
bun run build                 # production build
bunx tsc --noEmit             # type-check

# Move contract (requires minitiad on PATH)
cd contagion
minitiad move build --named-addresses contagion=0x<deployer_hex>
minitiad tx move publish build/contagion/bytecode_modules/attestations.mv \
  --from <key> --keyring-backend test --chain-id <rollup> --broadcast-mode sync
```

## Final QA Checklist
- `.initia/submission.json` has correct `commit_sha`, `deployed_address`,
  `rollup_chain_id`, `demo_video_url`.
- `VITE_CONTAGION_MODULE_ADDRESS` is set and matches the published module
  owner.
- Auto-sign is enabled on first connect (`autoSign.enable(chainId)`).
- Walking to a test camp mints an `Attestation` tx and shows its hash in
  the HUD.
- Two tabs can play against each other through the local WebSocket server.
