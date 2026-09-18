# 📡 API Documentation - SatisClient

## 🌐 URLs Disponibles

### Développement Local
- **API Backend** : http://localhost:3001/api
- **Swagger UI** : http://localhost:3001/api/docs 🎯
- **Health Check** : http://localhost:3001/api

### Production
- **API Backend** : https://api.satisclient.votredomaine.com/api
- **Swagger UI** : https://api.satisclient.votredomaine.com/api/docs

---

## 📚 Swagger - Documentation Interactive

### C'est Quoi ?

**Swagger** (OpenAPI) est une documentation interactive automatique de l'API REST. C'est **LE** meilleur outil pour :
- 📖 Explorer toutes les routes disponibles
- 🧪 Tester les endpoints sans Postman
- 📝 Voir les schémas de données (request/response)
- 🔐 Tester avec authentification JWT

### Comment Y Accéder ?

1. Démarrer l'application : `npm run dev`
2. Ouvrir dans le navigateur : **http://localhost:3001/api/docs**
3. Vous verrez une interface bleue avec toutes les routes

### Interface Swagger

```
┌──────────────────────────────────────────────┐
│  SatisClient API v1.0                        │
│  [Authorize 🔒]                              │
├──────────────────────────────────────────────┤
│                                              │
│  ▼ Auth - Authentification                  │
│    POST /api/auth/login    Login            │
│    POST /api/auth/register Register         │
│                                              │
│  ▼ Users - Gestion utilisateurs             │
│    GET  /api/users/me      Mon profil       │
│    GET  /api/users         Liste users      │
│                                              │
│  ▼ Organizations - Multi-tenant             │
│    GET  /api/organizations Liste orgs       │
│    POST /api/organizations Créer org        │
│                                              │
└──────────────────────────────────────────────┘
```

---

## 🧪 Utiliser Swagger pour Tester

### 1. Tester une Route Publique (Login)

1. Dérouler **Auth**
2. Cliquer sur `POST /api/auth/login`
3. Cliquer sur **"Try it out"**
4. Modifier les credentials :
   ```json
   {
     "email": "admin@demo.satisclient.sn",
     "password": "Demo123!Pass"
   }
   ```
5. Cliquer sur **"Execute"**
6. Voir la réponse avec le **JWT token** :
   ```json
   {
     "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "refresh_token": "...",
     "user": { ... }
   }
   ```

### 2. Tester une Route Protégée (avec JWT)

1. **Copier le token** reçu lors du login
2. Cliquer sur **"Authorize 🔒"** en haut de la page
3. Coller le token (format : `Bearer eyJhbGc...`)
4. Cliquer sur **"Authorize"**
5. Maintenant toutes les routes protégées sont accessibles !
6. Tester `GET /api/users/me` pour voir votre profil

### 3. Tester la Création d'une Ressource

Exemple : Créer une organisation

1. S'assurer d'être authentifié (voir étape 2)
2. Dérouler **Organizations**
3. Cliquer sur `POST /api/organizations`
4. **"Try it out"**
5. Remplir le body :
   ```json
   {
     "name": "Ma Nouvelle Org",
     "email": "contact@org.sn",
     "phone": "+221771234567"
   }
   ```
6. **"Execute"**
7. Voir la réponse avec l'org créée

---

## 👨‍💻 Documenter une Nouvelle Route (Pour Développeurs)

### 1. Décorateurs de Base

```typescript
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Nom du Module')  // ← Groupe dans Swagger
@Controller('mon-module')
export class MonModuleController {

  @Get()
  @ApiOperation({ summary: 'Liste toutes les ressources' })
  @ApiResponse({ status: 200, description: 'Succès' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  findAll() {
    // ...
  }

  @Post()
  @ApiBearerAuth('JWT')  // ← Route protégée JWT
  @ApiOperation({ summary: 'Créer une nouvelle ressource' })
  @ApiResponse({ status: 201, description: 'Ressource créée' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  create(@Body() createDto: CreateDto) {
    // ...
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une ressource par ID' })
  @ApiResponse({ status: 200, description: 'Ressource trouvée' })
  @ApiResponse({ status: 404, description: 'Ressource non trouvée' })
  findOne(@Param('id') id: string) {
    // ...
  }
}
```

### 2. Documenter les DTOs

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email de l\'utilisateur',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Mot de passe (min 12 caractères)',
    minLength: 12,
  })
  @IsString()
  @MinLength(12)
  password: string;

  @ApiProperty({
    example: 'John',
    description: 'Prénom de l\'utilisateur',
  })
  @IsString()
  firstName: string;
}
```

### 3. Ajouter un Nouveau Tag

Dans `main.ts`, ajouter le tag à la configuration :

```typescript
const config = new DocumentBuilder()
  // ... autres configs
  .addTag('Mon Module', 'Description du module')
  .build();
```

### 4. Documenter les Réponses Complexes

```typescript
@Get()
@ApiOperation({ summary: 'Liste paginée' })
@ApiResponse({
  status: 200,
  description: 'Liste avec pagination',
  schema: {
    type: 'object',
    properties: {
      data: {
        type: 'array',
        items: { $ref: '#/components/schemas/User' }
      },
      meta: {
        type: 'object',
        properties: {
          total: { type: 'number', example: 100 },
          page: { type: 'number', example: 1 },
          perPage: { type: 'number', example: 10 }
        }
      }
    }
  }
})
findAll() {
  // ...
}
```

---

## 🔐 Sécurité Swagger

### En Développement
- ✅ Swagger activé automatiquement
- ✅ Accessible sur `/api/docs`
- ✅ Toutes les routes visibles

### En Production
- ⚠️ Swagger désactivé par défaut
- ✅ Activer avec `ENABLE_SWAGGER=true` dans `.env`
- ✅ Protéger avec authentification si exposé

**Configuration dans `main.ts` :**
```typescript
if (isDevelopment || configService.get('ENABLE_SWAGGER') === 'true') {
  // Swagger setup...
}
```

---

## 📝 Bonnes Pratiques

### ✅ À Faire
- Toujours ajouter `@ApiTags()` sur les controllers
- Documenter toutes les réponses HTTP possibles (200, 400, 401, 404, 500)
- Utiliser `@ApiProperty()` avec exemples dans les DTOs
- Ajouter `@ApiBearerAuth('JWT')` sur les routes protégées
- Tester vos routes dans Swagger avant de commit

### ❌ À Éviter
- Ne pas laisser Swagger activé en production sans protection
- Ne pas oublier de documenter les nouveaux endpoints
- Ne pas mettre de données sensibles dans les exemples
- Ne pas exposer des endpoints internes dans Swagger

---

## 🔗 Liens Utiles

- [NestJS Swagger Documentation](https://docs.nestjs.com/openapi/introduction)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger Editor](https://editor.swagger.io/)

---

## 🎯 Checklist Nouveau Développeur

Quand tu arrives sur le projet :

- [ ] Lancer `npm run dev`
- [ ] Ouvrir http://localhost:3001/api/docs
- [ ] Tester le login avec les credentials de test
- [ ] Copier le JWT token
- [ ] Cliquer sur "Authorize" et coller le token
- [ ] Explorer toutes les routes disponibles
- [ ] Tester quelques endpoints pour comprendre l'API
- [ ] Lire ce fichier API.md avant de créer de nouveaux endpoints

---

**Pour toute question sur l'API, consultez d'abord Swagger !** 🎯
