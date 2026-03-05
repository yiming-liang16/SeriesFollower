import { signUpSchema, signInSchema, updateProfileSchema, updateAvatarSchema } from '../validators/auth.js';
import {
  createUser,
  authenticateUser,
  getUserById,
  updateProfile,
  updateAvatar,
  findOrCreateGoogleUser
} from '../services/userService.js';
import { sign } from '../services/jwtService.js';
import { verifyGoogleIdToken } from '../services/googleAuthService.js';
import jwt from "jsonwebtoken";

export const signUp = async (req, res) => {
  try {
    console.log("RAW BODY:", req.body);

    // 1) validate request body
    const userData = await signUpSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    console.log("VALIDATED DATA:", userData);

    // 2) create user
    const user = await createUser(userData);

    // 3) ✅ create token (用你 login 同款的签发方式)
    // 例子：如果你 login 用的是 jwt.sign({ sub: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })
    // 那这里也用同样的
    const token = jwt.sign(
      { sub: user._id.toString() },          // payload：最常用 sub
      process.env.JWT_SECRET,                // secret
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    // 4) remove sensitive fields
    const safeUser = user?.toObject ? user.toObject() : { ...user };
    delete safeUser.password;
    delete safeUser.__v;

    // 5) return response (✅ 带 token)
    return res.status(201).json({
      success: true,
      message: "Sign up successful",
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error("SignUp error:", error.message);
    console.error("Full error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: error.errors?.join(", ") || "Validation failed",
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: "Username or email already exists",
      });
    }

    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

export const signIn = async (req, res, next) => {
  try {

    const userData = await signInSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    const user = await authenticateUser(userData.username, userData.password);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid username or password',
      });
    }

    const token = sign({ userId: user._id.toString() });

    return res.json({
      success: true,
      message: 'Sign in successful',
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
    try {
        const userId = req.user?.id;

        if(!userId) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
            });
        }

        const user = await getUserById(userId);

        if(!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
            });
        }

        return res.json({
            success: true,
            user,
        });
    } catch (error) {
        next(error);
    }
}

export const updateMe = async (req, res, next) => {
    try {
        const userId = req.user?.id;

        if(!userId) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
            });
        }

        const updates = await updateProfileSchema.validate(req.body, {
         abortEarly: false,
         stripUnknown: true,
    });
        const user = await updateProfile(userId, updates);

        return res.json({
            success: true,
            message: 'Profile updated successfully',
            user,
        });
    } catch (error) {
        next(error);
    }
}

export const updateMyAvatar = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    console.log('BODY:', req.body);
    console.log('FILE:', req.file);

    let avatarUrl = req.body?.avatarUrl || '';

    if (req.file?.filename) {
      avatarUrl = `/uploads/avatars/${req.file.filename}`;
    }

    // ✅ 如果两种方式都没拿到，直接给更明确的错误
    if (!avatarUrl) {
      return res.status(400).json({
        success: false,
        error: 'No avatar provided (upload a file or send avatarUrl)',
      });
    }

    const data = await updateAvatarSchema.validate(
      { avatarUrl },
      { abortEarly: false, stripUnknown: true }
    );

    const user = await updateAvatar(userId, data.avatarUrl);

    return res.json({
      success: true,
      message: 'Avatar updated successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const googleSignIn = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        error: 'idToken is required',
      });
    }

    const payload = await verifyGoogleIdToken(idToken);

    const user = await findOrCreateGoogleUser({
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      sub: payload.sub,
    });

    const token = sign({ userId: user._id });

    return res.json({
      success: true,
      message: 'Google sign in successful',
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
};