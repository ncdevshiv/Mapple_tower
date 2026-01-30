import {
  GameState, GameStatus, TowerType, LevelConfig
} from '../types';
import {
  LEVELS, TECH_TREE, CANVAS_WIDTH, CANVAS_HEIGHT
} from '../constants';
import { VFXManager } from './VFXManager';
import { SoundManager } from './SoundManager';
import { ISoundManager, IVFXManager, HeadlessSoundManager, HeadlessVFXManager } from '../game_logic/ISystems';
import { PersistenceManager } from './PersistenceManager';
import { EconomyManager } from '../game_logic/EconomyManager';
import { StrategyManager } from '../game_logic/StrategyManager';
import { EntityManager } from '../game_logic/EntityManager';
import { TowerManager } from '../game_logic/TowerManager';
import { WaveManager } from '../game_logic/WaveManager';
import { GAME_LOGIC_CONFIG } from '../game_logic/config';
import { SeededRNG } from './SeededRNG';
import { InputLogger } from './InputLogger';

export class GameEngine {
  public state: GameState;
  public autoPilotEnabled: boolean = false;
  private autoPilotTimer: number = 0;

  // Determinism
  public rng: SeededRNG;
  public logger: InputLogger;

  // Sub-Systems
  public vfx: IVFXManager;
  public sound: ISoundManager;
  public persistence: PersistenceManager;

  // Logic Managers
  private entities: EntityManager;
  private towers: TowerManager;
  private waves: WaveManager;
  private economy: EconomyManager;
  public strategy: StrategyManager;

  private currentLevelConfig: LevelConfig;

  constructor(levelIndex: number = 0, seed: number = Date.now(), headless: boolean = false) {
    // Initialize Core Systems
    this.rng = new SeededRNG(seed);
    this.logger = new InputLogger();
    if (headless) {
      this.vfx = new HeadlessVFXManager();
      this.sound = new HeadlessSoundManager();
    } else {
      this.vfx = new VFXManager();
      this.sound = new SoundManager();
    }
    this.persistence = new PersistenceManager();

    this.currentLevelConfig = LEVELS[levelIndex];
    this.state = this.initializeState(levelIndex);

    // Initialize Economy first as it reads state
    this.economy = new EconomyManager(this.state);

    // Initialize Strategy
    this.strategy = new StrategyManager(this.state);
    this.strategy.analyzeMap();

    // Initialize Logic Managers
    // We bind methods to this instance where needed
    const getDifficultyMultiplier = () => this.state.difficultyMultiplier;
    const getTechBonus = (e: string, t?: string) => this.getTechBonus(e, t);
    const getTheoreticalDPS = () => this.economy.getTheoreticalMaxDPS();


    this.entities = new EntityManager(this.state, this.vfx, this.sound, getDifficultyMultiplier, this.rng);
    this.towers = new TowerManager(this.state, this.vfx, this.sound, this.entities, getTechBonus, this.rng);
    this.waves = new WaveManager(this.state, this.entities, this.vfx, this.sound, getDifficultyMultiplier, getTheoreticalDPS, this.rng);
  }

  // --- Tech Tree Helpers ---
  private getTechBonus(effectType: string, target?: string): number {
    let bonus = 0;
    const profile = this.persistence.getProfile();

    TECH_TREE.forEach(node => {
      if (node.effectType === effectType) {
        if (node.target === 'ALL' || node.target === target) {
          const level = profile.unlockedTechs[node.id] || 0;
          bonus += level * node.effectValue;
        }
      }
    });
    return bonus;
  }

  private initializeState(levelIndex: number): GameState {
    const config = LEVELS[levelIndex];

    // Apply Tech Bonuses to Start Logic
    const startGoldBonus = this.getTechBonus('GOLD');
    const startLivesBonus = this.getTechBonus('LIVES');

    return {
      levelIndex,
      status: GameStatus.MENU,
      gold: config.startingGold + startGoldBonus,
      lives: config.startingLives + startLivesBonus,
      wave: 0,
      isWaveActive: false,
      nextWaveTime: 0,
      towers: [],
      enemies: [],
      projectiles: [],
      effects: [],
      selectedTowerId: null,
      gameSpeed: 1,
      currentGrid: JSON.parse(JSON.stringify(config.grid)),
      currentPath: [...config.path],
      difficultyMultiplier: 1.0,
      showTechTree: false
    };
  }

  // --- Public API for UI ---

  public startGame() {
    this.sound.init(); // Ensure Audio Context starts on interaction
    this.state.status = GameStatus.PLAYING;
    // Log start? Or is it implicit?
  }

  public toggleTechTree() {
    this.state.showTechTree = !this.state.showTechTree;
    this.state.status = this.state.showTechTree ? GameStatus.PAUSED : GameStatus.PLAYING;
    this.logger.log(this.getCurrentTick(), 'TECH_TOGGLE', { show: this.state.showTechTree });
  }

  public pauseGame() {
    if (this.state.status === GameStatus.PLAYING) this.state.status = GameStatus.PAUSED;
    else if (this.state.status === GameStatus.PAUSED) this.state.status = GameStatus.PLAYING;
  }

  public setGameSpeed(speed: number) {
    this.state.gameSpeed = speed;
    this.logger.log(this.getCurrentTick(), 'SPEED', { speed });
  }

  public nextLevel() {
    const nextIndex = this.state.levelIndex + 1;
    if (nextIndex < LEVELS.length) {
      this.currentLevelConfig = LEVELS[nextIndex];
      this.resetGame(nextIndex);
    }
  }

  public retryLevel() {
    this.resetGame(this.state.levelIndex);
  }

  public resetGame(levelIndex: number) {
    this.state = this.initializeState(levelIndex);
    this.currentLevelConfig = LEVELS[levelIndex];
    this.logger.clear();

    // Re-bind managers to new state
    this.economy = new EconomyManager(this.state);
    this.strategy = new StrategyManager(this.state);
    this.strategy.analyzeMap();

    const getDifficultyMultiplier = () => this.state.difficultyMultiplier;
    const getTechBonus = (e: string, t?: string) => this.getTechBonus(e, t);
    const getTheoreticalDPS = () => this.economy.getTheoreticalMaxDPS();

    this.entities = new EntityManager(this.state, this.vfx, this.sound, getDifficultyMultiplier, this.rng);
    this.towers = new TowerManager(this.state, this.vfx, this.sound, this.entities, getTechBonus, this.rng);
    this.waves = new WaveManager(this.state, this.entities, this.vfx, this.sound, getDifficultyMultiplier, getTheoreticalDPS, this.rng);

    this.state.status = GameStatus.PLAYING;
  }

  // Wrappers for Manager Methods
  public placeTower(type: TowerType, x: number, y: number) {
    const success = this.towers.placeTower(type, x, y);
    if (success) this.logger.log(this.getCurrentTick(), 'BUILD', { type, x, y });
    return success;
  }
  public upgradeTower(id: string, idx: number) {
    const success = this.towers.upgradeTower(id, idx);
    if (success) this.logger.log(this.getCurrentTick(), 'UPGRADE', { id, idx });
    return success;
  }
  public sellTower(id: string) {
    this.towers.sellTower(id);
    this.logger.log(this.getCurrentTick(), 'SELL', { id });
  }
  public moveTower(id: string, x: number, y: number) {
    const success = this.towers.moveTower(id, x, y);
    if (success) this.logger.log(this.getCurrentTick(), 'MOVE', { id, x, y });
    return success;
  }
  public getNextUpgradeCost(id: string): number | null { return this.towers.getNextUpgradeCost(id); }
  public startNextWave() {
    this.waves.startNextWave(this.currentLevelConfig);
    this.logger.log(this.getCurrentTick(), 'START_WAVE', {});
  }

  // Define Tick Helper
  private accumulatedTime: number = 0;
  private getCurrentTick(): number {
    return this.accumulatedTime;
  }

  private updateDifficulty() {
    let difficultyMult = 1 + (this.state.wave * GAME_LOGIC_CONFIG.DIFFICULTY_WAVE_SCALING);
    if (this.state.gold > 500) difficultyMult += GAME_LOGIC_CONFIG.DIFFICULTY_RICH_PLAYER_PENALTY;
    if (this.state.lives >= this.currentLevelConfig.startingLives) difficultyMult += GAME_LOGIC_CONFIG.DIFFICULTY_FULL_HP_PENALTY;
    if (this.state.towers.length > 0) {
      const avgLevel = this.state.towers.reduce((acc, t) => acc + t.level, 0) / this.state.towers.length;
      if (avgLevel > 2) difficultyMult += GAME_LOGIC_CONFIG.DIFFICULTY_HIGH_LEVEL_PENALTY;
    }
    this.state.difficultyMultiplier = difficultyMult;
  }

  private endGame(isVictory: boolean) {
    if (this.state.status === GameStatus.DEFEAT || this.state.status === GameStatus.VICTORY) return; // Prevent double trigger

    this.state.status = isVictory ? GameStatus.VICTORY : GameStatus.DEFEAT;
    const gems = 10 + (isVictory ? 20 : 0);
    this.persistence.addGems(gems);
    if (isVictory) this.sound.playUI('upgrade');
    else this.sound.playUI('error');

    // Submit Replay
    try {
      const replay = this.logger.getReplayData(
        // @ts-ignore - accessing private key for now or add getter. Actually internal use.
        this.rng['seed'],
        this.state.gold + (this.state.lives * 100) + (this.state.wave * 1000), // Score calc
        this.state.wave
      );

      // Dynamic Import to avoid cycle or if LeaderboardService isn't available in some contexts? 
      // No, standard import is fine.
      import('./LeaderboardService').then(({ LeaderboardService }) => {
        LeaderboardService.submitScore(this.state.levelIndex + 1, replay)
          .then(() => console.log('Replay submitted'))
          .catch(err => console.error('Replay submit failed', err));
      });
    } catch (e) {
      console.warn('Failed to submit replay', e);
    }
  }

  // --- MAIN LOOP ---
  public update(realDeltaTime: number) {
    if (this.state.status !== GameStatus.PLAYING) return;
    const deltaTime = realDeltaTime * this.state.gameSpeed;
    this.accumulatedTime += deltaTime;

    this.updateDifficulty();
    this.vfx.update(deltaTime);
    this.entities.update(deltaTime, this.state.gameSpeed);
    this.towers.update(deltaTime);
    this.waves.update(deltaTime, this.currentLevelConfig, (victory) => this.endGame(victory));

    if (this.autoPilotEnabled) {
      this.autoPilotTimer += deltaTime;
      if (this.autoPilotTimer > GAME_LOGIC_CONFIG.AI_THINK_INTERVAL_MS) {
        this.autoPilotTimer = 0;
        const move = this.strategy.getNextBestMove(this.state.gold);
        if (move.action === 'BUILD' && move.type && move.x !== undefined && move.y !== undefined) {
          this.placeTower(move.type, move.x, move.y);
        }
      }
    }

    if (this.state.lives <= 0) {
      this.endGame(false);
    }
  }
}