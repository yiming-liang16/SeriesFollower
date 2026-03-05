import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export function sign(payload, expiresIn = '7d') {
  if (!JWT_SECRET) throw new Error('JWT_SECRET is not set');
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verify(token) {
  if (!JWT_SECRET) throw new Error('JWT_SECRET is not set');
  return jwt.verify(token, JWT_SECRET);
}
