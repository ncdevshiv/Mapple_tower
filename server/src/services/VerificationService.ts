// ReplayData definition duplicated for server independence

export interface ReplayData {
    seed: number;
    inputs: any[];
    finalScore: number;
    finalWave: number;
    duration: number;
}

export class VerificationService {
    static async verify(replay: ReplayData): Promise<boolean> {
        console.log('[Verifier] Verifying replay:', replay.seed, replay.finalScore);

        // TODO: Isolate GameEngine for Node execution. 
        // For now, "Mock" verification that always passes if structure is valid,
        // to verify pipeline works.
        // Real implementation requires running the actual GameEngine here.
        // Since GameEngine is in 'f:/td2/services', importing it into 'f:/td2/server' 
        // might require TS path tweaks or build steps.

        // Minimal logic: inputs must exist
        if (!replay.inputs || !Array.isArray(replay.inputs)) return false;

        return true;
    }
}
