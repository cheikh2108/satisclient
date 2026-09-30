const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function ensurePlatformBootstrap() {
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'Variables d’environnement manquantes: SUPER_ADMIN_EMAIL et SUPER_ADMIN_PASSWORD',
    );
  }

  const org = await prisma.organization.upsert({
    where: { slug: 'satisclient-platform' },
    update: {
      name: process.env.SUPER_ADMIN_ORGANIZATION_NAME || 'SatisClient Platform',
      email,
      isPlatform: true,
    },
    create: {
      name: process.env.SUPER_ADMIN_ORGANIZATION_NAME || 'SatisClient Platform',
      slug: 'satisclient-platform',
      email,
      isPlatform: true,
      subscriptionPlan: 'business',
      subscriptionStatus: 'active',
      maxSites: 20,
      maxUsers: 50,
      maxMonthlyFeedbacks: 10000,
    },
  });

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: {
      organizationId_email: {
        organizationId: org.id,
        email,
      },
    },
    update: {
      passwordHash,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'super_admin',
      status: 'active',
      emailVerifiedAt: new Date(),
    },
    create: {
      organizationId: org.id,
      email,
      passwordHash,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'super_admin',
      status: 'active',
      emailVerifiedAt: new Date(),
    },
  });

  console.log(`Super admin prêt: ${user.email} | organisation: ${org.name}`);
  return { organization: org, user };
}

async function main() {
  await ensurePlatformBootstrap();
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error('Erreur seed super admin:', e.message || e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}

module.exports = { ensurePlatformBootstrap };
