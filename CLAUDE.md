# CLAUDE.md

Contagion is a real-time multiplayer social-deduction game shipped as an
Initia Minimove appchain + a Vite/React client. Use this guide when
navigating the repo.

## Repo Map
- `contagion/` — Move package (published to the appchain)
  - `sources/attestations.move` — the submission's core logic
- `contagion-frontend/` — Vite + React client + Node game server
  - `server/index.ts` — Node `http` + `ws` server for real-time gameplay
    (run via tsx; loads repo-root `.env` through dotenv)
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
- The Node WebSocket server is authoritative for infection state and tick;
  the chain only stores signed attestations, never raw game state.
- Use `initiaAddress` (bech32) as the `sender` for every Move message; hex
  addresses are for the EVM world.

## Common Commands
```bash
# Frontend (Node + pnpm; the server is TypeScript run via tsx, not Bun)
cd contagion-frontend
pnpm install                  # uses node-linker=hoisted (see .npmrc)
pnpm run dev:server           # game server on :3001 (tsx watch)
pnpm run dev                  # Vite client on :3000
pnpm run build                # production build
pnpm exec tsc --noEmit        # type-check

# Move contract (requires minitiad v1.0.7 on PATH)
cd contagion
# --language-version 2.1 is REQUIRED: the main-pinned InitiaStdlib deps use
# Move 2.1 syntax (+=, -=) and the v1.0.7 compiler defaults to 2.0.
minitiad move build --named-addresses contagion=0x<deployer_hex> \
  --language-version 2.1 --skip-fetch-latest-git-deps
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
