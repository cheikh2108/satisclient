const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findFirst({ where: { role: 'super_admin' } });
  if (existing) {
    console.log('Super admin already exists, skipping.');
    return;
  }

  const password = process.env.SUPER_ADMIN_PASSWORD;
  if (!password) {
    console.error('SUPER_ADMIN_PASSWORD env variable is required');
    process.exit(1);
  }
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email: process.env.SUPER_ADMIN_EMAIL || 'admin@satisclient.fr',
      passwordHash,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'super_admin',
      status: 'active',
      emailVerifiedAt: new Date(),
    },
  });

  console.log(`Super admin créé: ${user.email}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
