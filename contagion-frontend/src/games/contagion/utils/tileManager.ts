/**
 * Tile asset manager — Stardew Valley–style procedural map generation
 *
 * Uses layered value noise to produce biomes: grass plains, forests,
 * dirt paths/roads, stone mountains, water ponds, sandy shores, and
 * flower meadows.  Every tile is deterministic (seed = grid position).
 */

import type { TileData } from '../components/IsometricTile';

// ── Ground / base ────────────────────────────────────────────────────
import dirt1 from '@/assets/Tiles/Ground/GroundTile_Dirt1.png';
import dirt2 from '@/assets/Tiles/Ground/GroundTile_Dirt2.png';
import dirt3 from '@/assets/Tiles/Ground/GroundTile_Dirt3.png';
import sand from '@/assets/Tiles/Ground/GroundTile_Sand.png';
import water from '@/assets/Tiles/Water/GroundTile_Water.png';
import stone1 from '@/assets/Tiles/Stone/GroundTile_Stone1.png';
import stone2 from '@/assets/Tiles/Stone/GroundTile_Stone2.png';
import stone3 from '@/assets/Tiles/Stone/GroundTile_Stone3.png';

// ── Grass overlays ───────────────────────────────────────────────────
import grass1 from '@/assets/Tiles/Grass/TileOverlay_Grass1.png';
import grass2 from '@/assets/Tiles/Grass/TileOverlay_Grass2.png';
import grass3 from '@/assets/Tiles/Grass/TileOverlay_Grass3.png';
import tallGrass1 from '@/assets/Tiles/Grass/TileOverlay_TallGrass1.png';
import tallGrass2 from '@/assets/Tiles/Grass/TileOverlay_TallGrass2.png';
import tallGrass3 from '@/assets/Tiles/Grass/TileOverlay_TallGrass3.png';

// ── Flowers ──────────────────────────────────────────────────────────
import flower1 from '@/assets/Tiles/Grass/TileOverlay_Flower1.png';
import flower2 from '@/assets/Tiles/Grass/TileOverlay_Flower2.png';
import flower3 from '@/assets/Tiles/Grass/TileOverlay_Flower3.png';
import flower4 from '@/assets/Tiles/Grass/TileOverlay_Flower4.png';
import flower5 from '@/assets/Tiles/Grass/TileOverlay_Flower5.png';
import flower6 from '@/assets/Tiles/Grass/TileOverlay_Flower6.png';
import flower7 from '@/assets/Tiles/Grass/TileOverlay_Flower7.png';
import flower8 from '@/assets/Tiles/Grass/TileOverlay_Flower8.png';
import flower9 from '@/assets/Tiles/Grass/TileOverlay_Flower9.png';
import flower10 from '@/assets/Tiles/Grass/TileOverlay_Flower10.png';
import flower11 from '@/assets/Tiles/Grass/TileOverlay_Flower11.png';
import flower12 from '@/assets/Tiles/Grass/TileOverlay_Flower12.png';
import clovers1 from '@/assets/Tiles/Grass/TileOverlay_Clovers1.png';
import clovers2 from '@/assets/Tiles/Grass/TileOverlay_Clovers2.png';
import clovers3 from '@/assets/Tiles/Grass/TileOverlay_Clovers3.png';

// ── Stone overlays (paths + tall rocks) ──────────────────────────────
import stonePath1 from '@/assets/Tiles/Stone/TileOverlay_StonePath1.png';
import stonePath2 from '@/assets/Tiles/Stone/TileOverlay_StonePath2.png';
import stonePath3 from '@/assets/Tiles/Stone/TileOverlay_StonePath3.png';
import tallStone2 from '@/assets/Tiles/Stone/TallTileOverlay_Stone2.png';
import tallStone3 from '@/assets/Tiles/Stone/TallTileOverlay_Stone3.png';
import tallStone4 from '@/assets/Tiles/Stone/TallTileOverlay_Stone4.png';

// ── Trees ────────────────────────────────────────────────────────────
import pineStage4 from '@/assets/Tiles/Trees/Pine_Stage4.png';
import oakStage4 from '@/assets/Tiles/Trees/Oak_Stage4.png';
import birchStage4 from '@/assets/Tiles/Trees/Birch_Stage4.png';
import cherryStage4 from '@/assets/Tiles/Trees/CherryTree_Stage4.png';
import appleStage4 from '@/assets/Tiles/Trees/Appletree_Stage4.png';
import ginkgoStage4 from '@/assets/Tiles/Trees/Ginkgo_Stage4.png';
import plumStage4 from '@/assets/Tiles/Trees/PlumTree_Stage4.png';
import fantasyStage4 from '@/assets/Tiles/Trees/FantasyTree_Stage4.png';

// ── Bushes ───────────────────────────────────────────────────────────
import berryBush1Red from '@/assets/Tiles/Bushes/Bush_BerryBush1_BerriesRed.png';
import berryBush2White from '@/assets/Tiles/Bushes/Bush_BerryBush2_BerriesWhite.png';
import berryBush3Black from '@/assets/Tiles/Bushes/Bush_BerryBush3_BerriesBlack.png';
import greenBush1 from '@/assets/Tiles/Bushes/Bush_GreenBush1.png';
import greenBush2 from '@/assets/Tiles/Bushes/Bush_GreenBush2.png';
import greenBush3 from '@/assets/Tiles/Bushes/Bush_GreenBush3.png';
import decorBushPink from '@/assets/Tiles/Bushes/Bush_DecorativeBush_Pink.png';
import decorBushBlue from '@/assets/Tiles/Bushes/Bush_DecorativeBush_Blue.png';
import decorBushOrange from '@/assets/Tiles/Bushes/Bush_DecorativeBush_Orange.png';

// ── Water overlays ───────────────────────────────────────────────────
import waterPuddle1 from '@/assets/Tiles/Water/TileOverlay_WaterPuddle1.png';
import waterPuddle2 from '@/assets/Tiles/Water/TileOverlay_WaterPuddle2.png';
import waterPuddle3 from '@/assets/Tiles/Water/TileOverlay_WaterPuddle3.png';

// ── Snow and Ice overlays ────────────────────────────────────────────
import snowOverlay from '@/assets/Tiles/Water/TileOverlayDiscreet_Snow.png';
import iceOverlay from '@/assets/Tiles/Water/TileOverlay_Ice.png';
import brokenIce1 from '@/assets/Tiles/Water/TileOverlay_BrokenIce1.png';

// ── Asset arrays ─────────────────────────────────────────────────────

const DIRT_BASES = [dirt1, dirt2, dirt3];
const STONE_BASES = [stone1, stone2, stone3];
const GRASS_OVERLAYS = [grass1, grass2, grass3];
const TALL_GRASS = [tallGrass1, tallGrass2, tallGrass3];
const FLOWERS = [flower1, flower2, flower3, flower4, flower5, flower6, flower7, flower8, flower9, flower10, flower11, flower12];
const CLOVERS = [clovers1, clovers2, clovers3];
const STONE_PATHS = [stonePath1, stonePath2, stonePath3];
const TALL_STONES = [tallStone2, tallStone3, tallStone4];
const TREES = [pineStage4, oakStage4, birchStage4, cherryStage4, appleStage4, ginkgoStage4, plumStage4, fantasyStage4];
const BUSHES = [berryBush1Red, berryBush2White, berryBush3Black, greenBush1, greenBush2, greenBush3, decorBushPink, decorBushBlue, decorBushOrange];
const WATER_PUDDLES = [waterPuddle1, waterPuddle2, waterPuddle3];

// ── Deterministic hash / noise ───────────────────────────────────────

/** Fast integer hash (Robert Jenkins' 32-bit mix). */
function hash(x: number, y: number, seed: number = 0): number {
  let h = (x * 374761393 + y * 668265263 + seed * 2147483647) | 0;
  h = ((h ^ (h >> 13)) * 1274126177) | 0;
  h = (h ^ (h >> 16)) | 0;
  return h;
}

/** Returns 0..1 deterministic random for a grid cell + channel. */
function rng(gx: number, gy: number, channel: number = 0): number {
  return (Math.abs(hash(gx, gy, channel)) % 10000) / 10000;
}

/** Smooth value noise in 0..1 at arbitrary (fx, fy) for a given channel.
 *  Uses bilinear interpolation of hashed grid corners. */
function noise(fx: number, fy: number, channel: number = 0): number {
  const ix = Math.floor(fx);
  const iy = Math.floor(fy);
  const tx = fx - ix;
  const ty = fy - iy;

  // Smoothstep
  const sx = tx * tx * (3 - 2 * tx);
  const sy = ty * ty * (3 - 2 * ty);

  const n00 = rng(ix, iy, channel);
  const n10 = rng(ix + 1, iy, channel);
  const n01 = rng(ix, iy + 1, channel);
  const n11 = rng(ix + 1, iy + 1, channel);

  const nx0 = n00 + sx * (n10 - n00);
  const nx1 = n01 + sx * (n11 - n01);
  return nx0 + sy * (nx1 - nx0);
}

/** Multi-octave fractal noise (fBm). */
function fbm(fx: number, fy: number, octaves: number, channel: number): number {
  let value = 0;
  let amp = 1;
  let freq = 1;
  let maxAmp = 0;
  for (let i = 0; i < octaves; i++) {
    value += amp * noise(fx * freq, fy * freq, channel + i * 97);
    maxAmp += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return value / maxAmp;
}

// ── Maze corridor generation (deterministic recursive backtracking) ───
// Layout: each cell is 5x5 tiles (3x3 interior + 1-tile walls between cells).
// Walls are grass; passages are dirt. Creates winding maze corridors.

const MAZE_CELL_SIZE = 5;
const MAZE_WIDTH = 42;   // 42*5 = 210 tiles
const MAZE_HEIGHT = 42;
const MAZE_SEED = 12345;

/** Wall openings: "cx,cy,dx,dy" means passage from (cx,cy) toward (dx,dy). */
let mazePassages: Set<string>;

function initMaze(): void {
  mazePassages = new Set();
  const visited = new Set<string>();
  const stack: [number, number][] = [[0, 0]];
  visited.add('0,0');

  const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];

  while (stack.length > 0) {
    const [cx, cy] = stack[stack.length - 1];

    const unvisited: number[] = [];
    for (let i = 0; i < 4; i++) {
      const [dx, dy] = dirs[i];
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx >= 0 && nx < MAZE_WIDTH && ny >= 0 && ny < MAZE_HEIGHT && !visited.has(`${nx},${ny}`)) {
        unvisited.push(i);
      }
    }

    if (unvisited.length === 0) {
      stack.pop();
      continue;
    }

    const r = hash(cx, cy, MAZE_SEED);
    const idx = Math.abs(r) % unvisited.length;
    const chosen = unvisited[idx];
    const [dx, dy] = dirs[chosen];
    const nx = cx + dx;
    const ny = cy + dy;
    visited.add(`${nx},${ny}`);
    mazePassages.add(`${cx},${cy},${dx},${dy}`);
    mazePassages.add(`${nx},${ny},${-dx},${-dy}`);
    stack.push([nx, ny]);
  }
}

initMaze();

/** True if tile (gx, gy) is inside a maze cell's interior (always corridor). */
function isMazeCellInterior(gx: number, gy: number): boolean {
  const cx = Math.floor(gx / MAZE_CELL_SIZE);
  const cy = Math.floor(gy / MAZE_CELL_SIZE);
  if (cx < 0 || cx >= MAZE_WIDTH || cy < 0 || cy >= MAZE_HEIGHT) return false;
  const localX = gx - cx * MAZE_CELL_SIZE;
  const localY = gy - cy * MAZE_CELL_SIZE;
  return localX >= 1 && localX <= 3 && localY >= 1 && localY <= 3;
}

/** True if tile (gx, gy) is a passage (opening in wall between cells). */
function isMazePassage(gx: number, gy: number): boolean {
  const cx = Math.floor(gx / MAZE_CELL_SIZE);
  const cy = Math.floor(gy / MAZE_CELL_SIZE);
  const localX = gx - cx * MAZE_CELL_SIZE;
  const localY = gy - cy * MAZE_CELL_SIZE;

  if (localX === 4 && localY >= 1 && localY <= 3) {
    return localY === 2 && mazePassages.has(`${cx},${cy},1,0`);
  }
  if (localX === 0 && localY >= 1 && localY <= 3) {
    return localY === 2 && cx > 0 && mazePassages.has(`${cx - 1},${cy},1,0`);
  }
  if (localY === 4 && localX >= 1 && localX <= 3) {
    return localX === 2 && mazePassages.has(`${cx},${cy},0,1`);
  }
  if (localY === 0 && localX >= 1 && localX <= 3) {
    return localX === 2 && cy > 0 && mazePassages.has(`${cx},${cy - 1},0,1`);
  }
  return false;
}

function isMazeCorridor(gx: number, gy: number): boolean {
  return isMazeCellInterior(gx, gy) || isMazePassage(gx, gy);
}

// ── Road network (village center + maze) ───────────────────────────────

/** Road segments for village center (Stardew-style). */
const ROAD_SEGMENTS: [number, number, number, number][] = [
  [10, 32, 54, 32],
  [32, 10, 32, 54],
  [20, 32, 12, 20],
  [44, 32, 52, 44],
  [32, 20, 42, 14],
  [22, 44, 42, 44],
];

function pointToSegmentDist(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.sqrt((px - ax) ** 2 + (py - ay) ** 2);
  let t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const closestX = ax + t * dx;
  const closestY = ay + t * dy;
  return Math.sqrt((px - closestX) ** 2 + (py - closestY) ** 2);
}

function isVillageRoad(gx: number, gy: number): boolean {
  for (const [ax, ay, bx, by] of ROAD_SEGMENTS) {
    if (pointToSegmentDist(gx + 0.5, gy + 0.5, ax, ay, bx, by) < 1.6) return true;
  }
  return false;
}

function isRoad(gx: number, gy: number): boolean {
  if (isVillageRoad(gx, gy)) return true;
  return isMazeCorridor(gx, gy);
}

// ── Pond centers (circular water areas) ──────────────────────────────

const POND_CENTERS: [number, number, number][] = [
  // [cx, cy, radius]  — hardcoded for the original 64×64 region
  [18, 46, 5],   // SW lake with beach
  [48, 18, 4.5], // NE lake with beach
  [8, 14, 3.5],  // NW pond with beach
  // Reduced ponds - only keep key decorative ponds in corners
  [5, 5, 3.5],    // far NW corner
  [58, 58, 3.5],  // far SE corner
];

/** Procedurally generate pond centers for any 32×32 region.
 *  Uses noise to deterministically decide if a region has a pond. */
function getProceduralPondCenters(gx: number, gy: number): [number, number, number][] {
  // Which 32×32 region are we in?
  const rx = Math.floor(gx / 32);
  const ry = Math.floor(gy / 32);
  // Skip the original 64×64 region (covered by hardcoded)
  if (rx >= 0 && rx <= 1 && ry >= 0 && ry <= 1) return [];
  // ~60% chance a region gets a pond or lake — fill empty areas
  const regionHash = rng(rx, ry, 500);
  if (regionHash > 0.6) return [];
  // Place pond at noise-derived position within the region
  const cx = rx * 32 + 8 + Math.floor(rng(rx, ry, 501) * 16);
  const cy = ry * 32 + 8 + Math.floor(rng(rx, ry, 502) * 16);
  // Mix of small ponds and occasional larger lakes
  const isLake = rng(rx, ry, 504) < 0.25;
  const radius = isLake ? 4 + rng(rx, ry, 503) * 3 : 2.5 + rng(rx, ry, 503) * 2.5;
  return [[cx, cy, radius]];
}

// ── Rivers for maze-like terrain (removed - was blocking movement) ─────
function isRiver(gx: number, gy: number): number {
  // Rivers removed - they were blocking player movement
  return 0;
}

function pondValue(gx: number, gy: number): number {
  // Check rivers first
  const riverVal = isRiver(gx, gy);
  if (riverVal > 0) return riverVal;

  // Check hardcoded ponds
  for (const [cx, cy, r] of POND_CENTERS) {
    const d = Math.sqrt((gx - cx) ** 2 + (gy - cy) ** 2);
    if (d < r) return 1;
    if (d < r + 2.5) return 1 - (d - r) / 2.5; // Wider beach area
  }
  // Check procedural ponds (check surrounding regions too)
  for (let drx = -1; drx <= 1; drx++) {
    for (let dry = -1; dry <= 1; dry++) {
      const ponds = getProceduralPondCenters(gx + drx * 32, gy + dry * 32);
      for (const [cx, cy, r] of ponds) {
        const d = Math.sqrt((gx - cx) ** 2 + (gy - cy) ** 2);
        if (d < r) return 1;
        if (d < r + 2) return 1 - (d - r) / 2; // Beach area
      }
    }
  }
  return 0;
}

// ── Mountain clusters (bigger, multi-level like the reference image) ──

const MOUNTAIN_CLUSTERS: { cx: number; cy: number; r: number; peak: number }[] = [
  // Grand central-west mountain — 7 layers, the tallest peak
  { cx: 12, cy: 48, r: 14, peak: 7 },
  // NE mountain range — 6 layers
  { cx: 50, cy: 10, r: 12, peak: 6 },
  // SE mountain — 5 layers
  { cx: 54, cy: 48, r: 10, peak: 5 },
  // NW hillock — 4 layers
  { cx: 10, cy: 12, r: 7, peak: 4 },
  // Central-south ridge — 5 layers
  { cx: 32, cy: 55, r: 8, peak: 5 },
  // Additional elevated areas for more varied terrain
  { cx: 8, cy: 32, r: 6, peak: 4 },
  { cx: 58, cy: 28, r: 8, peak: 5 },
  { cx: 20, cy: 8, r: 6, peak: 4 },
  { cx: 42, cy: 8, r: 5, peak: 3 },
  { cx: 8, cy: 56, r: 6, peak: 4 },
  { cx: 56, cy: 56, r: 6, peak: 4 },
  // Snow mountains in empty corner/edge areas
  { cx: 4, cy: 4, r: 8, peak: 6 },   // far NW — snow peak
  { cx: 60, cy: 4, r: 7, peak: 5 },  // far NE — snow peak
  { cx: 4, cy: 60, r: 8, peak: 6 },  // far SW — snow peak
  { cx: 60, cy: 60, r: 7, peak: 5 }, // far SE — snow peak
  { cx: 4, cy: 32, r: 6, peak: 5 },  // west edge — snow peak
  { cx: 60, cy: 32, r: 6, peak: 5 }, // east edge — snow peak
];

/** Procedurally generate mountain clusters for any 32×32 region. */
function getProceduralMountains(gx: number, gy: number): { cx: number; cy: number; r: number; peak: number }[] {
  const rx = Math.floor(gx / 32);
  const ry = Math.floor(gy / 32);
  // Skip original 64×64 area
  if (rx >= 0 && rx <= 1 && ry >= 0 && ry <= 1) return [];
  // ~75% chance a region gets a mountain — lots of elevated terrain
  const regionHash = rng(rx, ry, 600);
  if (regionHash > 0.75) return [];
  const cx = rx * 32 + 8 + Math.floor(rng(rx, ry, 601) * 16);
  const cy = ry * 32 + 8 + Math.floor(rng(rx, ry, 602) * 16);
  const r = 6 + Math.floor(rng(rx, ry, 603) * 10);    // radius 6-15
  const peak = 4 + Math.floor(rng(rx, ry, 604) * 5);  // peak 4-8
  return [{ cx, cy, r, peak }];
}

function evaluateMountain(gx: number, gy: number, cluster: { cx: number; cy: number; r: number; peak: number }): { value: number; peak: number } {
  const { cx, cy, r, peak } = cluster;
  const d = Math.sqrt((gx - cx) ** 2 + (gy - cy) ** 2);
  let v = 0;
  if (d < r * 0.3) v = 1;
  else if (d < r) v = 1 - (d - r * 0.3) / (r * 0.7);
  else if (d < r + 2) v = (1 - (d - r) / 2) * 0.1;
  return { value: v, peak };
}

/** Returns a smooth 0..1 mountain influence value + the peak elevation for this tile. */
function mountainInfo(gx: number, gy: number): { value: number; peak: number } {
  let bestVal = 0;
  let bestPeak = 0;
  // Hardcoded clusters
  for (const cluster of MOUNTAIN_CLUSTERS) {
    const { value, peak } = evaluateMountain(gx, gy, cluster);
    if (value > bestVal) { bestVal = value; bestPeak = peak; }
  }
  // Procedural clusters (check surrounding regions)
  for (let drx = -1; drx <= 1; drx++) {
    for (let dry = -1; dry <= 1; dry++) {
      const mtns = getProceduralMountains(gx + drx * 32, gy + dry * 32);
      for (const cluster of mtns) {
        const { value, peak } = evaluateMountain(gx, gy, cluster);
        if (value > bestVal) { bestVal = value; bestPeak = peak; }
      }
    }
  }
  return { value: bestVal, peak: bestPeak };
}

// ── Tile type enum extended ──────────────────────────────────────────

export type TileType = TileData['type'] | 'road' | 'forest' | 'mountain' | 'pond';

// ── Biome generation ─────────────────────────────────────────────────

export interface ExtendedTileData extends TileData {
  /** Extra semantic for decoration decisions. */
  biome: 'grass' | 'forest' | 'road' | 'mountain' | 'snow_mountain' | 'pond' | 'shore' | 'flower_meadow';
  /** Whether the tile blocks movement (water, tall mountain rocks). */
  blocked: boolean;
  /** Optional decoration overlay (tree, bush, etc.) drawn as a separate
   *  tall sprite in the depth-sorted pass. */
  decoration?: string;
  /** True when decoration is a tree — can be chopped with axe (5–10 swings). */
  choppable?: boolean;
}

/**
 * Generate a tile for a given grid position. Deterministic — same input
 * always produces the same output.
 */
// Village buildings area - clear zone around buildings
const VILLAGE_BUILDINGS = [
  { x: 30, y: 30, w: 2, h: 2 },  // Player house
  { x: 45, y: 28, w: 2, h: 2 },  // General store
  { x: 50, y: 35, w: 2, h: 2 },  // Tool shop
  { x: 35, y: 40, w: 1, h: 1 },  // Tom's tent
  { x: 25, y: 42, w: 2, h: 2 },  // Isabelle's house
  { x: 42, y: 45, w: 1, h: 1 },  // Resident tent
  { x: 55, y: 42, w: 1, h: 1 },  // Visitor tent
  { x: 38, y: 32, w: 3, h: 3 },  // Town hall
  // Expanded area houses (3x3 with different roofs)
  { x: 75, y: 75, w: 3, h: 3 },
  { x: 135, y: 85, w: 3, h: 3 },
  { x: 105, y: 155, w: 3, h: 3 },
];

function isNearVillage(gx: number, gy: number): boolean {
  const BUFFER = 3; // Small buffer (3 tiles) - allows trees around houses but keeps them clear
  for (const building of VILLAGE_BUILDINGS) {
    if (gx >= building.x - BUFFER && gx < building.x + building.w + BUFFER &&
        gy >= building.y - BUFFER && gy < building.y + building.h + BUFFER) {
      return true;
    }
  }
  return false;
}

export function generateTile(gridX: number, gridY: number): ExtendedTileData {
  const gx = gridX;
  const gy = gridY;

  // Village buffer zone - no mountains, rocks, or blocking decorations
  const inVillage = isNearVillage(gx, gy);

  // ── 1. Feature overlays (ponds, mountains, roads) take priority ────

  // Ponds (skip in village)
  if (!inVillage) {
    const pv = pondValue(gx, gy);
    if (pv > 0.8) {
      return { type: 'water', biome: 'pond', blocked: true, elevation: 0 };
    }
    if (pv > 0.3) {
      return { type: 'sand', biome: 'shore', blocked: false, elevation: 0 };
    }
  }

  // Mountains — elevated terrain you can climb on (multi-level) - skip in village
  if (!inVillage) {
    const mtn = mountainInfo(gx, gy);
    if (mtn.value > 0.03) { // Lower threshold for more elevated terrain
      // Map the 0..1 value to elevation levels: each step = 1/peak of the range
      const rawElev = Math.round(mtn.value * mtn.peak);
      const elev = Math.max(0, Math.min(mtn.peak, rawElev));

      if (elev >= 1) {
      const r = rng(gx, gy, 50);
      const isSnowPeak = elev >= mtn.peak - 1 && mtn.peak >= 5; // Snow on top 2 layers of tall mountains (5+ layers)
      // Top plateau: snow-capped if tall, else grass with more trees
      if (elev >= mtn.peak && mtn.value > 0.9) {
        const hasDeco = !isSnowPeak && r < 0.35; // Increased from 0.20 to 0.35 for more trees on mountains
        let decoration: string | undefined;
        let blocked = false;
        if (hasDeco) {
          if (r < 0.20) { // Increased from 0.10 to 0.20 for more trees
            decoration = TREES[Math.floor(rng(gx, gy, 51) * TREES.length)];
            blocked = true;
            return { type: isSnowPeak ? 'stone' : 'grass', biome: isSnowPeak ? 'snow_mountain' : 'mountain', blocked, decoration, elevation: elev, choppable: true };
          } else {
            decoration = BUSHES[Math.floor(rng(gx, gy, 52) * BUSHES.length)];
            blocked = true;
          }
        }
        return {
          type: isSnowPeak ? 'stone' : 'grass',
          biome: isSnowPeak ? 'snow_mountain' : 'mountain',
          blocked,
          decoration,
          elevation: elev,
        };
      }
      // Rocky slopes (or snow slopes near peak)
      const boulderChance = elev >= mtn.peak - 1 ? 0.02 : 0.06;
      const hasBoulder = r < boulderChance;
      return {
        type: 'stone',
        biome: isSnowPeak ? 'snow_mountain' : 'mountain',
        blocked: hasBoulder,
        decoration: hasBoulder ? TALL_STONES[Math.floor(r * 100) % TALL_STONES.length] : undefined,
        elevation: elev,
      };
      }
    }
  }

  // Roads
  if (isRoad(gx, gy)) {
    return { type: 'dirt', biome: 'road', blocked: false, elevation: 0 };
  }

  // ── 2. Noise-based biomes for remaining tiles ──────────────────────

  const elevation = fbm(gx / 16, gy / 16, 3, 0);   // large-scale terrain
  const moisture = fbm(gx / 12, gy / 12, 3, 100);   // moisture layer
  const detail = fbm(gx / 6, gy / 6, 2, 200);       // small-scale variety

  // Forest: high elevation + moderate moisture (skip decorations in village)
  if (elevation > 0.45 && moisture > 0.35) { // Lower thresholds for more forest coverage
    const r = rng(gx, gy, 10);
    let decoration: string | undefined;
    let blocked = false;
    if (!inVillage) { // Only add trees/bushes outside village — never block houses
      if (r < 0.55) { // Increased from 0.35 to 0.55 for much denser forests
        // Tree — blocks movement, choppable with axe
        decoration = TREES[Math.floor(rng(gx, gy, 11) * TREES.length)];
        blocked = true;
        return { type: 'grass', biome: 'forest', blocked, decoration, elevation: 0, choppable: true };
      } else if (r < 0.75) { // Increased from 0.50 to 0.75 for more bushes
        // Bush — blocks movement
        decoration = BUSHES[Math.floor(rng(gx, gy, 12) * BUSHES.length)];
        blocked = true;
      }
    }
    return {
      type: 'grass',
      biome: 'forest',
      blocked,
      decoration,
      elevation: 0,
    };
  }

  // Flower meadows: low elevation + high moisture — flowers are walkable decorations
  if (elevation < 0.4 && moisture > 0.6) {
    return { type: 'grass', biome: 'flower_meadow', blocked: false, elevation: 0 };
  }

  // Default grass (skip decorations in village)
  const r = rng(gx, gy, 20);
  let decoration: string | undefined;
  let blocked = false;
  // More trees and bushes on regular grass (only outside village)
  if (!inVillage) {
    if (detail > 0.55 && r < 0.25) { // Increased from 0.7/0.08 to 0.55/0.25 for much more trees
      decoration = TREES[Math.floor(rng(gx, gy, 21) * TREES.length)];
      blocked = true; // trees always block
      return { type: 'grass', biome: 'grass', blocked, decoration, elevation: 0, choppable: true };
    } else if (detail > 0.50 && r < 0.40) { // Increased from 0.65/0.15 to 0.50/0.40 for more bushes
      decoration = BUSHES[Math.floor(rng(gx, gy, 22) * BUSHES.length)];
      blocked = true; // bushes block
    }
  }

  return {
    type: 'grass',
    biome: 'grass',
    blocked,
    decoration,
    elevation: 0,
  };
}

// ── Asset selection ──────────────────────────────────────────────────

export interface TileAssets {
  base?: string;
  overlay?: string;
}

/**
 * Get the base + overlay image paths for a tile. Only handles the ground
 * layer; decorations (trees/bushes/tall stones) are drawn separately via
 * the decoration system in the canvas.
 */
export function getTileAssets(tile: TileData, gridX: number, gridY: number): TileAssets {
  const r = rng(gridX, gridY, 30);
  const ext = tile as ExtendedTileData;

  switch (tile.type) {
    case 'grass': {
      const base = DIRT_BASES[Math.floor(r * DIRT_BASES.length)];
      let overlay: string;

      if (ext.biome === 'flower_meadow') {
        // Dense flowers
        overlay = FLOWERS[Math.floor(rng(gridX, gridY, 31) * FLOWERS.length)];
      } else if (ext.biome === 'forest') {
        // Forest floor: tall grass / clovers, muted
        const fr = rng(gridX, gridY, 32);
        if (fr < 0.4) overlay = TALL_GRASS[Math.floor(fr * 10) % TALL_GRASS.length];
        else if (fr < 0.7) overlay = CLOVERS[Math.floor(fr * 10) % CLOVERS.length];
        else overlay = GRASS_OVERLAYS[Math.floor(fr * 10) % GRASS_OVERLAYS.length];
      } else {
        // Regular grass with some variety
        const gr = rng(gridX, gridY, 33);
        if (gr < 0.15) overlay = FLOWERS[Math.floor(rng(gridX, gridY, 34) * FLOWERS.length)];
        else if (gr < 0.25) overlay = CLOVERS[Math.floor(gr * 10) % CLOVERS.length];
        else if (gr < 0.35) overlay = TALL_GRASS[Math.floor(gr * 10) % TALL_GRASS.length];
        else overlay = GRASS_OVERLAYS[Math.floor(gr * 10) % GRASS_OVERLAYS.length];
      }
      return { base, overlay };
    }

    case 'dirt': {
      const base = DIRT_BASES[Math.floor(r * DIRT_BASES.length)];
      // Roads get stone path overlay
      if (ext.biome === 'road') {
        return { base, overlay: STONE_PATHS[Math.floor(rng(gridX, gridY, 35) * STONE_PATHS.length)] };
      }
      return { base };
    }

    case 'sand': {
      // Shore tiles: sand base, occasional puddle overlay
      const sr = rng(gridX, gridY, 36);
      const overlay = sr < 0.3 ? WATER_PUDDLES[Math.floor(sr * 10) % WATER_PUDDLES.length] : undefined;
      return { base: sand, overlay };
    }

    case 'stone': {
      const base = STONE_BASES[Math.floor(r * STONE_BASES.length)];

      // Snow mountains get snow overlay
      if (ext.biome === 'snow_mountain') {
        return { base: stone1, overlay: snowOverlay }; // White stone with snow
      }

      // Mountain stone tiles get occasional grass/moss overlay
      if (ext.biome === 'mountain') {
        const sr = rng(gridX, gridY, 40);
        if (sr < 0.3) {
          return { base, overlay: GRASS_OVERLAYS[Math.floor(sr * 10) % GRASS_OVERLAYS.length] };
        }
      }
      return { base };
    }

    case 'water': {
      return { base: water };
    }

    default:
      return { base: DIRT_BASES[0] };
  }
}
