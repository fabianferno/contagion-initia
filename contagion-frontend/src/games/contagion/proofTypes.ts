/**
 * Health proof data returned by the server and optionally anchored
 * on-chain as a Move attestation. Replaces the previous ZK proof type.
 */
export interface HealthProof {
  /** Hex/base64 commitment hash tying player + tick + status + nonce together. */
  commitment: string;
  /** Mirrors the old ZK public inputs: [playerIdHash, tick, statusBit, nonce]. */
  publicInputs: string[];
  /** Server-signed opaque proof blob (here, just a signed hash). */
  proof: string;
  /** Tick at which the test was performed. */
  tick: number;
  /** Status, expressed as 0 (infected) or 1 (healthy) for UI compatibility. */
  status: 0 | 1;
  /** Initia tx hash for the on-chain attestation — populated when auto-sign completes. */
  txHash?: string;
}

/** Alias kept so existing imports of ZKProofResult keep compiling. */
export type ZKProofResult = HealthProof;
