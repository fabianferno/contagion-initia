import React from 'react';
import { getTileScreenPosition, TILE_IMAGE_SIZE } from '../utils/isometricUtils';

export interface TileData {
  type: 'grass' | 'dirt' | 'water' | 'stone' | 'sand';
  variant?: number;
  overlay?: string;
  zIndex?: number;
  /** Biome tag for asset/decoration selection. */
  biome?: string;
  /** Whether this tile blocks player movement. */
  blocked?: boolean;
  /** Optional tall decoration sprite (tree, bush, rock) drawn depth-sorted. */
  decoration?: string;
  /** Elevation level: 0 = ground, 1+ = raised, -1 = sunken (water). Character
   *  can move between tiles whose elevation differs by at most 1. */
  elevation?: number;
}

interface IsometricTileProps {
  gridX: number;
  gridY: number;
  tile: TileData;
  offsetX?: number;
  offsetY?: number;
  baseImage?: string;
  overlayImage?: string;
  onClick?: () => void;
}

export function IsometricTile({
  gridX,
  gridY,
  tile,
  offsetX = 0,
  offsetY = 0,
  baseImage,
  overlayImage,
  onClick,
}: IsometricTileProps) {
  const screenPos = getTileScreenPosition(gridX, gridY, offsetX, offsetY);
  const zIndex = tile.zIndex ?? gridX + gridY;

  const tileStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${screenPos.x}px`,
    top: `${screenPos.y}px`,
    width: `${TILE_IMAGE_SIZE}px`, // Render full 500x500 image
    height: `${TILE_IMAGE_SIZE}px`, // Render full 500x500 image
    zIndex,
    cursor: onClick ? 'pointer' : 'default',
    imageRendering: 'pixelated' as const,
    // Anchor at bottom-center: the walkable footprint is a 2:1 diamond at the bottom
    // Logical tile size (250x125) is used for positioning, but we render the full 500x500 image
    transformOrigin: 'center bottom',
  };

  return (
    <div
      style={tileStyle}
      onClick={onClick}
      className="isometric-tile"
    >
      {baseImage && (
        <img
          src={baseImage}
          alt={`${tile.type} tile`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'center bottom', // Anchor at bottom-center
            pointerEvents: 'none',
            display: 'block',
          }}
        />
      )}
      {overlayImage && (
        <img
          src={overlayImage}
          alt="tile overlay"
          style={{
            position: 'absolute',
            bottom: 0, // Align to bottom
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'center bottom', // Anchor at bottom-center
            pointerEvents: 'none',
            display: 'block',
          }}
        />
      )}
    </div>
  );
}
