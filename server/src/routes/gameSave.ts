import express from 'express';
import { syncSave } from '../controllers/gameSaveController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.post('/sync', authenticateToken, syncSave);

export default router;
