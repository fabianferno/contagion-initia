#!/usr/bin/env bash
# Run on the EC2 host. Pulls the latest commit, installs server deps, and
# restarts the pm2 game/faucet server (TypeScript via tsx on Node).
#
# This box runs the BACKEND only — the client is hosted on Vercel, and
# nginx fronts this server at contagion.crevn.xyz (proxying /ws + /api to
# :3001). No client dist/ is needed here.
#
# One-time prereqs on the box (Amazon Linux 2023):
#   - Node.js 20.6+ (for `node --import tsx`)  — e.g. via nvm
#   - corepack enable && corepack prepare pnpm@10.24.0 --activate   (or: npm i -g pnpm)
#   - pm2 installed (npm i -g pm2)
#   - native-build toolchain for keccak/secp256k1:
#       sudo dnf groupinstall -y "Development Tools" && sudo dnf install -y python3
#   - .env present at repo root (the server loads ../.env via dotenv)
#
# Usage:
#   cd ~/projects/contagion-initia/contagion-frontend
#   ./deploy.sh

set -euo pipefail

cd "$(dirname "$0")"
REPO_ROOT="$(cd .. && pwd)"

echo "==> git pull"
git -C "$REPO_ROOT" pull --ff-only

if [[ ! -f "$REPO_ROOT/.env" ]]; then
  echo "ERROR: $REPO_ROOT/.env missing. The server needs it (faucet key, chain endpoints)." >&2
  exit 1
fi

echo "==> pnpm install (server deps + native builds)"
pnpm install --frozen-lockfile

mkdir -p logs

if pm2 describe contagion-server >/dev/null 2>&1; then
  echo "==> pm2 reload contagion-server"
  pm2 reload ecosystem.config.cjs --update-env
else
  echo "==> pm2 start ecosystem.config.cjs"
  pm2 start ecosystem.config.cjs
  pm2 save
fi

pm2 status contagion-server
echo "==> Done."
