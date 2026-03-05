import express from 'express';
import {
  signUp,
  signIn,
  getMe,
  updateMe,
  updateMyAvatar,
  googleSignIn
} from '../controllers/userController.js';

import { authenticateToken } from '../middlewares/authMiddleware.js';
import { uploadAvatar } from '../middlewares/uploadAvatar.js';


const router = express.Router();

/**
 * Public routes (no token required)
 */

// POST /api/users/signup
router.post('/signup', signUp);

// POST /api/users/signin
router.post('/signin', signIn);
router.post('/google', googleSignIn);

//avartar
router.post('/me/avatar', authenticateToken, uploadAvatar.single('avatar'), updateMyAvatar);
/**
 * Protected routes (token required)
 */

router.get('/me', authenticateToken, getMe);
router.patch('/me', authenticateToken, updateMe);

export default router;

