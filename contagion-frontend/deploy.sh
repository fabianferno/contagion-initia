#!/usr/bin/env bash
# Run on the EC2 host itself. Pulls latest, builds the client (with a
# bumped Node heap so micro instances don't OOM), then restarts the pm2
# WebSocket server.
#
# One-time prereqs on the box:
#   - bun installed (curl -fsSL https://bun.sh/install | bash)
#   - pm2 installed (npm i -g pm2)
#   - 4G swap enabled if RAM < 2G (see README of this script)
#   - .env present at repo root (vite.config.ts has envDir: '..')
#
# Usage:
#   cd ~/projects/contagion-initia/contagion-frontend
#   ./deploy.sh

set -euo pipefail

cd "$(dirname "$0")"
REPO_ROOT="$(cd .. && pwd)"

echo "==> git pull"
git -C "$REPO_ROOT" pull --ff-only

echo "==> bun install"
bun install

echo "==> vite build (heap bumped to 3GB)"
NODE_OPTIONS="--max-old-space-size=3072" bun run build

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
