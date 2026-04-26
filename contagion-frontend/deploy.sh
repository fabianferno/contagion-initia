#!/usr/bin/env bash
# Build the Vite client locally and rsync ./dist to an EC2 host.
#
# Configure once via env vars (export them in your shell or a .env.deploy):
#   DEPLOY_HOST       e.g. ec2-user@1.2.3.4   (required)
#   DEPLOY_REMOTE_DIR remote path that holds dist/  (default: ~/projects/contagion-initia/contagion-frontend)
#   DEPLOY_SSH_KEY    optional path to an ssh private key
#   PM2_RESTART       set to "1" to restart the contagion-server pm2 process after deploy
#
# Usage:
#   ./deploy.sh
#   DEPLOY_HOST=ec2-user@1.2.3.4 PM2_RESTART=1 ./deploy.sh

set -euo pipefail

cd "$(dirname "$0")"

if [[ -f ../.env.deploy ]]; then
  # shellcheck disable=SC1091
  source ../.env.deploy
fi

: "${DEPLOY_HOST:?DEPLOY_HOST is required, e.g. ec2-user@1.2.3.4}"
DEPLOY_REMOTE_DIR="${DEPLOY_REMOTE_DIR:-~/projects/contagion-initia/contagion-frontend}"

SSH_OPTS=()
if [[ -n "${DEPLOY_SSH_KEY:-}" ]]; then
  SSH_OPTS=(-i "$DEPLOY_SSH_KEY")
fi

echo "==> Installing deps"
bun install

echo "==> Building client (vite build)"
bun run build

echo "==> Ensuring remote dir exists: $DEPLOY_HOST:$DEPLOY_REMOTE_DIR/dist"
ssh "${SSH_OPTS[@]}" "$DEPLOY_HOST" "mkdir -p $DEPLOY_REMOTE_DIR/dist"

echo "==> Rsyncing dist/"
rsync -avz --delete \
  ${DEPLOY_SSH_KEY:+-e "ssh -i $DEPLOY_SSH_KEY"} \
  dist/ "$DEPLOY_HOST:$DEPLOY_REMOTE_DIR/dist/"

if [[ "${PM2_RESTART:-0}" == "1" ]]; then
  echo "==> Restarting pm2 process: contagion-server"
  ssh "${SSH_OPTS[@]}" "$DEPLOY_HOST" "pm2 restart contagion-server || true"
fi

echo "==> Done. Static build is live at $DEPLOY_HOST:$DEPLOY_REMOTE_DIR/dist"
