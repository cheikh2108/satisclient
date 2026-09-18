# SatisClient Backend (NestJS)

API REST pour la plateforme SatisClient.

## Structure

```
backend/
├── src/
│   ├── main.ts                 # Point d'entrée
│   ├── app.module.ts           # Module racine
│   ├── common/                 # Utilitaires partagés
│   │   ├── decorators/         # Décorateurs custom
│   │   ├── filters/            # Exception filters
│   │   ├── guards/             # Guards (auth, roles)
│   │   ├── interceptors/       # Intercepteurs (logging, transform)
│   │   └── pipes/              # Pipes de validation
│   ├── config/                 # Configuration
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   ├── email.config.ts
│   │   └── redis.config.ts
│   ├── modules/                # Modules fonctionnels
│   │   ├── auth/               # Authentification & autorisation
│   │   ├── users/              # Gestion utilisateurs
│   │   ├── organizations/      # Organisations (multi-tenant)
│   │   ├── sites/              # Sites & hiérarchie
│   │   ├── feedback/           # Avis & notations
│   │   ├── complaints/         # Réclamations
│   │   ├── suggestions/        # Suggestions
│   │   ├── surveys/            # Enquêtes
│   │   ├── analytics/          # Analytics & KPIs
│   │   ├── notifications/      # Email, SMS, WhatsApp
│   │   ├── qr-codes/           # QR codes
│   │   ├── files/              # Upload & storage
│   │   ├── reports/            # Rapports PDF/Excel
│   │   └── audit/              # Audit logs
│   └── prisma/                 # Prisma ORM
│       ├── schema.prisma       # Schéma de données
│       ├── migrations/         # Migrations SQL
│       └── seed.ts             # Données de test
├── test/                       # Tests E2E
├── package.json
└── tsconfig.json
```

## Installation

```bash
cd backend
pnpm install
```

## Configuration

Copier `.env.example` vers `.env` et ajuster les valeurs.

## Développement

```bash
# Démarrer en mode dev
pnpm run start:dev

# Générer module
nest g module modules/exemple

# Générer service
nest g service modules/exemple

# Générer controller
nest g controller modules/exemple
```

## Prisma

```bash
# Créer migration
pnpm prisma migrate dev --name nom_migration

# Appliquer migrations
pnpm prisma migrate deploy

# Générer client
pnpm prisma generate

# Interface graphique
pnpm prisma studio

# Seed database
pnpm prisma db seed
```

## Tests

```bash
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Coverage
pnpm run test:cov
```

## Build

```bash
pnpm run build
pnpm run start:prod
```

## API Documentation

Swagger disponible sur: http://localhost:3001/api/docs

## Modules principaux

### Auth Module
- JWT authentication
- RBAC (Role-Based Access Control)
- Guards: JwtGuard, RolesGuard
- Strategies: JWT, Refresh Token

### Organizations Module
- Multi-tenant isolation
- Settings management
- Subscription plans

### Complaints Module
- Workflow state machine
- SLA tracking
- Assignment & escalation
- History tracking

### Analytics Module
- CSAT/NPS calculation
- Sentiment analysis (AI)
- Trend detection
- Multi-site comparisons
