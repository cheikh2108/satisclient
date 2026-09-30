/**
 * SatisClient - Script de seed
 * Usage: node prisma/seed.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function randomDateInLast(days) {
  return daysAgo(randomBetween(0, days));
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Démarrage du seed SatisClient...\n');

  // 1. Organisation principale (existante)
  const org = await prisma.organization.findFirst();
  if (!org) throw new Error('Aucune organisation trouvée. Relancez prisma db push + seed.');

  await prisma.organization.update({
    where: { id: org.id },
    data: {
      name: 'SatisClient Platform',
      slug: 'satisclient-platform',
      email: 'admin@satisclient.fr',
      subscriptionPlan: 'business',
      subscriptionStatus: 'active',
      maxSites: 20,
      maxUsers: 50,
      maxMonthlyFeedbacks: 10000,
    },
  });
  console.log(`✅ Organisation principale: SatisClient`);

  // 2. Organisations supplémentaires
  console.log('\n🏢 Création des organisations supplémentaires...');

  const extraOrgsData = [
    {
      name: 'Banque Atlantique CI',
      slug: 'banque-atlantique-ci',
      email: 'admin@banque-atlantique.ci',
      subscriptionPlan: 'pro',
      subscriptionStatus: 'active',
      maxSites: 10,
      maxUsers: 25,
      maxMonthlyFeedbacks: 5000,
    },
    {
      name: 'Réseau Ecobank Mali',
      slug: 'ecobank-mali',
      email: 'contact@ecobank.ml',
      subscriptionPlan: 'essentialiel',
      subscriptionStatus: 'trial',
      maxSites: 1,
      maxUsers: 3,
      maxMonthlyFeedbacks: 1000,
      trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 jours
    },
    {
      name: 'Hôpital Principal Dakar',
      slug: 'hopital-principal-dakar',
      email: 'qualite@hpd.sn',
      subscriptionPlan: 'institution',
      subscriptionStatus: 'active',
      maxSites: 5,
      maxUsers: 15,
      maxMonthlyFeedbacks: 3000,
    },
    {
      name: 'TeleCom Burkina',
      slug: 'telecom-burkina',
      email: 'support@telecom-bf.com',
      subscriptionPlan: 'pro',
      subscriptionStatus: 'suspended',
      maxSites: 8,
      maxUsers: 20,
      maxMonthlyFeedbacks: 4000,
    },
  ];

  const extraOrgs = [];
  for (const data of extraOrgsData) {
    try {
      const existing = await prisma.organization.findUnique({ where: { slug: data.slug } });
      if (!existing) {
        const newOrg = await prisma.organization.create({ data });
        extraOrgs.push(newOrg);
      }
    } catch (e) {
      // Ignore si déjà existant
    }
  }
  console.log(`  ✅ ${extraOrgs.length} organisations supplémentaires créées`);

  // 3. Admin (créer s'il n'existe pas)
  const adminHash = await bcrypt.hash('Admin123!Pass', 12);
  const admin = await prisma.user.upsert({
    where: { organizationId_email: { organizationId: org.id, email: 'admin@satisclient.fr' } },
    update: {
      firstName: 'Admin',
      lastName: 'Demo',
      passwordHash: adminHash,
    },
    create: {
      organizationId: org.id,
      email: 'admin@satisclient.fr',
      passwordHash: adminHash,
      firstName: 'Admin',
      lastName: 'Demo',
      phone: '+221771234567',
      role: 'super_admin',
      status: 'active',
      emailVerifiedAt: new Date(),
    },
  });
  console.log(`✅ Admin: ${admin.email}`);

  // ─── Sites ──────────────────────────────────────────────────────────────────
  console.log('\n📍 Création des sites...');

  const sitesData = [
    { name: 'Agence Dakar Plateau', code: 'DKR-PLT', type: 'agency', city: 'Dakar', region: 'Dakar', isActive: true },
    { name: 'Agence Dakar Almadies', code: 'DKR-ALM', type: 'agency', city: 'Dakar', region: 'Dakar', isActive: true },
    { name: 'Agence Thiès Centre', code: 'THS-CTR', type: 'agency', city: 'Thiès', region: 'Thiès', isActive: true },
    { name: 'Agence Saint-Louis', code: 'STL-CTR', type: 'agency', city: 'Saint-Louis', region: 'Saint-Louis', isActive: true },
    { name: 'Agence Ziguinchor', code: 'ZGC-CTR', type: 'agency', city: 'Ziguinchor', region: 'Ziguinchor', isActive: true },
    // Site inactif pour couvrir le KPI "Inactifs"
    { name: 'Agence Kaolack (fermée)', code: 'KLK-CTR', type: 'agency', city: 'Kaolack', region: 'Kaolack', isActive: false },
  ];

  const sites = await Promise.all(
    sitesData.map(s =>
      prisma.site.create({
        data: {
          organizationId: org.id,
          name: s.name,
          code: s.code,
          type: s.type,
          city: s.city,
          region: s.region,
          country: 'SN',
          isActive: s.isActive !== undefined ? s.isActive : true,
        },
      })
    )
  );
  console.log(`  ✅ ${sites.length} sites créés`);

  // ─── Utilisateurs ────────────────────────────────────────────────────────────
  console.log('\n👥 Création des utilisateurs...');

  const passwordHash = await bcrypt.hash('Password123!', 12);
  const usersData = [
    { firstName: 'Fatou', lastName: 'Diallo', email: 'fatou.diallo@satisclient.sn', role: 'org_admin', status: 'active' },
    { firstName: 'Moussa', lastName: 'Ndiaye', email: 'moussa.ndiaye@satisclient.sn', role: 'quality_manager', status: 'active' },
    { firstName: 'Aissatou', lastName: 'Ba', email: 'aissatou.ba@satisclient.sn', role: 'service_manager', status: 'active' },
    { firstName: 'Ibrahima', lastName: 'Sow', email: 'ibrahima.sow@satisclient.sn', role: 'agent', status: 'active' },
    { firstName: 'Mariama', lastName: 'Diop', email: 'mariama.diop@satisclient.sn', role: 'agent', status: 'active' },
    { firstName: 'Ousmane', lastName: 'Fall', email: 'ousmane.fall@satisclient.sn', role: 'agent', status: 'active' },
    // Utilisateurs en attente pour couvrir le KPI "En attente"
    { firstName: 'Khadija', lastName: 'Sall', email: 'khadija.sall@satisclient.sn', role: 'agent', status: 'pending' },
    { firstName: 'Ababacar', lastName: 'Thiam', email: 'ababacar.thiam@satisclient.sn', role: 'agent', status: 'pending' },
  ];

  const users = await Promise.all(
    usersData.map(u =>
      prisma.user.create({
        data: {
          organizationId: org.id,
          email: u.email,
          passwordHash,
          firstName: u.firstName,
          lastName: u.lastName,
          role: u.role,
          status: u.status,
          emailVerifiedAt: u.status === 'active' ? new Date() : null,
        },
      })
    )
  );
  console.log(`  ✅ ${users.length} utilisateurs créés`);

  // ─── QR Codes ────────────────────────────────────────────────────────────────
  console.log('\n📱 Création des QR codes...');

  const qrCodes = await Promise.all(
    sites.map((site, i) =>
      prisma.qrCode.create({
        data: {
          organizationId: org.id,
          siteId: site.id,
          code: `QR-${site.code}-001`,
          targetType: 'feedback',
          destinationUrl: `https://satisclient.sn/f/${site.code}`,
          qrImageUrl: null,
          isActive: true,
          scanCount: randomBetween(50, 500),
          lastScannedAt: randomDateInLast(7),
        },
      })
    )
  );
  console.log(`  ✅ ${qrCodes.length} QR codes créés`);

  // ─── Feedbacks ───────────────────────────────────────────────────────────────
  console.log('\n💬 Création des feedbacks...');

  const positiveComments = [
    'Service excellent, personnel très professionnel et à l\'écoute.',
    'Très satisfait de la rapidité et de la qualité du service.',
    'Accueil chaleureux, problème résolu en moins de 10 minutes.',
    'Excellent travail de l\'équipe, je recommande vivement.',
    'Très bonne expérience, service rapide et efficace.',
    'Personnel compétent et aimable, je reviendrai.',
  ];

  const neutralComments = [
    'Service correct mais délai d\'attente un peu long.',
    'Correct dans l\'ensemble, quelques améliorations possibles.',
    'Service standard, rien à signaler de particulier.',
    'Acceptable, mais on peut faire mieux sur les délais.',
  ];

  const negativeComments = [
    'Trop long d\'attente, plus d\'une heure pour être servi.',
    'Personnel peu aimable et manque d\'information sur les procédures.',
    'Problème non résolu après deux visites, très déçu.',
    'Service décevant, pas à la hauteur des attentes.',
  ];

  const channels = ['web', 'qr_code', 'email', 'in_app'];
  const feedbacks = [];

  for (let day = 90; day >= 0; day--) {
    const date = daysAgo(day);
    const count = randomBetween(2, 8);

    for (let j = 0; j < count; j++) {
      const sentimentRoll = Math.random();
      let sentiment, rating, comment;

      if (sentimentRoll < 0.60) {
        sentiment = 'positive';
        rating = pick([4, 5, 5, 5]);
        comment = pick(positiveComments);
      } else if (sentimentRoll < 0.80) {
        sentiment = 'neutral';
        rating = pick([3, 3, 4]);
        comment = pick(neutralComments);
      } else {
        sentiment = 'negative';
        rating = pick([1, 2, 2]);
        comment = pick(negativeComments);
      }

      const clientNames = [
        'Cheikh Diop', 'Ndèye Fall', 'Mamadou Sy', 'Aminata Kane', 'Boubacar Barry',
        'Rokhaya Gaye', 'Ibrahima Touré', 'Fatoumata Bah', 'Oumar Ndiaye', 'Aissatou Diallo',
        'Modou Sarr', 'Mariama Fall', 'Abdou Ba', 'Khady Mbaye', 'Seydou Cissé',
      ];
      const isAnon = Math.random() > 0.6; // 40% anonymes seulement
      const site = pick(sites);
      feedbacks.push({
        organizationId: org.id,
        siteId: site.id,
        overallRating: rating,
        comment,
        commentSentiment: sentiment,
        feedbackChannel: pick(channels),
        isAnonymous: isAnon,
        respondentName: isAnon ? null : pick(clientNames),
        respondentEmail: isAnon ? null : null,
        needsResponse: sentiment === 'negative' && Math.random() > 0.5,
        isProcessed: Math.random() > 0.4,
        createdAt: date,
        updatedAt: date,
      });
    }
  }

  await prisma.feedback.createMany({ data: feedbacks });
  console.log(`  ✅ ${feedbacks.length} feedbacks créés`);

  // ─── Réclamations ────────────────────────────────────────────────────────────
  console.log('\n📋 Création des réclamations...');

  const complaintTitles = [
    'Délai de traitement trop long',
    'Erreur sur mon dossier',
    'Personnel peu professionnel',
    'Manque d\'information sur les procédures',
    'Problème non résolu après plusieurs visites',
    'Dossier perdu par l\'agence',
    'Facturation incorrecte',
    'Mauvaise orientation du client',
    'Rupture de stock documentaire',
    'Non-respect du rendez-vous fixé',
  ];

  const categories = ['service', 'personnel', 'délai', 'documentation', 'facturation'];
  const statuses = ['received', 'qualified', 'assigned', 'in_progress', 'resolved', 'closed'];
  const priorities = ['low', 'normal', 'high', 'urgent'];
  const complainants = [
    { name: 'Seydou Camara', email: 'seydou.camara@gmail.com' },
    { name: 'Rokhaya Gueye', email: 'rokhaya.gueye@yahoo.fr' },
    { name: 'Lamine Touré', email: 'lamine.toure@outlook.com' },
    { name: 'Khady Mbaye', email: 'khady.mbaye@gmail.com' },
    { name: 'Abdoulaye Diouf', email: null },
  ];

  let ticketCounter = 1000;
  const complaints = [];

  for (let day = 60; day >= 0; day--) {
    const date = daysAgo(day);
    const count = randomBetween(1, 3);

    for (let j = 0; j < count; j++) {
      const complainant = pick(complainants);
      const status = pick(statuses);
      const site = pick(sites);
      ticketCounter++;

      complaints.push({
        organizationId: org.id,
        siteId: site.id,
        ticketNumber: `RCL-2026-${ticketCounter}`,
        title: pick(complaintTitles),
        description: `Réclamation soumise le ${date.toLocaleDateString('fr-FR')}. ${pick(negativeComments)}`,
        category: pick(categories),
        priority: pick(priorities),
        status,
        complainantName: complainant.name,
        complainantEmail: complainant.email,
        isAnonymous: !complainant.email,
        assignedTo: ['in_progress', 'resolved', 'closed'].includes(status) ? pick(users).id : null,
        resolvedAt: status === 'resolved' || status === 'closed' ? daysAgo(randomBetween(0, day)) : null,
        slaDueDate: new Date(date.getTime() + 5 * 24 * 60 * 60 * 1000),
        createdAt: date,
        updatedAt: date,
        relatedComplaintIds: [],
        attachments: [],
      });
    }
  }

  await prisma.complaint.createMany({ data: complaints });
  console.log(`  ✅ ${complaints.length} réclamations créées`);

  // ─── Notifications ────────────────────────────────────────────────────────────
  console.log('\n🔔 Création des notifications...');

  const notifData = [
    { type: 'feedback', title: 'Nouveau feedback négatif', message: 'Un client a laissé un avis négatif sur l\'agence Dakar Plateau', priority: 'high' },
    { type: 'complaint', title: 'Réclamation urgente reçue', message: 'Une réclamation urgente a été soumise et nécessite une action immédiate', priority: 'urgent' },
    { type: 'feedback', title: 'Objectif satisfaction atteint', message: 'L\'agence Thiès a atteint 90% de satisfaction ce mois', priority: 'normal' },
    { type: 'complaint', title: 'Réclamation résolue', message: 'La réclamation RCL-2026-1045 a été résolue avec succès', priority: 'normal' },
    { type: 'system', title: 'Rapport mensuel disponible', message: 'Le rapport de satisfaction du mois de septembre est disponible', priority: 'normal' },
    { type: 'feedback', title: '50 nouveaux feedbacks aujourd\'hui', message: 'Vous avez reçu 50 retours clients aujourd\'hui, +20% vs hier', priority: 'normal' },
  ];

  await prisma.notification.createMany({
    data: notifData.map((n, i) => ({
      userId: admin.id,
      organizationId: org.id,
      notificationType: n.type,
      channel: 'in_app',
      status: 'delivered',
      subject: n.title,
      body: n.message,
      scheduledFor: daysAgo(i),
      sentAt: daysAgo(i),
      deliveredAt: daysAgo(i),
      readAt: i > 2 ? daysAgo(i) : null,
      createdAt: daysAgo(i),
    })),
  });
  console.log(`  ✅ ${notifData.length} notifications créées`);

  // ─── Audit logs ──────────────────────────────────────────────────────────────
  console.log('\n📜 Création des logs d\'audit...');

  const auditActions = ['login_success', 'feedback.created', 'complaint.created', 'complaint.updated', 'user.updated', 'site.created'];
  const allUsers = [admin, ...users];
  const auditLogs = Array.from({ length: 50 }, (_, i) => {
    const u = pick(allUsers);
    return {
      organizationId: org.id,
      userId: u.id,
      userEmail: u.email,
      action: pick(auditActions),
      entityType: pick(['auth', 'feedback', 'complaint', 'user', 'site']),
      entityId: null,
      success: Math.random() > 0.05,
      errorMessage: null,
      ipAddress: `41.82.${randomBetween(1, 254)}.${randomBetween(1, 254)}`,
      createdAt: randomDateInLast(30),
    };
  });

  await prisma.auditLog.createMany({ data: auditLogs });
  console.log(`  ✅ ${auditLogs.length} logs d'audit créés`);

  // ─── Résumé ──────────────────────────────────────────────────────────────────
  console.log('\n✅ Seed terminé avec succès !\n');
  console.log('─────────────────────────────────────────');
  console.log(`  Organisations: ${1 + extraOrgs.length} (SatisClient + ${extraOrgs.length} clients démo)`);
  console.log(`  Sites        : ${sites.length}`);
  console.log(`  Utilisateurs : ${users.length + 1} (admin inclus)`);
  console.log(`  QR Codes     : ${qrCodes.length}`);
  console.log(`  Feedbacks    : ${feedbacks.length}`);
  console.log(`  Réclamations : ${complaints.length}`);
  console.log(`  Notifications: ${notifData.length}`);
  console.log(`  Audit logs   : ${auditLogs.length}`);
  console.log('─────────────────────────────────────────');
  console.log('\n🔑 Connexion admin:');
  console.log('  Email    : admin@satisclient.fr');
  console.log('  Password : Admin123!Pass');
  console.log('\n🔑 Autres utilisateurs (password: Password123!):');
  usersData.forEach(u => console.log(`  ${u.email} (${u.role})`));
}

main()
  .catch(e => {
    console.error('❌ Erreur seed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
