# 🎯 SatisClient

**Plateforme B2B de gestion de l'expérience client, satisfaction et redevabilité**

> *"Votre avis améliore nos services"*

[![Version](https://img.shields.io/badge/version-1.0.0--dev-blue.svg)](https://github.com/cheikh2108/satisclient)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-En%20développement-yellow.svg)]()

> **✨ État actuel:** Infrastructure technique complète avec PostgreSQL natif, sécurité robuste (JWT, Encryption, Rate limiting), 15 tables BDD créées avec données de test. Backend NestJS et Frontend Next.js configurés et fonctionnels. Développement des modules métier en cours.

## 📋 À propos

SatisClient transforme chaque avis, réclamation ou suggestion en information exploitable, action correctrice et preuve de traitement. C'est une solution complète pour les entreprises, institutions, structures sanitaires, établissements éducatifs, ONG et services publics.

**Principe directeur:** Écouter → Comprendre → Affecter → Traiter → Mesurer → Améliorer

## ✨ Fonctionnalités principales

### 🌟 Module Satisfaction
- Notation 1-5 étoiles avec critères personnalisables
- Enquêtes dynamiques (QCM, échelles, texte libre)
- Analyse de sentiment par IA
- QR Codes par site/service

### 📋 Module Réclamations
- Workflow complet (Reçue → Qualifiée → Affectée → En cours → Résolue → Clôturée)
- Numéro de suivi unique (ex: SAT-2026-000145)
- Gestion SLA avec escalades automatiques
- Pièces jointes et traçabilité complète

### 💡 Module Suggestions
- Collection et classification
- Affectation et suivi
- Transformation en actions d'amélioration

### 📊 Analytics & Reporting
- Tableaux de bord temps réel
- KPIs: CSAT, NPS, délai moyen, taux résolution
- Comparaisons multisites
- Exports PDF, Excel, CSV

### 🔔 Notifications multi-canaux
- Email (Nodemailer)
- SMS (Twilio / Africa's Talking)
- WhatsApp (Twilio API)
- Notifications in-app

## 🏗️ Architecture technique

### Stack (V1)
- **Backend:** NestJS (Node.js + TypeScript)
- **Frontend:** Next.js 14 (React + TypeScript + App Router)
- **Database:** PostgreSQL 18 natif Windows
- **ORM:** Prisma 5
- **Package Manager:** npm (Node.js natif)
- **UI:** Shadcn/ui + Tailwind CSS
- **Charts:** Recharts
- **Sécurité:** JWT + Refresh Tokens, AES-256-GCM, bcrypt (12 rounds)

### Structure du projet

```
satisclient/
├── backend/                    # API NestJS
│   ├── src/
│   │   ├── modules/           # Modules fonctionnels
│   │   ├── common/            # Services sécurité
│   │   ├── config/            # Configuration
│   │   └── prisma/            # Service Prisma
│   ├── prisma/
│   │   ├── schema.prisma     # Schéma BDD (15 tables)
│   │   └── seed.ts           # Données de test
│   └── .env                   # Variables backend
├── frontend/                   # Application Next.js
│   ├── src/
│   │   ├── app/              # App Router
│   │   ├── components/       # Composants React
│   │   └── lib/              # Utilities
│   ├── public/
│   └── .env.local            # Variables frontend
├── shared/                     # Types partagés
└── docs/                       # Documentation complète
```

## 💰 Formules commerciales

| Formule | Prix/mois | Sites | Users | Fonctionnalités |
|---------|-----------|-------|-------|-----------------|
| **Essentiel** | 25 000 FCFA | 1 | 3 | Avis, notation, enquêtes, QR codes |
| **Pro** | 60 000 FCFA | 5 | 10 | + Réclamations, workflow, SLA, alertes |
| **Business** | 125 000 FCFA | 15 | 30 | + IA, analytics avancées, API |
| **Institution** | Sur devis | Illimité | Illimité | + SSO, intégrations custom, sécurité renforcée |

**Offre de lancement:** 30 jours d'essai gratuits

## 🚀 Démarrage rapide

### Prérequis

- **Node.js 18+** et npm 9+
- **PostgreSQL 14+** natif Windows/Mac/Linux
- **Git**

> **Note V1:** Redis, Email, SMS, AI ne sont pas requis pour le développement local.

### Installation

```bash
# 1. Cloner le repository
git clone https://github.com/cheikh2108/satisclient.git
cd satisclient

# 2. Installer les dépendances
npm install

# 3. Configurer PostgreSQL
# Créer l'utilisateur et la base de données :
# CREATE USER satisclient WITH PASSWORD 'satisclient_password';
# CREATE DATABASE satisclient_dev OWNER satisclient;

# 4. Configurer l'environnement
# Le fichier backend/.env existe déjà avec les bonnes valeurs
# Si besoin, voir .env.example pour référence

# 5. Générer le client Prisma
cd backend
npx prisma generate

# 6. Les tables et données de test sont déjà créées
# Si besoin de recréer : voir docs/GETTING_STARTED.md

# 7. Démarrer l'application (backend + frontend)
cd ..
npm run dev
```

### Accès

- **Frontend:** http://localhost:3000
- **API Backend:** http://localhost:3001
- **API Docs (Swagger):** http://localhost:3001/api/docs

**Comptes de test:**
- **Admin:** `admin@demo.satisclient.sn` / `Demo123!Pass`
- **Manager:** `qualite@demo.satisclient.sn` / `Demo123!Pass`
- **Agent:** `agent@demo.satisclient.sn` / `Demo123!Pass`

## 📚 Documentation

**👉 Toute la documentation est dans [docs/](docs/README.md)**

- [Installation & Setup](docs/GETTING_STARTED.md)
- [Architecture technique](docs/ARCHITECTURE.md)
- [Base de données](docs/DATABASE_SCHEMA.md)
- [Sécurité](docs/SECURITY.md)
- [Déploiement Dokploy](docs/DEPLOYMENT.md)
- [État du projet](docs/STATUS.md)
- [Cahier des charges](SatisClient_Cahier_des_charges_et_offre_commerciale.md)

## 🎯 Roadmap

### Phase 1: MVP Essentiel (En cours - 6 semaines)
- [x] Architecture définie
- [x] Schéma base de données (15 tables)
- [x] Setup projet NestJS + Next.js
- [x] Sécurité (JWT, Encryption, Rate limiting, Brute force protection)
- [x] PostgreSQL + Prisma configuré
- [x] Base de données avec données de test
- [ ] Module Auth (JWT + RBAC) - en cours
- [ ] Module Organizations (multi-tenant) - en cours
- [ ] Module Feedback (notation + commentaires)
- [ ] QR Codes génération
- [ ] Dashboard basique
- [ ] Exports PDF/Excel

### Phase 2: Formule Pro (6-8 semaines)
- [ ] Module Complaints complet (workflow)
- [ ] SLA tracking + alertes
- [ ] Système d'affectation
- [ ] Notifications email/SMS/WhatsApp
- [ ] Surveys dynamiques
- [ ] Analytics avancées
- [ ] Redis (Cache & Queues)

### Phase 3: Formule Business (6-8 semaines)
- [ ] Analyse sentiment IA (OpenAI)
- [ ] Escalades automatiques
- [ ] Rapports planifiés
- [ ] API REST documentée (Swagger)
- [ ] Comparaisons multisites avancées
- [ ] Cloud Storage (S3/MinIO)

### Phase 4: Formule Institution (Sur devis)
- [ ] SSO (SAML, OAuth2)
- [ ] Intégrations customs
- [ ] White-labeling
- [ ] Sécurité renforcée (2FA)
- [ ] Support on-premise
- [ ] Payment (Stripe/PayDunia)
- [ ] Monitoring (Sentry)

## 🎨 Secteurs cibles

- 🏥 **Santé:** Cliniques, hôpitaux, laboratoires
- 🎓 **Éducation:** Écoles, universités, centres de formation
- 🏨 **Hôtellerie/Restauration:** Hôtels, restaurants
- 🛒 **Commerce:** Supermarchés, boutiques, réseaux
- 💳 **Finance:** Banques, assurances, microfinance
- 🏛️ **Secteur public:** Mairies, ministères, agences publiques
- 🤝 **ONG/Projets:** Mécanismes de feedback et redevabilité

## 🔐 Sécurité

- ✅ Authentification JWT avec refresh tokens
- ✅ RBAC (Role-Based Access Control)
- ✅ Row Level Security PostgreSQL (isolation multi-tenant)
- ✅ Rate limiting par organisation/utilisateur
- ✅ Validation stricte des inputs (class-validator)
- ✅ Protection CSRF, XSS, injection SQL
- ✅ Helmet.js pour headers sécurisés
- ✅ Audit logs complet
- ✅ Chiffrement données sensibles
- ⏳ 2FA pour admins (Phase 4)
- ⏳ SSO SAML/OAuth2 (Phase 4)

## 🧪 Tests

```bash
# Tests unitaires backend
cd backend
npm test

# Tests E2E backend
npm run test:e2e

# Tests frontend
cd frontend
npm test

# Coverage
npm run test:cov
```

## 📦 Déploiement

### Production (Dokploy)

Le déploiement en production se fait via **Dokploy** sur VPS.

```bash
# Build backend
cd backend
npm run build

# Build frontend
cd frontend
npm run build

# Démarrage production
npm run start:prod
```

Voir [Guide de déploiement Dokploy](docs/DEPLOYMENT.md) pour plus de détails.

## 🤝 Contribution

Ce projet est développé par **ATAABA Expertise**.

Pour toute contribution:
1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 License

Proprietary - © 2026 ATAABA Expertise. Tous droits réservés.

## 📞 Contact

**ATAABA Expertise**
- Email: contact@ataaba.com
- Site web: https://ataaba.com
- Support: support@satisclient.sn

## 🙏 Remerciements

- [NestJS](https://nestjs.com/) - Framework backend
- [Next.js](https://nextjs.org/) - Framework frontend
- [Prisma](https://www.prisma.io/) - ORM
- [Shadcn/ui](https://ui.shadcn.com/) - Composants UI
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS

---

**Version:** 1.0.0 (Septembre 2026)  
**Statut:** 🚧 En développement actif
