import { useEffect, useState } from 'react';

interface TaskCompleteNotificationProps {
  title: string;
  reward: number;
  onComplete?: () => void;
}

export function TaskCompleteNotification({ title, reward, onComplete }: TaskCompleteNotificationProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9998,
        background: 'linear-gradient(135deg, rgba(40, 180, 40, 0.95), rgba(60, 200, 60, 0.95))',
        border: '3px solid #60ff60',
        borderRadius: 12,
        padding: '24px 40px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6), 0 0 40px rgba(96, 255, 96, 0.4)',
        animation: 'slideIn 0.3s ease-out, pulse 0.5s ease-in-out infinite alternate',
        textAlign: 'center',
      }}
    >
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translate(-50%, -60%);
              opacity: 0;
            }
            to {
              transform: translate(-50%, -50%);
              opacity: 1;
            }
          }
          @keyframes pulse {
            from {
              box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6), 0 0 40px rgba(96, 255, 96, 0.4);
            }
            to {
              box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6), 0 0 60px rgba(96, 255, 96, 0.6);
            }
          }
        `}
      </style>

      <div
        style={{
          fontSize: 48,
          marginBottom: 12,
        }}
      >
        ✓
      </div>

      <div
        style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 18,
          fontWeight: 'bold',
          color: '#fff',
          marginBottom: 8,
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
        }}
      >
        TASK COMPLETE!
      </div>

      <div
        style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 14,
          color: '#e0ffe0',
          marginBottom: 12,
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 20,
          fontWeight: 'bold',
          color: '#ffff80',
          textShadow: '0 0 10px rgba(255, 255, 0, 0.5)',
        }}
      >
        +{reward} POINTS
      </div>
    </div>
  );
}
