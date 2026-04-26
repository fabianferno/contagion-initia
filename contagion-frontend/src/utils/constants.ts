/**
 * Initia appchain configuration for Contagion.
 * All values come from Vite env vars, with sensible fallbacks so the
 * app still runs in pure client-only mode (the on-chain attestation
 * step becomes a no-op if a module address isn't configured).
 */

const env = import.meta.env as unknown as Record<string, string | undefined>;

export const INITIA_CHAIN_ID =
  env.VITE_INITIA_CHAIN_ID || 'contagion-1';

export const INITIA_RPC_URL =
  env.VITE_INITIA_RPC_URL || 'http://localhost:26657';

export const INITIA_REST_URL =
  env.VITE_INITIA_REST_URL || 'http://localhost:1317';

export const INITIA_INDEXER_URL =
  env.VITE_INITIA_INDEXER_URL || 'http://localhost:8080';

export const INITIA_JSON_RPC_URL =
  env.VITE_INITIA_JSON_RPC_URL || 'http://localhost:8545';

export const INITIA_GAS_DENOM = env.VITE_INITIA_GAS_DENOM || 'umin';

export const INITIA_BECH32_PREFIX = env.VITE_INITIA_BECH32_PREFIX || 'init';

/** Bech32 address of the account that published the `contagion::attestations` module. */
export const CONTAGION_MODULE_ADDRESS =
  env.VITE_CONTAGION_MODULE_ADDRESS || '';

/** The module name as published on-chain. */
export const CONTAGION_MODULE_NAME = 'attestations';

/** Human-readable display metadata for the custom Initia chain. */
export const INITIA_CHAIN_NAME = env.VITE_INITIA_CHAIN_NAME || 'Contagion Appchain';

export const INITIA_NATIVE_ASSET = {
  denom: INITIA_GAS_DENOM,
  symbol: env.VITE_INITIA_SYMBOL || 'MIN',
  name: env.VITE_INITIA_TOKEN_NAME || 'Contagion Token',
  decimals: 6,
};

/** WebSocket for the real-time game layer (separate from on-chain RPC). */
export const CONTAGION_WS_URL =
  env.VITE_CONTAGION_WS_URL ||
  (typeof window !== 'undefined'
    ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`
    : 'ws://localhost:3001');

/** External faucet shown as a fallback if the in-app faucet fails. */
export const PUBLIC_FAUCET_URL = env.VITE_PUBLIC_FAUCET_URL || '';
