import { Router } from 'express';
import { login, requestPasswordReset, resetPassword, validateTokenHandler } from '../controllers/auth.controller';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/login', login);
router.post('/request-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

router.get('/validate', authenticate, validateTokenHandler);

export default router; 