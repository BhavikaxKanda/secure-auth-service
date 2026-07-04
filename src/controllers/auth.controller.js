const { PrismaClient } = require('@prisma/client');
const { hashPassword, comparePassword } = require('../utils/hash');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');

const prisma = new PrismaClient();

async function register(req, res) {
  try {
    const { email, username, password } = req.body;

    // check if someone's already using this email or username
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return res.status(409).json({ message: 'That email or username is already taken' });
    }

    const passwordHash = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: { email, username, passwordHash },
    });

    return res.status(201).json({
      message: 'Account created successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ message: 'Something went wrong on our end' });
  }
}

async function login(req, res) {
  try {
    const { identifier, password } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email/username or password' });
    }

    const passwordIsCorrect = await comparePassword(password, user.passwordHash);

    if (!passwordIsCorrect) {
      return res.status(401).json({ message: 'Invalid email/username or password' });
    }

    const accessToken = generateAccessToken({ userId: user.id });
    const refreshToken = generateRefreshToken({ userId: user.id });

    // keep track of this login session so it can be revoked later if needed
    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
      },
    });

    return res.status(200).json({ accessToken, refreshToken });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Something went wrong on our end' });
  }
}

module.exports = { register, login };