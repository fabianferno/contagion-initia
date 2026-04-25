import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useWallet } from '@/hooks/useWallet';
import { INITIA_CHAIN_NAME, INITIA_NATIVE_ASSET } from '@/utils/constants';
import './FaucetModal.css';

interface FaucetModalProps {
  open: boolean;
  onClose: () => void;
}

interface FaucetSuccess { txhash: string | null; amount: string }

export function FaucetModal({ open, onClose }: FaucetModalProps) {
  const { publicKey } = useWallet();
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<FaucetSuccess | null>(null);

  useEffect(() => {
    if (!open) {
      setError(null);
      setSuccess(null);
      setSubmitting(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function handleRequest() {
    if (!publicKey) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/faucet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: publicKey }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `faucet failed (${res.status})`);
      setSuccess({ txhash: data.txhash ?? null, amount: data.amount ?? '' });
      queryClient.invalidateQueries({ queryKey: ['balance', publicKey] });
      // Light refresh delay so the chain has time to settle.
      setTimeout(() => queryClient.invalidateQueries({ queryKey: ['balance', publicKey] }), 1500);
    } catch (e) {
      setError((e as Error).message || 'faucet failed');
    } finally {
      setSubmitting(false);
    }
  }

  const formattedAmount = (() => {
    if (!success?.amount) return null;
    const m = success.amount.match(/^(\d+)([a-z]+)$/);
    if (!m) return success.amount;
    const raw = BigInt(m[1]);
    const decimals = INITIA_NATIVE_ASSET.decimals;
    const base = 10n ** BigInt(decimals);
    const whole = raw / base;
    const frac = raw % base;
    const fracStr = frac.toString().padStart(decimals, '0').replace(/0+$/, '').slice(0, 4);
    return `${whole}${fracStr ? '.' + fracStr : ''} ${INITIA_NATIVE_ASSET.symbol}`;
  })();

  return (
    <div className="faucet-modal-backdrop" onClick={onClose}>
      <div className="faucet-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="faucet-modal-head">
          <div>
            <div className="faucet-modal-title">Faucet</div>
            <div className="faucet-modal-subtitle">{INITIA_CHAIN_NAME}</div>
          </div>
          <button className="faucet-modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="faucet-modal-body">
          <p className="faucet-modal-blurb">
            Drip test {INITIA_NATIVE_ASSET.symbol} to your connected wallet so the auto-sign
            attestation flow can pay tx fees.
          </p>

          <label className="faucet-field-label">Recipient</label>
          <div className="faucet-address" title={publicKey ?? ''}>
            {publicKey ?? <span style={{ opacity: 0.5 }}>connect a wallet first</span>}
          </div>

          {error && <div className="faucet-alert faucet-alert-error">{error}</div>}

          {success && (
            <div className="faucet-alert faucet-alert-success">
              <div>Sent {formattedAmount ?? success.amount} ✓</div>
              {success.txhash && (
                <div className="faucet-tx">
                  tx <code>{success.txhash.slice(0, 10)}…{success.txhash.slice(-6)}</code>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="faucet-modal-actions">
          <button className="pixel-btn pixel-btn-secondary" onClick={onClose} disabled={submitting}>
            Close
          </button>
          <button
            className="pixel-btn pixel-btn-green"
            onClick={handleRequest}
            disabled={!publicKey || submitting}
          >
            {submitting ? 'Sending…' : success ? 'Send another' : 'Request tokens'}
          </button>
        </div>
      </div>
    </div>
  );
}
