import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

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
      logoUrl: null,
      primaryColor: '#3B82F6',
      welcomeMessage: 'Bienvenue à la Clinique Espoir. Votre santé, notre priorité.',
      subscriptionPlan: 'pro',
      subscriptionStatus: 'active',
      maxSites: 5,
      maxUsers: 10,
      maxMonthlyFeedbacks: 5000,
    },
  });

  console.log('✅ Organization created:', demoOrg.name);

  // ============================================
  // 2. UTILISATEURS
  // ============================================

  const passwordHash = await bcrypt.hash('Demo123!Pass', 12);

  const adminUser = await prisma.user.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      organizationId: demoOrg.id,
      email: 'admin@demo.satisclient.sn',
      passwordHash,
      firstName: 'Admin',
      lastName: 'Demo',
      phone: '+221771234567',
      role: 'org_admin',
      status: 'active',
      emailVerifiedAt: new Date(),
    },
  });

  const qualityManager = await prisma.user.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      organizationId: demoOrg.id,
      email: 'qualite@demo.satisclient.sn',
      passwordHash,
      firstName: 'Aminata',
      lastName: 'Diallo',
      phone: '+221771234568',
      role: 'quality_manager',
      status: 'active',
      emailVerifiedAt: new Date(),
    },
  });

  const agent = await prisma.user.upsert({
    where: { id: '00000000-0000-0000-0000-000000000003' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000003',
      organizationId: demoOrg.id,
      email: 'agent@demo.satisclient.sn',
      passwordHash,
      firstName: 'Moussa',
      lastName: 'Sow',
      phone: '+221771234569',
      role: 'agent',
      status: 'active',
      emailVerifiedAt: new Date(),
    },
  });

  console.log('✅ Users created:', [adminUser, qualityManager, agent].map((u) => u.email).join(', '));

  // ============================================
  // 3. SITES (HIÉRARCHIE)
  // ============================================

  const mainSite = await prisma.site.create({
    data: {
      organizationId: demoOrg.id,
      name: 'Siège Principal',
      code: 'HQ-DKR',
      type: 'organization',
      address: 'Avenue Cheikh Anta Diop, Dakar',
      city: 'Dakar',
      region: 'Dakar',
      country: 'SN',
      phone: '+221338234567',
      email: 'siege@cliniqueespoir.demo',
      isActive: true,
      managerId: adminUser.id,
      feedbackLinkCode: 'clinique-espoir-hq',
    },
  });

  const plateauAgency = await prisma.site.create({
    data: {
      organizationId: demoOrg.id,
      parentId: mainSite.id,
      name: 'Agence Plateau',
      code: 'AG-PLT',
      type: 'agency',
      address: 'Place de l\'Indépendance, Plateau',
      city: 'Dakar',
      region: 'Dakar',
      country: 'SN',
      phone: '+221338234568',
      isActive: true,
      managerId: qualityManager.id,
      feedbackLinkCode: 'clinique-plateau',
    },
  });

  const pediatrieService = await prisma.site.create({
    data: {
      organizationId: demoOrg.id,
      parentId: plateauAgency.id,
      name: 'Service Pédiatrie',
      code: 'SRV-PED',
      type: 'service',
      isActive: true,
      managerId: agent.id,
      feedbackLinkCode: 'pediatrie',
    },
  });

  const cardiologieService = await prisma.site.create({
    data: {
      organizationId: demoOrg.id,
      parentId: plateauAgency.id,
      name: 'Service Cardiologie',
      code: 'SRV-CAR',
      type: 'service',
      isActive: true,
      feedbackLinkCode: 'cardiologie',
    },
  });

  console.log('✅ Sites created:', [mainSite, plateauAgency, pediatrieService, cardiologieService].length);

  // ============================================
  // 4. FEEDBACKS DE DEMO
  // ============================================

  const feedbacks = await prisma.feedback.createMany({
    data: [
      {
        organizationId: demoOrg.id,
        siteId: pediatrieService.id,
        overallRating: 5,
        criteriaRatings: {
          accueil: 5,
          qualite: 5,
          delai: 4,
          proprete: 5,
        },
        comment: 'Excellent service ! Le personnel est très attentionné avec les enfants.',
        commentSentiment: 'positive',
        respondentName: 'Fatou Ndiaye',
        respondentEmail: 'fatou@example.com',
        feedbackChannel: 'qr_code',
        isAnonymous: false,
      },
      {
        organizationId: demoOrg.id,
        siteId: pediatrieService.id,
        overallRating: 3,
        criteriaRatings: {
          accueil: 4,
          qualite: 4,
          delai: 2,
          proprete: 3,
        },
        comment: 'Bonne prise en charge mais temps d\'attente un peu long.',
        commentSentiment: 'neutral',
        respondentName: 'Ibrahima Fall',
        respondentEmail: 'ibrahima@example.com',
        feedbackChannel: 'web',
        isAnonymous: false,
      },
      {
        organizationId: demoOrg.id,
        siteId: cardiologieService.id,
        overallRating: 4,
        criteriaRatings: {
          accueil: 4,
          qualite: 5,
          delai: 3,
          proprete: 4,
        },
        comment: 'Très satisfait de la consultation. Médecin compétent et à l\'écoute.',
        commentSentiment: 'positive',
        respondentName: 'Awa Seck',
        feedbackChannel: 'web',
        isAnonymous: false,
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
      siteId: pediatrieService.id,
      ticketNumber: 'SAT-2026-000001',
      title: 'Temps d\'attente excessif',
      description: 'Nous avons attendu plus de 2 heures avant la consultation malgré notre rendez-vous.',
      category: 'Délai',
      priority: 'normal',
      status: 'received',
      complainantName: 'Mame Diarra',
      complainantEmail: 'mdiarra@example.com',
      complainantPhone: '+221771234570',
      isAnonymous: false,
      source: 'web',
      slaDueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // +5 jours
    },
  });

  const complaint2 = await prisma.complaint.create({
    data: {
      organizationId: demoOrg.id,
      siteId: cardiologieService.id,
      ticketNumber: 'SAT-2026-000002',
      title: 'Problème de facturation',
      description: 'Montant facturé différent de celui annoncé lors de la prise de rendez-vous.',
      category: 'Facturation',
      priority: 'high',
      status: 'qualified',
      complainantName: 'Ousmane Ba',
      complainantEmail: 'oба@example.com',
      isAnonymous: false,
      source: 'email',
      assignedTo: agent.id,
      assignedAt: new Date(),
      slaDueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // +2 jours
    },
  });

  console.log('✅ Complaints created:', [complaint1, complaint2].length);

  // ============================================
  // 6. SUGGESTIONS DE DEMO
  // ============================================

  const suggestions = await prisma.suggestion.createMany({
    data: [
      {
        organizationId: demoOrg.id,
        siteId: plateauAgency.id,
        title: 'Système de prise de rendez-vous en ligne',
        description: 'Il serait pratique d\'avoir un système de réservation en ligne pour éviter les déplacements inutiles.',
        category: 'Amélioration digitale',
        status: 'submitted',
        submitterName: 'Aminata Touré',
        submitterEmail: 'atoure@example.com',
        isAnonymous: false,
      },
      {
        organizationId: demoOrg.id,
        siteId: pediatrieService.id,
        title: 'Espace jeux pour enfants',
        description: 'Un coin jeux dans la salle d\'attente aiderait à distraire les enfants pendant l\'attente.',
        category: 'Confort',
        status: 'approved',
        submitterName: 'Khady Diop',
        isAnonymous: false,
        assignedTo: qualityManager.id,
        assignedAt: new Date(),
      },
    ],
  });

  console.log('✅ Suggestions created:', suggestions.count);

  console.log('\n🎉 Seed completed successfully!\n');
  console.log('📝 Credentials de test:');
  console.log('   Admin:           admin@demo.satisclient.sn / Demo123!Pass');
  console.log('   Quality Manager: qualite@demo.satisclient.sn / Demo123!Pass');
  console.log('   Agent:           agent@demo.satisclient.sn / Demo123!Pass');
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
