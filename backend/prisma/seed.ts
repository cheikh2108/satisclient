import { PrismaClient, UserRole, UserStatus, ComplaintStatus, ComplaintPriority } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ============================================
  // 1. ORGANISATION DE DEMO
  // ============================================

  const demoOrg = await prisma.organization.upsert({
    where: { slug: 'demo-clinique-espoir' },
    update: {},
    create: {
      name: 'Clinique Espoir',
      slug: 'demo-clinique-espoir',
      email: 'contact@cliniqueespoir.demo',
      phone: '+221771234567',
      logo: null,
      address: 'Avenue Cheikh Anta Diop, Dakar',
      website: 'https://cliniqueespoir.demo',
      industry: 'Santé',
      size: '50-200',
      subscriptionTier: 'PRO',
      subscriptionStart: new Date(),
      subscriptionEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isActive: true,
      settings: {
        timezone: 'Africa/Dakar',
        language: 'fr',
        slaHours: 48,
      },
    },
  });

  console.log('✅ Organization created:', demoOrg.name);

  // ============================================
  // 2. UTILISATEURS
  // ============================================

  const passwordHash = await bcrypt.hash('Demo123!Pass', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@demo.satisclient.sn' },
    update: {},
    create: {
      organizationId: demoOrg.id,
      email: 'admin@demo.satisclient.sn',
      passwordHash,
      firstName: 'Admin',
      lastName: 'Demo',
      phone: '+221771234567',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'qualite@demo.satisclient.sn' },
    update: {},
    create: {
      organizationId: demoOrg.id,
      email: 'qualite@demo.satisclient.sn',
      passwordHash,
      firstName: 'Aminata',
      lastName: 'Diallo',
      phone: '+221771234568',
      role: UserRole.MANAGER,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
  });

  const agent = await prisma.user.upsert({
    where: { email: 'agent@demo.satisclient.sn' },
    update: {},
    create: {
      organizationId: demoOrg.id,
      email: 'agent@demo.satisclient.sn',
      passwordHash,
      firstName: 'Moussa',
      lastName: 'Sow',
      phone: '+221771234569',
      role: UserRole.AGENT,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
  });

  console.log('✅ Users created:', [adminUser, manager, agent].map((u) => u.email).join(', '));

  // ============================================
  // 3. CLIENTS
  // ============================================

  const customer1 = await prisma.customer.create({
    data: {
      organizationId: demoOrg.id,
      email: 'fatou@example.com',
      phone: '+221771234570',
      firstName: 'Fatou',
      lastName: 'Ndiaye',
      isAnonymous: false,
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      organizationId: demoOrg.id,
      email: 'ibrahima@example.com',
      phone: '+221771234571',
      firstName: 'Ibrahima',
      lastName: 'Fall',
      isAnonymous: false,
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      organizationId: demoOrg.id,
      phone: '+221771234572',
      isAnonymous: true,
    },
  });

  console.log('✅ Customers created:', 3);

  // ============================================
  // 4. FEEDBACKS DE DEMO
  // ============================================

  const feedbacks = await prisma.feedback.createMany({
    data: [
      {
        organizationId: demoOrg.id,
        customerId: customer1.id,
        rating: 5,
        comment: 'Excellent service ! Le personnel est très attentionné.',
        category: 'Service client',
        sentiment: 'positive',
      },
      {
        organizationId: demoOrg.id,
        customerId: customer2.id,
        rating: 3,
        comment: 'Bonne prise en charge mais temps d\'attente un peu long.',
        category: 'Délai',
        sentiment: 'neutral',
      },
      {
        organizationId: demoOrg.id,
        customerId: customer3.id,
        rating: 4,
        comment: 'Très satisfait dans l\'ensemble.',
        category: 'Qualité',
        sentiment: 'positive',
      },
    ],
  });

  console.log('✅ Feedbacks created:', feedbacks.count);

  // ============================================
  // 5. RÉCLAMATIONS DE DEMO
  // ============================================

  const complaint1 = await prisma.complaint.create({
    data: {
      organizationId: demoOrg.id,
      customerId: customer1.id,
      reference: 'SAT-2026-000001',
      title: 'Temps d\'attente excessif',
      description: 'Nous avons attendu plus de 2 heures avant la consultation malgré notre rendez-vous.',
      category: 'Délai',
      priority: ComplaintPriority.MEDIUM,
      status: ComplaintStatus.IN_PROGRESS,
      assignedTo: agent.id,
      slaDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000),
    },
  });

  const complaint2 = await prisma.complaint.create({
    data: {
      organizationId: demoOrg.id,
      customerId: customer2.id,
      reference: 'SAT-2026-000002',
      title: 'Problème de facturation',
      description: 'Montant facturé différent de celui annoncé lors de la prise de rendez-vous.',
      category: 'Facturation',
      priority: ComplaintPriority.HIGH,
      status: ComplaintStatus.ASSIGNED,
      assignedTo: agent.id,
      slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  console.log('✅ Complaints created:', [complaint1, complaint2].length);

  console.log('\n🎉 Seed completed successfully!\n');
  console.log('📝 Credentials de test:');
  console.log('   Admin:   admin@demo.satisclient.sn / Demo123!Pass');
  console.log('   Manager: qualite@demo.satisclient.sn / Demo123!Pass');
  console.log('   Agent:   agent@demo.satisclient.sn / Demo123!Pass');
  console.log('\n📊 Prisma Studio: http://localhost:5555');
  console.log('\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
