import { AccAddress } from '@initia/initia.js';
import {
  CONTAGION_MODULE_ADDRESS,
  CONTAGION_MODULE_NAME,
  INITIA_CHAIN_ID,
} from '@/utils/constants';

export interface RecordAttestationInput {
  /** Bech32 init1... address of the signer. */
  senderBech32: string;
  /** Game session id, u64. */
  sessionId: number;
  /** Tick at which the test was performed, u64. */
  tick: number;
  /** Result from the test camp. */
  infected: boolean;
  /** 32-byte commitment hash as a hex string (with or without 0x). */
  commitmentHex: string;
}

/** Hex string → Uint8Array without the common 0x prefix. */
function hexToBytes(hex: string): Uint8Array {
  const clean = hex.replace(/^0x/, '').padStart(64, '0').slice(-64);
  const out = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

function b64(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  if (typeof btoa === 'function') return btoa(s);
  return Buffer.from(bytes).toString('base64');
}

function b64BigEndianU64(n: number): string {
  const bytes = new Uint8Array(8);
  const big = BigInt(Math.max(0, Math.floor(n)));
  for (let i = 7; i >= 0; i--) {
    bytes[i] = Number((big >> BigInt((7 - i) * 8)) & 0xffn);
  }
  return b64(bytes);
}

function b64LittleEndianU64(n: number): string {
  const bytes = new Uint8Array(8);
  const big = BigInt(Math.max(0, Math.floor(n)));
  for (let i = 0; i < 8; i++) {
    bytes[i] = Number((big >> BigInt(i * 8)) & 0xffn);
  }
  return b64(bytes);
}

/**
 * Build a `MsgExecute` transaction message that calls
 * `contagion::attestations::record_attestation`. Returned object is
 * ready to drop into `requestTxSync({ messages })`.
 */
export function buildRecordAttestationMessage(input: RecordAttestationInput) {
  if (!CONTAGION_MODULE_ADDRESS) {
    throw new Error('Contagion module address not configured. Set VITE_CONTAGION_MODULE_ADDRESS.');
  }

  const moduleHex = AccAddress.toHex(CONTAGION_MODULE_ADDRESS);
  const ownerAddrBytes = hexToBytes(moduleHex);

  const args = [
    b64(ownerAddrBytes),
    b64LittleEndianU64(input.sessionId),
    b64LittleEndianU64(input.tick),
    b64(new Uint8Array([input.infected ? 1 : 0])),
    b64(hexToBytes(input.commitmentHex)),
  ];

  return {
    typeUrl: '/initia.move.v1.MsgExecute',
    value: {
      sender: input.senderBech32.toLowerCase(),
      moduleAddress: CONTAGION_MODULE_ADDRESS.toLowerCase(),
      moduleName: CONTAGION_MODULE_NAME,
      functionName: 'record_attestation',
      typeArgs: [],
      args,
    },
  };
}

/** Local `u64` big-endian encoder, used by callers that also want to emit an envelope hint. */
export function encodeU64BE(n: number): string {
  return b64BigEndianU64(n);
}

export const ATTESTATION_CHAIN_ID = INITIA_CHAIN_ID;
