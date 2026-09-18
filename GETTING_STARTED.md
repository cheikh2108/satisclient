# 🚀 Guide de démarrage - SatisClient

## Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** 18+ ([télécharger](https://nodejs.org/))
- **pnpm** 8+ (recommandé) ou npm/yarn
- **Docker** et **Docker Compose** (pour PostgreSQL et Redis)
- **Git**

### Installation de pnpm

```bash
npm install -g pnpm
```

## Installation

### 1. Cloner le repository (si pas déjà fait)

```bash
git clone https://github.com/ataaba/satisclient.git
cd satisclient
```

### 2. Installer les dépendances

```bash
# À la racine du projet
pnpm install
```

Cela installera automatiquement les dépendances pour :
- Le projet root
- Le backend (NestJS)
- Le frontend (Next.js)

### 3. Démarrer les services Docker

```bash
# Démarrer PostgreSQL + Redis + pgAdmin + Redis Commander
docker-compose up -d

# Vérifier que les services sont lancés
docker-compose ps
```

Services disponibles :
- **PostgreSQL** : `localhost:5432`
- **Redis** : `localhost:6379`
- **pgAdmin** : http://localhost:5050 (admin@satisclient.local / admin)
- **Redis Commander** : http://localhost:8081

### 4. Configurer les variables d'environnement

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer .env avec vos valeurs (les valeurs par défaut fonctionnent pour le dev local)
```

**Variables minimales requises :**
```env
NODE_ENV=development
DATABASE_URL="postgresql://satisclient:satisclient_password@localhost:5432/satisclient_dev?schema=public"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
BACKEND_PORT=3001
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 5. Initialiser la base de données

```bash
# Générer le client Prisma
cd backend
pnpm prisma generate

# Créer les tables (migration)
pnpm prisma migrate dev --name init

# (Optionnel) Seed avec des données de test
pnpm prisma db seed
```

### 6. Démarrer l'application

#### Option A: Tout démarrer en même temps (recommandé)

```bash
# À la racine
pnpm dev
```

Cela démarre :
- **Backend** sur http://localhost:3001
- **Frontend** sur http://localhost:3000

#### Option B: Démarrer séparément

```bash
# Terminal 1 - Backend
cd backend
pnpm dev

# Terminal 2 - Frontend
cd frontend
pnpm dev
```

## Accès à l'application

- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:3001/api
- **API Documentation (Swagger)** : http://localhost:3001/api/docs
- **pgAdmin** : http://localhost:5050

## Compte de test (après seed)

```
Email: admin@demo.satisclient.sn
Mot de passe: Demo123!
```

## Commandes utiles

### Database (Prisma)

```bash
cd backend

# Créer une nouvelle migration
pnpm prisma migrate dev --name nom_migration

# Appliquer les migrations
pnpm prisma migrate deploy

# Ouvrir Prisma Studio (interface graphique)
pnpm prisma studio

# Reset database (⚠️ supprime toutes les données)
pnpm prisma migrate reset

# Seed database
pnpm prisma db seed
```

### Backend

```bash
cd backend

# Développement avec hot-reload
pnpm dev

# Build production
pnpm build

# Démarrer en production
pnpm start:prod

# Tests
pnpm test
pnpm test:e2e
pnpm test:cov

# Lint
pnpm lint
```

### Frontend

```bash
cd frontend

# Développement
pnpm dev

# Build production
pnpm build

# Démarrer production
pnpm start

# Lint
pnpm lint

# Type check
pnpm type-check
```

### Docker

```bash
# Démarrer les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Voir les logs d'un service spécifique
docker-compose logs -f postgres

# Arrêter les services
docker-compose down

# Arrêter et supprimer les volumes (⚠️ supprime les données)
docker-compose down -v

# Redémarrer un service
docker-compose restart postgres
```

## Structure du projet

```
satisclient/
├── backend/                 # API NestJS
│   ├── src/
│   │   ├── modules/        # Modules fonctionnels
│   │   ├── prisma/         # Prisma ORM
│   │   └── main.ts         # Point d'entrée
│   └── prisma/
│       └── schema.prisma   # Schéma de données
├── frontend/                # Application Next.js
│   ├── src/
│   │   ├── app/           # App Router (pages)
│   │   ├── components/    # Composants React
│   │   └── lib/           # Utilitaires
│   └── public/            # Fichiers statiques
├── shared/                  # Types partagés
├── docker-compose.yml       # Services Docker
├── .env.example            # Variables d'environnement
└── package.json            # Workspace root
```

## Résolution de problèmes

### Erreur de connexion à PostgreSQL

```bash
# Vérifier que Docker est lancé
docker-compose ps

# Redémarrer PostgreSQL
docker-compose restart postgres

# Vérifier les logs
docker-compose logs postgres
```

### Port déjà utilisé

```bash
# Voir quel processus utilise le port 3001
lsof -i :3001

# Changer le port dans .env
BACKEND_PORT=3002
```

### Prisma Client non généré

```bash
cd backend
pnpm prisma generate
```

### Erreur lors de l'installation des dépendances

```bash
# Nettoyer et réinstaller
rm -rf node_modules backend/node_modules frontend/node_modules
rm pnpm-lock.yaml
pnpm install
```

### Base de données corrompue

```bash
cd backend
pnpm prisma migrate reset
pnpm prisma db seed
```

## Prochaines étapes

Maintenant que votre environnement est configuré :

1. ✅ Explorez l'API : http://localhost:3001/api/docs
2. ✅ Consultez [ARCHITECTURE.md](ARCHITECTURE.md) pour comprendre la structure
3. ✅ Lisez [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) pour le modèle de données
4. ✅ Commencez à développer les modules dans `backend/src/modules/`
5. ✅ Créez des composants dans `frontend/src/components/`

## Support

Pour toute question :
- 📧 Email : support@satisclient.sn
- 📖 Documentation : [docs/](docs/)
- 🐛 Issues : GitHub Issues

---

**Bon développement ! 🚀**
