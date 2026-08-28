import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  getUserSessions,
  revokeSession,
  revokeAllOtherSessions,
} from '../controllers/session.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', getUserSessions);
router.delete('/:sessionId', revokeSession);
router.post('/revoke-others', revokeAllOtherSessions);

export default router;