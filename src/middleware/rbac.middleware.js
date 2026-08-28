import prisma from '../config/prisma.js';

/**
 * Middleware to restrict access based on user role
 * @param  {...string} allowedRoles 
 */
export const requireRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.roleId) {
        return res.status(403).json({ success: false, message: 'Access denied: No role assigned' });
      }

      const role = await prisma.role.findUnique({
        where: { id: req.user.roleId },
      });

      if (!role || !allowedRoles.includes(role.name)) {
        return res.status(403).json({ success: false, message: 'Access denied: Insufficient permissions' });
      }

      req.role = role;
      next();
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Authorization error', error: error.message });
    }
  };
};

/**
 * Middleware to restrict access based on granular permission
 * @param {string} requiredPermission 
 */
export const requirePermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.roleId) {
        return res.status(403).json({ success: false, message: 'Access denied: No role assigned' });
      }

      const role = await prisma.role.findUnique({
        where: { id: req.user.roleId },
        include: { permissions: true },
      });

      if (!role) {
        return res.status(403).json({ success: false, message: 'Access denied: Role not found' });
      }

      const hasPermission = role.permissions.some((p) => p.name === requiredPermission);

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: `Access denied: Missing permission '${requiredPermission}'`,
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Permission check error', error: error.message });
    }
  };
};