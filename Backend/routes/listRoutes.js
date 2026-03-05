import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import {
  createUserList,
  getMyLists,
  getMyListById,
  updateMyList,
  deleteMyList,
} from '../controllers/listController.js';

const router = express.Router();

router.post('/', authenticateToken, createUserList);      // Create
router.get('/', authenticateToken, getMyLists);           // Read all
router.get('/:id', authenticateToken, getMyListById);     // Read one
router.patch('/:id', authenticateToken, updateMyList);    // Update
router.delete('/:id', authenticateToken, deleteMyList);   // Delete

export default router;
