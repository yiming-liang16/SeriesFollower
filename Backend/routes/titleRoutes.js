import express from 'express';
import { search, getOne, getMyTitleStatus, create, update } from '../controllers/titleController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { uploadPoster } from '../middlewares/uploadPoster.js';

const router = express.Router();

router.get('/', search);
router.post('/', authenticateToken, uploadPoster.single('poster'), create);
router.patch('/:id', authenticateToken, uploadPoster.single('poster'), update);
router.get('/:id/me', authenticateToken, getMyTitleStatus);
router.get('/:id', getOne);

export default router;
