# 👨‍💻 Guide Développeur - SatisClient

## 🚀 Quick Start (5 minutes)

```bash
# 1. Installation
npm install

# 2. Démarrer l'application
npm run dev

# 3. Ouvrir ces URLs dans votre navigateur :
```

- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:3001/api
- **🎯 Swagger (Documentation API)** : http://localhost:3001/api/docs

## 🔐 Credentials de Test

```
Admin   : admin@demo.satisclient.sn   / Demo123!Pass
Manager : qualite@demo.satisclient.sn / Demo123!Pass
Agent   : agent@demo.satisclient.sn   / Demo123!Pass
```

## 📚 Documentation Complète

Toute la documentation est dans le dossier **[docs/](docs/README.md)** :

| Fichier | Contenu |
|---------|---------|
| **[API.md](docs/API.md)** | 🎯 Comment utiliser Swagger + Documenter l'API |
| [GETTING_STARTED.md](docs/GETTING_STARTED.md) | Installation détaillée |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Architecture du projet |
| [DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) | Schéma de la base de données |
| [SECURITY.md](docs/SECURITY.md) | Mesures de sécurité |

## 🧪 Tester l'API (avec Swagger)

1. Ouvrir http://localhost:3001/api/docs
2. Cliquer sur `POST /api/auth/login`
3. "Try it out" → Mettre les credentials de test
4. "Execute" → Copier le `access_token`
5. Cliquer sur "Authorize 🔒" en haut
6. Coller le token
7. Maintenant vous pouvez tester toutes les routes protégées !

## 🛠️ Commandes Utiles

```bash
# Développement
npm run dev              # Backend + Frontend en parallèle
cd backend && npm run dev   # Backend uniquement
cd frontend && npm run dev  # Frontend uniquement

# Base de données
cd backend
npx prisma studio       # Interface graphique BDD
npx prisma generate     # Régénérer le client Prisma
npx prisma migrate dev  # Créer/appliquer migrations

# Tests
npm test                # Tests unitaires
npm run test:e2e       # Tests E2E
npm run test:cov       # Coverage

# Build production
npm run build          # Build backend + frontend
```

## 📂 Structure Importante

```
satisclient/
├── backend/
│   ├── src/
│   │   ├── modules/        ← Modules métier (auth, users, etc.)
│   │   ├── common/         ← Services communs (sécurité)
│   │   └── main.ts         ← Point d'entrée + Config Swagger
│   ├── prisma/
│   │   └── schema.prisma   ← Schéma BDD (15 tables)
│   └── .env               ← Variables backend
├── frontend/
│   ├── src/app/           ← Pages Next.js (App Router)
│   └── .env.local         ← Variables frontend
└── docs/                  ← 📚 LIRE EN PREMIER !
```

## 🎯 Workflow Développement

### 1. Créer un Nouveau Module Backend

```bash
cd backend
npx nest g module modules/mon-module
npx nest g controller modules/mon-module
npx nest g service modules/mon-module
```

### 2. Documenter dans Swagger

```typescript
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Mon Module')
@Controller('mon-module')
export class MonModuleController {
  
  @Get()
  @ApiOperation({ summary: 'Liste des ressources' })
  @ApiResponse({ status: 200, description: 'Succès' })
  findAll() {
    // ...
  }
}
```

**📖 Voir [docs/API.md](docs/API.md) pour plus de détails**

### 3. Créer une Migration Prisma

```bash
cd backend

# 1. Modifier prisma/schema.prisma
# 2. Créer la migration
npx prisma migrate dev --name nom_de_la_migration

# 3. Générer le client
npx prisma generate
```

### 4. Créer une Page Frontend

```bash
cd frontend/src/app

# Créer un dossier et page.tsx
mkdir mon-module
touch mon-module/page.tsx
```

## ⚡ Debugging

### Backend ne démarre pas ?
```bash
# Vérifier PostgreSQL
psql -U satisclient -d satisclient_dev

# Régénérer Prisma Client
cd backend && npx prisma generate

# Vérifier les variables d'env
cat backend/.env
```

### Frontend ne démarre pas ?
```bash
# Supprimer .next et rebuild
rm -rf frontend/.next
cd frontend && npm run dev
```

### Base de données corrompue ?
```bash
cd backend
npx prisma migrate reset  # ⚠️ Supprime toutes les données !
```

## 🔒 Sécurité

Le projet a déjà **85% de sécurité implémentée** :
- ✅ JWT + Refresh Tokens
- ✅ AES-256-GCM Encryption
- ✅ bcrypt (12 rounds)
- ✅ Rate Limiting
- ✅ Brute Force Protection (5 attempts)
- ✅ XSS Sanitization
- ✅ CORS Configuré

**📖 Voir [docs/SECURITY.md](docs/SECURITY.md) pour les détails**

## 🐛 Problèmes Courants

| Problème | Solution |
|----------|----------|
| Port 3001 déjà utilisé | `taskkill /F /IM node.exe` (Windows) |
| Prisma Client outdated | `npx prisma generate` |
| .env non lu | Vérifier que le fichier est dans `backend/` |
| PostgreSQL connection error | Vérifier que PostgreSQL est lancé |

## 📞 Besoin d'Aide ?

1. **Swagger** : http://localhost:3001/api/docs (documentation automatique)
2. **Documentation** : Lire `docs/` (tout est là !)
3. **Issues GitHub** : Créer une issue sur le repo

---

## ✅ Checklist Premier Jour

- [ ] Cloner le repo
- [ ] Lancer `npm install`
- [ ] Configurer PostgreSQL (voir GETTING_STARTED.md)
- [ ] Lancer `npm run dev`
- [ ] Ouvrir Swagger : http://localhost:3001/api/docs
- [ ] Tester le login dans Swagger
- [ ] Lire `docs/API.md`
- [ ] Lire `docs/ARCHITECTURE.md`
- [ ] Explorer le code dans `backend/src/modules/`
- [ ] Créer votre première route et la tester dans Swagger

**Bon développement ! 🚀**
