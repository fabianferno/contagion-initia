/**
 * Isometric coordinate conversion utilities
 * Converts between grid coordinates (x, y) and screen coordinates
 */

export interface GridPosition {
  x: number;
  y: number;
}

export interface ScreenPosition {
  x: number;
  y: number;
}

/**
 * Tile dimensions in pixels
 * - Image files are 500x500px (contains sprite with decorative elevation)
 * - Logical isometric tile size is 250x125px (2:1 ratio for walkable footprint)
 * - Use logical size for positioning calculations, image size for rendering
 */
export const TILE_IMAGE_SIZE = 500; // Actual image dimensions
export const TILE_WIDTH = 250; // Logical tile width (2:1 ratio)
export const TILE_HEIGHT = 125; // Logical tile height (2:1 ratio)
export const TILE_SIZE = TILE_WIDTH; // Alias for compatibility

/**
 * Convert grid coordinates to screen coordinates (true isometric projection)
 * Uses LOGICAL tile size (250x125) for positioning, not image size (500x500)
 * - The walkable footprint is a 2:1 diamond at the bottom of the 500x500 image
 * - Returns the position of the bottom-center point of the diamond footprint
 * - This is where tiles should be anchored
 */
export function gridToScreen(gridX: number, gridY: number): ScreenPosition {
  // Use logical tile dimensions (250x125) for positioning calculations
  // Standard isometric projection: 2:1 ratio
  const screenX = (gridX - gridY) * (TILE_WIDTH / 2);
  const screenY = (gridX + gridY) * (TILE_HEIGHT / 2);
  // Return bottom-center position of the diamond footprint
  return { x: screenX, y: screenY };
}

/**
 * Convert screen coordinates to grid coordinates (reverse isometric projection)
 * Uses logical tile size (250x125) for calculations
 */
export function screenToGrid(screenX: number, screenY: number): GridPosition {
  const gridX = (screenX / (TILE_WIDTH / 2) + screenY / (TILE_HEIGHT / 2)) / 2;
  const gridY = (screenY / (TILE_HEIGHT / 2) - screenX / (TILE_WIDTH / 2)) / 2;
  return { x: Math.floor(gridX), y: Math.floor(gridY) };
}

/**
 * Convert screen coordinates to precise grid coordinates (for free placement)
 * Returns fractional coordinates for placeable items
 * Uses logical tile size (250x125) for calculations
 */
export function screenToPreciseGrid(screenX: number, screenY: number): { x: number; y: number } {
  const gridX = (screenX / (TILE_WIDTH / 2) + screenY / (TILE_HEIGHT / 2)) / 2;
  const gridY = (screenY / (TILE_HEIGHT / 2) - screenX / (TILE_WIDTH / 2)) / 2;
  return { x: gridX, y: gridY };
}

/**
 * Get the screen position for a tile's anchor point (bottom-center of diamond)
 * For true isometric 500x500px tiles:
 * - The walkable footprint is a 2:1 diamond at the BOTTOM of the 500x500 image
 * - Anchor point is BOTTOM-CENTER (not top-left)
 * - Top portion is decorative elevation only
 */
export function getTileScreenPosition(gridX: number, gridY: number, offsetX = 0, offsetY = 0): ScreenPosition {
  const pos = gridToScreen(gridX, gridY);
  // Anchor at bottom-center of the logical diamond footprint
  // Use logical tile width/height for positioning
  return {
    x: pos.x + offsetX - (TILE_WIDTH / 2), // Center horizontally on logical width
    y: pos.y + offsetY - TILE_HEIGHT, // Position bottom-center using logical height
  };
}

/**
 * Get screen position for a precise grid coordinate (for placeable items)
 * Allows free placement not snapped to grid
 * Uses logical tile size (250x125) for positioning
 * Uses bottom-center anchor for consistency with tiles
 */
export function getPreciseScreenPosition(gridX: number, gridY: number, offsetX = 0, offsetY = 0): ScreenPosition {
  // Use logical tile dimensions for positioning
  const screenX = (gridX - gridY) * (TILE_WIDTH / 2);
  const screenY = (gridX + gridY) * (TILE_HEIGHT / 2);
  return {
    x: screenX + offsetX - (TILE_WIDTH / 2), // Center horizontally on logical width
    y: screenY + offsetY - TILE_HEIGHT, // Position bottom-center using logical height
  };
}

/**
 * Calculate the bounding box for a grid area
 */
export function getGridBounds(gridX: number, gridY: number, width: number, height: number): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
} {
  const corners = [
    gridToScreen(gridX, gridY),
    gridToScreen(gridX + width, gridY),
    gridToScreen(gridX, gridY + height),
    gridToScreen(gridX + width, gridY + height),
  ];

  return {
    minX: Math.min(...corners.map(c => c.x)),
    maxX: Math.max(...corners.map(c => c.x)),
    minY: Math.min(...corners.map(c => c.y)),
    maxY: Math.max(...corners.map(c => c.y)),
  };
}
