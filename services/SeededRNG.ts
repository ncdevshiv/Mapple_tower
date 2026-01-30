export class SeededRNG {
    private seed: number;

    constructor(seed: number) {
        this.seed = seed;
    }

    // Mulberry32 algorithm
    private next(): number {
        let t = this.seed += 0x6D2B79F5;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }

    // Float between [0, 1)
    public float(): number {
        return this.next();
    }

    // Int between [min, max] inclusive
    public int(min: number, max: number): number {
        return Math.floor(this.next() * (max - min + 1)) + min;
    }

    // Pick random element from array
    public pick<T>(array: T[]): T {
        return array[this.int(0, array.length - 1)];
    }

    // UUID replacement (Deterministic ID)
    public uuid(): string {
        return 'id_' + Math.floor(this.next() * 1000000000).toString(36);
    }
}
