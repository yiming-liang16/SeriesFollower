import bcrypt from 'bcrypt';
import User from '../models/User.js';
import crypto from 'crypto';

export async function createUser({ username, email, password, name }) {
  // 1) 本地注册必须有 password（双保险）
  if (!password) {
    const err = new Error('Password is required');
    err.statusCode = 400;
    throw err;
  }

  // 2) 检查 username 唯一
  const existingUsername = await User.findOne({ username });
  if (existingUsername) {
    const err = new Error('Username already exists');
    err.statusCode = 409;
    throw err;
  }

  // 3) 检查 email 唯一（统一小写）
  const normalizedEmail = email.toLowerCase();
  const existingEmail = await User.findOne({ email: normalizedEmail });
  if (existingEmail) {
    const err = new Error('Email already exists');
    err.statusCode = 409;
    throw err;
  }

  // 4) hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 5) 创建用户：明确 authProvider 是 local
  const user = await User.create({
    username,
    email: normalizedEmail,
    password: hashedPassword,
    name: name || '',
    authProvider: 'local', // ✅ 新增
  });

  return user;
}


export async function authenticateUser(username, password) {
  const user = await User.findOne({ username }).select('+password');

  if (!user) {
    return null;
  }

  // ✅ 关键：只允许 local 用户用密码登录
  if (user.authProvider !== 'local') {
    return null;
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return null;
  }

  user.password = undefined;
  return user;
}

export async function getUserById(userId) {
    const user = await User.findById(userId).select('-password'); //exclude password
    if(!user) {
     return null;
    }

    return user;
}

export async function updateProfile(userId, updates) {
    const allowedUpdates = ['name', 'bio', ];
    const safeUpdates = {};

    for (const key of allowedUpdates) {
        if(updates[key] !== undefined) {
            safeUpdates[key] = updates[key];
        }
    }
    const user = await User.findByIdAndUpdate( //findByIdAndUpdate from mongoose
        userId,
        safeUpdates, 
        { new: true, runValidators: true} //new: return the updated info, runValidators: throw errors
    );

    if(!user) {
        const err = new Error('User not found');
        err.statusCode = 404;
        throw err;
    }

    return user;

}

export async function updateAvatar(userId, avatarUrl) {
    const user = await User.findByIdAndUpdate (
        userId,
        { avatarUrl },
        { new: true}
    );

    if(!user) {
        const err = new Error ('User not found');
        err.statusCode = 404;
        throw err;
    }

    return user;
}

function buildUsername(email, sub) {
  const base = (email?.split('@')?.[0] || 'user')
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '');

  const suffix = (sub || crypto.randomUUID()).slice(0, 6);
  return `${base}_${suffix}`;
}

export async function findOrCreateGoogleUser({ email, name, picture, sub }) {
  if (!email) {
    const err = new Error('Google token has no email');
    err.statusCode = 400;
    throw err;
  }

  const normalizedEmail = email.toLowerCase();

  // 1) 先按 email 找
  let user = await User.findOne({ email: normalizedEmail });

  if (user) {
    // 如果用户原本是 local，你要允许“同邮箱 Google 登录”吗？
    // 我建议：允许登录，但把头像/名字补全（不强制改 provider）
    if (!user.name && name) user.name = name;
    if ((!user.avatarUrl || user.avatarUrl === '') && picture) user.avatarUrl = picture;
    await user.save();
    return user;
  }

  // 2) 没有就创建一个 google 用户
  let username = buildUsername(normalizedEmail, sub);

  // 避免 username 冲突（极小概率）
  while (await User.findOne({ username })) {
    username = buildUsername(normalizedEmail, crypto.randomUUID());
  }

  user = await User.create({
    username,
    email: normalizedEmail,
    name: name || username,
    avatarUrl: picture || '',
    authProvider: 'google',
    // password 不填（因为你模型已支持 google 无 password）
  });

  return user;
}


