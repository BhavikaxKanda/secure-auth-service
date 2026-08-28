import prisma from '../config/prisma.js';

// Get active sessions for the current user
export const getUserSessions = async (req, res) => {
  try {
    const sessions = await prisma.session.findMany({
      where: {
        userId: req.user.id,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        userAgent: true,
        ipAddress: true,
        createdAt: true,
        expiresAt: true,
      },
    });

    return res.status(200).json({ success: true, data: sessions });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Revoke a specific session
export const revokeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.userId !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    await prisma.session.update({
      where: { id: sessionId },
      data: { isRevoked: true },
    });

    return res.status(200).json({ success: true, message: 'Session revoked successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Revoke all other active sessions (Remote logout all devices)
export const revokeAllOtherSessions = async (req, res) => {
  try {
    const currentRefreshToken = req.body.refreshToken;

    await prisma.session.updateMany({
      where: {
        userId: req.user.id,
        refreshToken: { not: currentRefreshToken },
        isRevoked: false,
      },
      data: { isRevoked: true },
    });

    return res.status(200).json({ success: true, message: 'All other sessions have been revoked' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};