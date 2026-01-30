import { EnemyConfig, EnemyType, LevelConfig, TechNode, TileType, TowerConfig, TowerType } from './types';

// Grid Constants
export const TILE_SIZE = 64;
export const GRID_COLS = 12;
export const GRID_ROWS = 8;
export const CANVAS_WIDTH = GRID_COLS * TILE_SIZE;
export const CANVAS_HEIGHT = GRID_ROWS * TILE_SIZE;

// ------------------- TECH TREE -------------------
export const TECH_TREE: TechNode[] = [
  {
    id: 'archery_drill',
    name: 'Archery Drill',
    description: '+10% Arrow Tower Damage per level',
    cost: 50,
    maxLevels: 5,
    currentLevel: 0,
    effectType: 'DAMAGE',
    effectValue: 0.10,
    target: TowerType.ARROW
  },
  {
    id: 'reinforced_steel',
    name: 'Reinforced Steel',
    description: '+10% Cannon Blast Radius per level',
    cost: 75,
    maxLevels: 3,
    currentLevel: 0,
    effectType: 'RANGE', // Using RANGE logic for radius in this context or special handling
    effectValue: 0.10,
    target: TowerType.CANNON
  },
  {
    id: 'alchemy',
    name: 'Alchemy',
    description: '+50 Starting Gold per level',
    cost: 100,
    maxLevels: 5,
    currentLevel: 0,
    effectType: 'GOLD',
    effectValue: 50,
    target: 'ALL'
  },
  {
    id: 'stone_masonry',
    name: 'Stone Masonry',
    description: '+5 Starting Lives per level',
    cost: 40,
    maxLevels: 10,
    currentLevel: 0,
    effectType: 'LIVES',
    effectValue: 5,
    target: 'ALL'
  },
  {
    id: 'frost_mastery',
    name: 'Frost Mastery',
    description: '+10% Frost Range per level',
    cost: 60,
    maxLevels: 3,
    currentLevel: 0,
    effectType: 'RANGE',
    effectValue: 0.10,
    target: TowerType.FROST
  }
];

// ------------------- TOWER DEFINITIONS -------------------
export const TOWER_STATS: Record<TowerType, TowerConfig> = {
  [TowerType.ARROW]: {
    id: TowerType.ARROW,
    name: 'Archer Tower',
    description: 'Single target, fast firing.',
    cost: 50,
    damage: 15,
    range: 160,
    fireRate: 1.0,
    color: 'bg-amber-700',
    projectileSpeed: 400,
    upgrades: [
      {
        name: 'Iron Tips',
        description: '+30% Damage',
        cost: 40,
        stat: 'damage',
        value: 0.3,
        operation: 'multiply',
        type: 'DAMAGE'
      },
      {
        name: 'Steel Bolts',
        description: '+40% Damage',
        cost: 70,
        stat: 'damage',
        value: 0.4,
        operation: 'multiply',
        type: 'DAMAGE'
      },
      {
        name: 'Mithril Head',
        description: '+50% Damage',
        cost: 120,
        stat: 'damage',
        value: 0.5,
        operation: 'multiply',
        type: 'DAMAGE'
      }
    ]
  },
  [TowerType.CANNON]: {
    id: TowerType.CANNON,
    name: 'Cannon',
    description: 'Area damage, slow firing.',
    cost: 80,
    damage: 40,
    range: 130,
    fireRate: 0.6,
    aoeRadius: 60,
    color: 'bg-stone-800',
    projectileSpeed: 300,
    upgrades: [
      {
        name: 'Heavy Shells',
        description: '+35% Damage',
        cost: 70,
        stat: 'damage',
        value: 0.35,
        operation: 'multiply',
        type: 'DAMAGE'
      },
      {
        name: 'Shrapnel',
        description: '+20% Blast Radius',
        cost: 60,
        stat: 'aoeRadius',
        value: 0.2,
        operation: 'multiply',
        type: 'SPECIAL'
      },
      {
        name: 'Auto-Loader',
        description: '+15% Fire Rate',
        cost: 70,
        stat: 'fireRate',
        value: 0.15,
        operation: 'multiply',
        type: 'SPEED'
      }
    ]
  },
  [TowerType.FROST]: {
    id: TowerType.FROST,
    name: 'Ice Spire',
    description: 'Low damage, slows enemies.',
    cost: 100,
    damage: 8,
    range: 150,
    fireRate: 1.2,
    slowFactor: 0.3, // 30% slow
    slowDuration: 2000, // ms
    color: 'bg-cyan-500',
    projectileSpeed: 350,
    upgrades: [
      {
        name: 'Deep Freeze',
        description: '+15% Slow Strength',
        cost: 80,
        stat: 'slowFactor',
        value: 0.15,
        operation: 'add',
        type: 'SPECIAL'
      },
      {
        name: 'Permafrost',
        description: '+40% Duration',
        cost: 70,
        stat: 'slowDuration',
        value: 0.4,
        operation: 'multiply',
        type: 'SPECIAL'
      },
      {
        name: 'Blizzard',
        description: '+25% Range',
        cost: 60,
        stat: 'range',
        value: 0.25,
        operation: 'multiply',
        type: 'RANGE'
      }
    ]
  },
};

// ------------------- ENEMY DEFINITIONS -------------------
export const ENEMY_STATS: Record<EnemyType, EnemyConfig> = {
  [EnemyType.GRUNT]: {
    id: EnemyType.GRUNT,
    name: 'Grunt',
    hp: 100,
    speed: 0.9 * TILE_SIZE, // Reduced by 10% (was 1.0)
    reward: 10,
    color: 'bg-green-600',
  },
  [EnemyType.RUNNER]: {
    id: EnemyType.RUNNER,
    name: 'Runner',
    hp: 70,
    speed: 1.44 * TILE_SIZE, // Reduced by 10% (was 1.6)
    reward: 12,
    color: 'bg-yellow-500',
  },
  [EnemyType.TANK]: {
    id: EnemyType.TANK,
    name: 'Golem',
    hp: 250,
    speed: 0.63 * TILE_SIZE, // Reduced by 10% (was 0.7)
    reward: 20,
    color: 'bg-red-800',
  },
  [EnemyType.SHIELDED]: {
    id: EnemyType.SHIELDED,
    name: 'Paladin',
    hp: 150,
    speed: 0.9 * TILE_SIZE, // Reduced by 10% (was 1.0)
    reward: 18,
    hasShield: true,
    shieldStrength: 50,
    color: 'bg-blue-700',
  },
};

// ------------------- MAP GENERATION -------------------
export const createEmptyGrid = (): TileType[][] => {
  return Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill(TileType.BUILDABLE));
};

export const applyPathToGrid = (grid: TileType[][], path: { x: number, y: number }[]) => {
  // Clear previous paths first if reusing grid
  for (let y = 0; y < GRID_ROWS; y++) {
    for (let x = 0; x < GRID_COLS; x++) {
      if (grid[y][x] === TileType.PATH || grid[y][x] === TileType.START || grid[y][x] === TileType.END) {
        grid[y][x] = TileType.BUILDABLE;
      }
    }
  }

  path.forEach((p, index) => {
    if (index === 0) grid[p.y][p.x] = TileType.START;
    else if (index === path.length - 1) grid[p.y][p.x] = TileType.END;
    else grid[p.y][p.x] = TileType.PATH;
  });
};

// Level 1 Path (Straight across row 2, basically)
const LEVEL_1_PATH = [
  { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 },
  { x: 5, y: 2 }, { x: 6, y: 2 }, { x: 7, y: 2 }, { x: 8, y: 2 }, { x: 9, y: 2 },
  { x: 10, y: 2 }, { x: 11, y: 2 }
];

// Level 2 Path (Snake)
const LEVEL_2_PATH = [
  { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 2, y: 3 },
  { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 3 }, { x: 5, y: 4 }, { x: 5, y: 5 },
  { x: 6, y: 5 }, { x: 7, y: 5 }, { x: 8, y: 5 }, { x: 9, y: 5 }, { x: 9, y: 4 },
  { x: 9, y: 3 }, { x: 10, y: 3 }, { x: 11, y: 3 }
];

// Level 3 Path (Zig Zag)
const LEVEL_3_PATH = [
  { x: 0, y: 6 }, { x: 1, y: 6 }, { x: 2, y: 6 }, { x: 2, y: 5 }, { x: 2, y: 4 },
  { x: 3, y: 4 }, { x: 4, y: 4 }, { x: 5, y: 4 }, { x: 5, y: 3 }, { x: 5, y: 2 },
  { x: 6, y: 2 }, { x: 7, y: 2 }, { x: 8, y: 2 }, { x: 8, y: 3 }, { x: 8, y: 4 },
  { x: 9, y: 4 }, { x: 10, y: 4 }, { x: 10, y: 5 }, { x: 10, y: 6 }, { x: 11, y: 6 }
];

// ------------------- LEVELS -------------------
export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: 'Forest Path',
    startingGold: 150,
    startingLives: 20,
    path: LEVEL_1_PATH,
    grid: (() => { const g = createEmptyGrid(); applyPathToGrid(g, LEVEL_1_PATH); return g; })(),
    waves: [
      { enemies: [{ type: EnemyType.GRUNT, count: 5 }], interval: 1500 },
      { enemies: [{ type: EnemyType.GRUNT, count: 8 }], interval: 1200 },
      { enemies: [{ type: EnemyType.RUNNER, count: 3 }], interval: 1500 },
      { enemies: [{ type: EnemyType.GRUNT, count: 5 }, { type: EnemyType.RUNNER, count: 5 }], interval: 1000 },
      { enemies: [{ type: EnemyType.RUNNER, count: 10 }], interval: 800 },
      { enemies: [{ type: EnemyType.GRUNT, count: 15 }], interval: 600 },
    ]
  },
  {
    id: 2,
    name: 'Desert Ruins',
    startingGold: 200,
    startingLives: 20,
    path: LEVEL_2_PATH,
    grid: (() => { const g = createEmptyGrid(); applyPathToGrid(g, LEVEL_2_PATH); return g; })(),
    waves: [
      { enemies: [{ type: EnemyType.GRUNT, count: 10 }], interval: 1000 },
      { enemies: [{ type: EnemyType.TANK, count: 2 }], interval: 3000 },
      { enemies: [{ type: EnemyType.RUNNER, count: 10 }], interval: 800 },
      { enemies: [{ type: EnemyType.GRUNT, count: 10 }, { type: EnemyType.TANK, count: 3 }], interval: 1200 },
      { enemies: [{ type: EnemyType.TANK, count: 5 }, { type: EnemyType.RUNNER, count: 5 }], interval: 1500 },
      { enemies: [{ type: EnemyType.TANK, count: 8 }], interval: 2000 },
      { enemies: [{ type: EnemyType.GRUNT, count: 20 }, { type: EnemyType.TANK, count: 2 }], interval: 500 },
      { enemies: [{ type: EnemyType.TANK, count: 10 }], interval: 1500 },
    ]
  },
  {
    id: 3,
    name: 'Lava Mine',
    startingGold: 250,
    startingLives: 20,
    path: LEVEL_3_PATH,
    grid: (() => { const g = createEmptyGrid(); applyPathToGrid(g, LEVEL_3_PATH); return g; })(),
    waves: [
      { enemies: [{ type: EnemyType.SHIELDED, count: 2 }], interval: 3000 },
      { enemies: [{ type: EnemyType.GRUNT, count: 15 }], interval: 800 },
      { enemies: [{ type: EnemyType.SHIELDED, count: 5 }], interval: 2000 },
      { enemies: [{ type: EnemyType.TANK, count: 5 }, { type: EnemyType.SHIELDED, count: 3 }], interval: 2000 },
      { enemies: [{ type: EnemyType.RUNNER, count: 20 }], interval: 500 },
      { enemies: [{ type: EnemyType.SHIELDED, count: 8 }], interval: 1500 },
      { enemies: [{ type: EnemyType.TANK, count: 5 }, { type: EnemyType.SHIELDED, count: 5 }], interval: 1500 },
      { enemies: [{ type: EnemyType.GRUNT, count: 30 }], interval: 300 },
      { enemies: [{ type: EnemyType.SHIELDED, count: 10 }, { type: EnemyType.TANK, count: 5 }], interval: 1200 },
      { enemies: [{ type: EnemyType.TANK, count: 15 }], interval: 1500 },
    ]
  }
];