#!/usr/bin/env bash
# Run on your laptop. Builds the Vite client locally and pushes the
# resulting dist/ to git so the EC2 box can deploy via `./deploy.sh`
# (git pull + pm2 reload), no build step on the server.
#
# Usage:
#   cd contagion-frontend
#   ./build-push.sh

set -euo pipefail

cd "$(dirname "$0")"
REPO_ROOT="$(cd .. && pwd)"

echo "==> bun install"
bun install

echo "==> bun run build"
bun run build

if [[ ! -f dist/index.html ]]; then
  echo "ERROR: build did not produce dist/index.html" >&2
  exit 1
fi

cd "$REPO_ROOT"

if git diff --quiet -- contagion-frontend/dist && git diff --cached --quiet -- contagion-frontend/dist; then
  echo "==> dist/ unchanged — nothing to commit"
else
  echo "==> committing dist/"
  git add -f contagion-frontend/dist
  git commit -m "build: refresh contagion-frontend/dist"
fi

echo "==> git push"
git push

echo
echo "Done. On the EC2 box run:"
echo "    cd ~/projects/contagion-initia/contagion-frontend && ./deploy.sh"
