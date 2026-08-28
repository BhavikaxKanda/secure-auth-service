import prisma from '../config/prisma.js';

export const getAuditLogs = async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return res.status(200).json({ success: true, data: logs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getSecurityMetrics = async (req, res) => {
  try {
    const totalLogs = await prisma.auditLog.count();
    const blockedEvents = await prisma.auditLog.count({ where: { status: 'BLOCKED' } });
    const failedEvents = await prisma.auditLog.count({ where: { status: 'FAILED' } });
    const activeSessions = await prisma.session.count({ where: { isRevoked: false } });

    return res.status(200).json({
      success: true,
      data: {
        totalAuditLogs: totalLogs,
        blockedAccessAttempts: blockedEvents,
        failedRequests: failedEvents,
        currentActiveSessions: activeSessions,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};