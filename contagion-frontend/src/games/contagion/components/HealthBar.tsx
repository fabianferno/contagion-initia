import React from 'react';

// Import heart sprite stages
import heartStage1 from '@/assets/Health and Points Bars/Sprites/Heart Bar/Heart Stage 1.png';
import heartStage2 from '@/assets/Health and Points Bars/Sprites/Heart Bar/Heart Stage 2.png';
import heartStage3 from '@/assets/Health and Points Bars/Sprites/Heart Bar/Heart Stage 3.png';
import heartStage4 from '@/assets/Health and Points Bars/Sprites/Heart Bar/Heart Stage 4.png';
import heartStage5 from '@/assets/Health and Points Bars/Sprites/Heart Bar/Heart Stage 5.png';

interface HealthBarProps {
  health: number; // 0-100
  maxHealth: number; // typically 100
}

export function HealthBar({ health, maxHealth }: HealthBarProps) {
  const HEARTS_COUNT = 5;
  const HEALTH_PER_HEART = maxHealth / HEARTS_COUNT; // Each heart is 1/5 of max health

  // Calculate which stage each heart should display
  const getHeartStage = (heartIndex: number): string => {
    const heartMinHealth = heartIndex * HEALTH_PER_HEART;
    const heartMaxHealth = (heartIndex + 1) * HEALTH_PER_HEART;

    // Calculate how much health this heart has
    const heartHealth = Math.max(0, Math.min(HEALTH_PER_HEART, health - heartMinHealth));
    const heartPercent = (heartHealth / HEALTH_PER_HEART) * 100;

    // Map health percentage to sprite stage
    if (heartPercent >= 80) return heartStage1; // Full (80-100 HP)
    if (heartPercent >= 60) return heartStage2; // 3/4 (60-79 HP)
    if (heartPercent >= 40) return heartStage3; // 1/2 (40-59 HP)
    if (heartPercent >= 20) return heartStage4; // 1/4 (20-39 HP)
    return heartStage5; // Empty (0-19 HP)
  };

  return (
    <div
      className="absolute top-20 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 rounded-lg bg-black/60 px-4 py-2 backdrop-blur-sm shadow-xl"
      style={{ imageRendering: 'pixelated' }}
    >
      {/* Render 5 hearts */}
      <div className="flex items-center gap-1">
        {Array.from({ length: HEARTS_COUNT }, (_, i) => (
          <img
            key={i}
            src={getHeartStage(i)}
            alt={`Heart ${i + 1}`}
            className="h-10 w-auto object-contain"
            style={{ imageRendering: 'pixelated' }}
          />
        ))}
      </div>
      {/* Numeric health display */}
      <span className="font-mono text-lg font-bold text-white tabular-nums">
        {health}/{maxHealth}
      </span>
    </div>
  );
}
