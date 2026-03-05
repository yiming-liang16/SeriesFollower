import { verify } from '../services/jwtService.js';
import { getUserById } from '../services/userService.js';

export const authenticateToken = async (req, res, next) => {
  try {
    // 1) Get token from Authorization header: "Bearer <token>"
    const authHeader = req.headers.authorization; 
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required',
      });
    }

    // 2) Verify token (will throw if invalid/expired)
    const decoded = verify(token);

    const userId = decoded?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token payload',
      });
    }

    // 3) Fetch user from DB (ensure user still exists)
    const user = await getUserById(userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token - user not found',
      });
    }

    /**
     * 4) Attach user to request for controllers */

    req.user = { id: String(user._id), isAdmin: user.isAdmin };

    return next();
  } catch (error) {
    console.error('Authentication error:', error.message);

    // token 无效/过期
    return res.status(403).json({
      success: false,
      error: 'Invalid or expired token',
    });
  }
};

/**
 * requireAdmin
 */

export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      error: 'Admin access required',
    });
  }

  return next();
};
