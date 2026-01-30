import { Request, Response } from 'express';
import pool from '../config/database';

export const getLeaderboard = async (req: Request, res: Response) => {
    try {
        const { levelId } = req.params;
        const limit = parseInt(req.query.limit as string) || 50;

        const result = await pool.query(
            `SELECT le.score, le.waves_survived, le.achieved_at, u.username 
       FROM leaderboard_entries le 
       JOIN users u ON le.user_id = u.id 
       WHERE le.level_id = $1 
       ORDER BY le.score DESC 
       LIMIT $2`,
            [levelId, limit]
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

import { VerificationService } from '../services/VerificationService';

export const submitScore = async (req: Request, res: Response) => {
    try {
        const { levelId, replay } = req.body; // Expecting 'replay' object now
        // @ts-ignore
        const userId = req.user.id;

        if (!replay) {
            return res.status(400).json({ error: 'Replay data required' });
        }

        // 1. Verify Replay (The Anti-Cheat Check)
        const isValid = await VerificationService.verify(replay);
        if (!isValid) {
            console.warn(`[Cheat Detection] User ${userId} failed replay verification`);
            return res.status(403).json({ error: 'Score verification failed' });
        }

        // Extract validated stats from replay (don't trust body params, trust replay)
        const score = replay.finalScore;
        const waves = replay.finalWave;

        // Simple upsert logic: keep highest score
        // Check existing
        const existing = await pool.query(
            'SELECT score FROM leaderboard_entries WHERE user_id = $1 AND level_id = $2',
            [userId, levelId]
        );

        if (existing.rows.length > 0 && existing.rows[0].score >= score) {
            return res.status(200).json({ message: 'Score not higher than previous best', updated: false });
        }

        // Upsert (Postgres ON CONFLICT)
        await pool.query(
            `INSERT INTO leaderboard_entries (user_id, level_id, waves_survived, score, gold_remaining, lives_remaining, play_time_seconds, achieved_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       ON CONFLICT (user_id, level_id) 
       DO UPDATE SET 
         score = EXCLUDED.score,
         waves_survived = EXCLUDED.waves_survived,
         gold_remaining = EXCLUDED.gold_remaining,
         lives_remaining = EXCLUDED.lives_remaining,
         play_time_seconds = EXCLUDED.play_time_seconds,
         achieved_at = NOW()`,
            [userId, levelId, waves, score, 0.5, 9, replay.duration / 1000] // Placeholder for gold/lives if not in replay payload yet
        );

        // Update user aggregates
        await pool.query('UPDATE users SET total_games_played = total_games_played + 1, total_waves_cleared = total_waves_cleared + $1 WHERE id = $2', [waves, userId]);

        res.json({ message: 'Score submitted successfully', updated: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
