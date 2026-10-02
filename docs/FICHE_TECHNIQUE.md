# Fiche technique SatisClient

**Version :** 1.0  
**Date :** 1er octobre 2026  
**Statut :** application en production, évolutive

## 1. Objet

SatisClient est une plateforme SaaS multi-tenant de collecte et de pilotage de la satisfaction client. Elle sépare les données de la plateforme et celles des organisations clientes au moyen de `organizationId` et d'une organisation technique marquée `isPlatform`.

Cette fiche décrit l'architecture, les composants, les contrats principaux, le déploiement, la sécurité, l'exploitation et les limites connues.

## 2. Architecture générale

```text
Navigateur / QR / lien public
            |
            v
Frontend Next.js 16 : port 3000
            |
            v
Backend NestJS : /api, port 3001
            |
            +--> Prisma ORM
            |        |
            |        v
            |    PostgreSQL 16
            |
            +--> Resend : emails d'authentification
            +--> DexPay : paiements et webhooks signés
            +--> Stockage local : uploads persistants
```

### Composants

| Composant   | Technologie                              | Responsabilité                                                        |
| ----------- | ---------------------------------------- | --------------------------------------------------------------------- |
| Frontend    | Next.js 16, React, Tailwind, React Query | Interface web, dashboard, formulaires publics, cache et mutations.    |
| Backend     | NestJS 10, TypeScript                    | API REST, règles métier, sécurité, jobs et orchestration.             |
| Données     | PostgreSQL 16                            | Organisations, utilisateurs, feedbacks, enquêtes, paiements et audit. |
| ORM         | Prisma 5                                 | Schéma, accès base, transactions et génération client.                |
| Paiement    | DexPay                                   | Checkout abonnement/campagne et webhook HMAC-SHA256.                  |
| Email       | API Resend                               | Activation organisation et réinitialisation de mot de passe.          |
| Déploiement | Docker Compose, Dokploy                  | Build, réseau, redémarrage et variables d'environnement.              |

## 3. Arborescence importante

```text
backend/
  prisma/schema.prisma
  src/main.ts
  src/app.module.ts
  src/common/
  src/modules/auth/
  src/modules/organizations/
  src/modules/users/
  src/modules/sites/
  src/modules/feedback/
  src/modules/complaints/
  src/modules/suggestions/
  src/modules/surveys/
  src/modules/qr-codes/
  src/modules/analytics/
  src/modules/reports/
  src/modules/notifications/
  src/modules/files/
  src/modules/audit/
  src/modules/payments/
  src/modules/search/
frontend/
  src/app/
  src/components/
  src/hooks/
  src/lib/api/
  src/types/
  src/styles/
docs/
docker-compose.yml
```

## 4. Modules backend

Les modules sont enregistrés dans `backend/src/app.module.ts` :

- Auth ;
- Users ;
- Organizations ;
- Sites ;
- Feedback ;
- Complaints ;
- Suggestions ;
- Surveys ;
- Analytics ;
- Notifications ;
- QR Codes ;
- Files ;
- Reports ;
- Audit ;
- Payments ;
- Roles ;
- Search.

L'API est préfixée par `/api` dans `backend/src/main.ts`.

## 5. Modèle multi-tenant

Les données principales portent un `organizationId`. Les gardes contrôlent :

1. l'identité JWT ;
2. le rôle système ;
3. le statut de l'organisation ;
4. l'appartenance de la ressource à l'organisation de l'utilisateur.

Le `super_admin` peut accéder aux opérations plateforme. L'organisation technique `isPlatform=true` est exclue des statistiques commerciales et de la plupart des listes clients.

### Statuts d'organisation

- `trial` : essai en cours ;
- `active` : abonnement actif ;
- `suspended` : accès suspendu ;
- `expired` : abonnement ou essai expiré.

Une organisation expirée peut encore utiliser une campagne si un pack valide dispose de crédits, selon les règles du `OrganizationGuard`.

## 6. Authentification et sécurité

### 6.1 Authentification

Endpoints :

```text
POST /api/auth/login
POST /api/auth/register
POST /api/auth/create-account
POST /api/auth/refresh
POST /api/auth/logout
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

Caractéristiques :

- JWT d'accès de courte durée ;
- refresh token aléatoire persisté ;
- rotation des refresh tokens ;
- cookies `httpOnly` ;
- cookies `secure` et `SameSite=None` en production ;
- bcrypt avec 12 rounds ;
- validation de force du mot de passe ;
- révocation des sessions après changement de mot de passe ;
- limitation des demandes de reset ;
- anti-énumération pour le reset ;
- journalisation des connexions dans l'audit.

### 6.2 Protection HTTP

`main.ts` configure :

- Helmet ;
- CORS avec origines configurées ;
- compression ;
- cookie parser ;
- validation globale ;
- sanitation des chaînes HTML ;
- limite et contrôle de débit via Throttler.

La validation globale utilise :

```ts
new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
});
```

Les DTO imbriqués, notamment les questions d'enquête, doivent donc déclarer leurs décorateurs `class-validator`.

### 6.3 Éléments non activés

- 2FA non active ;
- SSO SAML/OAuth/LDAP non intégré ;
- vérification email complète non active sur tous les parcours ;
- notifications métier email/SMS/WhatsApp encore partielles.

## 7. Rôles et contrôle d'accès

Rôles Prisma :

```text
super_admin
org_admin
director
quality_manager
service_manager
agent
client
```

Le `RolesGuard` vérifie principalement l'enum système et les décorateurs `@Roles(...)`.

| Fonction                    | Rôles principaux                                                          |
| --------------------------- | ------------------------------------------------------------------------- |
| Administration plateforme   | `super_admin`                                                             |
| Administration organisation | `org_admin`                                                               |
| Création d'enquête          | `super_admin`, `org_admin`, `quality_manager`                             |
| Achat de pack campagne      | `org_admin`                                                               |
| Lecture des réponses        | `super_admin`, `org_admin`, `quality_manager`, `service_manager`, `agent` |
| Rapports enquêtes           | `super_admin`, `org_admin`, `quality_manager`                             |
| Gestion opérationnelle      | selon module et décorateurs de rôle                                       |

Les rôles personnalisés sont persistés avec leurs permissions JSON, mais leur application complète dans `RolesGuard` reste une évolution à prévoir.

## 8. Données principales

Le schéma Prisma contient notamment :

- `Organization` ;
- `User` ;
- `Site` ;
- `Feedback` ;
- `Complaint` et `ComplaintHistory` ;
- `Suggestion` ;
- `Survey` et `SurveyResponse` ;
- `QrCode` ;
- `Payment` et `CampaignPack` ;
- `PaymentWebhookEvent` ;
- `Notification` ;
- `AuditLog` ;
- `StoredFile` ;
- `CustomRole` ;
- `PasswordReset` ;
- `EmailVerification` ;
- `RefreshToken`.

Les opérations de consommation de crédits et de création de campagne utilisent une transaction Prisma.

## 9. Contrats API principaux

### Organisations

```text
GET    /api/organizations/me/usage
POST   /api/organizations
GET    /api/organizations
GET    /api/organizations/:id
GET    /api/organizations/slug/:slug
PATCH  /api/organizations/:id
DELETE /api/organizations/:id
```

### Utilisateurs

```text
GET    /api/users/me
PATCH  /api/users/me
POST   /api/users/me/password
PATCH  /api/users/me/preferences
GET    /api/users/me/sessions
DELETE /api/users/me/sessions/:tokenId
GET    /api/users/stats
GET    /api/users/platform-stats
GET    /api/users
```

### Sites

```text
POST   /api/sites
GET    /api/sites
GET    /api/sites/stats
GET    /api/sites/:id
GET    /api/sites/code/:code
GET    /api/sites/:id/children
PATCH  /api/sites/:id
DELETE /api/sites/:id
```

### Feedbacks

```text
POST   /api/feedbacks
GET    /api/feedbacks
GET    /api/feedbacks/stats
GET    /api/feedbacks/timeseries
GET    /api/feedbacks/:id
PATCH  /api/feedbacks/:id
DELETE /api/feedbacks/:id
```

La soumission publique de feedback ne nécessite pas de JWT selon le parcours public prévu.

### Réclamations

```text
POST   /api/complaints
GET    /api/complaints
GET    /api/complaints/stats
GET    /api/complaints/ticket/:ticketNumber
GET    /api/complaints/:id
POST   /api/complaints/:id/assign/:userId
PATCH  /api/complaints/:id/status
POST   /api/complaints/:id/resolve
POST   /api/complaints/:id/escalate
POST   /api/complaints/:id/comment
GET    /api/complaints/:id/history
PATCH  /api/complaints/:id
DELETE /api/complaints/:id
```

### Enquêtes

```text
POST   /api/surveys
GET    /api/surveys
GET    /api/surveys/:id
PATCH  /api/surveys/:id
DELETE /api/surveys/:id
POST   /api/surveys/:id/responses
GET    /api/surveys/:id/responses
GET    /api/surveys/:id/analytics
```

Parcours publics :

```text
GET    /api/public/surveys/:id
POST   /api/public/surveys/:id/responses
GET    /api/public/feedback-context?site=...&qr=...
POST   /api/public/scan
```

### QR codes

```text
POST   /api/qr-codes
GET    /api/qr-codes
GET    /api/qr-codes/stats
GET    /api/qr-codes/code/:code
GET    /api/qr-codes/:id
PATCH  /api/qr-codes/:id
POST   /api/qr-codes/:id/regenerate
POST   /api/qr-codes/:code/scan
DELETE /api/qr-codes/:id
```

Le compteur public utilise `POST /api/public/scan`. Les GET de contexte ne doivent pas produire d'effet de bord.

### Rapports

```text
POST /api/reports/complaints
POST /api/reports/analytics
POST /api/reports/survey
POST /api/reports/feedbacks
POST /api/reports/users
POST /api/reports/sites
```

Formats : PDF, XLSX et CSV.

### Paiements

```text
POST /api/billing/checkout
POST /api/billing/campaign-checkout
GET  /api/billing/platform-campaign-stats
POST /api/billing/dexpay/webhook
```

## 10. Enquêtes et campagnes

### Types

- `one_time` : campagne ponctuelle ;
- `recurring` : campagne récurrente ;
- `continuous` : enquête continue liée à l'abonnement.

### Règles

- une campagne ponctuelle ou récurrente exige `campaignPackId` ;
- une enquête continue ne doit pas utiliser de pack campagne ;
- le pack doit appartenir à la même organisation ;
- le pack doit être actif, non expiré et avoir `remaining > 0` ;
- la décrémentation est atomique ;
- la campagne est créée dans la même transaction que la consommation du crédit.

### Questions

Les questions sont validées par `class-validator` et prennent notamment en charge :

- `rating` sur 5 ;
- `nps` ;
- `scale` ;
- `single_choice` ;
- `multiple_choice` ;
- `yes_no` ;
- `text` ;
- `email` ;
- `phone` ;
- `date`.

## 11. Paiements DexPay

### Plans

| Plan           |         Prix de référence |
| -------------- | ------------------------: |
| `essentialiel` |                25 000 XOF |
| `pro`          |                60 000 XOF |
| `business`     |               125 000 XOF |
| `institution`  | Facturation personnalisée |

### Packs

| Code         |        Prix | Crédits |  Validité |
| ------------ | ----------: | ------: | --------: |
| `single`     |  75 000 XOF |       1 |  30 jours |
| `frequency2` | 130 000 XOF |       2 | 365 jours |
| `frequency3` | 180 000 XOF |       3 | 365 jours |
| `frequency4` | 220 000 XOF |       4 | 365 jours |

### Webhook

Le webhook :

1. vérifie la signature HMAC-SHA256 ;
2. déduplique l'événement par `eventKey` ;
3. localise le paiement par référence ;
4. marque le paiement comme `succeeded`, `failed` ou `cancelled` ;
5. crée le pack ou active l'abonnement dans une transaction ;
6. marque l'événement comme traité.

La clé DexPay ne doit jamais être exposée au frontend.

## 12. Emails Resend

Le service `ResendEmailService` utilise l'API HTTP Resend.

Emails implémentés :

- reset de mot de passe ;
- invitation d'activation d'une organisation créée par le `super_admin`.

Variables nécessaires :

```env
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=SatisClient <noreply@domaine-verifie.tld>
FRONTEND_URL=https://app.example.com
```

Le domaine utilisé dans `RESEND_FROM_EMAIL` doit être vérifié dans Resend. Ne jamais committer une clé API.

## 13. Stockage des fichiers

Le mode actuel utilise un stockage local :

```env
STORAGE_TYPE=local
STORAGE_PATH=/app/uploads
```

Les fichiers sont rangés par année et mois. Les métadonnées sont stockées en base dans `StoredFile`. Le volume Docker `uploads_data` doit être conservé pendant les redéploiements.

La limite applicative standard est de 10 Mo. Une évolution recommandée consiste à appliquer systématiquement la validation magic number au contrôleur d'upload.

## 14. Jobs et traitements différés

Le module Scheduler est activé. Les traitements de réclamations comprennent notamment :

- détection périodique des SLA dépassés ;
- vérification des tickets critiques ;
- avertissements d'échéance.

Les notifications réellement envoyées dépendent de l'intégration disponible. Les emails métier, SMS et WhatsApp ne sont pas tous actifs.

## 15. Variables d'environnement

### Base de données et sécurité

```env
DATABASE_URL=postgresql://...
POSTGRES_PASSWORD=...
JWT_SECRET=...
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=...
JWT_REFRESH_EXPIRES_IN=7d
ENCRYPTION_KEY=...
NODE_ENV=production
```

### Réseau

```env
BACKEND_PORT=3001
BACKEND_URL=https://api.example.com
FRONTEND_URL=https://app.example.com
CORS_ORIGIN=https://app.example.com
NEXT_PUBLIC_API_URL=https://api.example.com/api
NEXT_PUBLIC_APP_URL=https://app.example.com
```

### Administration initiale

```env
SUPER_ADMIN_EMAIL=...
SUPER_ADMIN_PASSWORD=...
SUPER_ADMIN_ORGANIZATION_NAME=SatisClient Platform
```

### Paiement

```env
DEXPAY_API_KEY=...
DEXPAY_API_SECRET=...
DEXPAY_SANDBOX=true
```

### Email et stockage

```env
RESEND_API_KEY=...
RESEND_FROM_EMAIL="SatisClient <noreply@domaine.tld>"
STORAGE_TYPE=local
STORAGE_PATH=/app/uploads
ENABLE_SWAGGER=false
```

## 16. Installation locale

### Prérequis

- Node.js 22 recommandé ;
- npm ;
- PostgreSQL 16 ou Docker ;
- variables d'environnement configurées.

### Backend

```powershell
cd backend
npm install --legacy-peer-deps
npx prisma generate
npm run build
npm run start:dev
```

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Le frontend utilise par défaut `http://localhost:3001/api` si `NEXT_PUBLIC_API_URL` n'est pas défini.

## 17. Déploiement Docker/Dokploy

Le fichier racine `docker-compose.yml` définit :

- `postgres` : PostgreSQL 16 ;
- `backend` : NestJS sur le port 3001 ;
- `frontend` : Next.js sur le port 3000.

### Déploiement

1. Connecter le dépôt Git à Dokploy.
2. Choisir Docker Compose.
3. Activer l'auto-deploy sur `main`.
4. Définir toutes les variables d'environnement.
5. Lancer **Rebuild & Deploy**.
6. Vérifier les logs des trois services.
7. Vérifier le frontend et l'API.

Un push Git ne garantit pas toujours le redémarrage de chaque service si Dokploy est configuré avec des services séparés. En cas de doute, utiliser explicitement **Rebuild & Deploy** sur le projet complet, ou reconstruire le service backend et le service frontend séparément.

### Démarrage backend

`backend/docker-entrypoint.sh` exécute la synchronisation Prisma prévue par le projet puis le bootstrap du super-administrateur. Toute erreur de démarrage doit être vérifiée dans les logs avant de relancer l'application.

### Vérifications post-déploiement

```text
Frontend : https://app.example.com
API      : https://api.example.com/api
Swagger  : https://api.example.com/api/docs
```

Tester au minimum :

- connexion ;
- renouvellement de session ;
- création d'organisation ;
- activation par email ;
- création de site ;
- feedback public ;
- création d'enquête ;
- soumission de réponse ;
- consultation des réponses ;
- QR code et compteur de scans ;
- rapport CSV ou PDF ;
- checkout en sandbox si activé.

## 18. Maintenance et sauvegardes

### PostgreSQL

Sauvegarder régulièrement la base et tester la restauration. Les données critiques comprennent les réponses, feedbacks, réclamations, paiements, audit et utilisateurs.

### Uploads

Sauvegarder le volume `uploads_data` en même temps que la base. Restaurer les fichiers avant de rendre l'interface disponible.

### Secrets

- stocker les secrets dans Dokploy ou un gestionnaire de secrets ;
- ne jamais les mettre dans Git ;
- renouveler immédiatement une clé exposée ;
- séparer les clés sandbox et production ;
- limiter l'accès aux variables de production.

## 19. Observabilité et diagnostic

### Logs à surveiller

- démarrage et connexion Prisma ;
- erreurs de webhook DexPay ;
- erreurs Resend ;
- échecs de validation DTO ;
- accès inter-organisation refusés ;
- dépassements SLA ;
- erreurs de fichiers ;
- erreurs de refresh token.

### Diagnostic d'un `400 Bad Request`

1. ouvrir Network dans le navigateur ;
2. sélectionner la requête ;
3. vérifier Payload ;
4. vérifier Response ;
5. consulter les logs backend ;
6. vérifier `ValidationPipe`, les DTO et les valeurs UUID ;
7. vérifier le pack, le site et le type d'enquête.

En production, les messages détaillés de validation peuvent être masqués par `disableErrorMessages`. Les logs backend restent la source de diagnostic.

## 20. Limites connues et évolutions

- 2FA non implémentée ;
- SSO non implémenté ;
- notifications métier email/SMS/WhatsApp partielles ;
- rapports automatiques et emails de remerciement non actifs ;
- rôles personnalisés non appliqués complètement par le guard ;
- recherche sans moteur full-text ;
- prévention des boucles de hiérarchie à renforcer ;
- magic number des fichiers à appliquer systématiquement ;
- cache Redis des statistiques non finalisé ;
- certaines escalades SLA restent à automatiser complètement.

## 21. Commandes utiles

```powershell
# Build backend
npm --prefix backend run build

# Build frontend
npm --prefix frontend run build

# Générer Prisma Client
npm --prefix backend run prisma:generate

# Vérifier Git
 git status --short --branch

# Déployer
 git add .
 git commit -m "message"
 git push origin main
```

## 22. Références du code

- Configuration applicative : [backend/src/app.module.ts](../backend/src/app.module.ts)
- Démarrage et sécurité HTTP : [backend/src/main.ts](../backend/src/main.ts)
- Schéma Prisma : [backend/prisma/schema.prisma](../backend/prisma/schema.prisma)
- Compose : [docker-compose.yml](../docker-compose.yml)
- Déploiement : [docs/DEPLOYMENT.md](DEPLOYMENT.md)
- Architecture : [docs/ARCHITECTURE.md](ARCHITECTURE.md)
- Sécurité : [docs/SECURITY.md](SECURITY.md)
