import { GameState } from '../types';

export interface ISoundManager {
    init(): void;
    playUI(key: string): void;
    playShoot(towerType: string): void;
    playHit(): void;
}

export interface IVFXManager {
    update(deltaTime: number): void;
    spawnExplosion(x: number, y: number, color: string): void;
    spawnHit(x: number, y: number, color: string): void;
    spawnGold(x: number, y: number): void;
}

export class HeadlessSoundManager implements ISoundManager {
    init() { }
    playUI() { }
    playShoot() { }
    playHit() { }
}

export class HeadlessVFXManager implements IVFXManager {
    update() { }
    spawnExplosion() { }
    spawnHit() { }
    spawnGold() { }
}
