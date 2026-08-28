import prisma from '../config/prisma.js';

// Get all roles with their permissions
export const getAllRoles = async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      include: { permissions: true },
    });
    return res.status(200).json({ success: true, data: roles });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new role
export const createRole = async (req, res) => {
  try {
    const { name, description, permissionIds } = req.body;

    const existing = await prisma.role.findUnique({ where: { name } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Role already exists' });
    }

    const role = await prisma.role.create({
      data: {
        name,
        description,
        permissions: permissionIds ? {
          connect: permissionIds.map((id) => ({ id })),
        } : undefined,
      },
      include: { permissions: true },
    });

    return res.status(201).json({ success: true, message: 'Role created', data: role });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Assign permissions to a role
export const assignPermissionsToRole = async (req, res) => {
  try {
    const { roleId } = req.params;
    const { permissionIds } = req.body;

    const updatedRole = await prisma.role.update({
      where: { id: roleId },
      data: {
        permissions: {
          set: permissionIds.map((id) => ({ id })),
        },
      },
      include: { permissions: true },
    });

    return res.status(200).json({ success: true, message: 'Permissions assigned', data: updatedRole });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get all available permissions
export const getAllPermissions = async (req, res) => {
  try {
    const permissions = await prisma.permission.findMany();
    return res.status(200).json({ success: true, data: permissions });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new permission
export const createPermission = async (req, res) => {
  try {
    const { name, description } = req.body;

    const existing = await prisma.permission.findUnique({ where: { name } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Permission already exists' });
    }

    const permission = await prisma.permission.create({
      data: { name, description },
    });

    return res.status(201).json({ success: true, message: 'Permission created', data: permission });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};