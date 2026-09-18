# 🧪 Guide de Test - Module Organizations

## 📋 Prérequis

✅ Backend lancé : http://localhost:3001  
✅ Swagger ouvert : http://localhost:3001/api/docs  
✅ PostgreSQL connecté  
✅ Credentials de test : `admin@demo.satisclient.sn` / `Demo123!Pass`

---

## 🔐 Étape 1 : Authentification

1. Ouvre Swagger : http://localhost:3001/api/docs
2. Trouve la section **Auth**
3. Clique sur `POST /api/auth/login`
4. Clique sur **"Try it out"**
5. Utilise ces credentials :
   ```json
   {
     "email": "admin@demo.satisclient.sn",
     "password": "Demo123!Pass"
   }
   ```
6. Clique sur **"Execute"**
7. **Copie le `access_token`** de la réponse
8. Clique sur **"Authorize 🔒"** en haut à droite
9. Colle le token (format automatique : `Bearer <ton_token>`)
10. Clique sur **"Authorize"** puis **"Close"**

✅ **Tu es maintenant authentifié !**

---

## 📦 Étape 2 : Créer une Organisation

### Test 1 : Création Basique

1. Trouve la section **Organizations**
2. Clique sur `POST /api/organizations`
3. Clique sur **"Try it out"**
4. Utilise ce payload :
   ```json
   {
     "name": "Acme Corporation",
     "email": "contact@acme.sn",
     "phone": "+221771234567",
     "subscriptionPlan": "pro"
   }
   ```
5. Clique sur **"Execute"**

**Résultat Attendu** : `201 Created`

```json
{
  "id": "uuid-généré-automatiquement",
  "name": "Acme Corporation",
  "slug": "acme-corporation",
  "email": "contact@acme.sn",
  "phone": "+221771234567",
  "primaryColor": "#3B82F6",
  "subscriptionPlan": "pro",
  "subscriptionStatus": "trial",
  "trialEndsAt": "2026-10-02T...",
  "maxSites": 5,
  "maxUsers": 10,
  "maxMonthlyFeedbacks": 5000,
  "createdAt": "2026-09-18T...",
  "updatedAt": "2026-09-18T..."
}
```

✅ **Vérifie** :
- Le `slug` est automatiquement généré → `acme-corporation`
- Le `subscriptionStatus` est `trial`
- Le `trialEndsAt` est dans 14 jours
- Les `maxSites`, `maxUsers`, `maxMonthlyFeedbacks` correspondent au plan **pro**

### Test 2 : Validation Email Invalide

```json
{
  "name": "Test Org",
  "email": "invalid-email",
  "subscriptionPlan": "essentialiel"
}
```

**Résultat Attendu** : `400 Bad Request`

```json
{
  "statusCode": 400,
  "message": ["email must be an email"]
}
```

### Test 3 : Validation Téléphone Format E.164

```json
{
  "name": "Test Org 2",
  "email": "test@test.sn",
  "phone": "771234567"
}
```

**Résultat Attendu** : `400 Bad Request` (doit commencer par `+221`)

### Test 4 : Doublon Détecté (Email)

Réessaie de créer avec le même email :

```json
{
  "name": "Acme 2",
  "email": "contact@acme.sn"
}
```

**Résultat Attendu** : `409 Conflict`

```json
{
  "statusCode": 409,
  "message": "Une organisation avec cet email existe déjà"
}
```

---

## 📋 Étape 3 : Lister les Organisations

### Test 1 : Liste Simple

1. Clique sur `GET /api/organizations`
2. Clique sur **"Try it out"**
3. Laisse les paramètres par défaut
4. Clique sur **"Execute"**

**Résultat Attendu** : `200 OK` + Array d'organisations

```json
[
  {
    "id": "...",
    "name": "Acme Corporation",
    "slug": "acme-corporation",
    ...
  }
]
```

### Test 2 : Pagination

Paramètres :
- `skip`: 0
- `take`: 10

### Test 3 : Filtre par Statut

Paramètres :
- `status`: `trial`
- `includeStats`: `true`

**Résultat Attendu** : Statistiques incluses

```json
[
  {
    "id": "...",
    "name": "Acme Corporation",
    "currentSitesCount": 0,
    "currentUsersCount": 1,
    "currentMonthlyFeedbacks": 0,
    ...
  }
]
```

---

## 🔍 Étape 4 : Récupérer une Organisation

### Test 1 : Par ID

1. Copie l'`id` d'une organisation
2. Clique sur `GET /api/organizations/{id}`
3. Clique sur **"Try it out"**
4. Colle l'ID
5. Clique sur **"Execute"**

**Résultat Attendu** : `200 OK` + Organisation complète avec stats

### Test 2 : Par Slug

1. Clique sur `GET /api/organizations/slug/{slug}`
2. Utilise `acme-corporation`
3. Clique sur **"Execute"**

**Résultat Attendu** : `200 OK` + Même organisation

### Test 3 : ID Inexistant

Utilise un UUID invalide : `00000000-0000-0000-0000-000000000000`

**Résultat Attendu** : `404 Not Found`

```json
{
  "statusCode": 404,
  "message": "Organisation non trouvée (id: 00000000-0000-0000-0000-000000000000)"
}
```

---

## ✏️ Étape 5 : Mettre à Jour

### Test 1 : Changement de Nom

1. Clique sur `PATCH /api/organizations/{id}`
2. Utilise l'ID de ton organisation
3. Payload :
   ```json
   {
     "name": "Acme Corp SARL",
     "primaryColor": "#FF5733"
   }
   ```
4. Clique sur **"Execute"**

**Résultat Attendu** : `200 OK`

✅ **Vérifie** :
- Le `name` est mis à jour
- Le `slug` est régénéré → `acme-corp-sarl`
- Le `primaryColor` est modifié
- Le `updatedAt` est changé

### Test 2 : Changement de Plan

```json
{
  "subscriptionPlan": "business"
}
```

**Résultat Attendu** : Les limites sont automatiquement mises à jour :
- `maxSites`: 20
- `maxUsers`: 50
- `maxMonthlyFeedbacks`: 25000

### Test 3 : Changement de Statut

```json
{
  "subscriptionStatus": "active"
}
```

---

## 🗑️ Étape 6 : Supprimer (Soft Delete)

### Test 1 : Suppression

1. Clique sur `DELETE /api/organizations/{id}`
2. Utilise l'ID
3. Clique sur **"Execute"**

**Résultat Attendu** : `200 OK`

```json
{
  "message": "Organisation supprimée avec succès"
}
```

### Test 2 : Vérifier la Suppression

Essaie de récupérer l'organisation par son ID

**Résultat Attendu** : `404 Not Found` (soft delete : `deletedAt` est marqué)

### Test 3 : Erreur si Utilisateurs Associés

Si tu essaies de supprimer une organisation avec des utilisateurs :

**Résultat Attendu** : `400 Bad Request`

```json
{
  "statusCode": 400,
  "message": "Impossible de supprimer: 5 utilisateur(s) associé(s)"
}
```

---

## 🎯 Étape 7 : Vérifier les Quotas

### Test 1 : Quota Sites

1. Clique sur `GET /api/organizations/{id}/can-create-site`
2. Utilise l'ID
3. Clique sur **"Execute"**

**Résultat Attendu** : `200 OK`

```json
{
  "canCreate": true
}
```

### Test 2 : Quota Utilisateurs

1. Clique sur `GET /api/organizations/{id}/can-create-user`
2. Utilise l'ID
3. Clique sur **"Execute"**

**Résultat Attendu** : `200 OK`

```json
{
  "canCreate": true
}
```

---

## 🔒 Étape 8 : Tester le RBAC (Contrôle d'Accès)

### Test 1 : Accès Refusé (Rôle Insuffisant)

1. **Déconnecte-toi** (clique sur "Authorize" → "Logout")
2. Connecte-toi avec un compte **Agent** :
   ```json
   {
     "email": "agent@demo.satisclient.sn",
     "password": "Demo123!Pass"
   }
   ```
3. Essaie de **créer une organisation** (`POST /api/organizations`)

**Résultat Attendu** : `403 Forbidden`

```json
{
  "statusCode": 403,
  "message": "Accès refusé. Rôles requis: super_admin. Votre rôle: agent"
}
```

### Test 2 : Routes Accessibles par ADMIN

Un `org_admin` peut :
- ✅ Lister les organisations (voit uniquement la sienne)
- ✅ Récupérer sa propre organisation
- ✅ Modifier sa propre organisation
- ❌ Créer une nouvelle organisation (réservé à `super_admin`)
- ❌ Supprimer une organisation (réservé à `super_admin`)

---

## ✅ Checklist Finale

- [ ] Créé au moins **3 organisations** avec différents plans
- [ ] Testé les **validations** (email, téléphone, doublons)
- [ ] Testé la **pagination** et les **filtres**
- [ ] Récupéré une organisation par **ID** et par **slug**
- [ ] Mis à jour une organisation (nom, plan, couleur)
- [ ] Supprimé une organisation (soft delete)
- [ ] Vérifié les **quotas** (sites, users)
- [ ] Testé le **RBAC** (super_admin vs org_admin vs agent)

---

## 🐛 Erreurs Courantes

| Erreur | Cause | Solution |
|--------|-------|----------|
| `401 Unauthorized` | Token expiré ou invalide | Refaire le login |
| `403 Forbidden` | Rôle insuffisant | Vérifier le rôle de l'utilisateur |
| `400 Bad Request` | Validation échouée | Vérifier le payload (email, téléphone E.164) |
| `404 Not Found` | Organisation inexistante | Vérifier l'ID/slug |
| `409 Conflict` | Email ou slug déjà utilisé | Changer l'email ou le nom |
| `500 Internal Server Error` | Erreur serveur | Voir les logs backend |

---

## 📊 Matrices de Test

### Limites par Plan

| Plan | maxSites | maxUsers | maxMonthlyFeedbacks |
|------|----------|----------|---------------------|
| `essentialiel` | 1 | 3 | 1000 |
| `pro` | 5 | 10 | 5000 |
| `business` | 20 | 50 | 25000 |
| `institution` | 100 | 200 | 100000 |

### Statuts Valides

- `active` : Abonnement actif
- `suspended` : Suspendu
- `trial` : En période d'essai (14 jours)
- `expired` : Expiré

---

**Bon test ! 🚀**

Si une route ne fonctionne pas comme prévu, vérifie les logs backend dans la console.
