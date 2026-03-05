import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { addItem, removeItem, getMyItems, updateItemStatus } from '../controllers/watchlistController.js';

const router = express.Router();

// POST /api/watchlist  (token required)
router.post('/', authenticateToken, addItem);
router.delete('/:titleId', authenticateToken, removeItem);

// GET /api/watchlist
router.get('/', authenticateToken, getMyItems);

router.patch('/:titleId', authenticateToken, updateItemStatus);

export default router;
