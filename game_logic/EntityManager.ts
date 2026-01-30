import { GameState, ActiveEnemy, ActiveProjectile, FloatingText, EnemyType } from '../types';
import { TILE_SIZE, ENEMY_STATS, CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants';
import { IVFXManager, ISoundManager } from './ISystems';
import { SeededRNG } from '../services/SeededRNG';

// Helper to generate IDs
const uuid = (rng: SeededRNG) => rng.uuid();

export class EntityManager {
    constructor(
        private state: GameState,
        private vfx: IVFXManager,
        private sound: ISoundManager,
        private getDifficultyMultiplier: () => number,
        private rng: SeededRNG
    ) { }

    public spawnEnemy(type: EnemyType) {
        const config = ENEMY_STATS[type];
        const startNode = this.state.currentPath[0];
        const difficultyMult = this.getDifficultyMultiplier();

        this.state.enemies.push({
            id: uuid(this.rng),
            type,
            x: startNode.x * TILE_SIZE + TILE_SIZE / 2,
            y: startNode.y * TILE_SIZE + TILE_SIZE / 2,
            pathIndex: 0,
            hp: config.hp * difficultyMult,
            maxHp: config.hp * difficultyMult,
            speed: config.speed,
            shield: config.shieldStrength ? config.shieldStrength * difficultyMult : 0,
            slowTimer: 0,
            frozen: false,
            incomingDamage: 0,
        });
    }

    public spawnProjectile(
        towerId: string,
        targetId: string,
        startX: number,
        startY: number,
        speed: number,
        damage: number,
        color: string,
        arcHeight: number,
        aoeRadius?: number,
        slowFactor?: number,
        slowDuration?: number
    ) {
        this.state.projectiles.push({
            id: uuid(this.rng),
            towerId,
            targetId,
            startX,
            startY,
            x: startX,
            y: startY,
            progress: 0,
            speed,
            damage,
            aoeRadius,
            slowFactor,
            slowDuration,
            hasHit: false,
            color,
            arcHeight
        });
    }

    public spawnFloatingText(x: number, y: number, text: string, color: string) {
        const rX = (this.rng.float() - 0.5) * 20;
        this.state.effects.push({
            id: uuid(this.rng),
            x: x + rX,
            y,
            text,
            color,
            life: 1000
        });
    }

    public update(deltaTime: number, speedMultiplier: number) {
        // ROBUSTNESS FIX: Recalculate incomingDamage from scratch every frame.
        // This prevents "drift" where enemies become invincible because we missed a decrement.
        this.state.enemies.forEach(e => e.incomingDamage = 0);
        this.state.projectiles.forEach(p => {
            if (!p.hasHit) {
                // For AOE, we should technically add to all in radius, but for Doomed checks,
                // primary target is usually sufficient. 
                // Let's stick to primary target for now to avoid O(N^2) every frame.
                const target = this.state.enemies.find(e => e.id === p.targetId);
                if (target) {
                    target.incomingDamage += p.damage;
                }
            }
        });

        this.updateEnemies(deltaTime);
        this.updateProjectiles(deltaTime);
        this.updateEffects(deltaTime, speedMultiplier);
    }

    private updateEnemies(deltaTime: number) {
        for (let i = this.state.enemies.length - 1; i >= 0; i--) {
            const enemy = this.state.enemies[i];
            let currentSpeed = enemy.speed;

            if (enemy.slowTimer > 0) {
                enemy.slowTimer -= deltaTime;
                currentSpeed *= 0.5;
                enemy.frozen = true;
            } else {
                enemy.frozen = false;
            }

            const path = this.state.currentPath;
            if (enemy.pathIndex < path.length - 1) {
                const nextNode = path[enemy.pathIndex + 1];
                const targetX = nextNode.x * TILE_SIZE + TILE_SIZE / 2;
                const targetY = nextNode.y * TILE_SIZE + TILE_SIZE / 2;
                const dx = targetX - enemy.x;
                const dy = targetY - enemy.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const moveDist = (currentSpeed * deltaTime) / 1000;

                if (dist <= moveDist) {
                    enemy.x = targetX;
                    enemy.y = targetY;
                    enemy.pathIndex++;
                } else {
                    enemy.x += (dx / dist) * moveDist;
                    enemy.y += (dy / dist) * moveDist;
                }
            } else {
                // Reached end
                this.state.lives--;
                this.state.enemies.splice(i, 1);
                this.spawnFloatingText(enemy.x, enemy.y, "-1 ❤", "#ef4444");
                this.sound.playUI('error');
                continue;
            }
        }
    }

    private updateProjectiles(deltaTime: number) {
        for (let i = this.state.projectiles.length - 1; i >= 0; i--) {
            const proj = this.state.projectiles[i];
            const target = this.state.enemies.find(e => e.id === proj.targetId);

            if (!target) {
                // Target dead/gone, remove projectile
                this.state.projectiles.splice(i, 1);
                continue;
            }

            // Optimization cleanup if projectile is somehow removed elsewhere or logic changes, 
            // but for now, we only care about 'hit' or 'miss' logic flows. 
            // Actually, if we add 'miss' logic later, we must decrement.
            // For now, let's just leave it, as 'incomingDamage' being slightly high is safer (towers shoot someone else) than too low.

            const totalDist = Math.sqrt(Math.pow(target.x - proj.startX, 2) + Math.pow(target.y - proj.startY, 2));
            const travelTime = (totalDist / proj.speed) * 1000;
            const step = deltaTime / travelTime;
            proj.progress += step;

            if (proj.progress >= 1) {
                this.applyDamage(target, proj);
                this.state.projectiles.splice(i, 1);
            } else {
                const curX = proj.startX + (target.x - proj.startX) * proj.progress;
                const curY = proj.startY + (target.y - proj.startY) * proj.progress;
                const zOffset = 4 * proj.arcHeight * proj.progress * (1 - proj.progress);
                proj.x = curX;
                proj.y = curY - zOffset;
            }
        }
    }

    private updateEffects(deltaTime: number, speedMultiplier: number) {
        for (let i = this.state.effects.length - 1; i >= 0; i--) {
            const fx = this.state.effects[i];
            fx.life -= deltaTime;
            fx.y -= 0.5 * (speedMultiplier > 1 ? 1.5 : 1);
            if (fx.life <= 0) this.state.effects.splice(i, 1);
        }
    }

    private applyDamage(primaryTarget: ActiveEnemy, proj: ActiveProjectile) {
        const enemiesToHit: ActiveEnemy[] = [];
        if (proj.aoeRadius) {
            const rSq = proj.aoeRadius * proj.aoeRadius;
            this.state.enemies.forEach(e => {
                const dx = e.x - primaryTarget.x;
                const dy = e.y - primaryTarget.y;
                if (dx * dx + dy * dy <= rSq) enemiesToHit.push(e);
            });
            this.vfx.spawnExplosion(primaryTarget.x, primaryTarget.y, '#f87171');
            this.sound.playHit();
        } else {
            enemiesToHit.push(primaryTarget);
            this.vfx.spawnHit(primaryTarget.x, primaryTarget.y, '#fff');
            this.sound.playHit();
        }

        enemiesToHit.forEach(e => {
            let actualDamage = proj.damage;
            if (e.shield > 0) {
                if (e.shield >= actualDamage) {
                    e.shield -= actualDamage;
                    actualDamage = 0;
                    this.spawnFloatingText(e.x, e.y - 20, 'BLOCKED', '#93c5fd');
                    this.vfx.spawnHit(e.x, e.y, '#3b82f6');
                } else {
                    actualDamage -= e.shield;
                    e.shield = 0;
                }
            }
            e.hp -= actualDamage;
            if (proj.slowFactor && proj.slowDuration) e.slowTimer = proj.slowDuration;
            if (e.hp <= 0) this.killEnemy(e);
        });
    }

    private killEnemy(enemy: ActiveEnemy) {
        const idx = this.state.enemies.findIndex(e => e.id === enemy.id);
        if (idx !== -1) {
            this.state.enemies.splice(idx, 1);
            this.state.gold += ENEMY_STATS[enemy.type].reward;
            this.spawnFloatingText(enemy.x, enemy.y, `+${ENEMY_STATS[enemy.type].reward}`, '#fbbf24');
            this.vfx.spawnGold(enemy.x, enemy.y);
        }
    }
}
