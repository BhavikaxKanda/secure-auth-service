const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const permissions = [
    { name: 'user:read', description: 'Read user profiles' },
    { name: 'user:write', description: 'Create and update users' },
    { name: 'user:delete', description: 'Delete users' },
    { name: 'role:manage', description: 'Manage roles and permissions' },
    { name: 'session:revoke', description: 'Revoke active sessions' },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
  }

  const allPerms = await prisma.permission.findMany();

  // 1. Admin Role with full permissions
  await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'System Administrator with full access',
      permissions: {
        connect: allPerms.map((p) => ({ id: p.id })),
      },
    },
  });

  // 2. Default User Role with read-only access
  await prisma.role.upsert({
    where: { name: 'USER' },
    update: {},
    create: {
      name: 'USER',
      description: 'Standard end user',
      permissions: {
        connect: allPerms.filter((p) => p.name === 'user:read').map((p) => ({ id: p.id })),
      },
    },
  });

  console.log('Database successfully seeded with baseline Roles and Permissions!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });