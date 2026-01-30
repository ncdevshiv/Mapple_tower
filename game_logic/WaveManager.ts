import { GameState, EnemyType, TileType, TowerType } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, ENEMY_STATS, TOWER_STATS, TILE_SIZE, GRID_COLS, GRID_ROWS, createEmptyGrid, applyPathToGrid } from '../constants';
import { EntityManager } from './EntityManager';
import { ISoundManager, IVFXManager } from './ISystems';
import { SeededRNG } from '../services/SeededRNG';

export class WaveManager {
    private waveQueue: { type: EnemyType; count: number }[] = [];
    private waveTimer: number = 0;
    private spawnTimer: number = 0;

    constructor(
        private state: GameState,
        private entities: EntityManager,
        private vfx: IVFXManager,
        private sound: ISoundManager,
        private getDifficultyMultiplier: () => number,
        private getTheoreticalDPS: () => number,
        private rng: SeededRNG
    ) { }

    public startNextWave(currentLevelConfig: any) {
        this.sound.init();
        if (this.state.isWaveActive) return;

        // Map Shift Logic for Wave 6/12/18...
        if (this.state.wave > 0 && this.state.wave % 6 === 0) {
            this.regenerateMap();
            this.entities.spawnFloatingText(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, "MAP SHIFT!", "#f472b6");
            this.sound.playUI('upgrade');
        }

        let waveConfig = currentLevelConfig.waves[this.state.wave];

        // Auto-generate if out of config
        if (!waveConfig) {
            const count = 10 + Math.floor(this.state.wave * 1.5);
            const types = [EnemyType.GRUNT, EnemyType.RUNNER, EnemyType.TANK, EnemyType.SHIELDED];
            const randomType = types[Math.floor(this.rng.float() * types.length)];
            waveConfig = {
                enemies: [{ type: randomType, count: count }],
                interval: Math.max(200, 1000 - this.state.wave * 20)
            };
        }

        // --- BALANCE GUARANTEE SYSTEM ---
        const balancedEnemies = this.balanceWave(waveConfig.enemies, waveConfig.interval);
        this.waveQueue = balancedEnemies.map(e => ({ ...e }));

        this.state.wave++;
        this.state.isWaveActive = true;
        this.waveTimer = waveConfig.interval;
        this.spawnTimer = waveConfig.interval;

        this.sound.playUI('click');
    }

    private balanceWave(enemies: { type: EnemyType; count: number }[], interval: number): { type: EnemyType; count: number }[] {
        // 1. Calculate Player Potential DPS
        const theoreticalDPS = this.getTheoreticalDPS();

        // 2. Calculate Wave Threat
        let totalWaveHP = 0;
        const diffMult = this.getDifficultyMultiplier(); // Apply difficulty to HP
        enemies.forEach(group => {
            const stats = ENEMY_STATS[group.type];
            totalWaveHP += (stats.hp + (stats.shieldStrength || 0)) * group.count * diffMult;
        });

        // 3. Time Window to kill
        // Path length in pixels / Average speed
        const pathLength = this.state.currentPath.length * TILE_SIZE;
        const avgSpeed = 1.0 * TILE_SIZE; // Rough average
        const timeToCross = pathLength / avgSpeed; // Seconds

        const requiredDPS = totalWaveHP / timeToCross;

        console.log(`[Balance] Potential DPS: ${theoreticalDPS.toFixed(2)}, Required DPS: ${requiredDPS.toFixed(2)}`);

        // 4. Check & Nerf if needed
        // If we need more DPS than we theoretically have (with a safety margin of 1.0, meaning tight balance)
        // We strictly enforce: Player MUST be able to win
        if (requiredDPS > theoreticalDPS) {
            const nerfFactor = theoreticalDPS / requiredDPS;
            console.log(`[Balance] Nerfing wave by factor ${nerfFactor.toFixed(2)} to ensure winnability.`);

            // Reduce counts or HP (we can't easily change HP per enemy dynamically without messing up types stats, so we reduce counts)
            return enemies.map(group => ({
                type: group.type,
                count: Math.max(1, Math.floor(group.count * nerfFactor * 0.95)) // 5% extra safety
            }));
        }
        // 5. Check & Buff if too easy (User Request: "result in score loss and health damage" if bad placement)
        // If the player is overpowered (Theoretical DPS >> Required DPS), we scale UP the wave.
        // This ensures that even with upgrades, the game remains "Competitive".
        else {
            const buffThreshold = 1.5; // If player has 1.5x more DPS than needed
            const dpsRatio = theoreticalDPS / Math.max(1, requiredDPS);

            if (dpsRatio > buffThreshold) {
                // Buff factor shouldn't be linear to avoid punishing success too hard, but enough to sweat.
                // Scale wave to match ~80% of Theoretical DPS.
                const targetDPS = theoreticalDPS * 0.8;
                const buffFactor = targetDPS / Math.max(1, requiredDPS);

                console.log(`[Balance] Buffing wave by factor ${buffFactor.toFixed(2)} to maintain challenge.`);

                return enemies.map(group => ({
                    type: group.type,
                    count: Math.ceil(group.count * buffFactor)
                }));
            }
        }

        return enemies;
    }

    public update(deltaTime: number, currentLevelConfig: any, onWaveEnd: (victory: boolean) => void) {
        if (this.state.isWaveActive) {
            this.spawnTimer += deltaTime;
            const currentWaveDelay = currentLevelConfig.waves[this.state.wave - 1]?.interval || 1000;

            if (this.spawnTimer >= currentWaveDelay && this.waveQueue.length > 0) {
                const groupIndex = this.waveQueue.findIndex(g => g.count > 0);
                if (groupIndex !== -1) {
                    const group = this.waveQueue[groupIndex];
                    this.entities.spawnEnemy(group.type);
                    group.count--;
                    this.spawnTimer = 0;
                }
            }

            const allSpawned = this.waveQueue.every(g => g.count <= 0);
            if (allSpawned && this.state.enemies.length === 0) {
                this.state.isWaveActive = false;

                // Check for Level End
                if (this.state.levelIndex < 3 && this.state.wave >= currentLevelConfig.waves.length && this.state.wave % 6 !== 0) {
                    onWaveEnd(true);
                }
            }
        }
    }

    private regenerateMap() {
        const newPath = this.generateRandomPath();
        const newGrid = createEmptyGrid();
        applyPathToGrid(newGrid, newPath);
        this.state.currentPath = newPath;
        this.state.currentGrid = newGrid;

        // Refund towers on invalid spots
        this.state.towers = this.state.towers.filter(t => {
            if (newGrid[t.gridY][t.gridX] !== TileType.BUILDABLE) {
                const cost = TOWER_STATS[t.type].cost;
                this.state.gold += cost;
                this.vfx.spawnGold(t.gridX * TILE_SIZE + TILE_SIZE / 2, t.gridY * TILE_SIZE);
                return false;
            }
            return true;
        });
        // Kill existing enemies for fairness on map shift (or could teleport them, but kill is safer)
        this.state.enemies = [];
    }

    private generateRandomPath() {
        // ... Logic from original GameEngine ...
        // Duplicating specific logic briefly for self-containment or could share util
        // For brevity, rewriting the simple random path logic:
        // ... Logic from original GameEngine ...
        // Duplicating specific logic briefly for self-containment or could share util
        // For brevity, rewriting the simple random path logic:
        const startY = this.rng.int(1, GRID_ROWS - 2);
        const path = [{ x: 0, y: startY }];
        let currentX = 0;
        let currentY = startY;

        while (currentX < GRID_COLS - 1) {
            const moves = [];
            moves.push({ x: currentX + 1, y: currentY });
            if (currentY > 1 && (path.length < 2 || path[path.length - 2].y >= currentY)) moves.push({ x: currentX, y: currentY - 1 });
            if (currentY < GRID_ROWS - 2 && (path.length < 2 || path[path.length - 2].y <= currentY)) moves.push({ x: currentX, y: currentY + 1 });

            const r = this.rng.float();
            let nextMove;
            if (r < 0.6 || currentX === GRID_COLS - 2) nextMove = { x: currentX + 1, y: currentY };
            else {
                const verticalMoves = moves.filter(m => m.x === currentX);
                nextMove = verticalMoves.length > 0 ? this.rng.pick(verticalMoves) : { x: currentX + 1, y: currentY };
            }

            if (!path.find(p => p.x === nextMove.x && p.y === nextMove.y)) {
                path.push(nextMove);
                currentX = nextMove.x;
                currentY = nextMove.y;
            } else {
                currentX++;
                path.push({ x: currentX, y: currentY });
            }
        }
        return path;
    }
}
