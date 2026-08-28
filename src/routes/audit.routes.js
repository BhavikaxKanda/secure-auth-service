import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/rbac.middleware.js';
import { getAuditLogs, getSecurityMetrics } from '../controllers/audit.controller.js';

const router = Router();

router.use(authenticate, requireRole('ADMIN'));

router.get('/logs', getAuditLogs);
router.get('/metrics', getSecurityMetrics);

export default router;