import { GameState, TowerType, ActiveEnemy } from '../types';
import { TOWER_STATS, TILE_SIZE } from '../constants';
import { IVFXManager, ISoundManager } from './ISystems';
import { EntityManager } from './EntityManager';
import { SeededRNG } from '../services/SeededRNG';

// Helper to generate IDs
const uuid = (rng: SeededRNG) => rng.uuid();

export class TowerManager {
    constructor(
        private state: GameState,
        private vfx: IVFXManager,
        private sound: ISoundManager,
        private entities: EntityManager,
        private getTechBonus: (type: string, target?: string) => number,
        private rng: SeededRNG
    ) { }

    public placeTower(type: TowerType, gridX: number, gridY: number): boolean {
        this.sound.init(); // User interaction trigger
        const config = TOWER_STATS[type];

        if (this.state.gold < config.cost) {
            this.sound.playUI('error');
            return false;
        }
        if (this.state.towers.some(t => t.gridX === gridX && t.gridY === gridY)) return false;

        // Check if tile is buildable (handled mostly in UI/Engine, but double check)
        // Assuming TileType.BUILDABLE check was done or passed in. 
        // Ideally Engine checks strict tile validity. We'll assume valid call here or check state grid.
        if (this.state.currentGrid[gridY][gridX] !== 0) { // 0 is BUILDABLE
            this.sound.playUI('error');
            return false;
        }

        this.state.gold -= config.cost;
        this.sound.playUI('click');
        this.vfx.spawnExplosion(gridX * TILE_SIZE + TILE_SIZE / 2, gridY * TILE_SIZE + TILE_SIZE / 2, '#fff');

        // Apply Tech Bonuses
        const dmgBonus = this.getTechBonus('DAMAGE', type);
        const rangeBonus = this.getTechBonus('RANGE', type);

        this.state.towers.push({
            id: uuid(this.rng),
            type,
            gridX,
            gridY,
            level: 1,
            damage: config.damage * (1 + dmgBonus),
            range: config.range * (1 + rangeBonus),
            fireRate: config.fireRate,
            lastFired: 1000, // Start ready to fire (assuming max cooldown ~1s, or just use huge number)
            rotation: 0,
            aoeRadius: config.aoeRadius ? config.aoeRadius * (1 + rangeBonus) : undefined,
            slowFactor: config.slowFactor,
            slowDuration: config.slowDuration,
            targetId: null,
        });

        return true;
    }

    public upgradeTower(towerId: string, upgradeIndex: number): boolean {
        const tower = this.state.towers.find(t => t.id === towerId);
        if (!tower) return false;
        if (tower.level >= 4) return false;

        const towerConfig = TOWER_STATS[tower.type];
        const upgradeOption = towerConfig.upgrades[upgradeIndex];
        if (!upgradeOption) return false;

        if (this.state.gold < upgradeOption.cost) {
            this.sound.playUI('error');
            return false;
        }

        this.state.gold -= upgradeOption.cost;
        tower.level++;
        this.sound.playUI('upgrade');
        this.vfx.spawnExplosion(tower.gridX * TILE_SIZE + TILE_SIZE / 2, tower.gridY * TILE_SIZE + TILE_SIZE / 2, '#fbbf24');

        const val = upgradeOption.value;
        if (upgradeOption.operation === 'multiply') {
            if (upgradeOption.stat === 'damage') tower.damage *= (1 + val);
            else if (upgradeOption.stat === 'range') tower.range *= (1 + val);
            else if (upgradeOption.stat === 'fireRate') tower.fireRate *= (1 + val);
            else if (upgradeOption.stat === 'aoeRadius' && tower.aoeRadius) tower.aoeRadius *= (1 + val);
            else if (upgradeOption.stat === 'slowDuration' && tower.slowDuration) tower.slowDuration *= (1 + val);
            else if (upgradeOption.stat === 'slowFactor' && tower.slowFactor) tower.slowFactor *= (1 + val);
        } else {
            if (upgradeOption.stat === 'damage') tower.damage += val;
            else if (upgradeOption.stat === 'range') tower.range += val;
            else if (upgradeOption.stat === 'fireRate') tower.fireRate += val;
            else if (upgradeOption.stat === 'aoeRadius' && tower.aoeRadius) tower.aoeRadius += val;
            else if (upgradeOption.stat === 'slowDuration' && tower.slowDuration) tower.slowDuration += val;
            else if (upgradeOption.stat === 'slowFactor' && tower.slowFactor) tower.slowFactor += val;
        }

        if (tower.slowFactor && tower.slowFactor > 0.9) tower.slowFactor = 0.9;

        this.entities.spawnFloatingText((tower.gridX * TILE_SIZE) + TILE_SIZE / 2, (tower.gridY * TILE_SIZE), `${upgradeOption.name.toUpperCase()}!`, '#fbbf24');
        return true;
    }

    public sellTower(towerId: string) {
        const index = this.state.towers.findIndex(t => t.id === towerId);
        if (index === -1) return;
        const tower = this.state.towers[index];
        const baseCost = TOWER_STATS[tower.type].cost;
        // Reverted to 50% refund always to maintain difficulty/punish mistakes as requested by user.
        this.state.gold += Math.floor(baseCost * 0.5);
        this.state.towers.splice(index, 1);
        this.state.selectedTowerId = null;
        this.sound.playUI('click');
        this.vfx.spawnGold(tower.gridX * TILE_SIZE, tower.gridY * TILE_SIZE);
    }

    public moveTower(towerId: string, newGridX: number, newGridY: number): boolean {
        // Can only move if wave is not active? Or just strict "Before starting attack" (Wave 0)
        if (this.state.isWaveActive) {
            this.sound.playUI('error');
            return false;
        }

        const tower = this.state.towers.find(t => t.id === towerId);
        if (!tower) return false;

        // Competitive Change: Moving costs 25% of base cost to prevent cheese/free optimization.
        // It's cheaper than Sell(50%) + Rebuy(100%), but still punishes "wrong placing".
        const moveCost = Math.floor(TOWER_STATS[tower.type].cost * 0.25);
        if (this.state.gold < moveCost) {
            this.sound.playUI('error');
            return false;
        }

        // Validation: Tile must be buildable
        if (this.state.currentGrid[newGridY][newGridX] !== 0) { // 0 is BUILDABLE
            this.sound.playUI('error');
            return false;
        }

        // Validation: Tile must be empty (no other tower)
        if (this.state.towers.some(t => t.gridX === newGridX && t.gridY === newGridY && t.id !== towerId)) {
            return false;
        }

        // Move
        console.log(`Moving tower ${towerId} to ${newGridX},${newGridY}. Cost: ${moveCost}`);
        this.state.gold -= moveCost;
        tower.gridX = newGridX;
        tower.gridY = newGridY;
        this.sound.playUI('click');
        this.vfx.spawnExplosion(newGridX * TILE_SIZE + TILE_SIZE / 2, newGridY * TILE_SIZE + TILE_SIZE / 2, '#fff'); // Reuse placement effect
        this.entities.spawnFloatingText(newGridX * TILE_SIZE, newGridY * TILE_SIZE, `-${moveCost} G`, '#fbbf24');

        return true;
    }

    public update(deltaTime: number) {
        this.state.towers.forEach(tower => {
            const cooldown = 1000 / tower.fireRate;
            tower.lastFired = Math.min(tower.lastFired + deltaTime, cooldown); // CLAMP: Prevent accumulation > 1 shot
            const towerCx = tower.gridX * TILE_SIZE + TILE_SIZE / 2;
            const towerCy = tower.gridY * TILE_SIZE + TILE_SIZE / 2;
            let target: ActiveEnemy | null = null;

            // 1. Check existing target existence and range
            // 1. Check existing target existence and range
            if (tower.targetId) {
                const existing = this.state.enemies.find(e => e.id === tower.targetId);
                // logic: Keep target if exists, in range, AND NOT DOOMED (unless we are the only source of incoming damage? No, simpler is better: if doomed, switch)
                // Note: We need to be careful. If 'this' tower fired the shot that doomed it, we should still switch? Yes, because that shot is active.
                if (existing) {
                    const dx = existing.x - towerCx;
                    const dy = existing.y - towerCy;
                    if (dx * dx + dy * dy <= tower.range * tower.range) {
                        // Check for Doomed status (Optimization)
                        if (existing.hp - existing.incomingDamage > 0) {
                            target = existing;
                        }
                    }
                }
            }

            // 2. Find new target if needed
            // 2. Find new target if needed
            if (!target) {
                // Heuristic: "First" - Target the enemy furthest along the path (ActiveEnemies matches spawn order, so index 0 is furthest)
                for (const enemy of this.state.enemies) {
                    // Check if doomed (HP <= confirmed incoming damage)
                    if (enemy.hp - enemy.incomingDamage <= 0) continue;

                    const dx = enemy.x - towerCx;
                    const dy = enemy.y - towerCy;
                    const dSq = dx * dx + dy * dy;

                    if (dSq <= tower.range * tower.range) {
                        target = enemy;
                        break; // Stop at the first (furthest) enemy found
                    }
                }
            }

            if (target) {
                tower.targetId = target.id;
                const angle = Math.atan2(target.y - towerCy, target.x - towerCx);
                tower.rotation = angle;

                if (tower.lastFired >= cooldown) {
                    tower.lastFired -= cooldown; // Preserve overflow for accurate DPS
                    this.sound.playShoot(tower.type);

                    const dx = target.x - towerCx;
                    const dy = target.y - towerCy;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const arcHeight = tower.type === TowerType.CANNON ? dist * 0.5 : dist * 0.2;
                    const projectileSpeed = TOWER_STATS[tower.type].projectileSpeed;
                    const color = tower.type === TowerType.FROST ? 'bg-cyan-300' : (tower.type === TowerType.CANNON ? 'bg-stone-900' : 'bg-yellow-200');

                    this.entities.spawnProjectile(
                        tower.id,
                        target.id,
                        towerCx,
                        towerCy - 10,
                        projectileSpeed,
                        tower.damage,
                        color,
                        arcHeight,
                        tower.aoeRadius,
                        tower.slowFactor,
                        tower.slowDuration
                    );
                }
            } else {
                tower.targetId = null;
            }
        });
    }
}
