
import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'clash_defense',
});

const migrate = async () => {
    try {
        const schemaPath = path.join(__dirname, '../../migrations/schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('Running schema...');
        await pool.query(schema);

        // Ensure columns exist (since CREATE IF NOT EXISTS won't add them)
        console.log('Ensuring columns exist...');
        await pool.query(`
            ALTER TABLE leaderboard_entries ADD COLUMN IF NOT EXISTS achieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
            ALTER TABLE leaderboard_entries ADD COLUMN IF NOT EXISTS play_time_seconds INTEGER DEFAULT 0;
            ALTER TABLE leaderboard_entries ADD COLUMN IF NOT EXISTS gold_remaining INTEGER DEFAULT 0;
            ALTER TABLE leaderboard_entries ADD COLUMN IF NOT EXISTS lives_remaining INTEGER DEFAULT 0;
        `);

        console.log('Migration completed successfully');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed', err);
        process.exit(1);
    }
};

migrate();
