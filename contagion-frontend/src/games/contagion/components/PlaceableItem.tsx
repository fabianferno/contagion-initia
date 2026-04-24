import React from 'react';
import { getPreciseScreenPosition } from '../utils/isometricUtils';
import './PlaceableItem.css';

export interface PlaceableItemData {
  id: string;
  type: string;
  image: string;
  gridX: number;
  gridY: number;
  zIndex?: number;
}

interface PlaceableItemProps {
  item: PlaceableItemData;
  offsetX?: number;
  offsetY?: number;
  onClick?: () => void;
  onDragStart?: (e: React.MouseEvent) => void;
}

/**
 * PlaceableItem component for items that can be placed freely on the map
 * These items are NOT snapped to the grid and can be positioned at any pixel
 */
export function PlaceableItem({
  item,
  offsetX = 0,
  offsetY = 0,
  onClick,
  onDragStart,
}: PlaceableItemProps) {
  const screenPos = getPreciseScreenPosition(item.gridX, item.gridY, offsetX, offsetY);
  const zIndex = item.zIndex ?? 1000 + item.gridX + item.gridY;

  const itemStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${screenPos.x}px`,
    top: `${screenPos.y}px`,
    zIndex,
    cursor: onClick || onDragStart ? 'pointer' : 'default',
    imageRendering: 'pixelated' as const,
    transformOrigin: 'center bottom', // Anchor at bottom-center for consistency with tiles
    pointerEvents: 'auto',
  };

  return (
    <div
      style={itemStyle}
      onClick={onClick}
      onMouseDown={onDragStart}
      className="placeable-item"
    >
      <img
        src={item.image}
        alt={item.type}
        style={{
          display: 'block',
          maxWidth: '100%',
          height: 'auto',
          pointerEvents: 'none',
          imageRendering: 'auto',
        }}
      />
    </div>
  );
}
