import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/rbac.middleware.js';
import { getAllUsers, updateUserRoleOrStatus } from '../controllers/user.controller.js';

const router = Router();

router.use(authenticate, requireRole('ADMIN'));

router.get('/', getAllUsers);
router.patch('/:userId', updateUserRoleOrStatus);

export default router;