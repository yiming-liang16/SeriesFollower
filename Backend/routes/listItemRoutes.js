import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import {
  createListItem,
  deleteListItem,
  getListItems,
} from '../controllers/listItemController.js';

const router = express.Router();

// GET /api/lists/:listId/items
router.get('/lists/:listId/items', authenticateToken, getListItems);

// POST /api/lists/:listId/items   body: { titleId }
router.post('/lists/:listId/items', authenticateToken, createListItem);

// DELETE /api/lists/:listId/items/:titleId
router.delete('/lists/:listId/items/:titleId', authenticateToken, deleteListItem);

export default router;