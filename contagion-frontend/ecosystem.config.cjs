/**
 * pm2 process file for the Contagion WebSocket + faucet server.
 *
 * Runs the TypeScript server on Node via tsx (`node --import tsx`).
 * The server loads the repo-root .env itself (via dotenv), so no env
 * file needs to be wired up here.
 *
 * Start once with:
 *   pm2 start ecosystem.config.cjs
 *   pm2 save
 *   pm2 startup    # then run the printed sudo command
 *
 * Subsequent deploys go through ./deploy.sh, which calls
 * `pm2 reload ecosystem.config.cjs --update-env`.
 */

const path = require('path');

module.exports = {
  apps: [
    {
      name: 'contagion-server',
      cwd: __dirname,
      script: 'server/index.ts',
      interpreter: 'node',
      interpreter_args: '--import tsx',
      env: {
        NODE_ENV: 'production',
        PLAGUE_WS_PORT: '3001',
      },
      max_restarts: 10,
      restart_delay: 2000,
      out_file: path.join(__dirname, 'logs/server.out.log'),
      error_file: path.join(__dirname, 'logs/server.err.log'),
      merge_logs: true,
      time: true,
    },
  ],
};
