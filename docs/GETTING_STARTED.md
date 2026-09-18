# 🚀 Guide de démarrage - SatisClient

## Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** 18+ ([télécharger](https://nodejs.org/))
- **npm** 9+ (inclus avec Node.js)
- **PostgreSQL** 14+ natif Windows ([télécharger](https://www.postgresql.org/download/windows/))
- **Redis** (optionnel, pour la production)
- **Git**

## Installation

### 1. Cloner le repository (si pas déjà fait)

```bash
git clone https://github.com/ataaba/satisclient.git
cd satisclient
```

### 2. Installer les dépendances

```bash
# À la racine du projet
npm install

# Cela installera automatiquement :
# - Les dépendances root (concurrently, prettier)
# - Les dépendances backend (NestJS, Prisma, etc.)
# - Les dépendances frontend (Next.js, React, etc.)
```

### 3. Configurer PostgreSQL

Assurez-vous que PostgreSQL est installé et en cours d'exécution.

```bash
# Créer l'utilisateur et la base de données
# Ouvrir pgAdmin ou psql et exécuter :

CREATE USER satisclient WITH PASSWORD 'satisclient_password';
CREATE DATABASE satisclient_dev OWNER satisclient;
GRANT ALL PRIVILEGES ON DATABASE satisclient_dev TO satisclient;
```

### 4. Configurer les variables d'environnement

Le fichier `backend/.env` existe déjà avec les bonnes valeurs :

```env
NODE_ENV=development
DATABASE_URL=postgresql://satisclient:satisclient_password@localhost:5432/satisclient_dev?schema=public
JWT_SECRET=<généré automatiquement>
ENCRYPTION_KEY=<généré automatiquement>
BACKEND_PORT=3001
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Note :** Les clés JWT et ENCRYPTION_KEY ont été générées automatiquement.

### 5. Initialiser la base de données

```bash
# Générer le client Prisma
cd backend
npx prisma generate

# Les tables ont déjà été créées via SQL
pnpm prisma migrate dev --name init

# (Optionnel) Seed avec des données de test
pnpm prisma db seed
```

### 6. Démarrer l'application

#### Option A: Tout démarrer en même temps (recommandé)

```bash
# À la racine
npm run dev
```

Cela démarre :
- **Backend** sur http://localhost:3001
- **Frontend** sur http://localhost:3000

#### Option B: Démarrer séparément

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Accès à l'application

- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:3001/api
- **API Documentation (Swagger)** : http://localhost:3001/api/docs

## Compte de test

```
Email: admin@demo.satisclient.sn
Mot de passe: Demo123!Pass
```

## Commandes utiles

### Database (Prisma)

```bash
cd backend

# Créer une nouvelle migration
npx prisma migrate dev --name nom_migration

# Appliquer les migrations
npx prisma migrate deploy

# Ouvrir Prisma Studio (interface graphique)
npx prisma studio

# Reset database (⚠️ supprime toutes les données)
npx prisma migrate reset

# Régénérer le client Prisma
npx prisma generate
```

### Backend

```bash
cd backend

# Développement avec hot-reload
npm run dev

# Build production
npm run build

# Démarrer en production
npm run start:prod

# Tests
npm test
npm run test:e2e
npm run test:cov

# Lint
npm run lint
```

### Frontend

```bash
cd frontend

# Développement
npm run dev

# Build production
npm run build

# Démarrer production
npm start

# Lint
npm run lint

# Type check
npm run type-check
```

### PostgreSQL (natif Windows)

```bash
# Vérifier le statut du service PostgreSQL
# Via Services Windows ou :
sc query postgresql-x64-<version>

# Se connecter à PostgreSQL
psql -U postgres

# Lister les bases de données
psql -U postgres -l

# Se connecter à satisclient_dev
psql -U satisclient -d satisclient_dev
```

## Structure du projet

```
satisclient/
├── backend/                 # API NestJS
│   ├── src/
│   │   ├── modules/        # Modules fonctionnels
│   │   ├── prisma/         # Prisma ORM
│   │   ├── common/         # Services communs (sécurité)
│   │   └── main.ts         # Point d'entrée
│   ├── prisma/
│   │   ├── schema.prisma   # Schéma de données
│   │   └── seed.ts         # Données de test
│   └── .env                # Variables d'environnement backend
├── frontend/                # Application Next.js
│   ├── src/
│   │   ├── app/           # App Router (pages)
│   │   ├── components/    # Composants React
│   │   └── lib/           # Utilitaires
│   └── public/            # Fichiers statiques
├── docs/                    # Documentation
└── package.json            # Configuration npm root
```

## Résolution de problèmes

### Erreur de connexion à PostgreSQL

```bash
# Vérifier que PostgreSQL est lancé (Windows Services)
sc query postgresql-x64-18

# Vérifier la connexion
psql -U satisclient -d satisclient_dev

# Si erreur d'authentification, vérifier DATABASE_URL dans backend/.env
```

### Port déjà utilisé

```bash
# Voir quel processus utilise le port 3001 (Windows)
netstat -ano | findstr :3001

# Tuer le processus
taskkill /PID <PID> /F

# Ou changer le port dans backend/.env
BACKEND_PORT=3002
```

### Prisma Client non généré

```bash
cd backend
npx prisma generate
```

### Erreur lors de l'installation des dépendances

```bash
# Nettoyer et réinstaller
rm -rf node_modules backend/node_modules frontend/node_modules
rm package-lock.json backend/package-lock.json frontend/package-lock.json
npm install
```

### Base de données à réinitialiser

```bash
# Option 1 : Via psql
psql -U postgres
DROP DATABASE satisclient_dev;
CREATE DATABASE satisclient_dev OWNER satisclient;

# Option 2 : Via Prisma
cd backend
npx prisma migrate reset
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
