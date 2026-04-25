import { useQuery } from '@tanstack/react-query';
import { INITIA_GAS_DENOM, INITIA_NATIVE_ASSET } from '@/utils/constants';

interface CoinAmount { denom: string; amount: string }
interface BalancesResponse { balances?: CoinAmount[] }

export interface BalanceInfo {
  /** Raw integer in base denom (e.g. umin). */
  raw: bigint;
  /** Human display, no symbol (e.g. "1.234"). */
  display: string;
  /** Display with symbol (e.g. "1.234 MIN"). */
  formatted: string;
  symbol: string;
  decimals: number;
}

const ZERO: BalanceInfo = {
  raw: 0n,
  display: '0',
  formatted: `0 ${INITIA_NATIVE_ASSET.symbol}`,
  symbol: INITIA_NATIVE_ASSET.symbol,
  decimals: INITIA_NATIVE_ASSET.decimals,
};

function formatAmount(raw: bigint, decimals: number): string {
  if (raw === 0n) return '0';
  const negative = raw < 0n;
  const abs = negative ? -raw : raw;
  const base = 10n ** BigInt(decimals);
  const whole = abs / base;
  const frac = abs % base;
  if (frac === 0n) return `${negative ? '-' : ''}${whole}`;
  const fracStr = frac.toString().padStart(decimals, '0').replace(/0+$/, '').slice(0, 4);
  return `${negative ? '-' : ''}${whole}${fracStr ? '.' + fracStr : ''}`;
}

export function useBalance(address: string | null) {
  return useQuery<BalanceInfo>({
    queryKey: ['balance', address, INITIA_GAS_DENOM],
    enabled: Boolean(address),
    refetchInterval: 6000,
    staleTime: 3000,
    queryFn: async () => {
      if (!address) return ZERO;
      const res = await fetch(`/api/balance/${address}`);
      if (!res.ok) throw new Error(`balance ${res.status}`);
      const data = (await res.json()) as BalancesResponse;
      const coin = data.balances?.find(c => c.denom === INITIA_GAS_DENOM);
      const raw = BigInt(coin?.amount ?? '0');
      const display = formatAmount(raw, INITIA_NATIVE_ASSET.decimals);
      return {
        raw,
        display,
        formatted: `${display} ${INITIA_NATIVE_ASSET.symbol}`,
        symbol: INITIA_NATIVE_ASSET.symbol,
        decimals: INITIA_NATIVE_ASSET.decimals,
      };
    },
  });
}

/** Threshold below which the UI nudges the user to use the faucet. Tuned to ~0.1 MIN. */
export const LOW_BALANCE_THRESHOLD: bigint = 100_000n;
