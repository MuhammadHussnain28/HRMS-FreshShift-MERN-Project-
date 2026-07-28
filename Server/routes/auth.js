import express from 'express';
import { register, login, refreshToken, logout } from '../controllers/authController.js';
import verifyToken from '../middlewares/verifyToken.js';
import authorize from '../middlewares/authorize.js';
import validate from '../middlewares/validate.js';
import authRateLimiter from '../middlewares/rateLimiter.js';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from '../validators/authValidators.js';

const router = express.Router();

router.post('/register', verifyToken, authorize('hr_admin'), validate(registerSchema), register);
router.post('/login', authRateLimiter, validate(loginSchema), login);
router.post('/refresh-token', authRateLimiter, validate(refreshTokenSchema), refreshToken);
router.post('/logout', verifyToken, logout);

export default router;
