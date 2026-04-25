import { useEffect, useState } from 'react';
import { WalletButton } from './WalletButton';
import { FaucetModal } from './FaucetModal';
import PixelTrail from './PixelTrail';
import logo from '@/assets/icons/android-chrome-192x192.png';
import { INITIA_CHAIN_NAME } from '@/utils/constants';
import { useWallet } from '@/hooks/useWallet';
import { useBalance, LOW_BALANCE_THRESHOLD } from '@/hooks/useBalance';
import './Layout.css';
import './FaucetModal.css';

interface LayoutProps {
  title?: string;
  subtitle?: string;
  variant?: 'light' | 'dark';
  mainClassName?: string;
  children: React.ReactNode;
}

export function Layout({ title, subtitle, variant = 'light', mainClassName, children }: LayoutProps) {
  const resolvedTitle = title || import.meta.env.VITE_GAME_TITLE || 'Contagion';
  const resolvedSubtitle = subtitle || import.meta.env.VITE_GAME_TAGLINE || 'Trust No One';
  const { publicKey, isConnected } = useWallet();
  const { data: balance, isLoading } = useBalance(publicKey);
  const [faucetOpen, setFaucetOpen] = useState(false);

  const isLow = isConnected && !!balance && balance.raw < LOW_BALANCE_THRESHOLD;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', variant);
    return () => document.documentElement.removeAttribute('data-theme');
  }, [variant]);

  return (
    <div className="layout-root">
      <div className="layout-pixel-trail">
        <PixelTrail
          gridSize={60}
          trailSize={0.1}
          maxAge={250}
          interpolate={2}
          color="#ff0000"
          gooeyFilter={{ id: 'custom-goo-filter', strength: 2 }}
          useGlobalMouse
        />
      </div>

      <div className="layout-content max-w-7xl mx-auto">
        <header className="flex justify-between items-center py-4">
          <div>
            <div className="brand-row">
              <img src={logo} alt="" className="brand-logo" width={48} height={48} aria-hidden />
              <div>
                <div className="text-2xl font-bold">{resolvedTitle}</div>
                <p className="text-sm brand-subtitle">{resolvedSubtitle}</p>
              </div>
            </div>
            {isLow && (
              <div className="faucet-banner">
                <span>⚠ Insufficient balance for fees</span>
                <button onClick={() => setFaucetOpen(true)}>Get tokens</button>
              </div>
            )}
          </div>
          <div className="header-actions">
            <div className="network-pill">{INITIA_CHAIN_NAME}</div>
            {isConnected && (
              <button
                type="button"
                className={`balance-pill${isLow ? ' balance-low' : ''}`}
                onClick={() => setFaucetOpen(true)}
                title={isLow ? 'Low balance — open faucet' : 'Open faucet'}
              >
                <span className="balance-dot" />
                {isLoading && !balance ? '…' : balance?.formatted ?? '0'}
              </button>
            )}
            {isConnected && (
              <button
                type="button"
                className="pixel-btn pixel-btn-secondary"
                onClick={() => setFaucetOpen(true)}
                style={{ padding: '8px 14px' }}
              >
                Faucet
              </button>
            )}
            <WalletButton />
          </div>
        </header>

        <main className={mainClassName ?? 'studio-main'}>{children}</main>

        <footer className="studio-footer">
          <span>Built on Initia · Interwoven Rollup</span>
        </footer>
      </div>

      <FaucetModal open={faucetOpen} onClose={() => setFaucetOpen(false)} />
    </div>
  );
}
