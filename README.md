# 🎯 SatisClient

**Plateforme B2B de gestion de l'expérience client, satisfaction et redevabilité**

> _"Votre avis améliore nos services"_

[![Version](https://img.shields.io/badge/version-1.0.0--dev-blue.svg)](https://github.com/cheikh2108/satisclient)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-En%20développement-yellow.svg)](<>)

> **État actuel:** Application déployable avec backend NestJS, frontend Next.js, PostgreSQL/Prisma, authentification JWT, multi-tenant, gestion des réclamations, feedbacks, analytics, notifications et administration plateforme.

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

### 🔔 Notifications

- Notifications in-app persistantes par utilisateur
- Préférences par canal et par type d'événement
- Notifications de nouveaux feedbacks et de nouvelles réclamations pour les responsables d'organisation
- Préparation des canaux email, SMS et WhatsApp

## 🏗️ Architecture technique

### Stack (V1)

- **Backend:** NestJS (Node.js + TypeScript)
- **Frontend:** Next.js 16 (React + TypeScript + App Router)
- **Database:** PostgreSQL 16 via Docker Compose
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
│   │   ├── schema.prisma                 # Schéma BDD multi-tenant
│   │   ├── bootstrap-super-admin.js      # Bootstrap production sans données de démo
│   │   └── seed.ts                       # Point d'entrée historique de compatibilité
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

| Formule         | Prix/mois    | Sites    | Users    | Fonctionnalités                                |
| --------------- | ------------ | -------- | -------- | ---------------------------------------------- |
| **Essentiel**   | 25 000 FCFA  | 1        | 3        | Avis, notation, enquêtes, QR codes             |
| **Pro**         | 60 000 FCFA  | 5        | 10       | + Réclamations, workflow, SLA, alertes         |
| **Business**    | 125 000 FCFA | 15       | 30       | + IA, analytics avancées, API                  |
| **Institution** | Sur devis    | Illimité | Illimité | + SSO, intégrations custom, sécurité renforcée |

**Offre de lancement:** 7 jours d'essai gratuits

## 🚀 Démarrage rapide

### Prérequis

- **Node.js 18+** et npm 9+
- **PostgreSQL 14+** natif Windows/Mac/Linux
- **Git**

> **Note:** Redis, les fournisseurs email/SMS et l'IA sont optionnels pour le démarrage local.

### Installation

```bash
# 1. Cloner le repository
git clone https://github.com/cheikh2108/satisclient.git
cd satisclient

# 2. Installer les dépendances du backend et du frontend
cd backend && npm install
cd ../frontend && npm install

# 3. Configurer PostgreSQL
# Créer l'utilisateur et la base de données :
# CREATE USER satisclient WITH PASSWORD 'satisclient_password';
# CREATE DATABASE satisclient_dev OWNER satisclient;

# 4. Configurer l'environnement
# Copier les fichiers .env.example disponibles et renseigner les secrets locaux

# 5. Générer le client Prisma
cd backend
npx prisma generate

# 6. Initialiser la base et le compte super admin
npx prisma db push
npm run prisma:seed
# Variables attendues: SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD
# Optionnel: SUPER_ADMIN_ORGANIZATION_NAME

# 7. Démarrer l'application (backend + frontend)
cd ..
npm run dev
```

### Accès

- **Frontend:** http://localhost:3000
- **API Backend:** http://localhost:3001
- **API Docs (Swagger):** http://localhost:3001/api/docs

**Compte super admin d'environnement:**

- Configuré via les variables `SUPER_ADMIN_EMAIL` et `SUPER_ADMIN_PASSWORD`
- Le compte est créé automatiquement avec l’organisation `SatisClient Platform`
- Aucune donnée de démonstration n’est injectée dans le bootstrap de production

### Multi-tenant et rôles

- `super_admin`: administration de la plateforme, sans accès aux notifications des organisations clientes
- `org_admin`: administration d'une organisation cliente
- `quality_manager` et `service_manager`: responsables opérationnels
- `agent` et `client`: accès limités selon leur organisation

L'organisation `SatisClient Platform` est une organisation technique marquée comme plateforme. Elle est exclue des statistiques commerciales, des listes clients et des quotas des organisations clientes.

### Variables Dokploy

Le service `backend` doit recevoir ces variables dans Dokploy :

```env
POSTGRES_PASSWORD=...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
ENCRYPTION_KEY=...
BACKEND_URL=https://api.example.com
FRONTEND_URL=https://app.example.com
SUPER_ADMIN_EMAIL=admin@example.com
SUPER_ADMIN_PASSWORD=...
SUPER_ADMIN_ORGANIZATION_NAME=SatisClient Platform
# Sandbox DexPay
DEXPAY_API_KEY=pk_test_...
DEXPAY_API_SECRET=sk_test_...
DEXPAY_SANDBOX=true
```

Au démarrage Docker, l'entrypoint exécute `prisma db push`, puis `bootstrap-super-admin.js`. Si le bootstrap échoue, le conteneur backend s'arrête afin que l'erreur apparaisse dans les logs Dokploy.

### Paiements DexPay

Les organisations peuvent payer ou renouveler leur formule mensuelle depuis l'onglet **Abonnement**. Le backend crée une checkout session DexPay et redirige l'organisation vers la page de paiement hébergée.

- Les clés DexPay restent uniquement dans le service `backend`.
- Le paiement est validé exclusivement par webhook signé HMAC-SHA256.
- Un paiement confirmé active l'organisation pour 30 jours.
- Une organisation expirée peut encore ouvrir le checkout pour renouveler son accès.
- Utiliser les clés `pk_test_*` et `sk_test_*` en sandbox, puis les clés `pk_live_*` et `sk_live_*` en production.
- Régler `DEXPAY_SANDBOX=true` avec les clés de test, puis `DEXPAY_SANDBOX=false` avec les clés de production.
- Webhook attendu : `POST /api/billing/dexpay/webhook`.

### Passage en production DexPay

Après validation complète en sandbox, remplacer uniquement les variables DexPay dans Dokploy :

```env
DEXPAY_API_KEY=pk_live_...
DEXPAY_API_SECRET=sk_live_...
DEXPAY_SANDBOX=false
```

Puis redéployer le backend et effectuer un petit paiement réel de contrôle. L'URL webhook reste la même :

```text
https://votre-domaine.tld/api/billing/dexpay/webhook
```

Ne jamais placer `sk_test_*` ou `sk_live_*` dans le frontend, le dépôt Git ou la documentation.

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

### Phase 1: MVP Essentiel

- [x] Architecture définie
- [x] Schéma base de données (15 tables)
- [x] Setup projet NestJS + Next.js
- [x] Sécurité (JWT, Encryption, Rate limiting, Brute force protection)
- [x] PostgreSQL + Prisma configuré
- [x] Base de données Prisma multi-tenant
- [x] Module Auth (JWT + RBAC)
- [x] Module Organizations
- [x] Module Feedback et réclamations
- [x] QR Codes
- [x] Dashboard et KPI plateforme/client
- [x] Notifications in-app et préférences
- [x] Déploiement Docker/Dokploy

### Phase 2: Extensions produit

- [x] Module Complaints complet (workflow)
- [x] SLA tracking et alertes applicatives
- [x] Système d'affectation
- [x] Notifications email/SMS/WhatsApp réelles
- [x] Surveys dynamiques
- [x] Analytics avancées
- [x] Redis (Cache & Queues)

### Phase 3: Fonctionnalités avancées

- [x] Analyse sentiment IA (OpenAI)
- [x] Escalades automatiques
- [x] Rapports planifiés
- [x] API REST documentée (Swagger)
- [x] Comparaisons multisites avancées
- [x] Cloud Storage (S3/MinIO)

### Phase 4: Formule Institution (Sur devis)

- [x] SSO (SAML, OAuth2)
- [x] Intégrations customs
- [x] White-labeling
- [x] Sécurité renforcée (2FA)
- [x] Support on-premise
- [x] Payment (Stripe/PayDunia)
- [x] Monitoring (Sentry)

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

### Production (Docker/Dokploy)

Le déploiement en production se fait via **Dokploy** sur VPS.

Le déploiement recommandé utilise [docker-compose.yml](docker-compose.yml) dans Dokploy. Les services sont :

- `postgres`: base PostgreSQL persistante via le volume `postgres_data` ;
- `backend`: API NestJS, migrations/synchronisation Prisma et bootstrap du super admin ;
- `frontend`: application Next.js ;
- `uploads`: stockage persistant des fichiers via le volume `uploads_data`.

Après chaque déploiement, vérifier les logs du backend. Le message attendu est :

```text
Super admin prêt: admin@example.com | organisation: SatisClient Platform
Starting server...
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
