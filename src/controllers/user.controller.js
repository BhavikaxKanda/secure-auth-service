import prisma from '../config/prisma.js';

// Get all users (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        isActive: true,
        createdAt: true,
        role: { select: { id: true, name: true } },
      },
    });
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update user role or status (Admin only)
export const updateUserRoleOrStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { roleId, isActive } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(roleId && { roleId }),
        ...(isActive !== undefined && { isActive }),
      },
      select: {
        id: true,
        email: true,
        username: true,
        isActive: true,
        role: { select: { id: true, name: true } },
      },
    });

    return res.status(200).json({ success: true, message: 'User updated successfully', data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};