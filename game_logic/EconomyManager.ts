import { GameState, TowerType } from '../types';
import { TOWER_STATS } from '../constants';

export class EconomyManager {
    constructor(private state: GameState) { }

    public getNetWorth(): number {
        const towerValue = this.state.towers.reduce((total, tower) => {
            // Calculate tower value including upgrades
            let value = TOWER_STATS[tower.type].cost;
            // We could add upgrade costs here if we tracked them precisely in tower struct, 
            // but for now we'll approximate or need to store total investment on tower.
            // Currently tower.level implies investment.
            // Let's re-calculate from scratch based on level for accuracy if definitions change,
            // or better: The TowerManager should probably track "investedGold" on the tower object.
            // For now, let's use a rough heuristic based on base cost * level, effectively.
            // Actually, let's look at TOWER_STATS upgrades.
            const config = TOWER_STATS[tower.type];
            for (let i = 0; i < tower.level - 1; i++) {
                if (config.upgrades[i]) {
                    value += config.upgrades[i].cost;
                }
            }
            return total + value;
        }, 0);

        return this.state.gold + towerValue;
    }

    /**
     * Calculates the maximum theoretical DPS the player could have
     * if they spent all their current gold + sold all towers and rebought efficiently.
     * We assume the "Archer Tower" is the gold standard for pure single-target DPS efficiency.
     */
    public getTheoreticalMaxDPS(): number {
        const totalWealth = this.getNetWorth();

        // Find the most cost-efficient tower (DPS per Gold)
        let bestEfficiency = 0;
        Object.values(TOWER_STATS).forEach(tower => {
            const efficiency = tower.damage / tower.cost;
            if (efficiency > bestEfficiency) bestEfficiency = efficiency;
        });

        // Assume 90% of wealth is spent on towers (some buffer)
        const spendableWealth = totalWealth * 0.9;

        // Raw DPS
        const rawDPS = spendableWealth * bestEfficiency;

        // Efficiency Factor: Players aren't perfect.
        // Towers aren't always shooting (range, travel time).
        // Let's assume 70% accepted efficiency for "Perfect Strategy" in a real game context.
        // If we demand 100%, the game becomes frame-perfect. 70% allows for placement errors.
        return rawDPS * 0.7;
    }

    public predictFutureWealth(currentWaveReward: number): number {
        return this.getNetWorth() + currentWaveReward;
    }
}
