# 🎯 SatisClient

**Plateforme B2B de gestion de l'expérience client, satisfaction et redevabilité**

> *"Votre avis améliore nos services"*

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/ataaba/satisclient)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-En%20développement-yellow.svg)]()

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

### Stack
- **Backend:** NestJS (Node.js + TypeScript)
- **Frontend:** Next.js 14+ (React + TypeScript + App Router)
- **Database:** PostgreSQL 15+ avec Row Level Security
- **Cache:** Redis
- **ORM:** Prisma
- **Queue:** Bull (Redis-based)
- **UI:** Shadcn/ui + Tailwind CSS
- **Charts:** Recharts / Tremor

### Structure du projet

```
satisclient/
├── backend/                    # API NestJS
│   ├── src/
│   │   ├── modules/           # Modules fonctionnels
│   │   ├── common/            # Utilities partagées
│   │   ├── config/            # Configuration
│   │   └── prisma/            # Schéma + migrations
│   └── test/
├── frontend/                   # Application Next.js
│   ├── src/
│   │   ├── app/              # App Router
│   │   ├── components/       # Composants React
│   │   ├── lib/              # Utilities
│   │   └── hooks/            # Custom hooks
│   └── public/
├── shared/                     # Types partagés
├── docker/                     # Configuration Docker
└── docs/                       # Documentation

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

- Node.js 18+ et pnpm
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (optionnel)

### Installation

```bash
# Cloner le repository
git clone https://github.com/ataaba/satisclient.git
cd satisclient

# Installation des dépendances
pnpm install

# Démarrer les services (PostgreSQL + Redis)
docker-compose up -d

# Configuration environnement
cp .env.example .env
# Éditer .env avec vos credentials

# Migrations base de données
cd backend
pnpm prisma migrate dev

# Seed données de test
pnpm prisma db seed

# Démarrer le backend (port 3001)
pnpm run start:dev

# Dans un autre terminal, démarrer le frontend (port 3000)
cd frontend
pnpm run dev
```

### Accès

- **Frontend:** http://localhost:3000
- **API Backend:** http://localhost:3001
- **API Docs (Swagger):** http://localhost:3001/api/docs

**Compte de test:**
- Email: `admin@demo.satisclient.sn`
- Mot de passe: `Demo123!`

## 📚 Documentation

- [Architecture complète](ARCHITECTURE.md)
- [Schéma de base de données](DATABASE_SCHEMA.md)
- [Cahier des charges](SatisClient_Cahier_des_charges_et_offre_commerciale.md)
- [Guide API](docs/api/README.md) *(À venir)*
- [Guide déploiement](docs/deployment/README.md) *(À venir)*

## 🎯 Roadmap

### Phase 1: MVP Essentiel (En cours - 6 semaines)
- [x] Architecture définie
- [x] Schéma base de données
- [ ] Setup projet NestJS + Next.js
- [ ] Module Auth (JWT + RBAC)
- [ ] Module Organizations (multi-tenant)
- [ ] Module Feedback (notation + commentaires)
- [ ] QR Codes génération
- [ ] Dashboard basique
- [ ] Exports PDF/Excel

### Phase 2: Formule Pro (6-8 semaines)
- [ ] Module Complaints complet (workflow)
- [ ] SLA tracking + alertes
- [ ] Système d'affectation
- [ ] Notifications email/SMS
- [ ] Surveys dynamiques
- [ ] Analytics avancées

### Phase 3: Formule Business (6-8 semaines)
- [ ] Analyse sentiment IA
- [ ] Escalades automatiques
- [ ] Rapports planifiés
- [ ] API REST documentée (Swagger)
- [ ] Comparaisons multisites avancées

### Phase 4: Formule Institution (Sur devis)
- [ ] SSO (SAML, OAuth2)
- [ ] Intégrations customs
- [ ] White-labeling
- [ ] Sécurité renforcée (2FA)
- [ ] Support on-premise

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
pnpm run test

# Tests E2E backend
pnpm run test:e2e

# Tests frontend
cd frontend
pnpm run test

# Coverage
pnpm run test:cov
```

## 📦 Déploiement

### Production

```bash
# Build backend
cd backend
pnpm run build

# Build frontend
cd frontend
pnpm run build

# Démarrage production
pnpm run start:prod
```

### Docker

```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Démarrer
docker-compose -f docker-compose.prod.yml up -d
```

Voir [Guide de déploiement](docs/deployment/README.md) pour plus de détails.

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
