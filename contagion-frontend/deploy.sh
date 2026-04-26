#!/usr/bin/env bash
# Run on the EC2 host. Pulls the latest commit (which contains a freshly
# built dist/ from your laptop) and restarts the pm2 WebSocket server.
# Does NOT build — building happens locally via build-push.sh.
#
# One-time prereqs on the box:
#   - bun installed (curl -fsSL https://bun.sh/install | bash)
#   - pm2 installed (npm i -g pm2)
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

if [[ ! -f dist/index.html ]]; then
  echo "ERROR: dist/index.html missing. Did you run build-push.sh on your laptop?" >&2
  exit 1
fi

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
