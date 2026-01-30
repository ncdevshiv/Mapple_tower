"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputLogger = void 0;
class InputLogger {
    constructor() {
        this.inputs = [];
        this.startTime = Date.now();
    }
    log(tick, type, payload) {
        this.inputs.push({
            tick: Math.round(tick), // Ensure integer ticks
            type,
            payload
        });
    }
    getReplayData(seed, finalScore, finalWave) {
        return {
            seed,
            inputs: [...this.inputs],
            finalScore,
            finalWave,
            duration: Date.now() - this.startTime
        };
    }
    clear() {
        this.inputs = [];
        this.startTime = Date.now();
    }
}
exports.InputLogger = InputLogger;
