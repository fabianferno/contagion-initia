import React, { useRef, useEffect, useState, useCallback } from 'react';
import { IsometricTile, type TileData } from './IsometricTile';
import { PlaceableItem, type PlaceableItemData } from './PlaceableItem';
import { getTileAssets, generateTile } from '../utils/tileManager';
import { gridToScreen, TILE_WIDTH, TILE_HEIGHT, TILE_IMAGE_SIZE } from '../utils/isometricUtils';
import './IsometricMap.css';

interface IsometricMapProps {
  width?: number; // Optional - will use container size if not provided
  height?: number; // Optional - will use container size if not provided
  cameraX?: number;
  cameraY?: number;
  onTileClick?: (gridX: number, gridY: number) => void;
  onItemClick?: (itemId: string) => void;
  placeableItems?: PlaceableItemData[];
  className?: string;
}

interface Chunk {
  x: number;
  y: number;
  tiles: Map<string, TileData>;
}

const CHUNK_SIZE = 16; // Tiles per chunk
const VIEWPORT_CHUNKS = 3; // How many chunks to render around camera

export function IsometricMap({
  width,
  height,
  cameraX = 0,
  cameraY = 0,
  onTileClick,
  onItemClick,
  placeableItems = [],
  className = '',
}: IsometricMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [chunks, setChunks] = useState<Map<string, Chunk>>(new Map());
  const [visibleTiles, setVisibleTiles] = useState<Array<{ gridX: number; gridY: number; tile: TileData }>>([]);
  const [dimensions, setDimensions] = useState({ width: width || 1200, height: height || 800 });

  // Update dimensions based on container size
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current?.parentElement) {
        const parent = containerRef.current.parentElement;
        const rect = parent.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setDimensions({
            width: rect.width,
            height: rect.height,
          });
        }
      } else if (!width || !height) {
        // Fallback to viewport size
        setDimensions({
          width: window.innerWidth - 40,
          height: window.innerHeight - 200,
        });
      }
    };

    // Initial update
    const timeoutId = setTimeout(updateDimensions, 0);
    
    // Update on resize
    window.addEventListener('resize', updateDimensions);
    
    // Also update when parent size changes (using ResizeObserver if available)
    let resizeObserver: ResizeObserver | null = null;
    if (containerRef.current?.parentElement && window.ResizeObserver) {
      resizeObserver = new ResizeObserver(updateDimensions);
      resizeObserver.observe(containerRef.current.parentElement);
    }

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateDimensions);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [width, height]);

  const mapWidth = dimensions.width;
  const mapHeight = dimensions.height;

  // Generate chunk key
  const getChunkKey = useCallback((chunkX: number, chunkY: number) => {
    return `${chunkX},${chunkY}`;
  }, []);

  // Get chunk coordinates from grid coordinates
  const getChunkCoords = useCallback((gridX: number, gridY: number) => {
    return {
      x: Math.floor(gridX / CHUNK_SIZE),
      y: Math.floor(gridY / CHUNK_SIZE),
    };
  }, []);

  // Load or generate chunk
  const getChunk = useCallback((chunkX: number, chunkY: number): Chunk => {
    const key = getChunkKey(chunkX, chunkY);
    
    if (chunks.has(key)) {
      return chunks.get(key)!;
    }

    // Generate new chunk
    const newChunk: Chunk = {
      x: chunkX,
      y: chunkY,
      tiles: new Map(),
    };

    // Generate tiles for this chunk
    for (let y = 0; y < CHUNK_SIZE; y++) {
      for (let x = 0; x < CHUNK_SIZE; x++) {
        const gridX = chunkX * CHUNK_SIZE + x;
        const gridY = chunkY * CHUNK_SIZE + y;
        const tile = generateTile(gridX, gridY);
        newChunk.tiles.set(`${x},${y}`, tile);
      }
    }

    return newChunk;
  }, [chunks, getChunkKey]);

  // Update visible tiles based on camera position
  useEffect(() => {
    const cameraChunk = getChunkCoords(cameraX, cameraY);
    const newChunks = new Map(chunks);
    const newVisibleTiles: Array<{ gridX: number; gridY: number; tile: TileData }> = [];

    // Load chunks around camera
    for (let dy = -VIEWPORT_CHUNKS; dy <= VIEWPORT_CHUNKS; dy++) {
      for (let dx = -VIEWPORT_CHUNKS; dx <= VIEWPORT_CHUNKS; dx++) {
        const chunkX = cameraChunk.x + dx;
        const chunkY = cameraChunk.y + dy;
        const key = getChunkKey(chunkX, chunkY);

        if (!newChunks.has(key)) {
          const chunk = getChunk(chunkX, chunkY);
          newChunks.set(key, chunk);
        }

        const chunk = newChunks.get(key)!;
        
        // Add tiles from this chunk
        chunk.tiles.forEach((tile, tileKey) => {
          const [localX, localY] = tileKey.split(',').map(Number);
          const gridX = chunkX * CHUNK_SIZE + localX;
          const gridY = chunkY * CHUNK_SIZE + localY;
          
          // Check if tile is in viewport (rough check)
          // Use image size for viewport culling since that's what we render
          const screenPos = gridToScreen(gridX, gridY);
          if (
            screenPos.x > -TILE_IMAGE_SIZE * 2 &&
            screenPos.x < mapWidth + TILE_IMAGE_SIZE * 2 &&
            screenPos.y > -TILE_IMAGE_SIZE * 2 &&
            screenPos.y < mapHeight + TILE_IMAGE_SIZE * 2
          ) {
            newVisibleTiles.push({ gridX, gridY, tile });
          }
        });
      }
    }

    // Clean up distant chunks (keep only recent ones)
    if (newChunks.size > VIEWPORT_CHUNKS * VIEWPORT_CHUNKS * 4) {
      const chunksToKeep = new Set<string>();
      for (let dy = -VIEWPORT_CHUNKS * 2; dy <= VIEWPORT_CHUNKS * 2; dy++) {
        for (let dx = -VIEWPORT_CHUNKS * 2; dx <= VIEWPORT_CHUNKS * 2; dx++) {
          const chunkX = cameraChunk.x + dx;
          const chunkY = cameraChunk.y + dy;
          chunksToKeep.add(getChunkKey(chunkX, chunkY));
        }
      }

      newChunks.forEach((_, key) => {
        if (!chunksToKeep.has(key)) {
          newChunks.delete(key);
        }
      });
    }

    setChunks(newChunks);
    setVisibleTiles(newVisibleTiles);
  }, [cameraX, cameraY, mapWidth, mapHeight, chunks, getChunk, getChunkCoords, getChunkKey]);

  // Calculate offset to center camera
  const cameraScreenPos = gridToScreen(cameraX, cameraY);
  const offsetX = mapWidth / 2 - cameraScreenPos.x;
  const offsetY = mapHeight / 2 - cameraScreenPos.y;

  return (
    <div
      ref={containerRef}
      className={`isometric-map ${className}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: '#87CEEB', // Sky blue background
      }}
    >
      {visibleTiles.map(({ gridX, gridY, tile }) => {
        const assets = getTileAssets(tile, gridX, gridY);
        return (
          <IsometricTile
            key={`tile-${gridX},${gridY}`}
            gridX={gridX}
            gridY={gridY}
            tile={tile}
            offsetX={offsetX}
            offsetY={offsetY}
            baseImage={assets.base}
            overlayImage={assets.overlay}
            onClick={onTileClick ? () => onTileClick(gridX, gridY) : undefined}
          />
        );
      })}
      
      {/* Render placeable items (not snapped to grid) */}
      {placeableItems.map((item) => (
        <PlaceableItem
          key={item.id}
          item={item}
          offsetX={offsetX}
          offsetY={offsetY}
          onClick={onItemClick ? () => onItemClick(item.id) : undefined}
        />
      ))}
    </div>
  );
}
