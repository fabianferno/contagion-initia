import { useState, useEffect } from 'react';

import inv1 from '@/assets/Inventory/Inventory1.png';
import inv2 from '@/assets/Inventory/Inventory2.png';
import inv3 from '@/assets/Inventory/Inventory3.png';
import inv4 from '@/assets/Inventory/Inventory4.png';
import inv5 from '@/assets/Inventory/Inventory5.png';
import inv6 from '@/assets/Inventory/Inventory6.png';
import inv7 from '@/assets/Inventory/Inventory7.png';
import inv8 from '@/assets/Inventory/Inventory8.png';
import inv9 from '@/assets/Inventory/Inventory9.png';
import inv10 from '@/assets/Inventory/Inventory10.png';
import inv11 from '@/assets/Inventory/Inventory11.png';

import diamondImg from '@/assets/PlacebleItems/Valuables/Diamond.png';
import rubyImg from '@/assets/PlacebleItems/Valuables/Ruby.png';
import amberImg from '@/assets/PlacebleItems/Valuables/Amber.png';
import amethystImg from '@/assets/PlacebleItems/Valuables/Amathyst.png';
import emeraldImg from '@/assets/PlacebleItems/Valuables/Emrald.png';

// Frame array: index 0 = no selection, indices 1–10 = slot 0–9 selected
const FRAMES = [inv1, inv2, inv3, inv4, inv5, inv6, inv7, inv8, inv9, inv10, inv11];

// ─── Layout constants (source pixels, 101×76 image) ─────────────────
const SRC_W = 101;
const SRC_H = 76;
const SCALE = 6;

// Slot grid: 5 columns × 2 rows
const COLS = 5;
const ROWS = 2;
const GRID_ORIGIN_X = 3;
const GRID_ORIGIN_Y = 34;
const COL_STRIDE = 19;
const ROW_STRIDE = 18;
const SLOT_W = 17;
const SLOT_H = 16;

const GEM_TYPES = ['diamond', 'ruby', 'emerald', 'amethyst', 'amber'] as const;
type GemType = typeof GEM_TYPES[number];

const GEM_IMAGES: Record<GemType, string> = {
  diamond: diamondImg,
  ruby: rubyImg,
  emerald: emeraldImg,
  amethyst: amethystImg,
  amber: amberImg,
};

const GEM_LABELS: Record<GemType, string> = {
  diamond: 'Diamond',
  ruby: 'Ruby',
  emerald: 'Emerald',
  amethyst: 'Amethyst',
  amber: 'Amber',
};

interface InventoryOverlayProps {
  gemInventory?: Record<string, number>;
  onClose: () => void;
}

export function InventoryOverlay({ gemInventory = {}, onClose }: InventoryOverlayProps) {
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  // Keyboard: Escape to close, 1–9 and 0 to select slots
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      const digit = parseInt(e.key, 10);
      if (!isNaN(digit)) {
        const slot = digit === 0 ? 9 : digit - 1;
        setSelectedSlot((prev) => prev === slot ? null : slot);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Slot 0–4 = gems (one slot per gem type), slot 5–9 = empty for future use
  const frameIndex = selectedSlot === null ? 0 : selectedSlot + 1;
  const frameSrc = FRAMES[Math.min(frameIndex, FRAMES.length - 1)];

  const selectedGemType = selectedSlot !== null && selectedSlot < GEM_TYPES.length
    ? GEM_TYPES[selectedSlot]
    : null;

  const totalGems = GEM_TYPES.reduce((sum, t) => sum + (gemInventory[t] ?? 0), 0);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div style={{ position: 'relative', width: SRC_W * SCALE, height: SRC_H * SCALE }}>
        {/* Pre-rendered inventory frame */}
        <img
          src={frameSrc}
          alt="Inventory"
          draggable={false}
          style={{
            display: 'block',
            width: SRC_W * SCALE,
            height: SRC_H * SCALE,
            imageRendering: 'pixelated',
          }}
        />

        {/* Gem slots (first 5) */}
        {GEM_TYPES.map((gemType, i) => {
          const col = i % COLS;
          const row = Math.floor(i / COLS);
          const x = GRID_ORIGIN_X + col * COL_STRIDE;
          const y = GRID_ORIGIN_Y + row * ROW_STRIDE;
          const count = gemInventory[gemType] ?? 0;

          return (
            <div
              key={gemType}
              style={{
                position: 'absolute',
                left: x * SCALE + 2,
                top: y * SCALE + 2,
                width: SLOT_W * SCALE - 4,
                height: SLOT_H * SCALE - 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}
            >
              {count > 0 && (
                <>
                  <img
                    src={GEM_IMAGES[gemType]}
                    alt={gemType}
                    style={{
                      width: '70%',
                      height: '70%',
                      objectFit: 'contain',
                      imageRendering: 'pixelated',
                    }}
                  />
                  {/* Count badge */}
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 2,
                      right: 4,
                      fontSize: 9 * SCALE / 6,
                      fontFamily: '"Press Start 2P", monospace',
                      fontWeight: 'bold',
                      color: '#fff',
                      textShadow: '1px 1px 0 #000',
                      lineHeight: 1,
                    }}
                  >
                    {count}
                  </span>
                </>
              )}
            </div>
          );
        })}

        {/* Slot clickable hitboxes */}
        {Array.from({ length: COLS * ROWS }).map((_, i) => {
          const col = i % COLS;
          const row = Math.floor(i / COLS);
          const x = GRID_ORIGIN_X + col * COL_STRIDE;
          const y = GRID_ORIGIN_Y + row * ROW_STRIDE;
          const gemType = i < GEM_TYPES.length ? GEM_TYPES[i] : null;
          const count = gemType ? (gemInventory[gemType] ?? 0) : 0;

          return (
            <button
              key={i}
              style={{
                position: 'absolute',
                left: x * SCALE,
                top: y * SCALE,
                width: SLOT_W * SCALE,
                height: SLOT_H * SCALE,
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
              }}
              onClick={() => setSelectedSlot(selectedSlot === i ? null : i)}
              title={gemType ? `${GEM_LABELS[gemType]}: ${count}` : `Slot ${i + 1}`}
            />
          );
        })}

        {/* Selected gem info panel */}
        {selectedGemType && (
          <div
            style={{
              position: 'absolute',
              bottom: -72,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.85)',
              border: '1px solid #888',
              borderRadius: 6,
              padding: '6px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              whiteSpace: 'nowrap',
            }}
          >
            <img
              src={GEM_IMAGES[selectedGemType]}
              style={{ width: 28, height: 28, imageRendering: 'pixelated' }}
              alt={selectedGemType}
            />
            <span style={{ fontFamily: '"Press Start 2P", monospace', color: '#fff', fontSize: 14 }}>
              {GEM_LABELS[selectedGemType]}: <b>{gemInventory[selectedGemType] ?? 0}</b>
            </span>
          </div>
        )}

        {/* Total count */}
        <div
          style={{
            position: 'absolute',
            bottom: -28,
            left: '50%',
            transform: 'translateX(-50%)',
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 14,
            color: '#fff',
            textShadow: '1px 1px 2px #000',
            whiteSpace: 'nowrap',
          }}
        >
          Gems: {totalGems}
        </div>
      </div>
    </div>
  );
}
