import { Request, Response } from 'express';
import pool from '../config/database';

export const syncSave = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.id;
        const profile = req.body; // Expecting UserProfile object

        // Upsert user gems and techs
        // For simplicity, we just update the 'gems' column in users table 
        // and a 'tech_tree' column if we had one. 
        // The plan mentioned 'game_saves' table for slot saves, 
        // but PersistenceManager currently just sends the whole profile containing gems/techs.

        // Let's stick to updating the 'users' table for global progression (gems)
        // and maybe store techs there too if we add a column, or just 'game_saves'

        // Updating 'users' table with gems
        await pool.query('UPDATE users SET gems = $1 WHERE id = $2', [profile.gems, userId]);

        // TODO: Handle tech tree persistence properly in a dedicated table or JSON column
        // For now, we acknowledge receipt

        res.json({ success: true, message: 'Progress synced' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
