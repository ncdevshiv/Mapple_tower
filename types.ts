// Enums for identifiable game entities
export enum TowerType {
  ARROW = 'ARROW',
  CANNON = 'CANNON',
  FROST = 'FROST',
}

export enum EnemyType {
  GRUNT = 'GRUNT',
  RUNNER = 'RUNNER',
  TANK = 'TANK',
  SHIELDED = 'SHIELDED',
}

export enum GameStatus {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  VICTORY = 'VICTORY',
  DEFEAT = 'DEFEAT',
}

export enum TileType {
  BUILDABLE = 0,
  PATH = 1,
  START = 2,
  END = 3,
  OBSTACLE = 4, // For scenery
}

// Coordinate system
export interface Point {
  x: number;
  y: number;
}

export interface TowerUpgrade {
  name: string;
  description: string;
  stat: 'damage' | 'range' | 'fireRate' | 'aoeRadius' | 'slowFactor' | 'slowDuration';
  value: number; // e.g. 0.25 for +25%
  operation: 'multiply' | 'add';
  cost: number;
  type: 'DAMAGE' | 'RANGE' | 'SPEED' | 'SPECIAL';
}

// Configuration Interfaces (Data-Driven Design)
export interface TowerConfig {
  id: TowerType;
  name: string;
  cost: number;
  damage: number;
  range: number; // In pixels
  fireRate: number; // Shots per second
  color: string;
  projectileSpeed: number;
  aoeRadius?: number;
  slowFactor?: number;
  slowDuration?: number;
  description: string;
  upgrades: TowerUpgrade[];
}

export interface EnemyConfig {
  id: EnemyType;
  name: string;
  hp: number;
  speed: number; // Tiles per second (approx)
  reward: number;
  color: string;
  hasShield?: boolean;
  shieldStrength?: number;
}

export interface LevelConfig {
  id: number;
  name: string;
  grid: TileType[][]; // 8 rows x 12 cols
  path: Point[]; // Array of grid coordinates for enemy pathing
  waves: WaveConfig[];
  startingGold: number;
  startingLives: number;
}

export interface WaveConfig {
  enemies: { type: EnemyType; count: number }[];
  interval: number; // Time between spawns in this wave
}

// Runtime State Interfaces
export interface ActiveTower {
  id: string;
  type: TowerType;
  gridX: number;
  gridY: number;
  level: number;
  damage: number;
  range: number;
  fireRate: number;
  lastFired: number;
  rotation: number; // Angle in radians
  aoeRadius?: number;
  slowFactor?: number;
  slowDuration?: number;
  targetId: string | null;
}

export interface ActiveEnemy {
  id: string;
  type: EnemyType;
  x: number; // Pixel X
  y: number; // Pixel Y
  pathIndex: number; // Current target node index in path array
  hp: number;
  maxHp: number;
  speed: number;
  shield: number;
  slowTimer: number; // If > 0, enemy is slowed
  frozen: boolean; // Visual state
  incomingDamage: number; // For AI targeting optimization
}

export interface ActiveProjectile {
  id: string;
  towerId: string;
  targetId: string; // Homing logic
  startX: number;
  startY: number;
  x: number;
  y: number;
  progress: number; // 0 to 1 for parabolic movement
  speed: number;
  damage: number;
  aoeRadius?: number;
  slowFactor?: number;
  slowDuration?: number;
  hasHit: boolean;
  color: string;
  arcHeight: number; // How high the projectile goes (visual)
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}

// --- NEW VFX & TECH TYPES ---

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'spark' | 'smoke' | 'frost' | 'gold';
}

export interface TechNode {
  id: string;
  name: string;
  description: string;
  cost: number;
  maxLevels: number;
  currentLevel: number; // Runtime state
  effectType: 'DAMAGE' | 'RANGE' | 'GOLD' | 'LIVES' | 'DISCOUNT';
  effectValue: number; // Per level
  target?: TowerType | 'ALL'; // Applies to specific tower or all
}

export interface UserProfile {
  gems: number;
  unlockedTechs: Record<string, number>; // TechID -> Level
}

export interface GameState {
  levelIndex: number;
  status: GameStatus;
  gold: number;
  lives: number;
  wave: number;
  isWaveActive: boolean;
  nextWaveTime: number;
  towers: ActiveTower[];
  enemies: ActiveEnemy[];
  projectiles: ActiveProjectile[];
  effects: FloatingText[];
  selectedTowerId: string | null;
  gameSpeed: number; // 1 = normal, 2 = fast
  currentGrid: TileType[][]; // Grid can change dynamically
  currentPath: Point[]; // Path can change dynamically
  difficultyMultiplier: number; // Calculated based on performance
  // New
  showTechTree: boolean;
}