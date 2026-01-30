import { GameState, TileType, TowerType } from '../types';
import { GRID_COLS, GRID_ROWS, TILE_SIZE, TOWER_STATS } from '../constants';

export class StrategyManager {
    private pathCoverageMap: Map<number, number[][]> = new Map(); // Range -> Grid Scores

    constructor(private state: GameState) { }

    /**
     * Pre-calculates or refreshes the "Heatmap" of valuable tiles.
     * A tile's value is determined by how many path segments are within Range.
     */
    public analyzeMap() {
        this.pathCoverageMap.clear();

        // Analyze for common ranges (Arrow ~160, Cannon ~130)
        const ranges = [TOWER_STATS[TowerType.ARROW].range, TOWER_STATS[TowerType.CANNON].range];

        ranges.forEach(range => {
            const heatGrid: number[][] = Array(GRID_ROWS).fill(0).map(() => Array(GRID_COLS).fill(0));

            for (let y = 0; y < GRID_ROWS; y++) {
                for (let x = 0; x < GRID_COLS; x++) {
                    if (this.state.currentGrid[y][x] !== TileType.BUILDABLE) continue;

                    const cx = x * TILE_SIZE + TILE_SIZE / 2;
                    const cy = y * TILE_SIZE + TILE_SIZE / 2;

                    let score = 0;
                    // Sample points along the path to estimate "Time on Target"
                    // We iterate simply through path nodes for now, but better is to interpolate
                    // For efficiency, we just check distance to path nodes. 
                    // A better heuristic: Check how many 10px segments of the path are in range.

                    const path = this.state.currentPath;
                    let segmentsInRange = 0;

                    for (let i = 0; i < path.length - 1; i++) {
                        const p1 = path[i];
                        const p2 = path[i + 1];

                        // Check snippet center
                        const mx = (p1.x + p2.x) / 2 * TILE_SIZE + TILE_SIZE / 2;
                        const my = (p1.y + p2.y) / 2 * TILE_SIZE + TILE_SIZE / 2;

                        const distSq = (cx - mx) ** 2 + (cy - my) ** 2;
                        if (distSq <= range ** 2) {
                            segmentsInRange++;
                        }
                    }

                    heatGrid[y][x] = segmentsInRange;
                }
            }
            this.pathCoverageMap.set(range, heatGrid);
        });
    }

    public getBestBuildingSpot(towerType: TowerType): { x: number, y: number, score: number } | null {
        if (this.pathCoverageMap.size === 0) this.analyzeMap();

        const range = TOWER_STATS[towerType].range;
        // Get closest cached map
        const cachedRanges = Array.from(this.pathCoverageMap.keys());
        const bestRangeKey = cachedRanges.reduce((prev, curr) => Math.abs(curr - range) < Math.abs(prev - range) ? curr : prev);
        const grid = this.pathCoverageMap.get(bestRangeKey);

        if (!grid) return null;

        let bestScore = -1;
        let bestSpot = null;

        for (let y = 0; y < GRID_ROWS; y++) {
            for (let x = 0; x < GRID_COLS; x++) {
                // Must be buildable and empty of existing towers
                if (this.state.currentGrid[y][x] !== TileType.BUILDABLE) continue;
                if (this.state.towers.some(t => t.gridX === x && t.gridY === y)) continue;

                if (grid[y][x] > bestScore) {
                    bestScore = grid[y][x];
                    bestSpot = { x, y, score: bestScore };
                }
            }
        }

        return bestSpot;
    }

    public getNextBestMove(currentGold: number): { action: 'BUILD' | 'WAIT', type?: TowerType, x?: number, y?: number } {
        // Simple Greedy Strategy:
        // Always try to build the most efficient tower (Arrow) in the best available spot.

        const arrowCost = TOWER_STATS[TowerType.ARROW].cost;
        const bestSpot = this.getBestBuildingSpot(TowerType.ARROW);

        if (!bestSpot) return { action: 'WAIT' }; // Map full?

        if (currentGold >= arrowCost) {
            return { action: 'BUILD', type: TowerType.ARROW, x: bestSpot.x, y: bestSpot.y };
        } else {
            return { action: 'WAIT' }; // Saving for next tower
        }
    }
}
