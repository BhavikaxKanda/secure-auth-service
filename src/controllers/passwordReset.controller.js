import crypto from 'crypto';
import bcrypt from 'bcrypt';
import prisma from '../config/prisma.js';

// Request password reset token
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If the email is registered, a password reset token has been generated.',
      });
    }

    // Generate raw token and hash it for DB storage
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Invalidate existing unused tokens
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, isUsed: false },
      data: { isUsed: true },
    });

    // Token valid for 15 minutes
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Password reset token generated successfully',
      resetToken, // Returned in response for testing/development
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Reset password using token
export const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!resetRecord || resetRecord.isUsed || resetRecord.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { isUsed: true },
      }),
      // Revoke all active sessions on password change for security
      prisma.session.updateMany({
        where: { userId: resetRecord.userId, isRevoked: false },
        data: { isRevoked: true },
      }),
    ]);

    return res.status(200).json({ success: true, message: 'Password has been reset successfully. Please log in again.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};