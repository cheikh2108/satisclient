# 🚀 Guide de Déploiement - SatisClient

## Vue d'ensemble

Le projet SatisClient peut être déployé de plusieurs façons :

1. **Dokploy** (VPS avec Docker) - **Recommandé** ✅
2. Vercel (Frontend) + Railway (Backend)
3. VPS classique (PM2)
4. Kubernetes

---

## 🎯 Déploiement avec Dokploy (Recommandé)

### Prérequis

- ✅ VPS (Ubuntu 20.04+, Debian 11+, ou similaire)
- ✅ Dokploy installé sur le VPS
- ✅ Domaine configuré (ex: `satisclient.votredomaine.com`)
- ✅ Git repository (GitHub, GitLab, etc.)

### Architecture de déploiement

```
┌─────────────────────────────────────────┐
│         VPS avec Dokploy                │
│                                         │
│  ┌───────────────┐  ┌────────────────┐ │
│  │   Frontend    │  │    Backend     │ │
│  │   (Next.js)   │  │    (NestJS)    │ │
│  │   Port 3000   │  │   Port 3001    │ │
│  └───────────────┘  └────────────────┘ │
│           │                  │          │
│           └──────────────────┘          │
│                    │                    │
│         ┌──────────┴──────────┐        │
│         │                     │        │
│    ┌─────────┐          ┌─────────┐   │
│    │PostgreSQL│         │  Redis  │   │
│    │ (Docker) │         │(Docker) │   │
│    └─────────┘          └─────────┘   │
└─────────────────────────────────────────┘
```

---

## 📦 Étape 1 : Préparer les Dockerfiles

Ces fichiers seront créés dans la section suivante.

### Backend Dockerfile (`backend/Dockerfile`)

- Multi-stage build (builder + production)
- Prisma optimisé
- Variables d'environnement sécurisées
- Healthcheck

### Frontend Dockerfile (`frontend/Dockerfile`)

- Next.js standalone build
- Optimisations production
- Variables d'environnement

---

## 🔧 Étape 2 : Configuration Dokploy

### 2.1 Créer un nouveau projet dans Dokploy

1. Connectez-vous à votre interface Dokploy
2. Cliquez sur **"New Project"**
3. Nom: `satisclient`
4. Type: **Docker Compose**

### 2.2 Configuration Git

1. Connecter le repository GitHub
2. Branch: `main`
3. Auto-deploy: ✅ Activer

### 2.3 Variables d'environnement (IMPORTANT)

Dans Dokploy, ajouter ces variables :

#### Variables communes

```env
NODE_ENV=production
```

#### Backend

```env
# Database
DATABASE_URL=postgresql://satisclient:VOTRE_PASSWORD@postgres:5432/satisclient_prod?schema=public

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Security
JWT_SECRET=<générer avec: openssl rand -hex 32>
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=<générer avec: openssl rand -hex 32>
JWT_REFRESH_EXPIRES_IN=7d
ENCRYPTION_KEY=<générer avec: openssl rand -hex 32>

# API
BACKEND_PORT=3001
BACKEND_URL=https://api.satisclient.votredomaine.com
CORS_ORIGIN=https://satisclient.votredomaine.com

# Email Resend (domaine d'expédition vérifié dans Resend)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL="SatisClient <noreply@votre-domaine.tld>"
# Anciennes variables SMTP conservées pour référence, non utilisées par le flux actuel
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASSWORD=votre-mot-de-passe-app
EMAIL_FROM="SatisClient <noreply@satisclient.sn>"

# SMS (optionnel)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

#### Frontend

```env
NEXT_PUBLIC_API_URL=https://api.satisclient.votredomaine.com
NEXT_PUBLIC_APP_URL=https://satisclient.votredomaine.com
```

### 2.4 Configuration du domaine

1. **Frontend:** `satisclient.votredomaine.com` → Port 3000
2. **Backend:** `api.satisclient.votredomaine.com` → Port 3001

Dokploy génère automatiquement les certificats SSL (Let's Encrypt) ✅

---

## 🗄️ Étape 3 : Configuration PostgreSQL

### Option A : PostgreSQL dans Dokploy (Recommandé)

Dokploy propose PostgreSQL en un clic :

1. Dans votre projet, ajouter **"New Database"**
2. Type: **PostgreSQL**
3. Version: **15**
4. Nom: `satisclient_prod`
5. User: `satisclient`
6. Password: (généré automatiquement)

Dokploy donne l'URL de connexion automatiquement.

### Option B : PostgreSQL externe (Supabase, Neon, etc.)

Utiliser un service managé externe et mettre l'URL dans `DATABASE_URL`.

---

## 🚀 Étape 4 : Déploiement

### 4.1 Push vers Git

```bash
git add .
git commit -m "chore: Add production Docker configuration"
git push origin main
```

### 4.2 Déployer depuis Dokploy

1. Dokploy détecte automatiquement le push
2. Build des images Docker (5-10 min)
3. Démarrage des containers
4. **Première fois uniquement** : Migrations Prisma

### 4.3 Exécuter les migrations (première fois)

Dans Dokploy, ouvrir le terminal du container backend :

```bash
# Générer Prisma Client
npx prisma generate

# Appliquer les migrations
npx prisma migrate deploy

# Seed données de demo (optionnel)
npx prisma db seed
```

---

## ✅ Étape 5 : Vérification

1. **Frontend:** https://satisclient.votredomaine.com
2. **Backend API:** https://api.satisclient.votredomaine.com/api
3. **Swagger:** https://api.satisclient.votredomaine.com/api/docs

### Test de connexion

```bash
curl -X POST https://api.satisclient.votredomaine.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demo.satisclient.sn","password":"Demo123!Pass"}'
```

---

## 🔄 Mises à jour (CI/CD)

### Déploiement automatique

Dokploy redéploie automatiquement à chaque push sur `main` ✅

### Déploiement manuel

Dans l'interface Dokploy :

1. Aller dans le projet
2. Cliquer sur **"Rebuild & Deploy"**

---

## 📊 Monitoring

### Logs

Dans Dokploy :

- **Backend logs:** Container `satisclient-backend`
- **Frontend logs:** Container `satisclient-frontend`
- **PostgreSQL logs:** Database service

### Métriques

Dokploy affiche :

- CPU usage
- Memory usage
- Requests/sec
- Response time

---

## 🛡️ Sécurité Production

### Checklist

- [x] HTTPS activé (Let's Encrypt via Dokploy)
- [x] Variables d'environnement sécurisées
- [x] Secrets générés aléatoirement
- [ ] Firewall configuré (ports 80, 443, 22 uniquement)
- [ ] Fail2ban installé (protection SSH)
- [ ] Backups PostgreSQL automatiques
- [ ] Monitoring actif (Sentry, Uptime Robot)

### Backups

Configurer des backups automatiques de PostgreSQL :

```bash
# Dans le VPS, créer un cron job
0 2 * * * docker exec satisclient-postgres pg_dump -U satisclient satisclient_prod | gzip > /backups/satisclient_$(date +\%Y\%m\%d).sql.gz
```

---

## 🔧 Troubleshooting

### Problème : Backend ne démarre pas

1. Vérifier les logs dans Dokploy
2. Vérifier `DATABASE_URL`
3. Vérifier que PostgreSQL est accessible

### Problème : Erreur de connexion BDD

```bash
# Tester la connexion depuis le container backend
docker exec -it satisclient-backend sh
npx prisma db push
```

### Problème : Frontend ne se connecte pas au backend

1. Vérifier `NEXT_PUBLIC_API_URL`
2. Vérifier CORS dans backend (`CORS_ORIGIN`)
3. Vérifier le domaine dans Dokploy

---

## 📈 Scaling

### Horizontal Scaling

Dokploy supporte le scaling :

1. Augmenter le nombre de replicas backend
2. Load balancer automatique
3. Sessions partagées via Redis

### Vertical Scaling

Augmenter les ressources du VPS :

- CPU: 2+ cores
- RAM: 4GB+ minimum
- Disk: 50GB+ SSD

---

## 💰 Coûts estimés

| Service                   | Coût/mois       |
| ------------------------- | --------------- |
| VPS (4GB RAM, 2 CPU)      | $10-20          |
| Domaine                   | $10-15          |
| Emails (SendGrid/Mailgun) | $0-10           |
| SMS (Twilio)              | Pay as you go   |
| **Total**                 | **$20-45/mois** |

---

## 🎯 Prochaines étapes

Après le premier déploiement :

1. ✅ Configurer les emails (SMTP)
2. ✅ Configurer les SMS (Twilio)
3. ✅ Ajouter monitoring (Sentry)
4. ✅ Configurer backups automatiques
5. ✅ Tests de charge
6. ✅ Documentation utilisateur

---

## 📚 Ressources

- **Dokploy:** https://dokploy.com/docs
- **Docker:** https://docs.docker.com
- **Prisma Migrations:** https://www.prisma.io/docs/guides/deployment
- **Next.js Standalone:** https://nextjs.org/docs/advanced-features/output-file-tracing

---

**Le déploiement avec Dokploy est simple et automatisé ! 🚀**

_Note: Les Dockerfiles de production seront créés dans la prochaine étape._
