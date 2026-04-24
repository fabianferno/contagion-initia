import { useMemo } from 'react';
import type { RemotePlayer, CureFragmentPos, BuriedGemPos } from '../hooks/useGameSocket';

interface RadarProps {
  /** Local player's current grid position */
  localPlayerX: number;
  localPlayerY: number;
  /** All players (excluding self) */
  players: RemotePlayer[];
  /** All cure fragments on the map */
  cureFragments: CureFragmentPos[];
  /** Buried gems (uncollected) — shown as radar blips */
  buriedGems?: BuriedGemPos[];
  /** Food pickup positions (from canvas) */
  foodPositions?: { gridX: number; gridY: number }[];
  /** Rare entity positions (from canvas) */
  rareEntityPositions?: { gridX: number; gridY: number }[];
  /** Testing house position — always shown as a house icon */
  testingHousePosition?: { x: number; y: number };
  /** Maximum distance to show on radar (in grid units) */
  radarRange?: number;
  /** Size of the radar display in pixels */
  size?: number;
}

interface RadarEntity {
  type: 'player' | 'fragment' | 'buriedGem' | 'food' | 'rareEntity' | 'testingHouse';
  angle: number; // radians from center
  distance: number; // normalized 0-1 (1 = at edge, for pointers)
  color?: string;
  name?: string;
}

export function Radar({
  localPlayerX,
  localPlayerY,
  players,
  cureFragments,
  buriedGems = [],
  foodPositions = [],
  rareEntityPositions = [],
  testingHousePosition,
  radarRange = 15,
  size = 150,
}: RadarProps) {
  const center = size / 2;
  const radius = center - 8; // Leave some padding

  // Calculate relative positions of nearby entities
  const entities: RadarEntity[] = useMemo(() => {
    const result: RadarEntity[] = [];
    const px = typeof localPlayerX === 'number' && !Number.isNaN(localPlayerX) ? localPlayerX : 0;
    const py = typeof localPlayerY === 'number' && !Number.isNaN(localPlayerY) ? localPlayerY : 0;
    const gems = Array.isArray(buriedGems) ? buriedGems : [];
    const food = Array.isArray(foodPositions) ? foodPositions : [];
    const rare = Array.isArray(rareEntityPositions) ? rareEntityPositions : [];

    // Add nearby players
    for (const player of players) {
      const dx = (player?.gridX ?? 0) - px;
      const dy = (player?.gridY ?? 0) - py;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= radarRange && distance > 0) {
        const angle = Math.atan2(dy, dx);
        result.push({
          type: 'player',
          angle,
          distance: distance / radarRange,
          color: player.color,
          name: player.name,
        });
      }
    }

    // Add nearby cure fragments
    for (const fragment of cureFragments) {
      const dx = (fragment?.gridX ?? 0) - px;
      const dy = (fragment?.gridY ?? 0) - py;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= radarRange && distance > 0) {
        const angle = Math.atan2(dy, dx);
        result.push({
          type: 'fragment',
          angle,
          distance: distance / radarRange,
        });
      }
    }

    // Add nearby buried gems (hidden until dug)
    for (const gem of gems) {
      const dx = (gem?.gridX ?? 0) - px;
      const dy = (gem?.gridY ?? 0) - py;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance <= radarRange && distance > 0) {
        result.push({
          type: 'buriedGem',
          angle: Math.atan2(dy, dx),
          distance: distance / radarRange,
        });
      }
    }

    for (const pos of food) {
      const dx = (pos?.gridX ?? 0) - px;
      const dy = (pos?.gridY ?? 0) - py;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance <= radarRange && distance > 0) {
        result.push({
          type: 'food',
          angle: Math.atan2(dy, dx),
          distance: distance / radarRange,
        });
      }
    }
    for (const pos of rare) {
      const dx = (pos?.gridX ?? 0) - px;
      const dy = (pos?.gridY ?? 0) - py;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance <= radarRange && distance > 0) {
        result.push({
          type: 'rareEntity',
          angle: Math.atan2(dy, dx),
          distance: distance / radarRange,
        });
      }
    }

    // Testing house — always shown as a landmark pointer
    if (testingHousePosition) {
      const dx = testingHousePosition.x - px;
      const dy = testingHousePosition.y - py;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > 0) {
        result.push({
          type: 'testingHouse',
          angle: Math.atan2(dy, dx),
          distance: Math.min(1, distance / radarRange),
        });
      }
    }

    return result;
  }, [localPlayerX, localPlayerY, players, cureFragments, buriedGems, foodPositions, rareEntityPositions, testingHousePosition, radarRange]);

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        imageRendering: 'pixelated',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
      }}
    >
      {/* Radar background circle */}
      <svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* Outer circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="rgba(0, 0, 0, 0.7)"
          stroke="#4a4a4a"
          strokeWidth="2"
        />
        {/* Inner grid lines */}
        <line
          x1={center}
          y1={0}
          x2={center}
          y2={size}
          stroke="#3a3a3a"
          strokeWidth="1"
        />
        <line
          x1={0}
          y1={center}
          x2={size}
          y2={center}
          stroke="#3a3a3a"
          strokeWidth="1"
        />
        {/* Diagonal lines */}
        <line
          x1={center}
          y1={center}
          x2={center + radius * Math.cos(Math.PI / 4)}
          y2={center + radius * Math.sin(Math.PI / 4)}
          stroke="#3a3a3a"
          strokeWidth="1"
        />
        <line
          x1={center}
          y1={center}
          x2={center + radius * Math.cos(-Math.PI / 4)}
          y2={center + radius * Math.sin(-Math.PI / 4)}
          stroke="#3a3a3a"
          strokeWidth="1"
        />
        {/* Center dot (local player) */}
        <circle
          cx={center}
          cy={center}
          r={3}
          fill="#4CAF50"
          stroke="#2d7a32"
          strokeWidth="1"
        />
        {/* Range circles */}
        <circle
          cx={center}
          cy={center}
          r={radius * 0.5}
          fill="none"
          stroke="#2a2a2a"
          strokeWidth="1"
          strokeDasharray="2 2"
        />
        <circle
          cx={center}
          cy={center}
          r={radius * 0.75}
          fill="none"
          stroke="#2a2a2a"
          strokeWidth="1"
          strokeDasharray="2 2"
        />
      </svg>

      {/* Render entities */}
      {entities.map((entity, idx) => {
        const x = center + Math.cos(entity.angle) * entity.distance * radius;
        const y = center + Math.sin(entity.angle) * entity.distance * radius;

        if (entity.type === 'player') {
          return (
            <div
              key={`player-${idx}`}
              style={{
                position: 'absolute',
                left: Math.round(x) - 2,
                top: Math.round(y) - 2,
                width: 4,
                height: 4,
                backgroundColor: entity.color || '#ff4444',
                border: '1px solid rgba(0, 0, 0, 0.8)',
                boxShadow: `0 0 2px ${entity.color || '#ff4444'}, 0 0 4px ${entity.color || '#ff4444'}40`,
                imageRendering: 'pixelated',
                pointerEvents: 'none',
              }}
              title={entity.name}
            />
          );
        }
        if (entity.type === 'food') {
          return (
            <div
              key={`food-${idx}`}
              style={{
                position: 'absolute',
                left: Math.round(x) - 2,
                top: Math.round(y) - 2,
                width: 4,
                height: 4,
                borderRadius: 1,
                backgroundColor: '#f59e0b',
                border: '1px solid #d97706',
                boxShadow: '0 0 2px #f59e0b, 0 0 4px #f59e0b40',
                imageRendering: 'pixelated',
                pointerEvents: 'none',
              }}
              title="Food"
            />
          );
        }
        if (entity.type === 'buriedGem') {
          return (
            <div
              key={`gem-${idx}`}
              style={{
                position: 'absolute',
                left: Math.round(x) - 3,
                top: Math.round(y) - 3,
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: '#ef4444',
                border: '1px solid #dc2626',
                boxShadow: '0 0 3px #ef4444, 0 0 6px #ef444480',
                imageRendering: 'pixelated',
                pointerEvents: 'none',
              }}
              title="Buried Gem (L to dig)"
            />
          );
        }
        if (entity.type === 'rareEntity') {
          return (
            <div
              key={`rare-${idx}`}
              style={{
                position: 'absolute',
                left: Math.round(x) - 3,
                top: Math.round(y) - 3,
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: '#a855f7',
                border: '1px solid #7c3aed',
                boxShadow: '0 0 3px #a855f7, 0 0 6px #a855f780',
                imageRendering: 'pixelated',
                pointerEvents: 'none',
              }}
              title="Rare Entity (E to interact)"
            />
          );
        }
        if (entity.type === 'testingHouse') {
          // House icon: small square with a triangle roof
          const hx = Math.round(x);
          const hy = Math.round(y);
          return (
            <svg
              key={`house-${idx}`}
              style={{ position: 'absolute', left: hx - 7, top: hy - 9, pointerEvents: 'none', overflow: 'visible' }}
              width={14}
              height={14}
            >
              {/* Roof */}
              <polygon points="7,0 14,7 0,7" fill="#f59e0b" stroke="#92400e" strokeWidth="1" />
              {/* Walls */}
              <rect x="2" y="7" width="10" height="7" fill="#fde68a" stroke="#92400e" strokeWidth="1" />
              {/* Door */}
              <rect x="5" y="10" width="4" height="4" fill="#92400e" />
              <title>Testing House (T to test)</title>
            </svg>
          );
        }
        // Cure fragment
        return (
          <div
            key={`fragment-${idx}`}
            style={{
              position: 'absolute',
              left: Math.round(x) - 2,
              top: Math.round(y) - 2,
              width: 4,
              height: 4,
              transform: 'rotate(45deg)',
              backgroundColor: '#c084fc',
              border: '1px solid #a855f7',
              boxShadow: '0 0 2px #c084fc, 0 0 4px #c084fc40',
              imageRendering: 'pixelated',
              pointerEvents: 'none',
            }}
            title="Cure Fragment"
          />
        );
      })}

      {/* Radar label */}
      <div
        style={{
          position: 'absolute',
          bottom: 4,
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 10,
          fontWeight: 'bold',
          color: '#aaa',
          textShadow: '1px 1px 1px #000',
          pointerEvents: 'none',
        }}
      >
        RADAR
      </div>
    </div>
  );
}
