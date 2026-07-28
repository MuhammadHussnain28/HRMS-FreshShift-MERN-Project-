import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const hashRefreshToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const generateTokens = (payload) => {
  const accessToken = jwt.sign(
    { ...payload, jti: crypto.randomUUID() },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' }
  );

  const refreshToken = jwt.sign(
    { ...payload, jti: crypto.randomUUID() },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
  );

  return { accessToken, refreshToken };
};

export const registerUser = async (userData) => {
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    const error = new Error('Email already registered');
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create(userData);

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.refreshTokenHash;

  return userObj;
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email }).select('+password +refreshTokenHash');
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  if (user.employmentStatus !== 'active') {
    const error = new Error('Account is not active. Contact HR administrator.');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const tokens = generateTokens({ id: user._id, role: user.role });

  const refreshHash = hashRefreshToken(tokens.refreshToken);
  await User.findByIdAndUpdate(user._id, { refreshTokenHash: refreshHash });

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.refreshTokenHash;

  return { ...tokens, user: userObj };
};

export const refreshUserToken = async (rawRefreshToken) => {
  let decoded;
  try {
    decoded = jwt.verify(rawRefreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    const error = new Error('Invalid or expired refresh token');
    error.statusCode = 401;
    throw error;
  }

  const user = await User.findById(decoded.id).select('+refreshTokenHash');
  if (!user || !user.refreshTokenHash) {
    const error = new Error('Invalid refresh token. Please login again.');
    error.statusCode = 401;
    throw error;
  }

  const incomingHash = hashRefreshToken(rawRefreshToken);
  if (incomingHash !== user.refreshTokenHash) {
    const error = new Error('Refresh token has been revoked. Please login again.');
    error.statusCode = 401;
    throw error;
  }

  const tokens = generateTokens({ id: user._id, role: user.role });

  const refreshHash = hashRefreshToken(tokens.refreshToken);
  await User.findByIdAndUpdate(user._id, { refreshTokenHash: refreshHash });

  return tokens;
};

export const logoutUser = async (userId) => {
  await User.findByIdAndUpdate(userId, { $unset: { refreshTokenHash: 1 } });
};
