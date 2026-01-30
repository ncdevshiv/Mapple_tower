export interface GameInput {
    tick: number;
    type: 'BUILD' | 'SELL' | 'UPGRADE' | 'MOVE' | 'START_WAVE' | 'TECH_TOGGLE' | 'SPEED';
    payload: any;
}

export interface ReplayData {
    seed: number;
    inputs: GameInput[];
    finalScore: number; // For validation
    finalWave: number;
    duration: number;
}

export class InputLogger {
    private inputs: GameInput[] = [];
    private startTime: number = Date.now();

    public log(tick: number, type: GameInput['type'], payload: any) {
        this.inputs.push({
            tick: Math.round(tick), // Ensure integer ticks
            type,
            payload
        });
    }

    public getReplayData(seed: number, finalScore: number, finalWave: number): ReplayData {
        return {
            seed,
            inputs: [...this.inputs],
            finalScore,
            finalWave,
            duration: Date.now() - this.startTime
        };
    }

    public clear() {
        this.inputs = [];
        this.startTime = Date.now();
    }
}
