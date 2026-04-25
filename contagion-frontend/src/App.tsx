import { lazy, Suspense, Component, type ReactNode } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { useWallet } from './hooks/useWallet';

const ContagionGame = lazy(() =>
  import('./games/contagion/ContagionGame').then(m => ({ default: m.ContagionGame })),
);

class GameErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(err: Error) { return { error: err }; }
  render() {
    if (this.state.error) {
      return (
        <div className="card pixel-card" style={{ padding: '2rem', maxWidth: 480 }}>
          <h3 style={{ color: 'var(--color-error)', marginBottom: '1rem' }}>Game failed to load</h3>
          <p style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
            {this.state.error.message}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

const GAME_TITLE = import.meta.env.VITE_GAME_TITLE || 'Contagion';
const GAME_TAGLINE = import.meta.env.VITE_GAME_TAGLINE || 'Trust No One';

function PlayRoute() {
  const { publicKey, isConnected } = useWallet();
  if (!isConnected || !publicKey) return <Navigate to="/" replace />;
  return (
    <GameErrorBoundary>
      <Suspense fallback={<div style={{ textAlign: 'center', padding: '3rem' }}>Loading game…</div>}>
        <ContagionGame userAddress={publicKey} />
      </Suspense>
    </GameErrorBoundary>
  );
}

function AppLayout() {
  const location = useLocation();
  const isLanding = location.pathname === '/';
  return (
    <Layout
      title={GAME_TITLE}
      subtitle={GAME_TAGLINE}
      variant="dark"
      mainClassName={isLanding ? 'studio-main studio-main-full' : undefined}
    >
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/play" element={<PlayRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <GameErrorBoundary>
      <AppLayout />
    </GameErrorBoundary>
  );
}
