import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../config/prisma.js';

// Helper to generate access & refresh tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { userId: user.id, roleId: user.roleId },
    process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'your_secret_key',
    { expiresIn: '15m' }
  );

  const refreshToken = crypto.randomBytes(40).toString('hex');
  return { accessToken, refreshToken };
};

export const register = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email or username already exists' });
    }

    const defaultRole = await prisma.role.findUnique({ where: { name: 'USER' } });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        roleId: defaultRole?.id || null,
      },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    // Save session in DB
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        userAgent: req.headers['user-agent'] || 'unknown',
        ipAddress: req.ip || 'unknown',
        expiresAt,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role?.name || null,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token is required' });
    }

    const session = await prisma.session.findUnique({
      where: { refreshToken },
      include: { user: { include: { role: true } } },
    });

    if (!session || session.isRevoked || session.expiresAt < new Date()) {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    // Refresh Token Rotation: Revoke old session and issue new pair
    const newRefreshToken = crypto.randomBytes(40).toString('hex');
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.$transaction([
      prisma.session.update({
        where: { id: session.id },
        data: { isRevoked: true },
      }),
      prisma.session.create({
        data: {
          userId: session.userId,
          refreshToken: newRefreshToken,
          userAgent: req.headers['user-agent'] || session.userAgent,
          ipAddress: req.ip || session.ipAddress,
          expiresAt: newExpiresAt,
        },
      }),
    ]);

    const newAccessToken = jwt.sign(
      { userId: session.user.id, roleId: session.user.roleId },
      process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '15m' }
    );

    return res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await prisma.session.updateMany({
        where: { refreshToken },
        data: { isRevoked: true },
      });
    }

    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};