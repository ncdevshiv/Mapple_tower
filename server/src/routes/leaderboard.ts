import express from 'express';
import { getLeaderboard, submitScore } from '../controllers/leaderboardController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/:levelId', getLeaderboard);
router.post('/submit', authenticateToken, submitScore);

export default router;
