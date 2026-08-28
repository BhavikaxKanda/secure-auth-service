import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/rbac.middleware.js';
import {
  getAllRoles,
  createRole,
  assignPermissionsToRole,
  getAllPermissions,
  createPermission,
} from '../controllers/role.controller.js';

const router = Router();

// All role and permission routes require ADMIN role
router.use(authenticate, requireRole('ADMIN'));

router.get('/roles', getAllRoles);
router.post('/roles', createRole);
router.put('/roles/:roleId/permissions', assignPermissionsToRole);

router.get('/permissions', getAllPermissions);
router.post('/permissions', createPermission);

export default router;