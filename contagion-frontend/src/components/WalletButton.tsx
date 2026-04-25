import { useWallet } from '@/hooks/useWallet';

function shortenAddress(addr: string | null): string {
  if (!addr) return '';
  return `${addr.slice(0, 8)}…${addr.slice(-4)}`;
}

export function WalletButton() {
  const { publicKey, username, isConnected, connectWallet, openWallet } = useWallet();

  if (!isConnected || !publicKey) {
    return (
      <button
        className="pixel-btn pixel-btn-green"
        onClick={() => connectWallet()}
        style={{ padding: '8px 14px', fontWeight: 'bold' }}
      >
        Connect Wallet
      </button>
    );
  }

  return (
    <button
      className="pixel-btn pixel-btn-secondary"
      onClick={openWallet}
      style={{ padding: '8px 14px' }}
      title={publicKey}
    >
      {username ? username : shortenAddress(publicKey)}
    </button>
  );
}
