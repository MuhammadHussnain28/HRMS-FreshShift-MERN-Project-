import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import {
  registerUser,
  loginUser,
  refreshUserToken,
  logoutUser,
} from '../services/authService.js';

export const register = asyncHandler(async (req, res) => {
  const user = await registerUser(req.body);
  return sendSuccess(res, user, 'Employee registered successfully', 201);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await loginUser(email, password);
  return sendSuccess(res, result, 'Login successful');
});

export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;
  const tokens = await refreshUserToken(token);
  return sendSuccess(res, tokens, 'Tokens refreshed successfully');
});

export const logout = asyncHandler(async (req, res) => {
  await logoutUser(req.user.id);
  return sendSuccess(res, null, 'Logged out successfully');
});
