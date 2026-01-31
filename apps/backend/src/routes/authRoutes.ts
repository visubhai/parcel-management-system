import express from 'express';
import { login } from '../controllers/authController';
import { validate } from '../middleware/validate';
import { loginSchema } from '../validations/auth';

import { authRateLimiter } from '../middleware/rateLimiter';

const router = express.Router();

router.post('/login', authRateLimiter, validate(loginSchema), login);

export default router;
