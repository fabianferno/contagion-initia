import React, { useRef, useEffect, useState, useCallback } from 'react';
import { getTileAssets, generateTile, type ExtendedTileData } from '../utils/tileManager';
import { gridToScreen, TILE_WIDTH, TILE_HEIGHT, TILE_IMAGE_SIZE } from '../utils/isometricUtils';
import {
  FANTASY_TESTING_HOUSE_GRID_X,
  FANTASY_TESTING_HOUSE_GRID_Y,
  FANTASY_TESTING_HOUSE_DOOR_X,
  FANTASY_TESTING_HOUSE_DOOR_Y,
} from '../mapConstants';
import type { TileData } from './IsometricTile';
import type { PlaceableItemData } from './PlaceableItem';
import characterIdleSheet from '@/assets/Character0/Character0_Idle.png';
import characterWalkSheet from '@/assets/Character0/Character0_Walk.png';
import characterRunSheet from '@/assets/Character0/Character0_Run.png';
import characterSwordAttackSheet from '@/assets/Character0/Character0_SwordAttack_Sword.png';
import characterAxeSwingSheet from '@/assets/Character0/Character0_Swing_Axe.png';
import characterPickaxeSwingSheet from '@/assets/Character0/Character0_Swing_PickAxe.png';
import characterFishSheet from '@/assets/Character0/Character0_Fish_Fishingpole.png';
import characterSitSheet from '@/assets/Character0/Character0_SitHoldingTool_Fishingpole.png';
import characterDamageSheet from '@/assets/Character0/Character0_Damage.png';
import characterDieSheet from '@/assets/Character0/Character0_Die.png';
import characterInteractSheet from '@/assets/Character0/Character0_Interact.png';
import characterDigSheet from '@/assets/Character0/Character0_Dig_Showel.png';

// Enemy sprites
import goblinMoveSheet from '@/assets/IsometricEnemies/Goblin/Goblin1_Move.png';
import goblinAttackSheet from '@/assets/IsometricEnemies/Goblin/Goblin1_Attack.png';
import koboltMoveSheet from '@/assets/IsometricEnemies/Kobolt/Kobolt_Move_Red.png';
import koboltAttackSheet from '@/assets/IsometricEnemies/Kobolt/Kobolt_Attack_Red.png';
import scorpionMoveSheet from '@/assets/IsometricEnemies/Scorpion/Scorpion_Move_Red.png';
import scorpionAttackSheet from '@/assets/IsometricEnemies/Scorpion/Scorpion_Attack_Red.png';
import skeletonMoveSheet from '@/assets/IsometricEnemies/Skeleton/Skeleton1_Move.png';
import skeletonAttackSheet from '@/assets/IsometricEnemies/Skeleton/Skeleton1_Attack.png';
import slimeMoveSheet from '@/assets/IsometricEnemies/Slime/Slime_Move_Red.png';
import slimeAttackSheet from '@/assets/IsometricEnemies/Slime/Slime_Attack_Red.png';
import wolfMoveSheet from '@/assets/IsometricEnemies/Wolf/Wolf_Move_Red.png';
import wolfAttackSheet from '@/assets/IsometricEnemies/Wolf/Wolf_Attack_Red.png';

// Food pickups (random spawn, 1 min decay, small health restore)
import foodImage519 from '@/assets/PlacebleItems/FoodAndDrink/Layer 519.png';
import foodImage520 from '@/assets/PlacebleItems/FoodAndDrink/Layer 520.png';
import foodImage521 from '@/assets/PlacebleItems/FoodAndDrink/Layer 521.png';
import foodImage522 from '@/assets/PlacebleItems/FoodAndDrink/Layer 522.png';
import foodImage523 from '@/assets/PlacebleItems/FoodAndDrink/Layer 523.png';
import foodImage524 from '@/assets/PlacebleItems/FoodAndDrink/Layer 524.png';

const FOOD_IMAGES = [foodImage519, foodImage520, foodImage521, foodImage522, foodImage523, foodImage524];
const FOOD_SPAWN_MIN_MS = 60000;  // Spawn rarely: every 60–120 s

// Valuables: drop from mobs when killed, same logic as food
import amathystImg from '@/assets/PlacebleItems/Valuables/Amathyst.png';
import amberImg from '@/assets/PlacebleItems/Valuables/Amber.png';
import amberInsectImg from '@/assets/PlacebleItems/Valuables/Amber_Insect.png';
import diamondImg from '@/assets/PlacebleItems/Valuables/Diamond.png';
import emraldImg from '@/assets/PlacebleItems/Valuables/Emrald.png';
import lapisImg from '@/assets/PlacebleItems/Valuables/LapisLazulie.png';
import rubyImg from '@/assets/PlacebleItems/Valuables/Ruby.png';
const VALUABLE_IMAGES = [amathystImg, amberImg, amberInsectImg, diamondImg, emraldImg, lapisImg, rubyImg];
const VALUABLE_DROP_CHANCE = 0.35;  // 35% chance per mob kill
const VALUABLE_DECAY_MS = 60000;    // 1 min decay like food
const VALUABLE_PICKUP_RANGE = 1;
const FOOD_SPAWN_MAX_MS = 120000;
const FOOD_DECAY_MS = 60000;      // 1 minute then removed
const FOOD_HEALTH_RESTORE = 15;

// Plant/Vegetable sprites removed - no longer used in gameplay
const FOOD_PICKUP_RANGE = 1;      // tile distance to collect

// Rare entity (E to interact, increases health)
const RARE_ENTITY_SPAWN_MIN_MS = 90000;   // 90 s
const RARE_ENTITY_SPAWN_MAX_MS = 150000;   // 2.5 min
const RARE_ENTITY_HEALTH_RESTORE = 30;
const RARE_ENTITY_INTERACT_RANGE = 1;
const CHARACTER_INTERACT_COLS = 5;
const CHARACTER_INTERACT_ROWS = 3;
const CHARACTER_INTERACT_FRAME_MS = 220;  // Slower for smoother animation

// ── 1x1 Tent (simple, pre-composited) ─────────────────
import tentBlue from '@/assets/Isometric_RPG_Buildings/1x1Tile_Tent/Tent_Blue.png';
import tentGreen from '@/assets/Isometric_RPG_Buildings/1x1Tile_Tent/Tent_Green.png';
import tentRed from '@/assets/Isometric_RPG_Buildings/1x1Tile_Tent/Tent_Red.png';
import tentYellow from '@/assets/Isometric_RPG_Buildings/1x1Tile_Tent/Tent_Yellow.png';

// ── 2×2 SmallHouse layers (composited at load time) ─────────────────
import houseL1 from '@/assets/Isometric_RPG_Buildings/2x2Tile_SmallHouse/Layer1_InnerWalls.png';
import houseL2 from '@/assets/Isometric_RPG_Buildings/2x2Tile_SmallHouse/Layer2_BackBeam_Wood.png';
import houseL3 from '@/assets/Isometric_RPG_Buildings/2x2Tile_SmallHouse/Layer3_MiddleBeams_Wood.png';
import houseL4 from '@/assets/Isometric_RPG_Buildings/2x2Tile_SmallHouse/Layer4_FLoor.png';
import houseL5 from '@/assets/Isometric_RPG_Buildings/2x2Tile_SmallHouse/Layer5_ClosedDoor_Wood.png';
import houseL6 from '@/assets/Isometric_RPG_Buildings/2x2Tile_SmallHouse/Layer6_OuterWall_PaintedBeige.png';
import houseL7 from '@/assets/Isometric_RPG_Buildings/2x2Tile_SmallHouse/Layer7_WoodBeams_Wood.png';
import houseL9 from '@/assets/Isometric_RPG_Buildings/2x2Tile_SmallHouse/Layer9_FrontBeam_Wood.png';
import houseL10 from '@/assets/Isometric_RPG_Buildings/2x2Tile_SmallHouse/Layer10_RoofBeams_Wood.png';
import houseL11 from '@/assets/Isometric_RPG_Buildings/2x2Tile_SmallHouse/Layer11_Window_Wood.png';
import houseL12 from '@/assets/Isometric_RPG_Buildings/2x2Tile_SmallHouse/Layer12_Roof_Clay.png';
import houseL13 from '@/assets/Isometric_RPG_Buildings/2x2Tile_SmallHouse/Layer13_Chimney.png';

const HOUSE_LAYERS = [houseL1, houseL2, houseL3, houseL4, houseL5, houseL6, houseL7, houseL9, houseL10, houseL11, houseL12, houseL13];
const HOUSE_W = 1350;   // 2x2 small houses — much bigger
const HOUSE_H = 1650;

// ── 2×2 Store layers ─────────────────
import storeL1 from '@/assets/Isometric_RPG_Buildings/2x2Tile_Store/Layer1_BackBeam_Wood.png';
import storeL2 from '@/assets/Isometric_RPG_Buildings/2x2Tile_Store/Layer2_InnerWalls.png';
import storeL3 from '@/assets/Isometric_RPG_Buildings/2x2Tile_Store/Layer3_MiddleBeams_Wood.png';
import storeL4 from '@/assets/Isometric_RPG_Buildings/2x2Tile_Store/Layer4_Floor.png';
import storeL5 from '@/assets/Isometric_RPG_Buildings/2x2Tile_Store/Layer5_WindowDisplay.png';
import storeL6 from '@/assets/Isometric_RPG_Buildings/2x2Tile_Store/Layer6_WindowItems_Grocer.png';
import storeL7 from '@/assets/Isometric_RPG_Buildings/2x2Tile_Store/Layer7_ClosedDoor_Wood.png';
import storeL8 from '@/assets/Isometric_RPG_Buildings/2x2Tile_Store/Layer8_OuterWall_PaintedBlue.png';
import storeL10 from '@/assets/Isometric_RPG_Buildings/2x2Tile_Store/Layer10_Window.png';
import storeL11 from '@/assets/Isometric_RPG_Buildings/2x2Tile_Store/Layer11_FrontBeam_Wood.png';
import storeL12 from '@/assets/Isometric_RPG_Buildings/2x2Tile_Store/layer12_Roof_Wood.png';
import storeL13 from '@/assets/Isometric_RPG_Buildings/2x2Tile_Store/Layer13_Fabric_Red.png';
import storeL14 from '@/assets/Isometric_RPG_Buildings/2x2Tile_Store/Layer14_SignAndHook.png';
import storeL15 from '@/assets/Isometric_RPG_Buildings/2x2Tile_Store/Layer15_StoreType_Grocer.png';

const STORE_LAYERS = [storeL1, storeL2, storeL3, storeL4, storeL5, storeL6, storeL7, storeL8, storeL10, storeL11, storeL12, storeL13, storeL14, storeL15];
const STORE_W = 1350;   // Match small house size
const STORE_H = 1650;

// ── 3×3 Large House layers (base + roof variants) ─────────────────
import bigHouseL1 from '@/assets/Isometric_RPG_Buildings/3x3Tile_House/Layer1_BackBeam_Wood.png';
import bigHouseL2 from '@/assets/Isometric_RPG_Buildings/3x3Tile_House/Layer2_InnerWalls.png';
import bigHouseL3 from '@/assets/Isometric_RPG_Buildings/3x3Tile_House/Layer3_MiddleBeams_Wood.png';
import bigHouseL4 from '@/assets/Isometric_RPG_Buildings/3x3Tile_House/Layer4_Floor.png';
import bigHouseL5 from '@/assets/Isometric_RPG_Buildings/3x3Tile_House/Layer5_ClosedDoor_Wood.png';
import bigHouseL6 from '@/assets/Isometric_RPG_Buildings/3x3Tile_House/Layer6_OuterWalls_PaintedCream.png';
import bigHouseL7 from '@/assets/Isometric_RPG_Buildings/3x3Tile_House/Layer7_FrontBeam_Wood.png';
import bigHouseL8 from '@/assets/Isometric_RPG_Buildings/3x3Tile_House/Layer8_RoofBeams_Wood.png';
import bigHouseL9 from '@/assets/Isometric_RPG_Buildings/3x3Tile_House/Layer9_WoodBeams_Wood.png';
import bigHouseL10 from '@/assets/Isometric_RPG_Buildings/3x3Tile_House/Layer10_Window_Wood.png';
import bigHouseL11 from '@/assets/Isometric_RPG_Buildings/3x3Tile_House/Layer11_Window_Wood.png';
import bigHouseL13Chimney from '@/assets/Isometric_RPG_Buildings/3x3Tile_House/Layer13_Chimeny.png';
import bigHouseL13RoofClay from '@/assets/Isometric_RPG_Buildings/3x3Tile_House/Layer13_Roof_Clay.png';
import bigHouseL13RoofRedClay from '@/assets/Isometric_RPG_Buildings/3x3Tile_House/Layer13_Roof_RedClay.png';
import bigHouseL13RoofStraw from '@/assets/Isometric_RPG_Buildings/3x3Tile_House/Layer13_Roof_Straw.png';
import bigHouseL13RoofGrass from '@/assets/Isometric_RPG_Buildings/3x3Tile_House/Layer13_Roof_Grass.png';

const BIG_HOUSE_LAYERS = [bigHouseL1, bigHouseL2, bigHouseL3, bigHouseL4, bigHouseL5, bigHouseL6, bigHouseL7, bigHouseL8, bigHouseL9, bigHouseL10, bigHouseL11, bigHouseL13RoofClay, bigHouseL13Chimney];
const BIG_HOUSE_LAYERS_REDCLAY = [bigHouseL1, bigHouseL2, bigHouseL3, bigHouseL4, bigHouseL5, bigHouseL6, bigHouseL7, bigHouseL8, bigHouseL9, bigHouseL10, bigHouseL11, bigHouseL13RoofRedClay, bigHouseL13Chimney];
const BIG_HOUSE_LAYERS_STRAW = [bigHouseL1, bigHouseL2, bigHouseL3, bigHouseL4, bigHouseL5, bigHouseL6, bigHouseL7, bigHouseL8, bigHouseL9, bigHouseL10, bigHouseL11, bigHouseL13RoofStraw, bigHouseL13Chimney];
const BIG_HOUSE_LAYERS_GRASS = [bigHouseL1, bigHouseL2, bigHouseL3, bigHouseL4, bigHouseL5, bigHouseL6, bigHouseL7, bigHouseL8, bigHouseL9, bigHouseL10, bigHouseL11, bigHouseL13RoofGrass, bigHouseL13Chimney];

// ── 3×3 Fantasy Testing House (FantasyWood variant) ──────────────────
import fantasyHouseL1 from '@/assets/Isometric_RPG_Buildings/3x3Tile_House/Layer1_BackBeam_FantasyWood.png';
import fantasyHouseL3 from '@/assets/Isometric_RPG_Buildings/3x3Tile_House/Layer3_MiddleBeams_FantasyWood.png';
import fantasyHouseL5 from '@/assets/Isometric_RPG_Buildings/3x3Tile_House/Layer5_ClosedDoor_FantasyWood.png';
import fantasyHouseL6 from '@/assets/Isometric_RPG_Buildings/3x3Tile_House/Layer6_OuterWalls_FantasyWood.png';
import fantasyHouseL7 from '@/assets/Isometric_RPG_Buildings/3x3Tile_House/Layer7_FrontBeam_FantasyWood.png';
import fantasyHouseL8 from '@/assets/Isometric_RPG_Buildings/3x3Tile_House/Layer8_RoofBeams_FantasyWood.png';
import fantasyHouseL9 from '@/assets/Isometric_RPG_Buildings/3x3Tile_House/Layer9_WoodBeams_FantasyWood.png';
import fantasyHouseL10 from '@/assets/Isometric_RPG_Buildings/3x3Tile_House/Layer10_Window_FantasyWood.png';
import fantasyHouseL11 from '@/assets/Isometric_RPG_Buildings/3x3Tile_House/Layer11_Window_FantasyWood.png';
import fantasyHouseL13RoofGrassPink from '@/assets/Isometric_RPG_Buildings/3x3Tile_House/Layer13_Roof_GrassPinkFlowers.png';

const FANTASY_HOUSE_LAYERS = [
  fantasyHouseL1, bigHouseL2, fantasyHouseL3, bigHouseL4, fantasyHouseL5,
  fantasyHouseL6, fantasyHouseL7, fantasyHouseL8, fantasyHouseL9,
  fantasyHouseL10, fantasyHouseL11, fantasyHouseL13RoofGrassPink, bigHouseL13Chimney,
];

const BIG_HOUSE_W = 2000;  // 3x3 — larger than small houses
const BIG_HOUSE_H = 2450;

// Import decoration assets
import flower1 from '@/assets/Tiles/Grass/TileOverlay_Flower1.png';
import flower2 from '@/assets/Tiles/Grass/TileOverlay_Flower2.png';
import flower3 from '@/assets/Tiles/Grass/TileOverlay_Flower3.png';

// Decorative elements configuration
interface Decoration {
  id: string;
  type: 'flower' | 'path' | 'sign';
  image: string;
  gridX: number;
  gridY: number;
}

const VILLAGE_DECORATIONS: Decoration[] = [
  // Small flower accents around player house (minimal)
  { id: 'flower_1', type: 'flower', image: flower1, gridX: 29, gridY: 30 },
  { id: 'flower_2', type: 'flower', image: flower2, gridX: 33, gridY: 30 },

  // Flowers around town hall entrance
  { id: 'flower_3', type: 'flower', image: flower3, gridX: 38, gridY: 31 },
  { id: 'flower_4', type: 'flower', image: flower1, gridX: 41, gridY: 31 },

  // Flowers at store entrance
  { id: 'flower_5', type: 'flower', image: flower2, gridX: 45, gridY: 27 },
  { id: 'flower_6', type: 'flower', image: flower3, gridX: 47, gridY: 27 },
];

/// Building configuration - Animal Crossing style village layout with variety
interface Building {
  id: string;
  type: 'house' | 'store' | 'special' | 'tent';
  layers?: string[];  // For layered buildings (SmallHouse, Store, BigHouse)
  preComposited?: string;  // For pre-composited buildings (Tent)
  imageKey?: string;  // Override for layered buildings with variants (e.g. bighouse_redclay)
  gridX: number;
  gridY: number;
  width: number;  // tiles
  height: number; // tiles
  imageWidth: number;  // px
  imageHeight: number; // px
  label?: string;
}

const BUILDINGS: Building[] = [
  // Player's house - 2x2 SmallHouse
  {
    id: 'player_house',
    type: 'house',
    layers: HOUSE_LAYERS,
    gridX: 30,
    gridY: 30,
    width: 2,
    height: 2,
    imageWidth: HOUSE_W,
    imageHeight: HOUSE_H,
    label: 'Your House'
  },

  // General Store - 2x2 Store with awning
  {
    id: 'general_store',
    type: 'store',
    layers: STORE_LAYERS,
    gridX: 45,
    gridY: 28,
    width: 2,
    height: 2,
    imageWidth: STORE_W,
    imageHeight: STORE_H,
    label: 'General Store'
  },

  // Tool Shop - 2x2 SmallHouse (different color)
  {
    id: 'tool_shop',
    type: 'house',
    layers: HOUSE_LAYERS,
    gridX: 50,
    gridY: 35,
    width: 2,
    height: 2,
    imageWidth: HOUSE_W,
    imageHeight: HOUSE_H,
    label: 'Tool Shop'
  },

  // Tom's tent - 1x1 Tent
  {
    id: 'tent_1',
    type: 'tent',
    preComposited: tentBlue,
    gridX: 35,
    gridY: 40,
    width: 1,
    height: 1,
    imageWidth: 450,
    imageHeight: 550,
    label: 'Tom\'s Tent'
  },

  // Isabelle's house - 2x2 SmallHouse
  {
    id: 'house_2',
    type: 'house',
    layers: HOUSE_LAYERS,
    gridX: 25,
    gridY: 42,
    width: 2,
    height: 2,
    imageWidth: HOUSE_W,
    imageHeight: HOUSE_H,
    label: 'Isabelle\'s House'
  },

  // Resident tent - 1x1 Tent
  {
    id: 'tent_2',
    type: 'tent',
    preComposited: tentGreen,
    gridX: 42,
    gridY: 45,
    width: 1,
    height: 1,
    imageWidth: 450,
    imageHeight: 550,
    label: 'Resident Tent'
  },

  // Resident tent - 1x1 Tent
  {
    id: 'tent_3',
    type: 'tent',
    preComposited: tentYellow,
    gridX: 55,
    gridY: 42,
    width: 1,
    height: 1,
    imageWidth: 450,
    imageHeight: 550,
    label: 'Visitor Tent'
  },

  // Town Hall / Community Center - 3x3 Large House
  {
    id: 'town_hall',
    type: 'special',
    layers: BIG_HOUSE_LAYERS,
    gridX: 38,
    gridY: 32,
    width: 3,
    height: 3,
    imageWidth: BIG_HOUSE_W,
    imageHeight: BIG_HOUSE_H,
    label: 'Town Hall'
  },

  // Expanded area houses (3x3 with different roofs) - max 3
  {
    id: 'expanded_house_1',
    type: 'house',
    layers: BIG_HOUSE_LAYERS_REDCLAY,
    imageKey: 'bighouse_redclay',
    gridX: 75,
    gridY: 75,
    width: 3,
    height: 3,
    imageWidth: BIG_HOUSE_W,
    imageHeight: BIG_HOUSE_H,
    label: 'Red Clay House'
  },
  {
    id: 'expanded_house_2',
    type: 'house',
    layers: BIG_HOUSE_LAYERS_STRAW,
    imageKey: 'bighouse_straw',
    gridX: 135,
    gridY: 85,
    width: 3,
    height: 3,
    imageWidth: BIG_HOUSE_W,
    imageHeight: BIG_HOUSE_H,
    label: 'Thatched House'
  },
  {
    id: 'expanded_house_3',
    type: 'house',
    layers: BIG_HOUSE_LAYERS_GRASS,
    imageKey: 'bighouse_grass',
    gridX: 105,
    gridY: 155,
    width: 3,
    height: 3,
    imageWidth: BIG_HOUSE_W,
    imageHeight: BIG_HOUSE_H,
    label: 'Grass Roof House'
  },

  // Fantasy Testing House — the infection test clinic
  {
    id: 'fantasy_testing_house',
    type: 'special',
    layers: FANTASY_HOUSE_LAYERS,
    imageKey: 'fantasy_testing_house',
    gridX: FANTASY_TESTING_HOUSE_GRID_X,
    gridY: FANTASY_TESTING_HOUSE_GRID_Y,
    width: 3,
    height: 3,
    imageWidth: BIG_HOUSE_W,
    imageHeight: BIG_HOUSE_H,
    label: 'Testing House',
  },
];

/** Legacy single house position - kept for backward compatibility */
const HOUSE_GRID_X = 30;
const HOUSE_GRID_Y = 30;
/** House draw depth (front corner). Character at lower depth renders behind the house. */
const HOUSE_DEPTH = HOUSE_GRID_X + 1 + HOUSE_GRID_Y + 1; // 62
/**
 * House footprint: 2×2 tiles + buffer tiles where character would render BEHIND or SAME depth as house.
 * Blocks (gx,gy) if: inside 2×2 OR (adjacent and depth <= house) so character never gets obscured.
 * Tiles with depth === house depth can draw in undefined order; block those too.
 */
/** Set of "gx,gy" keys for tiles that block movement (water, trees, tall rocks).
 *  Built once during tile generation. */
const blockedTileKeys = new Set<string>();

/** Set of "gx,gy" keys for trees that have been chopped — tile becomes walkable. */
const choppedTileKeys = new Set<string>();

/** Set of "gx,gy" keys for tiles that have choppable trees (for quick lookup). */
const choppableTileKeys = new Set<string>();

/** Deterministic swings needed per tree (5–10) from grid position. */
function getTreeSwingsNeeded(gx: number, gy: number): number {
  const h = ((gx * 374761393 + gy * 668265263) | 0) >>> 0;
  return 5 + (h % 6); // 5, 6, 7, 8, 9, or 10
}

/** Elevation map: "gx,gy" → elevation level (0 = ground, 1+ = raised).
 *  Built once during tile generation. */
const elevationMap = new Map<string, number>();

/** Pixels to offset a tile upward per elevation level.
 *  Tuned so 7-layer mountains look dramatic but not absurd. */
const ELEVATION_PX = TILE_HEIGHT * 0.55;

/** Get elevation at a grid position (defaults to 0). */
function getElevation(gx: number, gy: number): number {
  return elevationMap.get(`${gx},${gy}`) ?? 0;
}

function isBlockedByHouse(gx: number, gy: number): boolean {
  // The fantasy testing house door tile is always walkable so the player can stand there
  if (gx === FANTASY_TESTING_HOUSE_DOOR_X && gy === FANTASY_TESTING_HOUSE_DOOR_Y) return false;

  // Check all buildings
  for (const building of BUILDINGS) {
    // Inside building footprint
    if (gx >= building.gridX && gx < building.gridX + building.width &&
        gy >= building.gridY && gy < building.gridY + building.height) {
      return true;
    }
    // Buffer: tiles adjacent to building where character depth <= building depth (would draw behind or overlap)
    const buildingDepth = building.gridX + building.width - 1 + building.gridY + building.height - 1;
    const depth = gx + gy;
    if (depth <= buildingDepth) {
      // Adjacent to building
      const adjX = gx >= building.gridX - 1 && gx <= building.gridX + building.width;
      const adjY = gy >= building.gridY - 1 && gy <= building.gridY + building.height;
      if (adjX && adjY) return true;
    }
  }
  return false;
}

/** Check if a tile is blocked by terrain (water, trees, mountains) or by the house. */
function isTileBlocked(gx: number, gy: number): boolean {
  if (isBlockedByHouse(gx, gy)) return true;
  const key = `${gx},${gy}`;
  if (choppedTileKeys.has(key)) return false; // Chopped trees no longer block
  return blockedTileKeys.has(key);
}

/** Check if movement from (fx,fy) to (tx,ty) is blocked by elevation difference > 1. */
function isElevationBlocked(fx: number, fy: number, tx: number, ty: number): boolean {
  const fromElev = getElevation(fx, fy);
  const toElev = getElevation(tx, ty);
  return Math.abs(fromElev - toElev) > 1;
}

/**
 * Check whether a diagonal move from (fx,fy) to (tx,ty) would clip through
 * a blocked corner. For a diagonal move (|dx|=1 AND |dy|=1), both intermediate
 * "shoulder" tiles must also be free — otherwise the character's render path
 * passes through the house.
 */
function isDiagonalBlocked(fx: number, fy: number, tx: number, ty: number): boolean {
  const dx = tx - fx;
  const dy = ty - fy;
  // Only applies to true diagonal moves
  if (Math.abs(dx) !== 1 || Math.abs(dy) !== 1) return false;
  // Check both "shoulder" tiles the diagonal cuts between
  return isTileBlocked(fx + dx, fy) || isTileBlocked(fx, fy + dy);
}

/** Eight directions around a tile (NW, N, NE, E, SE, S, SW, W) for surround targeting. */
const SURROUND_OFFSETS: [number, number][] = [
  [-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0],
];

/** Stable slot index 0–7 from enemy id so different mobs target different sides of the player. */
function slotIndexForEnemy(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h % 8;
}

/**
 * Choose a tile adjacent to the player for this enemy to path toward, so mobs surround the player.
 * Prefers the slot for this enemy's id; if blocked, tries other slots in order.
 */
function getSurroundSlot(
  playerX: number,
  playerY: number,
  enemyId: string,
  enemyX: number,
  enemyY: number,
  mapSize: number,
  occupiedSlots: Set<string> = new Set()
): { x: number; y: number } {
  const baseSlot = slotIndexForEnemy(enemyId);

  // Try each slot starting from the enemy's preferred slot
  for (let i = 0; i < 8; i++) {
    const slot = (baseSlot + i) % 8;
    const [dx, dy] = SURROUND_OFFSETS[slot];
    const tx = playerX + dx;
    const ty = playerY + dy;
    const slotKey = `${tx},${ty}`;

    // Check if slot is valid and not occupied by another enemy
    if (tx >= 0 && tx < mapSize && ty >= 0 && ty < mapSize
        && !isTileBlocked(tx, ty)
        && !isElevationBlocked(playerX, playerY, tx, ty)
        && !isDiagonalBlocked(playerX, playerY, tx, ty)
        && !occupiedSlots.has(slotKey)) {
      return { x: tx, y: ty };
    }
  }

  // Fallback: tile adjacent to player closest to enemy (ignoring occupied slots in fallback)
  let best = { x: playerX + 1, y: playerY };
  let bestDist = Infinity;
  for (const [dx, dy] of SURROUND_OFFSETS) {
    const tx = playerX + dx;
    const ty = playerY + dy;
    if (tx >= 0 && tx < mapSize && ty >= 0 && ty < mapSize && !isTileBlocked(tx, ty)) {
      const d = (enemyX - tx) ** 2 + (enemyY - ty) ** 2;
      if (d < bestDist) {
        bestDist = d;
        best = { x: tx, y: ty };
      }
    }
  }
  return best;
}

/** Find nearest unblocked tile to (gx, gy). Used when spawn or logic would place character inside blocked area. */
function findNearestFreeTile(gx: number, gy: number, size: number = DEFAULT_MAP_SIZE): { x: number; y: number } {
  if (!isTileBlocked(gx, gy)) return { x: gx, y: gy };
  for (let r = 1; r <= size; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
        const nx = gx + dx;
        const ny = gy + dy;
        if (nx >= 0 && nx < size && ny >= 0 && ny < size && !isTileBlocked(nx, ny)) {
          return { x: nx, y: ny };
        }
      }
    }
  }
  return { x: 0, y: 0 };
}

/** Find nearest land tile (grass, dirt, stone) — excludes water and sand. Used for food/rare entity spawns. */
function findNearestLandTile(gx: number, gy: number, size: number = DEFAULT_MAP_SIZE): { x: number; y: number } {
  const isLand = (nx: number, ny: number) => {
    if (nx < 0 || nx >= size || ny < 0 || ny >= size) return false;
    if (isTileBlocked(nx, ny)) return false;
    const t = generateTile(nx, ny);
    return t.type !== 'water' && t.type !== 'sand';
  };
  if (isLand(gx, gy)) return { x: gx, y: gy };
  for (let r = 1; r <= size; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
        const nx = gx + dx;
        const ny = gy + dy;
        if (isLand(nx, ny)) return { x: nx, y: ny };
      }
    }
  }
  return findNearestFreeTile(gx, gy, size);
}

function findBestStepTowardTarget(
  fromX: number,
  fromY: number,
  targetX: number,
  targetY: number,
  mapSize: number,
  flying = false
): { x: number; y: number } | null {
  const targetDist = (x: number, y: number) =>
    (x - targetX) ** 2 + (y - targetY) ** 2;
  const currentDist = targetDist(fromX, fromY);

  const candidates: { x: number; y: number; dist: number }[] = [];
  for (const [dx, dy] of SURROUND_OFFSETS) {
    const nx = fromX + dx;
    const ny = fromY + dy;
    if (nx < 0 || nx >= mapSize || ny < 0 || ny >= mapSize) continue;
    if (!flying && isTileBlocked(nx, ny)) continue;
    if (!flying && isElevationBlocked(fromX, fromY, nx, ny)) continue;
    if (!flying && isDiagonalBlocked(fromX, fromY, nx, ny)) continue;
    const d = targetDist(nx, ny);
    if (d < currentDist) candidates.push({ x: nx, y: ny, dist: d });
  }
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => a.dist - b.dist);
  return { x: candidates[0].x, y: candidates[0].y };
}

export interface OtherPlayer {
  id?: string;   // Player ID (same as address from server)
  address: string;
  name: string;
  color: string;
  gridX: number;
  gridY: number;
  infected?: boolean;
}

interface IsometricMapCanvasProps {
  width: number; // Required - fixed width
  height: number; // Required - fixed height
  cameraX?: number;
  cameraY?: number;
  cameraZoom?: number;
  onTileClick?: (gridX: number, gridY: number) => void;
  onItemClick?: (itemId: string) => void;
  onCameraChange?: (camera: { x: number; y: number; zoom: number }) => void;
  onPositionChange?: (gridX: number, gridY: number) => void;
  onKeyAction?: (key: string, gridX: number, gridY: number) => void;
  onHealthChange?: (health: number, maxHealth: number) => void;
  /** Current food count in inventory (max 5). */
  inventoryFoodCount?: number;
  maxInventoryFood?: number;
  /** Called on mount when user enters map: return 'consume' to restore health, 'inventory' to add to inventory, 'skip' otherwise. */
  onRequestStartingFood?: (health: number, maxHealth: number) => 'consume' | 'inventory' | 'skip';
  /** Called when food should be added to inventory (e.g. pickup while at full health). */
  onAddFoodToInventory?: () => void;
  /** Called when food pickup positions change (for radar). */
  onFoodPositionsChange?: (positions: { gridX: number; gridY: number }[]) => void;
  /** Called when rare entity positions change (for radar). */
  onRareEntityPositionsChange?: (positions: { gridX: number; gridY: number }[]) => void;
  /** Task event callbacks */
  onTaskEvent?: (event: TaskEvent) => void;
  /** Called when player holds Q for 2 seconds while infected — infect nearby real players */
  onInfectNearby?: () => void;
  placeableItems?: PlaceableItemData[];
  otherPlayers?: OtherPlayer[];
  localPlayerName?: string;
  localPlayerColor?: string;
  localPlayerInfected?: boolean;
  isPatientZero?: boolean;
  mapSize?: number;
  className?: string;
  /** Buried gems (for dig-to-collect). Server only sends uncollected gems. */
  buriedGems?: { id: number; gridX: number; gridY: number; gemType: string; points: number }[];
  /** Dug gems waiting to be collected. */
  dugGems?: { id: number; gridX: number; gridY: number; gemType: string; points: number; dugAt: number }[];
  /** Called when player presses L to dig up a gem at (gridX, gridY). */
  onDigGem?: (gemId: number, gridX: number, gridY: number) => void;
  /** Called when player presses E to collect a dug gem. */
  onCollectGem?: (gemId: number, gridX: number, gridY: number) => void;
  /** Test camp positions to render as landmarks on the map. */
  testCamps?: Array<{ x: number; y: number }>;
  /** Increment this to trigger the local player death animation. */
  deathTrigger?: number;

  // Wave defense removed from gameplay
}

export type TaskEventType = 'enemy_kill' | 'fish' | 'resource_collect' | 'location_visit' | 'damage_taken';

export interface TaskEvent {
  type: TaskEventType;
  gridX?: number;
  gridY?: number;
  amount?: number;
  /** Enemy type when damage_taken (goblin, kobolt, etc.) — used for point deduction. */
  enemyType?: string;
}

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 2;
/** Default map size — overridden by mapSize prop. */
const DEFAULT_MAP_SIZE = 200;
/** Isometric hover: lift tile by this many pixels (negative Y in screen space). */
const HOVER_LIFT_PX = 12;

/** Character sprite: fixed frame size; anchor at bottom-center (feet on tile center). */
const CHARACTER_FRAME_SIZE = 460;
const CHARACTER_IDLE_COLS = 4;
const CHARACTER_WALK_COLS = 6;
const CHARACTER_RUN_COLS = 4;
const CHARACTER_SWORD_ATTACK_COLS = 6; // Typical attack animation frames
const CHARACTER_AXE_SWING_COLS = 6; // Typical swing animation frames
const CHARACTER_PICKAXE_SWING_COLS = 6; // Typical swing animation frames
const CHARACTER_DIG_COLS = 6; // Dig/shovel animation frames (from 5x6 sheet)
const DIG_FRAME_MS = 120;
const CHARACTER_SIT_COLS = 4; // Sitting animation frames
const CHARACTER_FISH_COLS = 6; // Typical fishing animation frames
const CHARACTER_DAMAGE_COLS = 4;
const CHARACTER_DIE_COLS = 6;
const DAMAGE_FRAME_MS = 100;
const DIE_FRAME_MS = 150;
const DAMAGE_DURATION_MS = DAMAGE_FRAME_MS * CHARACTER_DAMAGE_COLS;
const DIE_DURATION_MS = DIE_FRAME_MS * CHARACTER_DIE_COLS;
const PLAYER_DAMAGE_PER_HIT = 20;
const PLAYER_INVULN_MS = 1500; // Invulnerable after hit
const WALK_MOVE_SPEED = 2.2;  // grid units per second (normal)
const RUN_MOVE_SPEED = 6.5;   // grid units per second (shift held)

// Enemy constants
const ENEMY_FRAME_SIZE = 460; // Same as character frame size
const ENEMY_MOVE_COLS = 6; // Typical move animation frames
const ENEMY_ATTACK_COLS = 6; // Typical attack animation frames
const ENEMY_DIE_COLS = 6; // Death animation frames
const ENEMY_MOVE_FRAME_MS = 150;
const ENEMY_IDLE_FRAME_MS = 200; // Slower cycle when standing still
const ENEMY_ATTACK_FRAME_MS = 100;
const ENEMY_DIE_FRAME_MS = 150;
const ENEMY_DIE_DURATION_MS = ENEMY_DIE_FRAME_MS * ENEMY_DIE_COLS;
const ENEMY_MOVE_SPEED = 2.0; // grid units per second
const ENEMY_ATTACK_RANGE = 1.5; // tiles
const ENEMY_ATTACK_COOLDOWN_MS = 1000; // 1 second between attacks
const AGGRO_RADIUS = 8;   // grid tiles - player must enter this range of mob spawn to aggro
const LEASH_RADIUS = 14;  // grid tiles - if player exits this range from spawn, mob returns
const NOISE_WALK = 0.004;       // per tile when walking (shift held)
const NOISE_RUN = 0.018;        // per tile when running (fast movement)
const NOISE_DIG = 0.08;         // when dig completes
const NOISE_ATTACK = 0.05;      // per attack (sword/axe/pickaxe)
const NOISE_DECAY_PER_SEC = 0.12;
const WAVE_COOLDOWN_MS = 3 * 60 * 1000; // 3 minutes after each wave
const FIRST_WAVE_DELAY_MS = 5000; // 5 seconds before first wave (so mobs appear quickly)
const MIN_WAVE_DELAY_MS = 30000; // 30 seconds minimum between subsequent waves
const MAX_WAVE_DELAY_MS = 120000; // 2 minutes maximum between subsequent waves
const ENEMIES_PER_WAVE_MIN = 2;
const ENEMIES_PER_WAVE_MAX = 5;

// Enemy health by type — rank-and-file are fragile
const ENEMY_MAX_HEALTH: Record<EnemyType, number> = {
  slime: 18,      // 1 hit
  goblin: 28,     // 1–2 hits
  kobolt: 38,     // 1–2 hits
  scorpion: 50,   // 2 hits
  skeleton: 60,   // 2–3 hits
  wolf: 75,       // 3 hits
};

// Player weapon damage
const SWORD_DAMAGE = 25;
const AXE_DAMAGE = 20;
const PICKAXE_DAMAGE = 15;

// Attack range for hitting enemies
const PLAYER_ATTACK_RANGE = 2.0; // tiles
/** Extra upward arc (in pixels) when jumping between elevation levels. */
const JUMP_ARC_PX = 80;
const IDLE_FRAME_MS = 200;
const WALK_FRAME_MS = 140;
const RUN_FRAME_MS = 100;
const SWORD_ATTACK_FRAME_MS = 80; // Faster attack animation
const AXE_SWING_FRAME_MS = 100; // Slightly slower for axe
const PICKAXE_SWING_FRAME_MS = 100; // Similar to axe
const SIT_FRAME_MS = 200; // Sitting animation timing
const FISH_FRAME_MS = 120; // Fishing/reeling animation timing
const ATTACK_DURATION_MS = SWORD_ATTACK_FRAME_MS * CHARACTER_SWORD_ATTACK_COLS; // Total attack duration
const MAX_DT = 0.05; // cap delta so one long frame doesn't teleport (50ms)
/** Threshold below which we consider a move complete. */
const ARRIVE_THRESHOLD = 0.01;
/** Safety: force-complete a move if it takes longer than this (seconds). */
const MOVE_TIMEOUT = 2.0;

/**
 * Map WASD key direction to sprite sheet row index.
 * WASD maps to screen-space cardinals in isometric projection:
 *   W = screen-up, S = screen-down, A = screen-left, D = screen-right
 * Grid deltas:
 *   W(-1,-1)=up  S(1,1)=down  A(-1,1)=left  D(1,-1)=right
 * Sprite rows: 0=SE(down-right) 1=SW(down-left) 2=E(right) 3=W(left) 4=NE(up-right)
 *
 * We convert grid (dx,dy) to screen direction, then pick the sprite row.
 */
function getDirectionRow(dx: number, dy: number, prevRow: number): number {
  if (dx === 0 && dy === 0) return prevRow;
  // Convert grid delta to screen delta for direction
  // screenDX = dx - dy, screenDY = dx + dy
  const sdx = dx - dy; // positive = right on screen
  const sdy = dx + dy; // positive = down on screen

  if (sdx > 0 && sdy > 0) return 0;   // screen down-right → SE
  if (sdx < 0 && sdy > 0) return 1;   // screen down-left  → SW
  if (sdx > 0 && sdy === 0) return 2;  // screen right      → E (row 2, now flipped to face right)
  if (sdx < 0 && sdy === 0) return 3;  // screen left       → W
  if (sdx > 0 && sdy < 0) return 4;    // screen up-right   → NE
  if (sdx < 0 && sdy < 0) return 4;    // screen up-left    → NE (closest)
  if (sdx === 0 && sdy < 0) return 4;  // screen up         → NE
  if (sdx === 0 && sdy > 0) return 0;  // screen down       → SE
  return prevRow;
}

export type EnemyType = 'goblin' | 'kobolt' | 'scorpion' | 'skeleton' | 'slime' | 'wolf';

// Enemies from IsometricEnemies: placed at random locations, aggro when player is near
const RANDOM_ENEMY_TYPES: EnemyType[] = ['goblin', 'kobolt', 'scorpion', 'skeleton', 'slime', 'wolf'];
const RANDOM_ENEMY_COUNT = 50;   // Total enemies placed across the map
const SPAWN_MIN_DIST_FROM_CENTER = 20; // Don't spawn too close to map center (player start)

export type MobAIState = 'idle' | 'aggro' | 'chase' | 'return';

export interface EnemyState {
  id: string;
  type: EnemyType;
  logicalGridX: number;
  logicalGridY: number;
  targetGridX: number;
  targetGridY: number;
  renderX: number;
  renderY: number;
  spawnGridX: number;
  spawnGridY: number;
  aiState: MobAIState;
  isMoving: boolean;
  isAttacking: boolean;
  directionRow: number;
  animation: 'idle' | 'move' | 'attack' | 'die';
  animStartTime: number;
  moveStartTime: number;
  attackCooldownUntil: number;
  targetPlayerId: string | null;
  health: number;
  maxHealth: number;
  isDead: boolean;
  dieUntil: number;
}

export interface CharacterState {
  /** Authoritative: only updates when a move completes. */
  logicalGridX: number;
  logicalGridY: number;
  /** Target cell for the CURRENT single-tile move. Always 1 tile from logical. */
  targetGridX: number;
  targetGridY: number;
  /** Interpolated position for rendering and camera. Only this moves during a step. */
  renderX: number;
  renderY: number;
  /** True while interpolating from logical toward target. */
  isMoving: boolean;
  directionRow: number;
  animation: 'idle' | 'walk' | 'run' | 'swordAttack' | 'axeAttack' | 'pickaxeAttack' | 'dig' | 'sit' | 'fish' | 'damage' | 'die' | 'interact';
  /** Timestamp when the current animation (idle or run) started. Frame index is
   *  derived from (now - animStartTime) via modulo — never reset at loop boundaries. */
  animStartTime: number;
  /** Timestamp when the current move started (for timeout safety). */
  moveStartTime: number;
  /** True when the current move involves an elevation change (jump arc). */
  isJumping: boolean;
  /** Attack state: null when not attacking, 'sword', 'axe', 'pickaxe', or 'dig' when attacking/digging */
  attackType: 'sword' | 'axe' | 'pickaxe' | 'dig' | null;
  /** Fishing state: 'sitting' when sitting, 'fishing' when fishing/reeling */
  fishingState: 'sitting' | 'fishing' | null;
  /** Timestamp when current attack started */
  attackStartTime: number;
  /** Set of enemy IDs hit during current attack (cleared when attack ends) */
  enemiesHitThisAttack: Set<string>;
  /** Player health (0 = dead) */
  health: number;
  maxHealth: number;
  /** When mob hit: play damage then revert. When health 0: play die. */
  damageUntil: number;
  dieUntil: number;
  /** Last time we took damage (for invuln window) */
  lastDamageTime: number;
}

export function IsometricMapCanvas({
  width,
  height,
  cameraX,
  cameraY,
  cameraZoom,
  onTileClick,
  onItemClick: _onItemClick,
  onPositionChange,
  onKeyAction,
  onHealthChange,
  inventoryFoodCount = 0,
  maxInventoryFood = 5,
  onRequestStartingFood,
  onAddFoodToInventory,
  onFoodPositionsChange,
  onRareEntityPositionsChange,
  onTaskEvent,
  onInfectNearby,
  placeableItems = [],
  otherPlayers = [],
  localPlayerName = 'You',
  localPlayerColor = '#4CAF50',
  localPlayerInfected = false,
  isPatientZero = false,
  mapSize: mapSizeProp,
  className = '',
  buriedGems = [],
  dugGems = [],
  onDigGem,
  onCollectGem,
  testCamps = [],
  deathTrigger = 0,
}: IsometricMapCanvasProps) {
  const MAP_SIZE = mapSizeProp ?? DEFAULT_MAP_SIZE;
  const mapSizeRef = useRef(MAP_SIZE);
  mapSizeRef.current = MAP_SIZE;

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Fixed dimensions - never resize
  const dimensions = { width, height };
  const devicePixelRatio = window.devicePixelRatio || 1;
  const imagesCache = useRef<Map<string, HTMLImageElement>>(new Map());
  const hoveredTileRef = useRef<{ gridX: number; gridY: number } | null>(null);
  // Force a re-render when hovered tile changes (for cursor style only)
  const [hoveredTile, setHoveredTile] = useState<{ gridX: number; gridY: number } | null>(null);

  // ──────────────────────────────────────────────────────────────────────────
  // Character state: lives in a REF so the RAF loop can read/write without
  // triggering React re-renders every frame.
  // Spawn near map center + offset so player is close to test camp (mapCenter+2, mapCenter+1)
  // ──────────────────────────────────────────────────────────────────────────
  const mapCenter = Math.floor(MAP_SIZE / 2);
  const _start = findNearestFreeTile(mapCenter + 1, mapCenter, MAP_SIZE);
  const startX = _start.x;
  const startY = _start.y;
  const characterRef = useRef<CharacterState>({
    logicalGridX: startX,
    logicalGridY: startY,
    targetGridX: startX,
    targetGridY: startY,
    renderX: startX,
    renderY: startY,
    isMoving: false,
    directionRow: 4,
    animation: 'idle',
    animStartTime: 0,
    moveStartTime: 0,
    isJumping: false,
    attackType: null,
    attackStartTime: 0,
    enemiesHitThisAttack: new Set(),
    fishingState: null,
    health: 500,
    maxHealth: 500,
    damageUntil: 0,
    dieUntil: 0,
    lastDamageTime: -10000,
  });

  const buriedGemsRef = useRef(buriedGems);
  buriedGemsRef.current = buriedGems;
  const dugGemsRef = useRef(dugGems);
  dugGemsRef.current = dugGems;
  const onDigGemRef = useRef(onDigGem);
  onDigGemRef.current = onDigGem;
  const onCollectGemRef = useRef(onCollectGem);
  onCollectGemRef.current = onCollectGem;

  const characterSheetsLoaded = useRef<{ 
    idle: HTMLImageElement | null; 
    walk: HTMLImageElement | null; 
    run: HTMLImageElement | null;
    swordAttack: HTMLImageElement | null;
    axeAttack: HTMLImageElement | null;
    pickaxeAttack: HTMLImageElement | null;
    dig: HTMLImageElement | null;
    sit: HTMLImageElement | null;
    fish: HTMLImageElement | null;
    damage: HTMLImageElement | null;
    die: HTMLImageElement | null;
    interact: HTMLImageElement | null;
  }>({ idle: null, walk: null, run: null, swordAttack: null, axeAttack: null, pickaxeAttack: null, dig: null, sit: null, fish: null, damage: null, die: null, interact: null });
  const characterSheetsReadyRef = useRef(false);

  // Enemy state management
  const enemiesRef = useRef<Map<string, EnemyState>>(new Map());
  const enemySheetsLoaded = useRef<{
    goblin: { move: HTMLImageElement | null; attack: HTMLImageElement | null };
    kobolt: { move: HTMLImageElement | null; attack: HTMLImageElement | null };
    scorpion: { move: HTMLImageElement | null; attack: HTMLImageElement | null };
    skeleton: { move: HTMLImageElement | null; attack: HTMLImageElement | null };
    slime: { move: HTMLImageElement | null; attack: HTMLImageElement | null };
    wolf: { move: HTMLImageElement | null; attack: HTMLImageElement | null };
  }>({
    goblin: { move: null, attack: null },
    kobolt: { move: null, attack: null },
    scorpion: { move: null, attack: null },
    skeleton: { move: null, attack: null },
    slime: { move: null, attack: null },
    wolf: { move: null, attack: null },
  });
  const enemySheetsReadyRef = useRef(false);
  const noiseLevelRef = useRef(0);
  const waveSpawnerRef = useRef({
    lastWaveTime: 0,
    nextWaveDelay: FIRST_WAVE_DELAY_MS, // First wave spawns after 5 seconds
  });
  const enemyIdCounterRef = useRef(0);
  const hasPreSpawnedMobsRef = useRef(false);

  // Food pickups: random spawn (rare), 1 min decay, collect for small health
  interface FoodItem {
    id: string;
    gridX: number;
    gridY: number;
    spawnTime: number;
    image: string;
  }
  const foodItemsRef = useRef<FoodItem[]>([]);
  const foodIdCounterRef = useRef(0);
  const lastFoodSpawnRef = useRef(0);
  const nextFoodSpawnDelayRef = useRef(FOOD_SPAWN_MIN_MS + Math.random() * (FOOD_SPAWN_MAX_MS - FOOD_SPAWN_MIN_MS));
  const onFoodPositionsChangeRef = useRef(onFoodPositionsChange);
  onFoodPositionsChangeRef.current = onFoodPositionsChange;
  const inventoryFoodCountRef = useRef(inventoryFoodCount);
  inventoryFoodCountRef.current = inventoryFoodCount;
  const maxInventoryFoodRef = useRef(maxInventoryFood);
  maxInventoryFoodRef.current = maxInventoryFood;
  const onAddFoodToInventoryRef = useRef(onAddFoodToInventory);
  onAddFoodToInventoryRef.current = onAddFoodToInventory;

  // Valuables: drop from mobs when killed, same logic as food
  interface ValuableItem {
    id: string;
    gridX: number;
    gridY: number;
    spawnTime: number;
    image: string;
  }
  const valuableItemsRef = useRef<ValuableItem[]>([]);
  const valuableIdCounterRef = useRef(0);

  // Rare entity: random spawn, E to interact for health
  interface RareEntity { id: string; gridX: number; gridY: number; spawnTime: number; animStartTime: number; }
  const rareEntitiesRef = useRef<RareEntity[]>([]);
  const lastRareSpawnRef = useRef(0);
  const nextRareSpawnDelayRef = useRef(RARE_ENTITY_SPAWN_MIN_MS + Math.random() * (RARE_ENTITY_SPAWN_MAX_MS - RARE_ENTITY_SPAWN_MIN_MS));
  const rareEntityIdCounterRef = useRef(0);
  const onRareEntityPositionsChangeRef = useRef(onRareEntityPositionsChange);
  onRareEntityPositionsChangeRef.current = onRareEntityPositionsChange;
  const onInfectNearbyRef = useRef(onInfectNearby);
  onInfectNearbyRef.current = onInfectNearby;
  const infectDummyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const infectDummyStartTimeRef = useRef<number | null>(null);

  // Calculate initial zoom to fit the map in view
  const calculateInitialZoom = useCallback(() => {
    const worldWidthPx = MAP_SIZE * TILE_WIDTH;
    const worldHeightPx = MAP_SIZE * TILE_HEIGHT;
    const zoomX = dimensions.width / worldWidthPx;
    const zoomY = dimensions.height / worldHeightPx;
    const fitZoom = Math.min(zoomX, zoomY) * 0.8;
    return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, fitZoom));
  }, [dimensions.width, dimensions.height, MAP_SIZE]);

  // Camera state: zoom managed via React state (changes infrequently).
  // The camera *position* for rendering always follows characterRef.renderX/Y
  // inside the RAF loop, so it never lags or snaps.
  const cameraRef = useRef({
    x: cameraX ?? 0,
    y: cameraY ?? 0,
    zoom: cameraZoom ?? calculateInitialZoom(),
  });
  // Sync with external camera changes (if provided)
  useEffect(() => {
    if (cameraX !== undefined && cameraY !== undefined && cameraZoom !== undefined) {
      cameraRef.current = { x: cameraX, y: cameraY, zoom: cameraZoom };
    }
  }, [cameraX, cameraY, cameraZoom]);

  // Notify parent of initial health on mount
  useEffect(() => {
    if (onHealthChange) {
      const ch = characterRef.current;
      onHealthChange(ch.health, ch.maxHealth);
    }
  }, [onHealthChange]);

  // Starting food when user enters map: if health full → inventory, else → consume
  useEffect(() => {
    if (!onRequestStartingFood) return;
    const ch = characterRef.current;
    const action = onRequestStartingFood(ch.health, ch.maxHealth);
    if (action === 'consume') {
      ch.health = Math.min(ch.maxHealth, ch.health + FOOD_HEALTH_RESTORE);
      if (onHealthChange) onHealthChange(ch.health, ch.maxHealth);
    }
  }, [onRequestStartingFood, onHealthChange]);

  // Trigger death animation when deathTrigger increments (local player eliminated)
  useEffect(() => {
    if (deathTrigger === 0) return;
    const ch = characterRef.current;
    const now = performance.now();
    ch.animation = 'die';
    ch.animStartTime = now;
    ch.dieUntil = now + DIE_DURATION_MS;
    ch.isMoving = false;
  }, [deathTrigger]);

  // ──────────────────────────────────────────────────────────────────────────
  // All map tiles: Map-based for incremental expansion. Key = "gx,gy".
  // ──────────────────────────────────────────────────────────────────────────
  const allTilesMap = useRef<Map<string, { gridX: number; gridY: number; tile: TileData }>>(new Map());
  const allTilesRef = useRef<Array<{ gridX: number; gridY: number; tile: TileData }>>([]);
  const generatedMapSize = useRef(0);

  /** Decorations (trees, bushes, tall rocks) to render depth-sorted. */
  const decorationsRef = useRef<Array<{ gridX: number; gridY: number; image: string }>>([]);

  /** Tree chop progress: key "gx,gy" -> { swings, maxSwings }. Cleared when tree is chopped. */
  const treeChopProgressRef = useRef<Map<string, { swings: number; maxSwings: number }>>(new Map());

  // Generate or expand tiles when MAP_SIZE changes
  if (generatedMapSize.current < MAP_SIZE) {
    const oldSize = generatedMapSize.current;
    const tileMap = allTilesMap.current;
    const decorations = decorationsRef.current;

    // Generate only NEW tiles (L-shaped border when expanding, or full grid first time)
    for (let gy = 0; gy < MAP_SIZE; gy++) {
      for (let gx = 0; gx < MAP_SIZE; gx++) {
        // Skip already-generated tiles
        if (gx < oldSize && gy < oldSize) continue;
        const key = `${gx},${gy}`;
        const tile = generateTile(gx, gy);
        tileMap.set(key, { gridX: gx, gridY: gy, tile });
        if (tile.blocked) {
          blockedTileKeys.add(key);
        }
        if ((tile as ExtendedTileData).choppable) {
          choppableTileKeys.add(key);
        }
        if (tile.elevation !== undefined && tile.elevation !== 0) {
          elevationMap.set(key, tile.elevation);
        }
        if (tile.decoration) {
          decorations.push({ gridX: gx, gridY: gy, image: tile.decoration });
        }
      }
    }

    // ── Smooth elevation map for the expanded region ──
    // Only process tiles near the boundary (within 10 tiles) or in the new area
    const smoothMin = Math.max(0, oldSize - 10);
    for (let pass = 0; pass < 10; pass++) {
      let changed = false;
      for (let gy = smoothMin; gy < MAP_SIZE; gy++) {
        for (let gx = smoothMin; gx < MAP_SIZE; gx++) {
          const e = getElevation(gx, gy);
          if (e === 0) continue;
          const neighbors = [
            [gx - 1, gy], [gx + 1, gy], [gx, gy - 1], [gx, gy + 1],
            [gx - 1, gy - 1], [gx + 1, gy - 1], [gx - 1, gy + 1], [gx + 1, gy + 1],
          ];
          for (const [nx, ny] of neighbors) {
            if (nx < 0 || nx >= MAP_SIZE || ny < 0 || ny >= MAP_SIZE) continue;
            const ne = getElevation(nx, ny);
            if (e - ne > 1) {
              const newNe = e - 1;
              elevationMap.set(`${nx},${ny}`, newNe);
              const entry = tileMap.get(`${nx},${ny}`);
              if (entry) entry.tile.elevation = newNe;
              changed = true;
            }
          }
        }
      }
      if (!changed) break;
    }

    // Rebuild flat array from map (sorted by gy, gx for consistent rendering)
    allTilesRef.current = Array.from(tileMap.values());
    generatedMapSize.current = MAP_SIZE;
  }

  // Set canvas size once using devicePixelRatio (never resize during pan/zoom)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = dimensions.width * devicePixelRatio;
    canvas.height = dimensions.height * devicePixelRatio;
    canvas.style.width = `${dimensions.width}px`;
    canvas.style.height = `${dimensions.height}px`;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.imageSmoothingEnabled = false;
  }, [dimensions.width, dimensions.height, devicePixelRatio]);

  // Pre-load character sprite sheets
  useEffect(() => {
    const load = (src: string): Promise<HTMLImageElement> =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    Promise.all([
      load(characterIdleSheet), 
      load(characterWalkSheet), 
      load(characterRunSheet),
      load(characterSwordAttackSheet),
      load(characterAxeSwingSheet),
      load(characterPickaxeSwingSheet),
      load(characterDigSheet),
      load(characterSitSheet),
      load(characterFishSheet),
      load(characterDamageSheet),
      load(characterDieSheet),
      load(characterInteractSheet),
    ]).then(([idle, walk, run, swordAttack, axeAttack, pickaxeAttack, dig, sit, fish, damage, die, interact]) => {
      characterSheetsLoaded.current = { idle, walk, run, swordAttack, axeAttack, pickaxeAttack, dig, sit, fish, damage, die, interact };
      characterSheetsReadyRef.current = true;
    }).catch((err) => console.warn('Character sheets failed to load', err));
  }, []);

  // Pre-load enemy sprite sheets
  useEffect(() => {
    const load = (src: string): Promise<HTMLImageElement> =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    Promise.all([
      load(goblinMoveSheet),
      load(goblinAttackSheet),
      load(koboltMoveSheet),
      load(koboltAttackSheet),
      load(scorpionMoveSheet),
      load(scorpionAttackSheet),
      load(skeletonMoveSheet),
      load(skeletonAttackSheet),
      load(slimeMoveSheet),
      load(slimeAttackSheet),
      load(wolfMoveSheet),
      load(wolfAttackSheet),
    ]).then(([goblinMove, goblinAttack, koboltMove, koboltAttack, scorpionMove, scorpionAttack, skeletonMove, skeletonAttack, slimeMove, slimeAttack, wolfMove, wolfAttack]) => {
      enemySheetsLoaded.current = {
        goblin: { move: goblinMove, attack: goblinAttack },
        kobolt: { move: koboltMove, attack: koboltAttack },
        scorpion: { move: scorpionMove, attack: scorpionAttack },
        skeleton: { move: skeletonMove, attack: skeletonAttack },
        slime: { move: slimeMove, attack: slimeAttack },
        wolf: { move: wolfMove, attack: wolfAttack },
      };
      enemySheetsReadyRef.current = true;
    }).catch((err) => console.warn('Enemy sheets failed to load', err));
  }, []);

  // Pre-composite building images into refs
  const buildingImagesRef = useRef<Map<string, HTMLImageElement>>(new Map());

  useEffect(() => {
    const load = (src: string): Promise<HTMLImageElement> =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });

    // Helper to composite layers
    const compositeLayers = (layers: string[], width: number, height: number): Promise<HTMLImageElement> => {
      return Promise.all(layers.map(load)).then((loadedLayers) => {
        const offscreen = document.createElement('canvas');
        offscreen.width = width;
        offscreen.height = height;
        const octx = offscreen.getContext('2d');
        if (!octx) throw new Error('Canvas context unavailable');
        for (const layer of loadedLayers) {
          octx.drawImage(layer, 0, 0, width, height);
        }
        const composited = new Image();
        return new Promise<HTMLImageElement>((resolve) => {
          composited.onload = () => resolve(composited);
          composited.src = offscreen.toDataURL();
        });
      });
    };

    // Composite all building types
    Promise.all([
      compositeLayers(HOUSE_LAYERS, HOUSE_W, HOUSE_H).then(img => {
        buildingImagesRef.current.set('smallhouse', img);
      }),
      compositeLayers(STORE_LAYERS, STORE_W, STORE_H).then(img => {
        buildingImagesRef.current.set('store', img);
      }),
      compositeLayers(BIG_HOUSE_LAYERS, BIG_HOUSE_W, BIG_HOUSE_H).then(img => {
        buildingImagesRef.current.set('bighouse', img);
      }),
      compositeLayers(BIG_HOUSE_LAYERS_REDCLAY, BIG_HOUSE_W, BIG_HOUSE_H).then(img => {
        buildingImagesRef.current.set('bighouse_redclay', img);
      }),
      compositeLayers(BIG_HOUSE_LAYERS_STRAW, BIG_HOUSE_W, BIG_HOUSE_H).then(img => {
        buildingImagesRef.current.set('bighouse_straw', img);
      }),
      compositeLayers(BIG_HOUSE_LAYERS_GRASS, BIG_HOUSE_W, BIG_HOUSE_H).then(img => {
        buildingImagesRef.current.set('bighouse_grass', img);
      }),
      // Load pre-composited tents
      load(tentBlue).then(img => buildingImagesRef.current.set('tent_blue', img)),
      load(tentGreen).then(img => buildingImagesRef.current.set('tent_green', img)),
      load(tentYellow).then(img => buildingImagesRef.current.set('tent_yellow', img)),
      load(tentRed).then(img => buildingImagesRef.current.set('tent_red', img)),
    ]).catch((err) => console.warn('Building images failed to load', err));
  }, []);

  // Legacy ref for backward compatibility
  const houseImageRef = useRef<HTMLImageElement | null>(null);
  useEffect(() => {
    const checkReady = setInterval(() => {
      if (buildingImagesRef.current.has('smallhouse')) {
        houseImageRef.current = buildingImagesRef.current.get('smallhouse')!;
        clearInterval(checkReady);
      }
    }, 100);
    return () => clearInterval(checkReady);
  }, []);

  // Load images into cache (returns synchronously if cached)
  const loadImage = useCallback((src: string): HTMLImageElement | null => {
    const cached = imagesCache.current.get(src);
    if (cached) return cached;
    // Start loading; will be available on next frame.
    const img = new Image();
    img.onload = () => { imagesCache.current.set(src, img); };
    img.src = src;
    return null;
  }, []);

  // WASD + Shift: keys currently held (always stored lowercase).
  // Use e.code instead of e.key so physical key position is always correct
  // regardless of Shift, CapsLock, or layout modifiers.
  const keysHeldRef = useRef<Set<string>>(new Set());
  const shiftHeldRef = useRef(false);
  const spaceHeldRef = useRef(false);
  useEffect(() => {
    const moveCodes = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD']);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') { shiftHeldRef.current = true; }
      if (e.code === 'Space') { spaceHeldRef.current = true; e.preventDefault(); }
      if (moveCodes.has(e.code)) { keysHeldRef.current.add(e.code); e.preventDefault(); }
      // Action keys (E for interact/collect)
      if (e.code === 'KeyE') {
        const ch = characterRef.current;
        const now = performance.now();
        let didInteract = false;
        // Rare entity first (higher priority)
        const rares = rareEntitiesRef.current;
        const rareIdx = rares.findIndex(
          r => Math.abs(r.gridX - ch.logicalGridX) <= RARE_ENTITY_INTERACT_RANGE &&
               Math.abs(r.gridY - ch.logicalGridY) <= RARE_ENTITY_INTERACT_RANGE
        );
        if (rareIdx !== -1) {
          rares.splice(rareIdx, 1);
          ch.health = Math.min(ch.maxHealth, ch.health + RARE_ENTITY_HEALTH_RESTORE);
          onRareEntityPositionsChangeRef.current?.(rares.map(r => ({ gridX: r.gridX, gridY: r.gridY })));
          didInteract = true;
        } else {
          const foods = foodItemsRef.current;
          const idx = foods.findIndex(
            f => Math.abs(f.gridX - ch.logicalGridX) <= FOOD_PICKUP_RANGE &&
                 Math.abs(f.gridY - ch.logicalGridY) <= FOOD_PICKUP_RANGE
          );
          if (idx !== -1) {
            const invCount = inventoryFoodCountRef.current;
            const maxInv = maxInventoryFoodRef.current;
            if (ch.health < ch.maxHealth) {
              foods.splice(idx, 1);
              ch.health = Math.min(ch.maxHealth, ch.health + FOOD_HEALTH_RESTORE);
              onFoodPositionsChangeRef.current?.(foods.map(f => ({ gridX: f.gridX, gridY: f.gridY })));
              didInteract = true;

              // Notify task system of resource collection
              onTaskEventRef.current?.({
                type: 'resource_collect',
                gridX: ch.logicalGridX,
                gridY: ch.logicalGridY,
                amount: 1,
              });
            } else if (invCount < maxInv) {
              foods.splice(idx, 1);
              onAddFoodToInventoryRef.current?.();
              onFoodPositionsChangeRef.current?.(foods.map(f => ({ gridX: f.gridX, gridY: f.gridY })));
              didInteract = true;

              // Notify task system of resource collection
              onTaskEventRef.current?.({
                type: 'resource_collect',
                gridX: ch.logicalGridX,
                gridY: ch.logicalGridY,
                amount: 1,
              });
            }
          }
        }
        if (!didInteract) {
          const valuables = valuableItemsRef.current;
          const vIdx = valuables.findIndex(
            v => Math.abs(v.gridX - ch.logicalGridX) <= VALUABLE_PICKUP_RANGE &&
                 Math.abs(v.gridY - ch.logicalGridY) <= VALUABLE_PICKUP_RANGE
          );
          if (vIdx !== -1) {
            valuables.splice(vIdx, 1);
            didInteract = true;

            // Notify task system of resource collection
            onTaskEventRef.current?.({
              type: 'resource_collect',
              gridX: ch.logicalGridX,
              gridY: ch.logicalGridY,
              amount: 1,
            });
          }
        }
        // Check for dug gems to collect
        if (!didInteract) {
          const dugGemsList = dugGemsRef.current ?? [];
          const px = Math.floor(ch.logicalGridX);
          const py = Math.floor(ch.logicalGridY);
          const gemIdx = dugGemsList.findIndex(
            g => Math.abs(g.gridX - px) <= 1.5 && Math.abs(g.gridY - py) <= 1.5
          );
          if (gemIdx !== -1 && onCollectGemRef.current) {
            const gem = dugGemsList[gemIdx];
            onCollectGemRef.current(gem.id, gem.gridX, gem.gridY);
            didInteract = true;
            console.log('[E Key] Collecting dug gem:', gem.id);
          }
        }
        if (didInteract) {
          ch.animation = 'interact';
          ch.animStartTime = now;
        }
        onKeyActionRef.current?.('e', ch.logicalGridX, ch.logicalGridY);
        e.preventDefault();
      }
      // T key: Test for infection at test camp
      if (e.code === 'KeyT') {
        const ch = characterRef.current;
        onKeyActionRef.current?.('t', ch.logicalGridX, ch.logicalGridY);
        e.preventDefault();
      }
      // L key: Dig up buried gems
      if (e.code === 'KeyL') {
        const ch = characterRef.current;
        const px = Math.floor(ch.logicalGridX);
        const py = Math.floor(ch.logicalGridY);

        // Find buried gem at player tile (allow standing on same tile)
        const gems = buriedGemsRef.current ?? [];
        console.log('[L Key] Player at:', px, py, 'Buried gems:', gems.length);

        const gem = gems.find(g =>
          Math.abs(g.gridX - px) <= 0 && Math.abs(g.gridY - py) <= 0
        );

        if (gem && onDigGemRef.current) {
          onDigGemRef.current(gem.id, gem.gridX, gem.gridY);
          console.log('[L Key] Digging gem:', gem.id, 'at', gem.gridX, gem.gridY);
        } else {
          const nearbyGems = gems.filter(g =>
            Math.abs(g.gridX - px) <= 2 && Math.abs(g.gridY - py) <= 2
          );
          console.log('[L Key] No gem at tile. Nearby gems:', nearbyGems.map(g => `(${g.gridX},${g.gridY})`));
        }

        e.preventDefault();
      }
      if (e.code === 'KeyQ') {
        e.preventDefault();
        if (e.repeat) return; // Ignore key repeat — timer would reset every ~50ms and never complete
        const ch = characterRef.current;
        // Allow patient zero to infect even before they've tested (they may not know yet client-side)
        const canInfect = localPlayerInfectedRef.current || isPatientZeroRef.current;
        if (!canInfect) return;

        // Start a 2s hold timer
        if (infectDummyTimerRef.current) clearTimeout(infectDummyTimerRef.current);
        infectDummyStartTimeRef.current = performance.now();
        infectDummyTimerRef.current = setTimeout(() => {
          infectDummyTimerRef.current = null;
          infectDummyStartTimeRef.current = null;
          // Infect nearby real player via server
          onInfectNearbyRef.current?.();
        }, 2000);
      }
      // Attack keys (G for sword, H for axe)
      if (e.code === 'KeyG') {
        const ch = characterRef.current;
        // Only start attack if not already attacking
        if (ch.attackType === null) {
          const now = performance.now();
          ch.attackType = 'sword';
          ch.attackStartTime = now;
          ch.animation = 'swordAttack';
          ch.animStartTime = now;
          ch.isMoving = false; // Stop movement when attacking
        }
        e.preventDefault();
      }
      if (e.code === 'KeyH') {
        const ch = characterRef.current;
        // Only start attack if not already attacking
        if (ch.attackType === null) {
          const now = performance.now();
          ch.attackType = 'axe';
          ch.attackStartTime = now;
          ch.animation = 'axeAttack';
          ch.animStartTime = now;
          ch.isMoving = false; // Stop movement when attacking
        }
        e.preventDefault();
      }
      // Pickaxe attack key (J)
      if (e.code === 'KeyJ') {
        const ch = characterRef.current;
        // Only start attack if not already attacking
        if (ch.attackType === null) {
          const now = performance.now();
          ch.attackType = 'pickaxe';
          ch.attackStartTime = now;
          ch.animation = 'pickaxeAttack';
          ch.animStartTime = now;
          ch.isMoving = false; // Stop movement when attacking
        }
        e.preventDefault();
      }
      // Dig key (L)
      if (e.code === 'KeyL') {
        const ch = characterRef.current;
        if (ch.attackType === null && ch.fishingState === null) {
          const now = performance.now();
          ch.attackType = 'dig';
          ch.attackStartTime = now;
          ch.animation = 'dig';
          ch.animStartTime = now;
          ch.isMoving = false;
        }
        e.preventDefault();
      }
      // Fishing key (K)
      if (e.code === 'KeyK') {
        const ch = characterRef.current;
        // Don't allow fishing while attacking
        if (ch.attackType !== null) {
          e.preventDefault();
          return;
        }
        
        const now = performance.now();
        
        if (ch.fishingState === null) {
          // First press: sit down
          ch.fishingState = 'sitting';
          ch.animation = 'sit';
          ch.animStartTime = now;
          ch.isMoving = false; // Stop movement when sitting
        } else if (ch.fishingState === 'sitting') {
          // Second press while sitting: start fishing/reeling
          ch.fishingState = 'fishing';
          ch.animation = 'fish';
          ch.animStartTime = now;

          // Notify task system of fishing action
          onTaskEventRef.current?.({
            type: 'fish',
            gridX: ch.logicalGridX,
            gridY: ch.logicalGridY,
            amount: 1,
          });
        } else if (ch.fishingState === 'fishing') {
          // Third press while fishing: stop and return to idle
          ch.fishingState = null;
          ch.animation = 'idle';
          ch.animStartTime = now;
        }
        
        e.preventDefault();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') { shiftHeldRef.current = false; }
      if (e.code === 'Space') { spaceHeldRef.current = false; }
      if (e.code === 'KeyQ') {
        if (infectDummyTimerRef.current) {
          clearTimeout(infectDummyTimerRef.current);
          infectDummyTimerRef.current = null;
          infectDummyStartTimeRef.current = null;
        }
      }
      if (moveCodes.has(e.code)) { keysHeldRef.current.delete(e.code); e.preventDefault(); }
    };
    const onBlur = () => {
      keysHeldRef.current.clear();
      shiftHeldRef.current = false;
      spaceHeldRef.current = false;
      if (infectDummyTimerRef.current) {
        clearTimeout(infectDummyTimerRef.current);
        infectDummyTimerRef.current = null;
        infectDummyStartTimeRef.current = null;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  // Placeable items ref for RAF loop access.
  const placeableItemsRef = useRef(placeableItems);
  placeableItemsRef.current = placeableItems;
  const otherPlayersRef = useRef(otherPlayers);
  otherPlayersRef.current = otherPlayers;
  const localPlayerNameRef = useRef(localPlayerName);
  localPlayerNameRef.current = localPlayerName;
  const localPlayerColorRef = useRef(localPlayerColor);
  localPlayerColorRef.current = localPlayerColor;
  const localPlayerInfectedRef = useRef(localPlayerInfected ?? false);
  localPlayerInfectedRef.current = localPlayerInfected ?? false;
  const isPatientZeroRef = useRef(isPatientZero);
  isPatientZeroRef.current = isPatientZero;
  const onPositionChangeRef = useRef(onPositionChange);
  onPositionChangeRef.current = onPositionChange;
  const onKeyActionRef = useRef(onKeyAction);
  onKeyActionRef.current = onKeyAction;

  // Report initial position to parent (for radar) on mount
  const hasReportedInitialPositionRef = useRef(false);
  useEffect(() => {
    if (hasReportedInitialPositionRef.current) return;
    hasReportedInitialPositionRef.current = true;
    const ch = characterRef.current;
    onPositionChangeRef.current?.(Math.floor(ch.logicalGridX), Math.floor(ch.logicalGridY));
  }, []);
  const onTaskEventRef = useRef(onTaskEvent);
  onTaskEventRef.current = onTaskEvent;
  // Wave defense refs removed - no longer part of gameplay

  // ──────────────────────────────────────────────────────────────────────────
  // SINGLE RAF LOOP: tick movement + draw canvas. No React state per frame.
  // ──────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    let lastT = performance.now();
    let rafId = 0;

    const tick = (t: number) => {
      rafId = requestAnimationFrame(tick);

      let dt = (t - lastT) / 1000;
      if (dt > MAX_DT) dt = MAX_DT;
      lastT = t;

      const ch = characterRef.current;

      // Noise decay
      noiseLevelRef.current = Math.max(0, noiseLevelRef.current - NOISE_DECAY_PER_SEC * dt);
      const ms = mapSizeRef.current;

      // ── Food pickups: spawn rarely, 1 min decay ───────────────────────────
      const foods = foodItemsRef.current;
      let foodListChanged = false;
      if (t - lastFoodSpawnRef.current >= nextFoodSpawnDelayRef.current) {
        const gx = Math.floor(Math.random() * ms);
        const gy = Math.floor(Math.random() * ms);
        const tile = findNearestFreeTile(gx, gy, ms);
        const image = FOOD_IMAGES[Math.floor(Math.random() * FOOD_IMAGES.length)];
        foods.push({
          id: `food_${foodIdCounterRef.current++}`,
          gridX: tile.x,
          gridY: tile.y,
          spawnTime: t,
          image,
        });
        lastFoodSpawnRef.current = t;
        nextFoodSpawnDelayRef.current = FOOD_SPAWN_MIN_MS + Math.random() * (FOOD_SPAWN_MAX_MS - FOOD_SPAWN_MIN_MS);
        foodListChanged = true;
      }
      for (let i = foods.length - 1; i >= 0; i--) {
        if (t - foods[i].spawnTime >= FOOD_DECAY_MS) {
          foods.splice(i, 1);
          foodListChanged = true;
        }
      }
      if (foodListChanged) onFoodPositionsChangeRef.current?.(foods.map(f => ({ gridX: f.gridX, gridY: f.gridY })));

      // Valuables: decay like food
      const valuables = valuableItemsRef.current;
      for (let i = valuables.length - 1; i >= 0; i--) {
        if (t - valuables[i].spawnTime >= VALUABLE_DECAY_MS) {
          valuables.splice(i, 1);
        }
      }

      // ── Rare entity: random spawn (rare), first one after 5s for testing ───
      const rares = rareEntitiesRef.current;
      const firstSpawnDelay = lastRareSpawnRef.current === 0 ? 5000 : nextRareSpawnDelayRef.current;
      if (t - lastRareSpawnRef.current >= firstSpawnDelay) {
        const gx = Math.floor(Math.random() * ms);
        const gy = Math.floor(Math.random() * ms);
        const tile = findNearestLandTile(gx, gy, ms);
        rares.push({
          id: `rare_${rareEntityIdCounterRef.current++}`,
          gridX: tile.x,
          gridY: tile.y,
          spawnTime: t,
          animStartTime: t,
        });
        lastRareSpawnRef.current = t;
        nextRareSpawnDelayRef.current = RARE_ENTITY_SPAWN_MIN_MS + Math.random() * (RARE_ENTITY_SPAWN_MAX_MS - RARE_ENTITY_SPAWN_MIN_MS);
        onRareEntityPositionsChangeRef.current?.(rares.map(r => ({ gridX: r.gridX, gridY: r.gridY })));
      }

      // ── Attack animation handling ────────────────────────────────────────
      if (ch.attackType !== null) {
        const attackElapsed = t - ch.attackStartTime;
        const attackDuration = ch.attackType === 'sword'
          ? SWORD_ATTACK_FRAME_MS * CHARACTER_SWORD_ATTACK_COLS
          : ch.attackType === 'axe'
          ? AXE_SWING_FRAME_MS * CHARACTER_AXE_SWING_COLS
          : ch.attackType === 'pickaxe'
          ? PICKAXE_SWING_FRAME_MS * CHARACTER_PICKAXE_SWING_COLS
          : DIG_FRAME_MS * CHARACTER_DIG_COLS;

        // Deal damage at mid-point of attack animation (frame 3 of 6) — skip for dig
        const damageFrame = 3;
        const damageTime = (damageFrame / 6) * attackDuration;

        if (ch.attackType !== 'dig' && attackElapsed >= damageTime && ch.enemiesHitThisAttack.size === 0) {
          noiseLevelRef.current = Math.min(1, noiseLevelRef.current + NOISE_ATTACK);
          // Attack hitbox active - check for enemies in range
          const damage = ch.attackType === 'sword' ? SWORD_DAMAGE
            : ch.attackType === 'axe' ? AXE_DAMAGE
            : PICKAXE_DAMAGE;

          enemiesRef.current.forEach((enemy) => {
            if (enemy.isDead) return; // Skip dead enemies

            // Calculate distance to enemy
            const dx = enemy.logicalGridX - ch.logicalGridX;
            const dy = enemy.logicalGridY - ch.logicalGridY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist <= PLAYER_ATTACK_RANGE) {
              // Enemy in range - apply damage
              enemy.health = Math.max(0, enemy.health - damage);
              ch.enemiesHitThisAttack.add(enemy.id);

              if (enemy.health === 0) {
                enemy.isDead = true;
                enemy.animation = 'die';
                enemy.dieUntil = t + ENEMY_DIE_DURATION_MS;
                enemy.animStartTime = t;
                enemy.isAttacking = false;
                enemy.isMoving = false;

                // Notify task system of enemy kill
                onTaskEventRef.current?.({
                  type: 'enemy_kill',
                  gridX: Math.floor(enemy.logicalGridX),
                  gridY: Math.floor(enemy.logicalGridY),
                  amount: 1,
                });

                if (Math.random() < VALUABLE_DROP_CHANCE) {
                  const gx = Math.floor(enemy.logicalGridX);
                  const gy = Math.floor(enemy.logicalGridY);
                  const tile = findNearestFreeTile(gx, gy, ms);
                  const image = VALUABLE_IMAGES[Math.floor(Math.random() * VALUABLE_IMAGES.length)];
                  valuableItemsRef.current.push({
                    id: `valuable_${valuableIdCounterRef.current++}`,
                    gridX: tile.x,
                    gridY: tile.y,
                    spawnTime: t,
                    image,
                  });
                }
              }
            }
          });
        }

        if (attackElapsed >= attackDuration) {
          // Attack/dig animation complete
          if (ch.attackType === 'dig') {
            noiseLevelRef.current = Math.min(1, noiseLevelRef.current + NOISE_DIG);
            const px = Math.floor(ch.logicalGridX);
            const py = Math.floor(ch.logicalGridY);
            // Check player tile + 8 adjacent tiles (gems may be on water/blocked tiles; player digs from nearby land)
            const gems = buriedGemsRef.current ?? [];
            const gem = gems.find(g =>
              Math.abs(g.gridX - px) <= 1 && Math.abs(g.gridY - py) <= 1
            );
            if (gem) {
              onCollectGemRef.current?.(gem.id, gem.gridX, gem.gridY);
            }
          } else if (ch.attackType === 'axe') {
            // Axe: chop adjacent tree (5–10 swings per tree)
            const px = Math.floor(ch.logicalGridX);
            const py = Math.floor(ch.logicalGridY);
            for (const [dx, dy] of SURROUND_OFFSETS) {
              const tx = px + dx;
              const ty = py + dy;
              const key = `${tx},${ty}`;
              if (!choppableTileKeys.has(key) || choppedTileKeys.has(key)) continue;
              const maxSwings = getTreeSwingsNeeded(tx, ty);
              const prog = treeChopProgressRef.current.get(key) ?? { swings: 0, maxSwings };
              prog.swings++;
              treeChopProgressRef.current.set(key, prog);
              if (prog.swings >= maxSwings) {
                choppedTileKeys.add(key);
                treeChopProgressRef.current.delete(key);
              }
              break; // One tree per swing
            }
          }
          ch.attackType = null;
          ch.animation = 'idle';
          ch.animStartTime = t;
          ch.enemiesHitThisAttack.clear();
        }
      }

      // ── Fishing state handling ────────────────────────────────────────
      if (ch.fishingState === 'sitting') {
        // Sitting state - loop the sit animation
        // Animation loops automatically via frameIndex calculation
        // No need to transition out unless user presses K again
      } else if (ch.fishingState === 'fishing') {
        // Fishing/reeling state - loop the fish animation
        // Animation loops automatically via frameIndex calculation
        // No need to transition out unless user presses K again
      }

      // ── Pre-spawn enemies at random locations (IsometricEnemies: goblin, kobolt, scorpion, skeleton, slime, wolf) ─
      if (enemySheetsReadyRef.current && !hasPreSpawnedMobsRef.current) {
        hasPreSpawnedMobsRef.current = true;
        const center = ms / 2;
        const used = new Set<string>();
        for (let i = 0; i < RANDOM_ENEMY_COUNT; i++) {
          let attempts = 0;
          let freeTile: { x: number; y: number } | null = null;
          while (attempts < 30) {
            const spawnX = Math.floor(Math.random() * ms);
            const spawnY = Math.floor(Math.random() * ms);
            const distFromCenter = Math.sqrt((spawnX - center) ** 2 + (spawnY - center) ** 2);
            if (distFromCenter < SPAWN_MIN_DIST_FROM_CENTER) {
              attempts++;
              continue;
            }
            const tile = findNearestFreeTile(spawnX, spawnY, ms);
            const key = `${tile.x},${tile.y}`;
            if (!used.has(key)) {
              used.add(key);
              freeTile = tile;
              break;
            }
            attempts++;
          }
          if (!freeTile) continue;
          const enemyType = RANDOM_ENEMY_TYPES[Math.floor(Math.random() * RANDOM_ENEMY_TYPES.length)];
          const enemyId = `enemy_${enemyIdCounterRef.current++}`;
          const maxHealth = ENEMY_MAX_HEALTH[enemyType];
          const enemy: EnemyState = {
            id: enemyId,
            type: enemyType,
            logicalGridX: freeTile.x,
            logicalGridY: freeTile.y,
            targetGridX: freeTile.x,
            targetGridY: freeTile.y,
            renderX: freeTile.x,
            renderY: freeTile.y,
            spawnGridX: freeTile.x,
            spawnGridY: freeTile.y,
            aiState: 'idle',
            isMoving: false,
            isAttacking: false,
            directionRow: 0,
            animation: 'idle',
            animStartTime: t,
            moveStartTime: t,
            attackCooldownUntil: 0,
            targetPlayerId: null,
            health: maxHealth,
            maxHealth: maxHealth,
            isDead: false,
            dieUntil: 0,
          };
          enemiesRef.current.set(enemyId, enemy);
        }
      }

      // ── Enemy Wave Spawner (disabled — no enemies on map) ──────────────
      const waveSpawner = waveSpawnerRef.current;
      const timeSinceLastWave = t - waveSpawner.lastWaveTime;
      
      if (false && timeSinceLastWave >= waveSpawner.nextWaveDelay && enemySheetsReadyRef.current) {
        // Spawn a new wave
        const enemyTypes: EnemyType[] = ['goblin', 'kobolt', 'scorpion', 'skeleton', 'slime', 'wolf'];
        const numEnemies = Math.floor(Math.random() * (ENEMIES_PER_WAVE_MAX - ENEMIES_PER_WAVE_MIN + 1)) + ENEMIES_PER_WAVE_MIN;
        
        for (let i = 0; i < numEnemies; i++) {
          const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
          // Spawn enemies at random edges of the map
          const edge = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left
          let spawnX = 0;
          let spawnY = 0;
          
          if (edge === 0) { // Top
            spawnX = Math.floor(Math.random() * ms);
            spawnY = Math.floor(Math.random() * 5);
          } else if (edge === 1) { // Right
            spawnX = ms - Math.floor(Math.random() * 5) - 1;
            spawnY = Math.floor(Math.random() * ms);
          } else if (edge === 2) { // Bottom
            spawnX = Math.floor(Math.random() * ms);
            spawnY = ms - Math.floor(Math.random() * 5) - 1;
          } else { // Left
            spawnX = Math.floor(Math.random() * 5);
            spawnY = Math.floor(Math.random() * ms);
          }
          
          // Find nearest free tile
          const freeTile = findNearestFreeTile(spawnX, spawnY, ms);
          
          const enemyId = `enemy_${enemyIdCounterRef.current++}`;
          const maxHealth = ENEMY_MAX_HEALTH[enemyType];
          const enemy: EnemyState = {
            id: enemyId,
            type: enemyType,
            logicalGridX: freeTile.x,
            logicalGridY: freeTile.y,
            targetGridX: freeTile.x,
            targetGridY: freeTile.y,
            renderX: freeTile.x,
            renderY: freeTile.y,
            spawnGridX: freeTile.x,
            spawnGridY: freeTile.y,
            aiState: 'idle',
            isMoving: false,
            isAttacking: false,
            directionRow: 0,
            animation: 'idle',
            animStartTime: t,
            moveStartTime: t,
            attackCooldownUntil: 0,
            targetPlayerId: null,
            health: maxHealth,
            maxHealth: maxHealth,
            isDead: false,
            dieUntil: 0,
          };
          
          enemiesRef.current.set(enemyId, enemy);
        }
        
        // Update wave spawner: 3-minute cooldown, then random delay for next wave
        waveSpawner.lastWaveTime = t;
        waveSpawner.nextWaveDelay = WAVE_COOLDOWN_MS + Math.random() * (MAX_WAVE_DELAY_MS - MIN_WAVE_DELAY_MS);
      }

      // ── Enemy AI: State machine (IDLE → CHASE → RETURN → IDLE, RALLY) ─────────
      const playerGridX = ch.logicalGridX;
      const playerGridY = ch.logicalGridY;
      // All chaseable players: local + otherPlayers (for slot allocation)
      const allPlayers: { id: string; gridX: number; gridY: number }[] = [
        { id: 'local', gridX: playerGridX, gridY: playerGridY },
        ...otherPlayersRef.current.map(p => ({
          id: p.id ?? p.address,
          gridX: p.gridX,
          gridY: p.gridY,
        })),
      ];

      const getTargetPos = (targetId: string | null) => {
        if (!targetId) return null;
        if (targetId === 'local') return { x: playerGridX, y: playerGridY };
        const p = allPlayers.find(a => a.id === targetId);
        return p ? { x: p.gridX, y: p.gridY } : null;
      };

      const occupiedSlotsPerPlayer = new Map<string, Set<string>>();
      occupiedSlotsPerPlayer.set('local', new Set<string>());
      for (const p of otherPlayersRef.current) {
        occupiedSlotsPerPlayer.set(p.id ?? p.address, new Set<string>());
      }
      for (const enemy of enemiesRef.current.values()) {
        if (enemy.isDead) continue;
        if (enemy.targetPlayerId && enemy.aiState === 'chase') {
          const slotSet = occupiedSlotsPerPlayer.get(enemy.targetPlayerId);
          if (slotSet) {
            const targetPos = getTargetPos(enemy.targetPlayerId);
            if (targetPos) {
              const d = Math.sqrt(
                (enemy.logicalGridX - targetPos.x) ** 2 + (enemy.logicalGridY - targetPos.y) ** 2
              );
              if (d <= 1.5) {
                slotSet.add(`${Math.floor(enemy.logicalGridX)},${Math.floor(enemy.logicalGridY)}`);
              }
            }
          }
        }
      }

      for (const enemy of enemiesRef.current.values()) {
        if (enemy.isDead) {
          if (t >= enemy.dieUntil) enemiesRef.current.delete(enemy.id);
          continue;
        }

        const sx = enemy.spawnGridX;
        const sy = enemy.spawnGridY;
        const distPlayerToSpawn = Math.sqrt(
          (playerGridX - sx) ** 2 + (playerGridY - sy) ** 2
        );
        const targetPos = { x: playerGridX, y: playerGridY };
        const distMobToPlayer = targetPos
          ? Math.sqrt(
              (enemy.logicalGridX - targetPos.x) ** 2 + (enemy.logicalGridY - targetPos.y) ** 2
            )
          : Infinity;
        const distMobToSpawn = Math.sqrt(
          (enemy.logicalGridX - sx) ** 2 + (enemy.logicalGridY - sy) ** 2
        );

        const aggroCheck = distPlayerToSpawn <= AGGRO_RADIUS;
        const leashCheck = distPlayerToSpawn > LEASH_RADIUS;

        if (enemy.aiState === 'idle') {
          if (aggroCheck) {
            enemy.aiState = 'chase';
            enemy.targetPlayerId = 'local';
          }
        } else if (enemy.aiState === 'chase') {
          if (leashCheck) {
            enemy.aiState = 'return';
            enemy.targetPlayerId = null;
          }
        } else if (enemy.aiState === 'return') {
          if (distMobToSpawn < 0.5) {
            enemy.aiState = 'idle';
          }
        }

        // Attack animation completion
        if (enemy.isAttacking) {
          const attackElapsed = t - enemy.animStartTime;
          const attackDuration = ENEMY_ATTACK_FRAME_MS * ENEMY_ATTACK_COLS;
          if (attackElapsed >= attackDuration) {
            if (enemy.targetPlayerId === 'local' && ch.health > 0 && t >= ch.lastDamageTime + PLAYER_INVULN_MS) {
              ch.health = Math.max(0, ch.health - PLAYER_DAMAGE_PER_HIT);
              ch.lastDamageTime = t;
              ch.damageUntil = t + DAMAGE_DURATION_MS;
              ch.animation = 'damage';
              ch.animStartTime = t;
              if (onHealthChange) onHealthChange(ch.health, ch.maxHealth);
              if (ch.health <= 0) ch.dieUntil = t + DIE_DURATION_MS;

              // Notify task system that player took damage (enemyType used for point deduction)
              onTaskEventRef.current?.({
                type: 'damage_taken',
                gridX: ch.logicalGridX,
                gridY: ch.logicalGridY,
                amount: PLAYER_DAMAGE_PER_HIT,
                enemyType: enemy.type,
              });
            }
            enemy.isAttacking = false;
            enemy.animation = enemy.isMoving ? 'move' : 'idle';
            enemy.animStartTime = t;
          }
        }

        // Idle: when not moving and not attacking
        if (!enemy.isMoving && !enemy.isAttacking && enemy.animation !== 'die') {
          if (enemy.animation !== 'idle') {
            enemy.animation = 'idle';
            enemy.animStartTime = t;
          }
        }

        // Movement: only when not moving and not attacking
        if (!enemy.isMoving && !enemy.isAttacking) {
          if (enemy.aiState === 'chase' && distMobToPlayer <= ENEMY_ATTACK_RANGE && t >= enemy.attackCooldownUntil) {
            enemy.isAttacking = true;
            enemy.animation = 'attack';
            enemy.animStartTime = t;
            enemy.attackCooldownUntil = t + ENEMY_ATTACK_COOLDOWN_MS;
          } else if (enemy.aiState === 'chase') {
            const targetId = enemy.targetPlayerId ?? 'local';
            const occupiedSlots = occupiedSlotsPerPlayer.get(targetId) || new Set<string>();
            const tx = targetPos?.x ?? playerGridX;
            const ty = targetPos?.y ?? playerGridY;
            const slot = getSurroundSlot(
              tx, ty,
              enemy.id, enemy.logicalGridX, enemy.logicalGridY, ms, occupiedSlots
            );
            const step = findBestStepTowardTarget(
              enemy.logicalGridX, enemy.logicalGridY, slot.x, slot.y, ms
            );
            if (step) {
              const lx = enemy.logicalGridX;
              const ly = enemy.logicalGridY;
              enemy.targetGridX = step.x;
              enemy.targetGridY = step.y;
              enemy.isMoving = true;
              enemy.animation = 'move';
              enemy.moveStartTime = t;
              enemy.animStartTime = t;
              enemy.directionRow = getDirectionRow(step.x - lx, step.y - ly, enemy.directionRow);
            }
          } else if (enemy.aiState === 'return') {
            const step = findBestStepTowardTarget(
              enemy.logicalGridX, enemy.logicalGridY, sx, sy, ms
            );
            if (step) {
              const lx = enemy.logicalGridX;
              const ly = enemy.logicalGridY;
              enemy.targetGridX = step.x;
              enemy.targetGridY = step.y;
              enemy.isMoving = true;
              enemy.animation = 'move';
              enemy.moveStartTime = t;
              enemy.animStartTime = t;
              enemy.directionRow = getDirectionRow(step.x - lx, step.y - ly, enemy.directionRow);
            }
          }
        }
        
        if (isTileBlocked(Math.floor(enemy.logicalGridX), Math.floor(enemy.logicalGridY))) {
          const free = findNearestFreeTile(enemy.logicalGridX, enemy.logicalGridY, ms);
          enemy.logicalGridX = free.x;
          enemy.logicalGridY = free.y;
          enemy.targetGridX = free.x;
          enemy.targetGridY = free.y;
          enemy.renderX = free.x;
          enemy.renderY = free.y;
          enemy.isMoving = false;
        }
        
        // Enemy movement tick (same pattern as character: interpolate renderX/Y, one tile per move)
        if (enemy.isMoving) {
          const moveDx = enemy.targetGridX - enemy.renderX;
          const moveDy = enemy.targetGridY - enemy.renderY;
          const moveDist = Math.sqrt(moveDx * moveDx + moveDy * moveDy);
          const moveSpeed = ENEMY_MOVE_SPEED;
          const step = moveSpeed * dt;
          const timedOut = (t - enemy.moveStartTime) / 1000 > MOVE_TIMEOUT;
          
          if (moveDist <= ARRIVE_THRESHOLD || step >= moveDist || timedOut) {
            enemy.renderX = enemy.targetGridX;
            enemy.renderY = enemy.targetGridY;
            enemy.logicalGridX = enemy.targetGridX;
            enemy.logicalGridY = enemy.targetGridY;
            enemy.isMoving = false;
          } else {
            enemy.renderX += (moveDx / moveDist) * step;
            enemy.renderY += (moveDy / moveDist) * step;
          }
        }
      }

      // ── Collision: never allow character inside house (push out if somehow stuck) ─
      if (isTileBlocked(Math.floor(ch.logicalGridX), Math.floor(ch.logicalGridY))) {
        const free = findNearestFreeTile(ch.logicalGridX, ch.logicalGridY, ms);
        ch.logicalGridX = free.x;
        ch.logicalGridY = free.y;
        ch.targetGridX = free.x;
        ch.targetGridY = free.y;
        ch.renderX = free.x;
        ch.renderY = free.y;
        ch.isMoving = false;
      }

      // ── Movement tick ──────────────────────────────────────────────────
      if (ch.isMoving) {
        const dx = ch.targetGridX - ch.renderX;
        const dy = ch.targetGridY - ch.renderY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const shifting = shiftHeldRef.current;
        const moveSpeed = shifting ? WALK_MOVE_SPEED : RUN_MOVE_SPEED;
        const step = moveSpeed * dt;
        const timedOut = (t - ch.moveStartTime) / 1000 > MOVE_TIMEOUT;
        if (dist <= ARRIVE_THRESHOLD || step >= dist || timedOut) {
          // Arrived at target (or safety timeout) — finalize logical position.
          // Collision check: if target is blocked, snap back and cancel (should never happen).
          if (isTileBlocked(ch.targetGridX, ch.targetGridY)) {
            ch.renderX = ch.logicalGridX;
            ch.renderY = ch.logicalGridY;
            ch.targetGridX = ch.logicalGridX;
            ch.targetGridY = ch.logicalGridY;
            ch.isMoving = false;
          } else {
            ch.renderX = ch.targetGridX;
            ch.renderY = ch.targetGridY;
            ch.logicalGridX = ch.targetGridX;
            ch.logicalGridY = ch.targetGridY;
            ch.isMoving = false;
            const moveNoise = shifting ? NOISE_WALK : NOISE_RUN;
            noiseLevelRef.current = Math.min(1, noiseLevelRef.current + moveNoise);
            onPositionChangeRef.current?.(ch.logicalGridX, ch.logicalGridY);
          }
          // Do NOT reset animation here. If a key is held, we chain
          // immediately into the next move below, keeping the cycle
          // continuous.
        } else {
          ch.renderX += (dx / dist) * step;
          ch.renderY += (dy / dist) * step;
        }
      }

      // Damage/die/interact animation expiry
      if (ch.damageUntil > 0 && t >= ch.damageUntil && ch.health > 0) {
        ch.damageUntil = 0;
        ch.animation = 'idle';
        ch.animStartTime = t;
      }
      if (ch.animation === 'interact') {
        const interactDuration = CHARACTER_INTERACT_FRAME_MS * CHARACTER_INTERACT_COLS;
        if (t - ch.animStartTime >= interactDuration) {
          ch.animation = 'idle';
          ch.animStartTime = t;
        }
      }
      if (ch.dieUntil > 0 && t >= ch.dieUntil) {
        ch.dieUntil = 0;
        // Only restore health when actually dead (respawn); never regenerate when already alive
        if (ch.health <= 0) {
          ch.health = ch.maxHealth;
          // Notify parent of health reset on respawn
          if (onHealthChange) {
            onHealthChange(ch.health, ch.maxHealth);
          }
        }
        ch.animation = 'idle';
        ch.animStartTime = t;
      }

      // ── Input: only when NOT moving, NOT attacking, NOT fishing, NOT damaged, NOT dead ───────────────────────────
      const canControl = ch.dieUntil <= 0 && (ch.damageUntil <= 0 || t >= ch.damageUntil) && ch.animation !== 'interact';
      if (canControl && !ch.isMoving && ch.attackType === null && ch.fishingState === null) {
        const keys = keysHeldRef.current;
        const shifting = shiftHeldRef.current;
        const jumping = spaceHeldRef.current;
        let dgx = 0;
        let dgy = 0;
        if (keys.has('KeyW')) { dgx = -1; dgy = -1; }
        else if (keys.has('KeyS')) { dgx = 1; dgy = 1; }
        else if (keys.has('KeyA')) { dgx = -1; dgy = 1; }
        else if (keys.has('KeyD')) { dgx = 1; dgy = -1; }

        // Save original intended direction for facing (before wall-slide changes it)
        const intendedDgx = dgx;
        const intendedDgy = dgy;

        let willJump = false;

        if (dgx !== 0 || dgy !== 0) {
          const nextX = ch.logicalGridX + dgx;
          const nextY = ch.logicalGridY + dgy;
          // Clamp to map bounds — reject out-of-bounds moves.
          if (nextX < 0 || nextX >= ms || nextY < 0 || nextY >= ms) {
            dgx = 0;
            dgy = 0;
          }
          // Check elevation difference
          else if (isTileBlocked(nextX, nextY) || isDiagonalBlocked(ch.logicalGridX, ch.logicalGridY, nextX, nextY)) {
            // Blocked by terrain — try wall-sliding
            const slideX = ch.logicalGridX + dgx;
            const slideY = ch.logicalGridY + dgy;
            if (!isTileBlocked(slideX, ch.logicalGridY) &&
                slideX >= 0 && slideX < ms &&
                (!isElevationBlocked(ch.logicalGridX, ch.logicalGridY, slideX, ch.logicalGridY) || jumping)) {
              dgy = 0;
              willJump = jumping && getElevation(ch.logicalGridX, ch.logicalGridY) !== getElevation(slideX, ch.logicalGridY);
            } else if (!isTileBlocked(ch.logicalGridX, slideY) &&
                       slideY >= 0 && slideY < ms &&
                       (!isElevationBlocked(ch.logicalGridX, ch.logicalGridY, ch.logicalGridX, slideY) || jumping)) {
              dgx = 0;
              willJump = jumping && getElevation(ch.logicalGridX, ch.logicalGridY) !== getElevation(ch.logicalGridX, slideY);
            } else {
              dgx = 0;
              dgy = 0;
            }
          }
          else if (isElevationBlocked(ch.logicalGridX, ch.logicalGridY, nextX, nextY)) {
            // Elevation difference — only allow if Space is held (jump)
            if (jumping) {
              willJump = true;
              // Allow the move
            } else {
              // Try wall-sliding on same elevation
              const slideX = ch.logicalGridX + dgx;
              const slideY = ch.logicalGridY + dgy;
              if (!isTileBlocked(slideX, ch.logicalGridY) &&
                  !isElevationBlocked(ch.logicalGridX, ch.logicalGridY, slideX, ch.logicalGridY) &&
                  slideX >= 0 && slideX < ms) {
                dgy = 0;
              } else if (!isTileBlocked(ch.logicalGridX, slideY) &&
                         !isElevationBlocked(ch.logicalGridX, ch.logicalGridY, ch.logicalGridX, slideY) &&
                         slideY >= 0 && slideY < ms) {
                dgx = 0;
              } else {
                dgx = 0;
                dgy = 0;
              }
            }
          } else {
            // Same elevation, no elevation block — check if jumping anyway for visual arc
            const fromE = getElevation(ch.logicalGridX, ch.logicalGridY);
            const toE = getElevation(nextX, nextY);
            if (fromE !== toE) {
              willJump = true;
            }
          }
        }

        if (dgx !== 0 || dgy !== 0) {
          const desiredAnim: 'run' | 'walk' | 'idle' = shifting ? 'walk' : 'run';
          ch.targetGridX = ch.logicalGridX + dgx;
          ch.targetGridY = ch.logicalGridY + dgy;
          ch.isMoving = true;
          ch.isJumping = willJump;
          ch.moveStartTime = t;
          // Use original intended direction for facing, so wall-sliding doesn't cause sideways sprites
          ch.directionRow = getDirectionRow(intendedDgx, intendedDgy, ch.directionRow);
          // Only reset animation clock on actual state transition.
          if (ch.animation !== desiredAnim) {
            ch.animation = desiredAnim;
            ch.animStartTime = t;
          }
        } else if (ch.animation !== 'idle' && ch.animation !== 'damage' && ch.animation !== 'die' && ch.animation !== 'interact') {
          // No input and not moving — transition to idle (don't override damage/die)
          ch.animation = 'idle';
          ch.animStartTime = t;
        }
      }

      // ── Animation frame index (time-based modulo, no resets at loop boundaries) ─
      const cols = ch.animation === 'idle' ? CHARACTER_IDLE_COLS
                 : ch.animation === 'walk' ? CHARACTER_WALK_COLS
                 : ch.animation === 'run' ? CHARACTER_RUN_COLS
                 : ch.animation === 'swordAttack' ? CHARACTER_SWORD_ATTACK_COLS
                 : ch.animation === 'axeAttack' ? CHARACTER_AXE_SWING_COLS
                 : ch.animation === 'pickaxeAttack' ? CHARACTER_PICKAXE_SWING_COLS
                 : ch.animation === 'dig' ? CHARACTER_DIG_COLS
                 : ch.animation === 'sit' ? CHARACTER_SIT_COLS
                 : ch.animation === 'fish' ? CHARACTER_FISH_COLS
                 : ch.animation === 'damage' ? CHARACTER_DAMAGE_COLS
                 : ch.animation === 'die' ? CHARACTER_DIE_COLS
                 : ch.animation === 'interact' ? CHARACTER_INTERACT_COLS
                 : CHARACTER_IDLE_COLS;
      const frameMs = ch.animation === 'idle' ? IDLE_FRAME_MS
                    : ch.animation === 'walk' ? WALK_FRAME_MS
                    : ch.animation === 'run' ? RUN_FRAME_MS
                    : ch.animation === 'swordAttack' ? SWORD_ATTACK_FRAME_MS
                    : ch.animation === 'axeAttack' ? AXE_SWING_FRAME_MS
                    : ch.animation === 'pickaxeAttack' ? PICKAXE_SWING_FRAME_MS
                    : ch.animation === 'dig' ? DIG_FRAME_MS
                    : ch.animation === 'sit' ? SIT_FRAME_MS
                    : ch.animation === 'fish' ? FISH_FRAME_MS
                    : ch.animation === 'damage' ? DAMAGE_FRAME_MS
                    : ch.animation === 'die' ? DIE_FRAME_MS
                    : ch.animation === 'interact' ? CHARACTER_INTERACT_FRAME_MS
                    : IDLE_FRAME_MS;
      const elapsed = t - ch.animStartTime;
      const rawFrame = Math.floor(elapsed / frameMs);
      
      // For sitting and fishing animations, pause on last frame instead of looping
      const shouldLoop = ch.animation !== 'sit' && ch.animation !== 'fish';
      const frameIndex = shouldLoop 
        ? rawFrame % cols 
        : Math.min(rawFrame, cols - 1); // Clamp to last frame for sit/fish

      // (All tiles pre-generated — no chunk management needed.)

      // ── Draw ───────────────────────────────────────────────────────────
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = devicePixelRatio;
      const centerX = dimensions.width / 2;
      const centerY = dimensions.height / 2;
      const cam = cameraRef.current;

      // Clear and fill with sky color background
      ctx.fillStyle = '#87CEEB'; // Sky blue background
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      // Camera follows the render position — smooth, no snapping.
      const cameraScreenPos = gridToScreen(ch.renderX, ch.renderY);
      // Offset camera vertically to account for character elevation + jump arc
      const camFromElev = getElevation(ch.logicalGridX, ch.logicalGridY);
      const camToElev = getElevation(ch.targetGridX, ch.targetGridY);
      const camMoveProgress = ch.isMoving
        ? 1 - Math.sqrt((ch.targetGridX - ch.renderX) ** 2 + (ch.targetGridY - ch.renderY) ** 2)
        : 1;
      const camClampedProgress = Math.max(0, Math.min(1, camMoveProgress));
      const camElev = camFromElev + (camToElev - camFromElev) * camClampedProgress;
      const camElevOffset = camElev * ELEVATION_PX;
      const camJumpArc = ch.isJumping
        ? Math.sin(camClampedProgress * Math.PI) * JUMP_ARC_PX
        : 0;
      ctx.translate(centerX, centerY);
      ctx.scale(cam.zoom, cam.zoom);
      ctx.translate(-cameraScreenPos.x, -(cameraScreenPos.y - camElevOffset - camJumpArc));

      // Background gradient.
      const gradient = ctx.createLinearGradient(0, 0, 0, dimensions.height * 10);
      gradient.addColorStop(0, '#87CEEB');
      gradient.addColorStop(1, '#E0F6FF');
      ctx.fillStyle = gradient;
      ctx.fillRect(-100000, -100000, 200000, 200000);

      // Build depth-sorted draw list.
      type Drawable =
        | { type: 'tile'; depth: number; gridX: number; gridY: number; tile: TileData }
        | { type: 'character'; depth: number }
        | { type: 'otherPlayer'; depth: number; player: OtherPlayer }
        | { type: 'placeable'; depth: number; item: PlaceableItemData }
        | { type: 'building'; depth: number; gridX: number; gridY: number; building?: Building }
        | { type: 'decoration'; depth: number; gridX: number; gridY: number; image: string }
        | { type: 'enemy'; depth: number; enemy: EnemyState }
        | { type: 'rareEntity'; depth: number; entity: RareEntity }
        | { type: 'buriedGemSparkle'; depth: number; gem: { id: number; gridX: number; gridY: number; gemType: string } }
        | { type: 'dugGem'; depth: number; gem: { id: number; gridX: number; gridY: number; gemType: string; dugAt: number } }
        | { type: 'testCamp'; depth: number; camp: { x: number; y: number } };

      const drawables: Drawable[] = [];
      const visibleTiles = allTilesRef.current;
      for (const { gridX, gridY, tile } of visibleTiles) {
        drawables.push({ type: 'tile', depth: gridX + gridY, gridX, gridY, tile });
      }
      drawables.push({ type: 'character', depth: ch.renderX + ch.renderY });
      for (const player of otherPlayersRef.current) {
        drawables.push({ type: 'otherPlayer', depth: player.gridX + player.gridY, player });
      }
      // Add enemies to draw list
      for (const enemy of enemiesRef.current.values()) {
        drawables.push({ type: 'enemy', depth: enemy.renderX + enemy.renderY, enemy });
      }
      // Decorations (trees, bushes, tall rocks) — skip chopped trees
      for (const deco of decorationsRef.current) {
        if (choppedTileKeys.has(`${deco.gridX},${deco.gridY}`)) continue;
        drawables.push({ type: 'decoration', depth: deco.gridX + deco.gridY + 0.5, gridX: deco.gridX, gridY: deco.gridY, image: deco.image });
      }
      // Food: high depth so it draws on top of tiles, bushes, character
      for (const f of foodItemsRef.current) {
        drawables.push({
          type: 'placeable',
          depth: f.gridX + f.gridY + 2,
          item: { id: f.id, type: 'food', image: f.image, gridX: f.gridX, gridY: f.gridY },
        });
      }
      for (const v of valuableItemsRef.current) {
        drawables.push({
          type: 'placeable',
          depth: v.gridX + v.gridY + 2,
          item: { id: v.id, type: 'valuable', image: v.image, gridX: v.gridX, gridY: v.gridY },
        });
      }
      for (const r of rareEntitiesRef.current) {
        drawables.push({ type: 'rareEntity', depth: r.gridX + r.gridY + 1, entity: r });
      }
      const items = placeableItemsRef.current;
      for (const item of items) {
        drawables.push({ type: 'placeable', depth: item.gridX + item.gridY, item });
      }
      // Add village decorations (paths, flowers)
      for (const deco of VILLAGE_DECORATIONS) {
        drawables.push({
          type: 'decoration',
          depth: deco.gridX + deco.gridY + (deco.type === 'path' ? -0.8 : 0.1), // Paths below tiles, flowers slightly above
          gridX: deco.gridX,
          gridY: deco.gridY,
          image: deco.image,
        });
      }
      // Add buried gem sparkles (only if player within ~5 tiles)
      const px = ch.logicalGridX;
      const py = ch.logicalGridY;
      for (const gem of buriedGemsRef.current) {
        const dist = Math.sqrt((gem.gridX - px) ** 2 + (gem.gridY - py) ** 2);
        if (dist <= 5) {
          drawables.push({
            type: 'buriedGemSparkle',
            depth: gem.gridX + gem.gridY + 5, // On top of tiles so sparkle is visible
            gem,
          });
        }
      }
      // Add dug gems on ground — higher depth so they draw on top of tiles (not inside)
      for (const gem of dugGemsRef.current) {
        drawables.push({
          type: 'dugGem',
          depth: gem.gridX + gem.gridY + 5, // Above tiles and adjacent tiles
          gem,
        });
      }
      // Add test camps (drawn above terrain, below players)
      for (const camp of testCamps) {
        drawables.push({
          type: 'testCamp',
          depth: camp.x + camp.y + 0.5,
          camp,
        });
      }
      // Add all buildings (houses, shops, etc.)
      if (houseImageRef.current) {
        for (const building of BUILDINGS) {
          const depth = building.gridX + building.width - 1 + building.gridY + building.height - 1;
          drawables.push({
            type: 'building',
            depth,
            gridX: building.gridX,
            gridY: building.gridY,
            building, // Pass building data for labels
          });
        }
      }
      // Add farm patches from wave system (DISABLED - no farm defense)
      // for (const farm of farmPatchesRef.current) {
      //   // Add farm boundary marker (drawn first, behind plants)
      //   const farmCenterX = farm.gridX + farm.width / 2;
      //   const farmCenterY = farm.gridY + farm.height / 2;
      //   drawables.push({
      //     type: 'farmPatch',
      //     depth: farmCenterX + farmCenterY - 0.5, // Slightly behind plants
      //     farm,
      //   });

      //   for (let row = 0; row < farm.width; row++) {
      //     for (let col = 0; col < farm.height; col++) {
      //       const plantGridX = farm.gridX + row;
      //       const plantGridY = farm.gridY + col;
      //       drawables.push({
      //         type: 'farmPlant',
      //         depth: plantGridX + plantGridY,
      //         farm,
      //         plantGridX,
      //         plantGridY,
      //         isCenter: row === Math.floor(farm.width / 2) && col === Math.floor(farm.height / 2),
      //       });
      //     }
      //   }
      // }
      // Add server enemies from wave system (DISABLED - no mobs)
      // for (const enemy of serverEnemiesRef.current) {
      //   drawables.push({
      //     type: 'serverEnemy',
      //     depth: enemy.gridX + enemy.gridY,
      //     enemy,
      //   });
      // }
      drawables.sort((a, b) => a.depth - b.depth);

      const hovered = hoveredTileRef.current;

      // Draw everything synchronously (skip tiles whose images haven't loaded yet).
      for (const d of drawables) {
        if (d.type === 'tile') {
          const assets = getTileAssets(d.tile, d.gridX, d.gridY);
          const screenPos = gridToScreen(d.gridX, d.gridY);
          const elev = getElevation(d.gridX, d.gridY);
          const elevOffset = elev * ELEVATION_PX;
          const x = screenPos.x - TILE_WIDTH / 2;
          const y = screenPos.y - TILE_HEIGHT - elevOffset;
          const mouseHovered = hovered && hovered.gridX === d.gridX && hovered.gridY === d.gridY;
          const underCharacter =
            Math.floor(ch.renderX) === d.gridX && Math.floor(ch.renderY) === d.gridY;
          const isHovered = mouseHovered || underCharacter;
          const drawY = isHovered ? y - HOVER_LIFT_PX : y;

          // For elevated tiles, draw stacked cubes underneath to show the side faces
          if (elev > 0 && assets.base) {
            const baseImg = imagesCache.current.get(assets.base) ?? (loadImage(assets.base), null);
            if (baseImg) {
              for (let lvl = 0; lvl < elev; lvl++) {
                const stackY = screenPos.y - TILE_HEIGHT - lvl * ELEVATION_PX;
                ctx.drawImage(baseImg, x, isHovered ? stackY - HOVER_LIFT_PX : stackY, TILE_IMAGE_SIZE, TILE_IMAGE_SIZE);
              }
            }
          }

          if (assets.base) {
            const img = imagesCache.current.get(assets.base);
            if (img) {
              ctx.drawImage(img, x, drawY, TILE_IMAGE_SIZE, TILE_IMAGE_SIZE);
            } else {
              loadImage(assets.base);
            }
          }
          if (assets.overlay) {
            const img = imagesCache.current.get(assets.overlay);
            if (img) {
              ctx.drawImage(img, x, drawY, TILE_IMAGE_SIZE, TILE_IMAGE_SIZE);
            } else {
              loadImage(assets.overlay);
            }
          }
        } else if (d.type === 'character') {
          const feet = gridToScreen(ch.renderX, ch.renderY);
          // Interpolate elevation between current logical tile and target tile
          const fromElev = getElevation(ch.logicalGridX, ch.logicalGridY);
          const toElev = getElevation(ch.targetGridX, ch.targetGridY);
          const moveProgress = ch.isMoving
            ? 1 - Math.sqrt((ch.targetGridX - ch.renderX) ** 2 + (ch.targetGridY - ch.renderY) ** 2)
            : 1;
          const clampedProgress = Math.max(0, Math.min(1, moveProgress));
          const charElev = fromElev + (toElev - fromElev) * clampedProgress;
          const charElevOffset = charElev * ELEVATION_PX;
          // Jump arc: parabolic curve peaking at midpoint of move
          const jumpArc = ch.isJumping
            ? Math.sin(clampedProgress * Math.PI) * JUMP_ARC_PX
            : 0;
          const drawX = feet.x - CHARACTER_FRAME_SIZE / 2;
          const drawY = feet.y - CHARACTER_FRAME_SIZE - charElevOffset - jumpArc;
          const sheets = characterSheetsLoaded.current;
          const sheet = ch.animation === 'swordAttack' ? sheets.swordAttack
                      : ch.animation === 'axeAttack' ? sheets.axeAttack
                      : ch.animation === 'pickaxeAttack' ? sheets.pickaxeAttack
                      : ch.animation === 'dig' ? sheets.dig
                      : ch.animation === 'sit' ? sheets.sit
                      : ch.animation === 'fish' ? sheets.fish
                      : ch.animation === 'damage' ? sheets.damage
                      : ch.animation === 'die' ? sheets.die
                      : ch.animation === 'interact' ? sheets.interact
                      : ch.animation === 'run' ? sheets.run
                      : ch.animation === 'walk' ? sheets.walk
                      : sheets.idle;
          if (sheet) {
            const sx = frameIndex * CHARACTER_FRAME_SIZE;
            const sy = ch.directionRow * CHARACTER_FRAME_SIZE;
            
            // For attack and fishing animations, flip horizontally when facing right
            // Right-facing rows: 0 (SE), 2 (E), 4 (NE)
            const isRightFacing = ch.directionRow === 0 || ch.directionRow === 2 || ch.directionRow === 4;
            const isAttackAnimation = ch.animation === 'swordAttack' || ch.animation === 'axeAttack' || ch.animation === 'pickaxeAttack' || ch.animation === 'dig';
            const isFishingAnimation = ch.animation === 'fish' || ch.animation === 'sit';
            const isDamageOrDie = ch.animation === 'damage' || ch.animation === 'die';
            const isInteract = ch.animation === 'interact';
            
            if ((isAttackAnimation || isFishingAnimation || isDamageOrDie || isInteract) && isRightFacing) {
              // Flip horizontally for right-facing attacks and fishing
              ctx.save();
              ctx.scale(-1, 1);
              ctx.drawImage(
                sheet, sx, sy, CHARACTER_FRAME_SIZE, CHARACTER_FRAME_SIZE,
                -drawX - CHARACTER_FRAME_SIZE, drawY, CHARACTER_FRAME_SIZE, CHARACTER_FRAME_SIZE,
              );
              ctx.restore();
            } else {
              // Normal drawing for left-facing or non-attack/fishing animations
              ctx.drawImage(
                sheet, sx, sy, CHARACTER_FRAME_SIZE, CHARACTER_FRAME_SIZE,
                drawX, drawY, CHARACTER_FRAME_SIZE, CHARACTER_FRAME_SIZE,
              );
            }
          }
          
          // Draw attack hit area visualization (swing arc)
          if (ch.attackType !== null) {
            ctx.save();
            // Position relative to camera transform
            ctx.translate(0, charElevOffset + jumpArc);
            ctx.scale(1, TILE_HEIGHT / TILE_WIDTH);
            
            if (ch.attackType === 'sword') {
              // Draw sword swing arc (semi-circle in front of player)
              const swingRadius = TILE_WIDTH * 1.2;
              const swingStartAngle = -Math.PI / 4; // 45 degrees left
              const swingEndAngle = Math.PI / 4; // 45 degrees right
              
              ctx.globalAlpha = 0.3;
              ctx.strokeStyle = '#ffaa00';
              ctx.lineWidth = 4;
              ctx.beginPath();
              ctx.arc(0, 0, swingRadius, swingStartAngle, swingEndAngle);
              ctx.stroke();
            } else if (ch.attackType === 'axe') {
              // Draw axe swing arc (wider arc)
              const swingRadius = TILE_WIDTH * 1.4;
              const swingStartAngle = -Math.PI / 3; // 60 degrees left
              const swingEndAngle = Math.PI / 3; // 60 degrees right
              
              ctx.globalAlpha = 0.3;
              ctx.strokeStyle = '#aa5500';
              ctx.lineWidth = 5;
              ctx.beginPath();
              ctx.arc(0, 0, swingRadius, swingStartAngle, swingEndAngle);
              ctx.stroke();
            } else if (ch.attackType === 'pickaxe') {
              // Draw pickaxe swing arc (forward-focused arc)
              const swingRadius = TILE_WIDTH * 1.3;
              const swingStartAngle = -Math.PI / 5; // 36 degrees left
              const swingEndAngle = Math.PI / 5; // 36 degrees right
              
              ctx.globalAlpha = 0.3;
              ctx.strokeStyle = '#8b7355';
              ctx.lineWidth = 5;
              ctx.beginPath();
              ctx.arc(0, 0, swingRadius, swingStartAngle, swingEndAngle);
              ctx.stroke();
            }
            
            ctx.restore();
          }
          // Infect progress bar — above local player when holding Q to infect a nearby player
          const infectStart = infectDummyStartTimeRef.current;
          const infectActive = infectDummyTimerRef.current != null;
          if ((localPlayerInfectedRef.current || isPatientZeroRef.current) && infectStart != null && infectActive) {
            const INFECT_MS = 2000;
            const progress = Math.min(1, (t - infectStart) / INFECT_MS);
            const barW = 80;
            const barH = 12;
            const barX = feet.x - barW / 2;
            const barY = drawY - 36;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            ctx.beginPath();
            ctx.roundRect(barX, barY, barW, barH, 4);
            ctx.fill();
            ctx.fillStyle = 'rgba(220, 50, 50, 0.95)';
            ctx.beginPath();
            ctx.roundRect(barX, barY, barW * progress, barH, 4);
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 120, 120, 0.9)';
            ctx.lineWidth = 2;
            ctx.strokeRect(barX, barY, barW, barH);
            ctx.font = 'bold 11px monospace';
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const secLeft = Math.ceil((INFECT_MS * (1 - progress)) / 1000);
            ctx.fillText(`Infecting... ${secLeft}s`, feet.x, barY + barH / 2);
          }
          // Name tag above local player
          const tagY = drawY - 10;
          const tagX = feet.x;
          const name = localPlayerNameRef.current;
          const color = localPlayerColorRef.current;
          ctx.font = 'bold 18px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          const textW = ctx.measureText(name).width + 12;
          ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.beginPath();
          ctx.roundRect(tagX - textW / 2, tagY - 22, textW, 26, 4);
          ctx.fill();
          ctx.fillStyle = color;
          ctx.fillText(name, tagX, tagY);
        } else if (d.type === 'otherPlayer') {
          const feet = gridToScreen(d.player.gridX, d.player.gridY);
          const otherElev = getElevation(d.player.gridX, d.player.gridY);
          const otherElevOffset = otherElev * ELEVATION_PX;
          const drawX = feet.x - CHARACTER_FRAME_SIZE / 2;
          const drawY = feet.y - CHARACTER_FRAME_SIZE - otherElevOffset;
          const sheets = characterSheetsLoaded.current;
          if (sheets.idle) {
            ctx.drawImage(
              sheets.idle, 0, 0, CHARACTER_FRAME_SIZE, CHARACTER_FRAME_SIZE,
              drawX, drawY, CHARACTER_FRAME_SIZE, CHARACTER_FRAME_SIZE,
            );
          } else {
            ctx.fillStyle = d.player.color;
            ctx.beginPath();
            ctx.arc(feet.x, feet.y - 20 - otherElevOffset, 14, 0, Math.PI * 2);
            ctx.fill();
          }
          // Toxic emoji above infected players — visible only to patient zero
          // Show radioactive symbol above infected players — only patient zero can see this
          if (d.player.infected && isPatientZeroRef.current) {
            ctx.font = '24px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText('☣️', feet.x, drawY - 32);
          }
          // Infection progress bar — shown above the nearest healthy player when patient zero holds Q
          if (isPatientZeroRef.current && !d.player.infected) {
            const infectStartT = infectDummyStartTimeRef.current;
            const infectTimerActive = infectDummyTimerRef.current != null;
            if (infectStartT != null && infectTimerActive) {
              // Find nearest healthy other player to local character
              const ch = characterRef.current;
              let nearestDist = Infinity;
              let nearestId: string | undefined;
              for (const op of otherPlayersRef.current) {
                if (op.infected) continue;
                const d2 = Math.sqrt((ch.logicalGridX - op.gridX) ** 2 + (ch.logicalGridY - op.gridY) ** 2);
                if (d2 < nearestDist) { nearestDist = d2; nearestId = op.address; }
              }
              if (nearestId === (d.player.address ?? d.player.id)) {
                const INFECT_MS = 2000;
                const progress = Math.min(1, (t - infectStartT) / INFECT_MS);
                const barW = 70;
                const barH = 8;
                const barX = feet.x - barW / 2;
                const barY = drawY - 40 - otherElevOffset;
                ctx.fillStyle = 'rgba(0,0,0,0.7)';
                ctx.beginPath();
                ctx.roundRect(barX, barY, barW, barH, 4);
                ctx.fill();
                ctx.fillStyle = 'rgba(200,50,50,0.95)';
                ctx.beginPath();
                ctx.roundRect(barX, barY, barW * progress, barH, 4);
                ctx.fill();
                ctx.strokeStyle = 'rgba(255,100,100,0.8)';
                ctx.lineWidth = 1;
                ctx.strokeRect(barX, barY, barW, barH);
                ctx.font = '10px monospace';
                ctx.fillStyle = '#fff';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const secLeft = Math.ceil((INFECT_MS * (1 - progress)) / 1000);
                ctx.fillText(`☣ ${secLeft}s`, feet.x, barY + barH / 2);
              }
            }
          }
          const tagY = drawY - 10;
          const tagX = feet.x;
          ctx.font = 'bold 18px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          // Patient zero sees infected label; others just see the name
          const label = (d.player.infected && isPatientZeroRef.current) ? `${d.player.name} ☣` : d.player.name;
          const nameW = ctx.measureText(label).width + 12;
          ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.beginPath();
          ctx.roundRect(tagX - nameW / 2, tagY - 22, nameW, 26, 4);
          ctx.fill();
          ctx.fillStyle = d.player.color;
          ctx.fillText(label, tagX, tagY);
        } else if (d.type === 'placeable') {
          const screenPos = gridToScreen(d.item.gridX, d.item.gridY);
          const itemElev = getElevation(d.item.gridX, d.item.gridY);
          const itemElevOffset = itemElev * ELEVATION_PX;
          if (d.item.type === 'cure-fragment') {
            // Draw a glowing diamond shape for cure fragments
            const cx = screenPos.x;
            const cy = screenPos.y - TILE_HEIGHT / 2 - itemElevOffset;
            const pulse = 0.7 + 0.3 * Math.sin(t / 400); // gentle pulse
            const size = 16 * pulse;
            ctx.save();
            ctx.globalAlpha = 0.9;
            // Glow
            ctx.shadowColor = '#a855f7';
            ctx.shadowBlur = 12;
            // Diamond shape
            ctx.fillStyle = '#c084fc';
            ctx.beginPath();
            ctx.moveTo(cx, cy - size);
            ctx.lineTo(cx + size * 0.6, cy);
            ctx.lineTo(cx, cy + size * 0.5);
            ctx.lineTo(cx - size * 0.6, cy);
            ctx.closePath();
            ctx.fill();
            // Inner highlight
            ctx.fillStyle = '#e9d5ff';
            ctx.beginPath();
            ctx.moveTo(cx, cy - size * 0.5);
            ctx.lineTo(cx + size * 0.25, cy);
            ctx.lineTo(cx, cy + size * 0.2);
            ctx.lineTo(cx - size * 0.25, cy);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          } else if (d.item.type === 'food' || d.item.type === 'valuable') {
            const img = imagesCache.current.get(d.item.image);
            if (img) {
              const w = img.naturalWidth || 64;
              const h = img.naturalHeight || 64;
              const cx = screenPos.x;
              const surfaceY = screenPos.y - TILE_HEIGHT / 2 - itemElevOffset;
              const x = cx - w / 2;
              const y = surfaceY - h;
              ctx.drawImage(img, x, y, w, h);
            } else if (d.item.image) {
              loadImage(d.item.image);
            }
          } else {
            const x = screenPos.x - TILE_WIDTH / 2;
            const y = screenPos.y - TILE_HEIGHT - itemElevOffset;
            const img = imagesCache.current.get(d.item.image);
            if (img) {
              ctx.drawImage(img, x, y);
            } else if (d.item.image) {
              loadImage(d.item.image);
            }
          }
        } else if (d.type === 'decoration') {
          // Decoration sprites are 500×1000: bottom 500px is the tile footprint,
          // top 500px is the tall part (canopy/trunk). We anchor the bottom edge
          // at the tile's screen position so the tall part grows upward.
          const DECO_W = TILE_IMAGE_SIZE;         // 500
          const DECO_H = TILE_IMAGE_SIZE * 2;     // 1000
          const screenPos = gridToScreen(d.gridX, d.gridY);
          const decoElev = getElevation(d.gridX, d.gridY);
          const decoElevOffset = decoElev * ELEVATION_PX;
          const x = screenPos.x - DECO_W / 2;
          const y = screenPos.y - DECO_H + TILE_HEIGHT - decoElevOffset;
          const img = imagesCache.current.get(d.image);
          if (img) {
            ctx.drawImage(img, x, y, DECO_W, DECO_H);
          } else {
            loadImage(d.image);
          }
        } else if (d.type === 'enemy') {
          const enemy = d.enemy;
          const enemyFeet = gridToScreen(enemy.renderX, enemy.renderY);
          // Interpolate elevation between current and target tile (same as character)
          const enemyFromElev = getElevation(enemy.logicalGridX, enemy.logicalGridY);
          const enemyToElev = getElevation(enemy.targetGridX, enemy.targetGridY);
          const enemyMoveProgress = enemy.isMoving
            ? 1 - Math.sqrt((enemy.targetGridX - enemy.renderX) ** 2 + (enemy.targetGridY - enemy.renderY) ** 2)
            : 1;
          const enemyClampedProgress = Math.max(0, Math.min(1, enemyMoveProgress));
          const enemyElev = enemyFromElev + (enemyToElev - enemyFromElev) * enemyClampedProgress;
          const enemyElevOffset = enemyElev * ELEVATION_PX;
          const enemyDisplaySize = ENEMY_FRAME_SIZE;
          const enemyDrawX = enemyFeet.x - enemyDisplaySize / 2;
          const enemyDrawY = enemyFeet.y - enemyDisplaySize - enemyElevOffset;

          const enemySheets = enemySheetsLoaded.current[enemy.type as keyof typeof enemySheetsLoaded.current];
          const enemySheet = enemySheets && (enemy.animation === 'attack' ? enemySheets.attack
            : enemy.animation === 'die' ? enemySheets.attack
            : enemySheets.move);

          if (enemySheet) {
            const enemyElapsed = t - enemy.animStartTime;
            const enemyFrameMs = enemy.animation === 'attack' ? ENEMY_ATTACK_FRAME_MS
              : enemy.animation === 'die' ? ENEMY_DIE_FRAME_MS
              : enemy.animation === 'idle' ? ENEMY_IDLE_FRAME_MS
              : ENEMY_MOVE_FRAME_MS;
            const enemyRawFrame = Math.floor(enemyElapsed / enemyFrameMs);
            const enemyCols = enemy.animation === 'attack' ? ENEMY_ATTACK_COLS
              : enemy.animation === 'die' ? ENEMY_DIE_COLS
              : ENEMY_MOVE_COLS;
            const enemyFrameIndex = enemy.animation === 'die'
              ? Math.min(enemyRawFrame, enemyCols - 1) // Clamp to last frame for death
              : enemyRawFrame % enemyCols;

            const enemySx = enemyFrameIndex * ENEMY_FRAME_SIZE;

            // IsometricEnemies (Kobolt, Goblin, etc.) use same layout as Character0:
            // Row 0=SE, 1=SW, 2=E, 3=W, 4=NE. Use directionRow directly.
            const enemySy = enemy.directionRow * ENEMY_FRAME_SIZE;

            // Apply fade-out effect for dying enemies
            if (enemy.animation === 'die') {
              const deathProgress = (t - enemy.animStartTime) / ENEMY_DIE_DURATION_MS;
              ctx.globalAlpha = 1 - deathProgress; // Fade from 1 to 0
            }

            const drawW = enemyDisplaySize;
            const drawH = enemyDisplaySize;
            ctx.drawImage(
              enemySheet, enemySx, enemySy, ENEMY_FRAME_SIZE, ENEMY_FRAME_SIZE,
              enemyDrawX, enemyDrawY, drawW, drawH,
            );

            // Reset alpha after drawing
            if (enemy.animation === 'die') {
              ctx.globalAlpha = 1.0;
            }

            // Draw health bar above enemy (if not dead and not at full health)
            if (!enemy.isDead && enemy.health < enemy.maxHealth) {
              const healthBarWidth = 60;
              const healthBarHeight = 6;
              const healthBarY = enemyDrawY - 10;
              const healthBarX = enemyDrawX + (enemyDisplaySize / 2) - (healthBarWidth / 2);

              // Background (red)
              ctx.fillStyle = '#8B0000';
              ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

              // Health (green)
              const healthPercent = enemy.health / enemy.maxHealth;
              ctx.fillStyle = '#00FF00';
              ctx.fillRect(healthBarX, healthBarY, healthBarWidth * healthPercent, healthBarHeight);

              // Border
              ctx.strokeStyle = '#000000';
              ctx.lineWidth = 1;
              ctx.strokeRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
            }
          }
        } else if (d.type === 'rareEntity') {
          const entity = d.entity;
          const screenPos = gridToScreen(entity.gridX, entity.gridY);
          const elev = getElevation(entity.gridX, entity.gridY);
          const elevOffset = elev * ELEVATION_PX;
          const cx = screenPos.x;
          const cy = screenPos.y - TILE_HEIGHT / 2 - elevOffset;
          const pulse = 0.8 + 0.2 * Math.sin(t / 300);
          const size = 20 * pulse;
          ctx.save();
          ctx.globalAlpha = 0.95;
          ctx.shadowColor = '#a855f7';
          ctx.shadowBlur = 16;
          ctx.fillStyle = '#c084fc';
          ctx.beginPath();
          ctx.moveTo(cx, cy - size);
          ctx.lineTo(cx + size * 0.6, cy);
          ctx.lineTo(cx, cy + size * 0.5);
          ctx.lineTo(cx - size * 0.6, cy);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#e9d5ff';
          ctx.beginPath();
          ctx.moveTo(cx, cy - size * 0.5);
          ctx.lineTo(cx + size * 0.25, cy);
          ctx.lineTo(cx, cy + size * 0.2);
          ctx.lineTo(cx - size * 0.25, cy);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        // Farm patch and enemy rendering removed - no longer part of gameplay
        } else if (d.type === 'building') {
          const building = d.building;
          if (!building) continue;

          const width = building.width;
          const height = building.height;
          const frontCorner = gridToScreen(d.gridX + width - 1, d.gridY + height - 1);

          // Determine which image to use based on building type
          let buildingImg: HTMLImageElement | undefined;
          let imgWidth = building.imageWidth;
          let imgHeight = building.imageHeight;

          if (building.preComposited) {
            // Pre-composited building (Tent)
            const tentKey = building.preComposited === tentBlue ? 'tent_blue' :
                           building.preComposited === tentGreen ? 'tent_green' :
                           building.preComposited === tentYellow ? 'tent_yellow' :
                           building.preComposited === tentRed ? 'tent_red' : '';
            buildingImg = buildingImagesRef.current.get(tentKey);
          } else if (building.imageKey) {
            buildingImg = buildingImagesRef.current.get(building.imageKey);
          } else if (building.layers) {
            // Layered building (SmallHouse, Store, BigHouse)
            if (building.layers === BIG_HOUSE_LAYERS) {
              buildingImg = buildingImagesRef.current.get('bighouse');
            } else if (building.layers === STORE_LAYERS) {
              buildingImg = buildingImagesRef.current.get('store');
            } else if (building.layers === HOUSE_LAYERS) {
              buildingImg = buildingImagesRef.current.get('smallhouse');
            }
          }

          if (buildingImg) {
            // Draw anchored at bottom-center of the front tile
            const drawX = frontCorner.x - imgWidth / 2;
            const drawY = frontCorner.y - imgHeight;
            ctx.drawImage(buildingImg, drawX, drawY, imgWidth, imgHeight);

            // Draw building label
            if (building.label) {
              ctx.font = 'bold 18px monospace';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'bottom';

              // Background for label
              const textWidth = ctx.measureText(building.label).width + 20;
              ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
              ctx.beginPath();
              ctx.roundRect(frontCorner.x - textWidth / 2, drawY - 30, textWidth, 28, 6);
              ctx.fill();

              // Label text with color coding
              const labelColor = building.type === 'store' ? '#FFD700' :    // Gold for stores
                                 building.type === 'special' ? '#00BFFF' :  // Cyan for town hall
                                 building.type === 'tent' ? '#90EE90' :     // Light green for tents
                                 '#FFFFFF';                                  // White for houses
              ctx.fillStyle = labelColor;

              // Stroke for readability
              ctx.strokeStyle = '#000';
              ctx.lineWidth = 3;
              ctx.strokeText(building.label, frontCorner.x, drawY - 8);
              ctx.fillText(building.label, frontCorner.x, drawY - 8);
            }
          }
        } else if (d.type === 'testCamp') {
          // Render test camp as a distinct medical landmark
          const camp = d.camp;
          const pos = gridToScreen(camp.x, camp.y);
          const elev = getElevation(camp.x, camp.y);
          const elevOffset = elev * ELEVATION_PX;
          const cx = pos.x;
          const cy = pos.y - elevOffset - 8;

          ctx.save();

          // Pulsing glow
          const pulse = 0.7 + Math.sin((t / 600) % (Math.PI * 2)) * 0.3;
          ctx.globalAlpha = pulse;

          // Green cross background circle
          const radius = 18;
          ctx.fillStyle = '#00cc44';
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.fill();

          // Dark border
          ctx.strokeStyle = '#004422';
          ctx.lineWidth = 2;
          ctx.stroke();

          // White medical cross
          ctx.globalAlpha = 1;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(cx - 3, cy - 11, 6, 22); // vertical bar
          ctx.fillRect(cx - 11, cy - 3, 22, 6); // horizontal bar

          // Label "TEST" below
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#000000';
          ctx.shadowBlur = 4;
          ctx.fillText('TEST', cx, cy + radius + 2);
          ctx.shadowBlur = 0;

          ctx.restore();

          // Interaction hint if nearby
          const pdist = Math.sqrt((camp.x - ch.logicalGridX) ** 2 + (camp.y - ch.logicalGridY) ** 2);
          if (pdist <= 4) {
            ctx.save();
            ctx.font = 'bold 13px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            const hint = 'Press T to test';
            const tw = ctx.measureText(hint).width + 12;
            ctx.fillStyle = 'rgba(0,0,0,0.75)';
            ctx.fillRect(cx - tw / 2, cy - radius - 28, tw, 20);
            ctx.fillStyle = '#00ff88';
            ctx.fillText(hint, cx, cy - radius - 12);
            ctx.restore();
          }
        } else if (d.type === 'buriedGemSparkle') {
          // Render sparkle effect for buried gems ON the ground
          const gem = d.gem;
          const pos = gridToScreen(gem.gridX, gem.gridY);
          const elev = getElevation(gem.gridX, gem.gridY);
          const elevOffset = elev * ELEVATION_PX;

          // Pulsing sparkle animation
          const sparklePhase = (t / 800) % 1; // 800ms cycle
          const sparkleAlpha = 0.5 + Math.sin(sparklePhase * Math.PI * 2) * 0.4; // More visible
          const sparkleSize = 10 + Math.sin(sparklePhase * Math.PI * 2) * 5; // Bigger

          ctx.save();
          ctx.globalAlpha = sparkleAlpha;

          // Draw sparkle on tile surface (same as dug gem surface)
          const cx = pos.x;
          const cy = pos.y - TILE_HEIGHT / 2 - elevOffset;

          // Bright glow circle
          const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, sparkleSize * 2);
          gradient.addColorStop(0, 'rgba(255, 255, 100, 0.8)');
          gradient.addColorStop(0.5, 'rgba(255, 221, 0, 0.4)');
          gradient.addColorStop(1, 'rgba(255, 221, 0, 0)');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(cx, cy, sparkleSize * 2, 0, Math.PI * 2);
          ctx.fill();

          // Cross sparkle lines
          ctx.strokeStyle = '#ffff44';
          ctx.lineWidth = 4;
          ctx.shadowColor = '#ffff00';
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.moveTo(cx, cy - sparkleSize);
          ctx.lineTo(cx, cy + sparkleSize);
          ctx.moveTo(cx - sparkleSize, cy);
          ctx.lineTo(cx + sparkleSize, cy);
          ctx.stroke();

          // Diagonal cross
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(cx - sparkleSize * 0.7, cy - sparkleSize * 0.7);
          ctx.lineTo(cx + sparkleSize * 0.7, cy + sparkleSize * 0.7);
          ctx.moveTo(cx + sparkleSize * 0.7, cy - sparkleSize * 0.7);
          ctx.lineTo(cx - sparkleSize * 0.7, cy + sparkleSize * 0.7);
          ctx.stroke();

          ctx.restore();
        } else if (d.type === 'dugGem') {
          // Render dug gem on ground with bounce animation (same layer as food)
          const gem = d.gem;
          const pos = gridToScreen(gem.gridX, gem.gridY);
          const elev = getElevation(gem.gridX, gem.gridY);
          const elevOffset = elev * ELEVATION_PX;

          // Bounce animation (first 600ms after digging)
          const timeSinceDug = t - gem.dugAt;
          const BOUNCE_DURATION = 600;
          const BOUNCE_HEIGHT = 30;
          let bounceOffset = 0;

          if (timeSinceDug < BOUNCE_DURATION) {
            const bounceProgress = timeSinceDug / BOUNCE_DURATION;
            // Ease-out cubic for natural bounce
            const eased = 1 - Math.pow(1 - bounceProgress, 3);
            // Parabolic arc: starts at ground, peaks above, settles on ground
            if (bounceProgress < 0.5) {
              // Rising phase
              bounceOffset = -(eased * 2) * BOUNCE_HEIGHT;
            } else {
              // Falling phase - settle to 0 (on ground)
              bounceOffset = -BOUNCE_HEIGHT + (eased - 0.5) * 2 * BOUNCE_HEIGHT;
            }
          } else {
            bounceOffset = 0; // Settled on ground (same as food)
          }

          // Gem sprite — use Valuables images, mapped by gem type
          const GEM_IMAGES: Record<string, string> = {
            diamond: diamondImg,
            ruby: rubyImg,
            amethyst: amathystImg,
            emerald: emraldImg,
            amber: amberImg,
          };
          const gemImgSrc = GEM_IMAGES[gem.gemType] || diamondImg;
          const GEM_DISPLAY = 48; // px to draw the gem image

          // Position gem ON TOP of tile surface
          const gemX = pos.x;
          const surfaceY = pos.y - TILE_HEIGHT / 2 - elevOffset;
          const gemY = surfaceY - GEM_DISPLAY + bounceOffset;

          ctx.save();

          // Subtle glow based on type color
          const gemGlowColors: Record<string, string> = {
            diamond: '#b9f2ff',
            ruby: '#ff4444',
            amethyst: '#cc44ff',
            emerald: '#44ff44',
            amber: '#ffaa00',
          };
          ctx.shadowColor = gemGlowColors[gem.gemType] || '#ffffff';
          ctx.shadowBlur = 14;

          const gemImg = imagesCache.current.get(gemImgSrc);
          if (gemImg) {
            ctx.drawImage(gemImg, gemX - GEM_DISPLAY / 2, gemY, GEM_DISPLAY, GEM_DISPLAY);
          } else {
            loadImage(gemImgSrc);
            // Fallback circle while loading
            ctx.fillStyle = gemGlowColors[gem.gemType] || '#888888';
            ctx.globalAlpha = 0.9;
            ctx.beginPath();
            ctx.arc(gemX, surfaceY - 14 + bounceOffset, 14, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();

          // Show interaction hint if player nearby
          const px = ch.logicalGridX;
          const py = ch.logicalGridY;
          const dist = Math.sqrt((gem.gridX - px) ** 2 + (gem.gridY - py) ** 2);
          if (dist <= 1.5) {
            ctx.save();
            ctx.font = 'bold 14px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            const hintText = 'Press E to collect';
            const textWidth = ctx.measureText(hintText).width + 12;
            ctx.fillRect(gemX - textWidth / 2, gemY - 32, textWidth, 20);
            ctx.fillStyle = '#ffffff';
            ctx.fillText(hintText, gemX, gemY - 16);
            ctx.restore();
          }
        }
      }
      // Testing house door proximity hint
      {
        const doorX = FANTASY_TESTING_HOUSE_DOOR_X;
        const doorY = FANTASY_TESTING_HOUSE_DOOR_Y;
        const playerDist = Math.sqrt((doorX - ch.logicalGridX) ** 2 + (doorY - ch.logicalGridY) ** 2);
        if (playerDist <= 4) {
          const doorPos = gridToScreen(doorX, doorY);
          const doorElev = getElevation(doorX, doorY);
          const dpy = doorPos.y - doorElev * ELEVATION_PX - 40;
          const hint = 'Press T to test for infection';
          ctx.save();
          ctx.font = 'bold 13px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          const tw = ctx.measureText(hint).width + 16;
          ctx.fillStyle = 'rgba(0,0,0,0.8)';
          ctx.fillRect(doorPos.x - tw / 2, dpy - 20, tw, 22);
          ctx.fillStyle = '#00ff88';
          ctx.fillText(hint, doorPos.x, dpy);
          ctx.restore();
        }
      }

      ctx.restore();

    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [dimensions.width, dimensions.height, devicePixelRatio, loadImage]);

  // Convert screen coordinates to grid coordinates (camera center = character render)
  const screenToGrid = useCallback((screenX: number, screenY: number) => {
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const ch = characterRef.current;
    const cam = cameraRef.current;
    const cameraScreenPos = gridToScreen(ch.renderX, ch.renderY);
    const transformedX = (screenX - centerX) / cam.zoom + cameraScreenPos.x;
    const transformedY = (screenY - centerY) / cam.zoom + cameraScreenPos.y;
    const gridX = Math.round((transformedX / (TILE_WIDTH / 2) + transformedY / (TILE_HEIGHT / 2)) / 2);
    const gridY = Math.round((transformedY / (TILE_HEIGHT / 2) - transformedX / (TILE_WIDTH / 2)) / 2);
    return { gridX, gridY };
  }, [dimensions]);

  // No drag-to-pan — camera always follows character.

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cssX = e.clientX - rect.left;
    const cssY = e.clientY - rect.top;

    // Hover detection
    const { gridX, gridY } = screenToGrid(cssX, cssY);
    const tileExists = gridX >= 0 && gridX < MAP_SIZE && gridY >= 0 && gridY < MAP_SIZE;
    if (tileExists) {
      hoveredTileRef.current = { gridX, gridY };
      setHoveredTile({ gridX, gridY });
    } else {
      hoveredTileRef.current = null;
      setHoveredTile(null);
    }
  }, [screenToGrid]);

  const handleMouseLeave = useCallback(() => {
    hoveredTileRef.current = null;
    setHoveredTile(null);
  }, []);

  // Zoom is locked — consume wheel events to prevent page scroll inside canvas.
  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const { gridX, gridY } = screenToGrid(e.clientX - rect.left, e.clientY - rect.top);
    onTileClick?.(gridX, gridY);
  }, [onTileClick, screenToGrid]);

  return (
    <canvas
      ref={canvasRef}
      className={`isometric-map-canvas ${className}`}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onWheel={handleWheel}
      style={{
        display: 'block',
        imageRendering: 'pixelated',
        cursor: hoveredTile ? 'pointer' : 'default',
        touchAction: 'none',
      }}
    />
  );
}
