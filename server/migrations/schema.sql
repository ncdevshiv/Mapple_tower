CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(32) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    gems INTEGER DEFAULT 0,
    total_games_played INTEGER DEFAULT 0,
    total_waves_cleared INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS leaderboard_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Score metrics
    level_id INTEGER NOT NULL,
    waves_survived INTEGER NOT NULL DEFAULT 0,
    score INTEGER NOT NULL DEFAULT 0,
    
    -- Game details
    gold_remaining INTEGER DEFAULT 0,
    lives_remaining INTEGER DEFAULT 0,
    towers_built INTEGER DEFAULT 0,
    play_time_seconds INTEGER DEFAULT 0,
    
    achieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, level_id)
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_level_score ON leaderboard_entries(level_id, score DESC);
