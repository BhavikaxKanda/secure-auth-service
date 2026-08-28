import prisma from '../config/prisma.js';
import logger from '../utils/logger.js';

export const auditLog = (action, resource) => {
  return async (req, res, next) => {
    const originalSend = res.send;

    res.send = function (body) {
      res.send = originalSend;
      const responseBody = body;

      const statusCode = res.statusCode;
      const status = statusCode >= 200 && statusCode < 400 ? 'SUCCESS' : statusCode === 403 ? 'BLOCKED' : 'FAILED';

      prisma.auditLog.create({
        data: {
          userId: req.user ? req.user.id : null,
          action,
          resource,
          ipAddress: req.ip || req.headers['x-forwarded-for'] || 'unknown',
          userAgent: req.headers['user-agent'] || 'unknown',
          status,
          details: `Status: ${statusCode}`,
        },
      }).catch((err) => logger.error(`Audit log failed: ${err.message}`));

      logger.info(`[AUDIT] Action: ${action} | Resource: ${resource} | Status: ${status} | IP: ${req.ip}`);

      return res.send(responseBody);
    };

    next();
  };
};