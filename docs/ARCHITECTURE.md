# SatisClient - Architecture Technique

## 1. Vue d'ensemble

Architecture monolithique modulaire pour le MVP, avec préparation pour évolution microservices.

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENTS                                  │
│  Web App │ Mobile Web │ QR Code Scanner │ Admin Dashboard   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    NEXT.JS FRONTEND                          │
│  ┌──────────────┬──────────────┬──────────────────────┐    │
│  │ Public Pages │ Client Portal│ Admin Dashboard       │    │
│  │ - Landing    │ - My Tickets │ - Users Management    │    │
│  │ - Feedback   │ - Track      │ - Settings            │    │
│  │ - Survey     │ - Profile    │ - Analytics           │    │
│  └──────────────┴──────────────┴──────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                         REST API / GraphQL
                              │
┌─────────────────────────────────────────────────────────────┐
│                    NESTJS BACKEND                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    API GATEWAY                        │  │
│  │  Rate Limiting │ CORS │ Compression │ Helmet         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────── MODULES ───────────────────────────┐  │
│  │                                                        │  │
│  │  [Auth Module]                                        │  │
│  │  - JWT Strategy                                       │  │
│  │  - RBAC Guards                                        │  │
│  │  - SSO (Future)                                       │  │
│  │                                                        │  │
│  │  [Organizations Module]                               │  │
│  │  - Multi-tenant isolation                             │  │
│  │  - Sites/Services hierarchy                           │  │
│  │                                                        │  │
│  │  [Feedback Module]                                    │  │
│  │  - Ratings & Reviews                                  │  │
│  │  - Surveys (dynamic forms)                            │  │
│  │  - Anonymous/Identified                               │  │
│  │                                                        │  │
│  │  [Complaints Module]                                  │  │
│  │  - Ticket creation (SAT-XXXX)                         │  │
│  │  - Workflow state machine                             │  │
│  │  - Assignment & Escalation                            │  │
│  │  - SLA tracking                                       │  │
│  │                                                        │  │
│  │  [Suggestions Module]                                 │  │
│  │  - Collection & Classification                        │  │
│  │  - Action tracking                                    │  │
│  │                                                        │  │
│  │  [Analytics Module]                                   │  │
│  │  - CSAT/NPS calculation                               │  │
│  │  - Trends & Comparisons                               │  │
│  │  - AI Sentiment Analysis                              │  │
│  │  - Reports generation                                 │  │
│  │                                                        │  │
│  │  [Notifications Module]                               │  │
│  │  - Email (Nodemailer)                                 │  │
│  │  - SMS (Twilio/Africa's Talking)                      │  │
│  │  - WhatsApp (Twilio API)                              │  │
│  │  - In-app notifications                               │  │
│  │                                                        │  │
│  │  [QR Code Module]                                     │  │
│  │  - Generation by entity                               │  │
│  │  - Link shortening                                    │  │
│  │                                                        │  │
│  │  [Files Module]                                       │  │
│  │  - Upload (S3/MinIO/Local)                            │  │
│  │  - Virus scan                                         │  │
│  │  - Compression                                        │  │
│  │                                                        │  │
│  │  [Reports Module]                                     │  │
│  │  - PDF generation (Puppeteer)                         │  │
│  │  - Excel exports (ExcelJS)                            │  │
│  │  - Scheduled reports                                  │  │
│  │                                                        │  │
│  │  [Audit Module]                                       │  │
│  │  - Action logging                                     │  │
│  │  - User tracking                                      │  │
│  │  - Compliance reports                                 │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
         ┌──────────────────┐  ┌──────────────────┐
         │   PostgreSQL     │  │     Redis        │
         │   - Main DB      │  │  - Cache         │
         │   - Audit logs   │  │  - Sessions      │
         │   - JSONB data   │  │  - Queue (Bull)  │
         └──────────────────┘  └──────────────────┘
                    │
                    ▼
         ┌──────────────────────────┐
         │   Background Jobs        │
         │   - SLA monitoring       │
         │   - Escalations          │
         │   - Scheduled reports    │
         │   - Sentiment analysis   │
         └──────────────────────────┘
```

## 2. Structure des dossiers

```
satisclient/
├── backend/                    # NestJS API
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── common/            # Shared utilities
│   │   │   ├── decorators/
│   │   │   ├── filters/
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   └── pipes/
│   │   ├── config/            # Configuration
│   │   │   ├── database.config.ts
│   │   │   ├── jwt.config.ts
│   │   │   └── email.config.ts
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── dto/
│   │   │   │   ├── guards/
│   │   │   │   └── strategies/
│   │   │   ├── users/
│   │   │   ├── organizations/
│   │   │   ├── sites/
│   │   │   ├── feedback/
│   │   │   ├── complaints/
│   │   │   ├── suggestions/
│   │   │   ├── surveys/
│   │   │   ├── analytics/
│   │   │   ├── notifications/
│   │   │   ├── qr-codes/
│   │   │   ├── files/
│   │   │   ├── reports/
│   │   │   └── audit/
│   │   └── prisma/            # Prisma ORM
│   │       ├── schema.prisma
│   │       ├── migrations/
│   │       └── seed.ts
│   ├── test/
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # Next.js App
│   ├── src/
│   │   ├── app/               # App Router
│   │   │   ├── (public)/      # Public routes
│   │   │   │   ├── page.tsx   # Landing
│   │   │   │   ├── feedback/[code]/
│   │   │   │   └── survey/[id]/
│   │   │   ├── (authenticated)/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── complaints/
│   │   │   │   ├── analytics/
│   │   │   │   └── settings/
│   │   │   ├── (admin)/
│   │   │   │   └── admin/
│   │   │   ├── api/           # API routes
│   │   │   │   └── auth/[...nextauth]/
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── ui/            # Shadcn components
│   │   │   ├── feedback/
│   │   │   ├── complaints/
│   │   │   ├── charts/
│   │   │   └── layouts/
│   │   ├── lib/
│   │   │   ├── api.ts         # API client
│   │   │   ├── utils.ts
│   │   │   └── validations.ts
│   │   ├── hooks/
│   │   ├── types/
│   │   └── styles/
│   ├── public/
│   ├── package.json
│   └── next.config.js
│
├── shared/                     # Shared types/constants
│   └── types/
│       ├── user.types.ts
│       ├── complaint.types.ts
│       └── feedback.types.ts
│
├── docs/                       # Documentation
│   ├── api/
│   ├── deployment/
│   └── user-guides/
│
├── docker/
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── docker-compose.yml
│
└── README.md
```

## 3. Modèle de données PostgreSQL

### Entités principales

```sql
-- Organizations (Multi-tenant)
organizations
  id, name, slug, logo, settings (JSONB), subscription_plan, created_at

-- Users
users
  id, email, password_hash, first_name, last_name, phone, role, organization_id

-- Sites/Locations hierarchy
sites
  id, name, type (region/agency/service/point), parent_id, organization_id, qr_code

-- Feedback/Ratings
feedbacks
  id, organization_id, site_id, rating (1-5), criteria (JSONB), comment, 
  is_anonymous, user_id, created_at, sentiment (positive/neutral/negative)

-- Surveys
surveys
  id, title, description, questions (JSONB), is_active, organization_id

survey_responses
  id, survey_id, respondent_id, answers (JSONB), submitted_at

-- Complaints
complaints
  id, ticket_number (SAT-2026-000145), organization_id, site_id, 
  category, description, priority, status, 
  created_by, assigned_to, 
  sla_due_date, resolved_at, closed_at,
  attachments (JSONB), created_at, updated_at

complaint_history
  id, complaint_id, action, old_status, new_status, comment, user_id, created_at

-- Suggestions
suggestions
  id, organization_id, site_id, title, description, status, 
  created_by, assigned_to, implemented_at

-- Notifications
notifications
  id, user_id, type, channel (email/sms/whatsapp), status, 
  content (JSONB), sent_at, read_at

-- Audit logs
audit_logs
  id, user_id, organization_id, action, entity_type, entity_id, 
  changes (JSONB), ip_address, user_agent, created_at
```

## 4. Patterns & Best Practices

### Backend (NestJS)

1. **CQRS Pattern** pour analytics (séparation lecture/écriture)
2. **Repository Pattern** via Prisma
3. **DTO Validation** avec class-validator
4. **Guards** pour RBAC (Role-Based Access Control)
5. **Interceptors** pour logging et transformation
6. **Exception Filters** pour gestion d'erreurs
7. **Bull Queue** pour jobs asynchrones (emails, rapports)
8. **Rate Limiting** par organisation/utilisateur

### Frontend (Next.js)

1. **Server Components** par défaut (performance)
2. **React Query** pour cache et état serveur
3. **Zustand** pour état client léger
4. **Zod** pour validation formulaires
5. **Shadcn/ui + Tailwind** pour UI cohérent
6. **Recharts/Tremor** pour visualisations
7. **Next-Auth** pour authentification

### Sécurité

1. **JWT** avec refresh tokens
2. **RBAC** (Role-Based) + **ABAC** (Attribute-Based)
3. **Row Level Security** PostgreSQL (isolation multi-tenant)
4. **Rate Limiting** (express-rate-limit)
5. **Helmet** pour headers sécurisés
6. **CORS** configuré
7. **Input Validation** stricte
8. **Audit Logs** pour toutes actions sensibles
9. **2FA** pour admins (Future)
10. **Encryption** des données sensibles

## 5. Intégrations tierces

### Phase 1 (MVP)
- **Nodemailer** - Emails transactionnels
- **QRCode** - Génération QR codes
- **ExcelJS** - Exports Excel
- **PDFKit/Puppeteer** - Rapports PDF

### Phase 2 (Pro)
- **Twilio** - SMS & WhatsApp
- **Africa's Talking** - SMS local alternatif
- **AWS S3 / MinIO** - Stockage fichiers
- **OpenAI API** - Analyse sentiment avancée

### Phase 3 (Business/Institution)
- **Azure AD / Okta** - SSO
- **Stripe/PayDunia** - Paiements abonnements
- **Zapier/n8n** - Automatisations
- **Metabase** - BI avancée

## 6. Stratégie de déploiement

### Environnements

```
Development  → Staging → Production
(Local)        (Test)    (Live)
```

### Infrastructure recommandée

**Option 1: Cloud VPS (Phase MVP)**
- DigitalOcean Droplet / Hetzner
- Docker Compose
- Nginx reverse proxy
- PostgreSQL + Redis co-localisés
- Backups quotidiens

**Option 2: Cloud Managed (Scale)**
- **Backend**: Vercel/Railway/Render
- **Database**: Supabase / Neon / AWS RDS
- **Storage**: AWS S3 / Cloudinary
- **Cache**: Upstash Redis
- **Queue**: AWS SQS / Redis

### CI/CD
- GitHub Actions
- Tests automatisés (Jest + Playwright)
- Déploiement automatique sur push `main`

## 7. Phases de développement

### Phase 1: MVP (Formule Essentiel) - 4-6 semaines
- [ ] Setup projet (NestJS + Next.js + PostgreSQL)
- [ ] Module Auth (JWT, RBAC)
- [ ] Module Organizations (multi-tenant)
- [ ] Module Feedback (notation + commentaires)
- [ ] QR Codes génération
- [ ] Dashboard simple (moyenne ratings)
- [ ] Exports PDF/Excel basiques

### Phase 2: Formule Pro - 6-8 semaines
- [ ] Module Complaints (workflow complet)
- [ ] Système d'affectation
- [ ] SLA tracking + alertes
- [ ] Notifications (email + SMS)
- [ ] Module Surveys (formulaires dynamiques)
- [ ] Analytics avancées (tendances, comparaisons)
- [ ] Multisite complet

### Phase 3: Formule Business - 6-8 semaines
- [ ] Analyse sentiment IA
- [ ] Escalades automatiques
- [ ] Rapports planifiés automatiques
- [ ] API REST documentée (Swagger)
- [ ] Comparaisons multisites avancées
- [ ] Performance optimization

### Phase 4: Formule Institution - Sur devis
- [ ] SSO (SAML, OAuth2)
- [ ] Intégrations customs
- [ ] White-labeling complet
- [ ] Sécurité renforcée (2FA, audit avancé)
- [ ] Support déploiement on-premise

## 8. Métriques de succès

### Techniques
- Temps de réponse API < 200ms (p95)
- Uptime > 99.5%
- Couverture tests > 80%

### Business
- Temps traitement réclamation moyen
- Taux satisfaction client
- Taux adoption par utilisateurs
- Conversion essai → payant

## 9. Risques & Mitigations

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Charge élevée (pics) | Perf dégradée | Redis cache, Bull queue, CDN |
| Isolation tenant faible | Fuite données | RLS PostgreSQL, tests sécurité |
| SLA non respectés | Perte confiance | Monitoring (Sentry), alertes proactives |
| SMS coûts élevés | Budget dépassé | Quotas par plan, throttling |
| Spam/abus | Surcharge | Rate limiting, CAPTCHA optionnel |

## 10. Prochaines étapes

1. ✅ Architecture validée
2. ⏳ Création structure projet
3. ⏳ Modèle de données Prisma
4. ⏳ Setup environnements dev
5. ⏳ Développement MVP Phase 1
