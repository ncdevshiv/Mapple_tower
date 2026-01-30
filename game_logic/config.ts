export const GAME_LOGIC_CONFIG = {
    // AI / Auto-Pilot
    AI_THINK_INTERVAL_MS: 500, // How often the AI makes a decision

    // Difficulty Scaling
    DIFFICULTY_BASE_MULT: 1.0,
    DIFFICULTY_WAVE_SCALING: 0.15,
    DIFFICULTY_RICH_PLAYER_PENALTY: 0.2, // Extra hard if gold > 500
    DIFFICULTY_FULL_HP_PENALTY: 0.1,     // Extra hard if full lives
    DIFFICULTY_HIGH_LEVEL_PENALTY: 0.15, // Extra hard if towers likely upgraded

    // Rewards
    GEMS_BASE_REWARD: 10,
    GEMS_VICTORY_BONUS: 20,
};
