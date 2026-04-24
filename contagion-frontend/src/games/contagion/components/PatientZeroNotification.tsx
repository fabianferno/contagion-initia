import { useEffect, useState } from 'react';

interface PatientZeroNotificationProps {
  show: boolean;
  onComplete?: () => void;
}

export function PatientZeroNotification({ show, onComplete }: PatientZeroNotificationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 4000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [show, onComplete]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999,
        pointerEvents: 'none',
        textAlign: 'center',
        animation: 'pzFadeOut 4s ease-in-out forwards',
      }}
    >
      <style>{`
        @keyframes pzFadeOut {
          0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
          15%  { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
          70%  { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
        }
        @keyframes pzGlow {
          0%, 100% { text-shadow: 0 0 20px #ff2200, 0 0 40px #ff2200; }
          50% { text-shadow: 0 0 40px #ff6600, 0 0 80px #ff6600, 0 0 120px #ff0000; }
        }
      `}</style>
      <div style={{
        fontFamily: '"Press Start 2P", monospace',
        fontWeight: 900,
        fontSize: 72,
        letterSpacing: 8,
        color: '#ff2200',
        animation: 'pzGlow 0.8s ease-in-out infinite',
        textTransform: 'uppercase',
      }}>
        INFECTED
      </div>
      <div style={{
        fontFamily: '"Press Start 2P", monospace',
        fontSize: 18,
        color: '#ff8844',
        marginTop: 8,
        letterSpacing: 4,
      }}>
        YOU HAVE BEEN INFECTED
      </div>
    </div>
  );
}
