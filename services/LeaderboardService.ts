const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
import { AuthService } from './AuthService';
import { ReplayData } from './InputLogger';

export interface LeaderboardEntry {
    username: string;
    score: number;
    waves_survived: number;
    achieved_at: string;
}

export class LeaderboardService {
    static async getLeaderboard(levelId: number): Promise<LeaderboardEntry[]> {
        const res = await fetch(`${API_URL}/leaderboard/${levelId}`);
        if (!res.ok) return [];
        return await res.json();
    }

    static async submitScore(levelId: number, replay: ReplayData) {
        if (!AuthService.isAuthenticated()) return;

        const token = AuthService.getToken();
        await fetch(`${API_URL}/leaderboard/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ levelId, replay })
        });
    }
}
