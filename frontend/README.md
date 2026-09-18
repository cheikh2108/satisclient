# SatisClient Frontend (Next.js)

Interface utilisateur de la plateforme SatisClient.

## Structure

```
frontend/
├── src/
│   ├── app/                    # App Router (Next.js 14+)
│   │   ├── (public)/           # Routes publiques (sans auth)
│   │   │   ├── page.tsx        # Landing page
│   │   │   ├── feedback/[code]/ # Formulaire avis public
│   │   │   └── survey/[id]/    # Enquête publique
│   │   ├── (authenticated)/    # Routes authentifiées
│   │   │   ├── dashboard/      # Tableau de bord
│   │   │   ├── complaints/     # Gestion réclamations
│   │   │   ├── analytics/      # Analytics & rapports
│   │   │   ├── surveys/        # Gestion enquêtes
│   │   │   └── settings/       # Paramètres
│   │   ├── (admin)/            # Routes admin
│   │   │   └── admin/          # Administration
│   │   ├── api/                # API Routes
│   │   │   └── auth/[...nextauth]/
│   │   ├── layout.tsx          # Layout global
│   │   └── globals.css         # Styles globaux
│   ├── components/
│   │   ├── ui/                 # Composants UI (Shadcn)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── table.tsx
│   │   │   └── ...
│   │   ├── layouts/            # Layouts
│   │   │   ├── navbar.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── footer.tsx
│   │   ├── feedback/           # Composants feedback
│   │   ├── complaints/         # Composants réclamations
│   │   ├── charts/             # Graphiques
│   │   └── forms/              # Formulaires
│   ├── lib/
│   │   ├── api.ts              # Client API
│   │   ├── utils.ts            # Utilitaires
│   │   ├── validations.ts      # Schémas Zod
│   │   └── constants.ts        # Constantes
│   ├── hooks/                  # Custom hooks
│   │   ├── use-auth.ts
│   │   ├── use-complaints.ts
│   │   └── use-analytics.ts
│   ├── types/                  # Types TypeScript
│   │   ├── user.ts
│   │   ├── complaint.ts
│   │   └── feedback.ts
│   └── styles/
│       └── globals.css
├── public/
│   ├── images/
│   ├── fonts/
│   └── icons/
├── package.json
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## Installation

```bash
cd frontend
pnpm install
```

## Configuration

Copier `.env.example` vers `.env.local` et ajuster les valeurs.

## Développement

```bash
# Démarrer dev server
pnpm run dev

# Build production
pnpm run build

# Démarrer production
pnpm run start

# Lint
pnpm run lint
```

## Composants UI (Shadcn)

```bash
# Ajouter un composant
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add table
npx shadcn@latest add form
```

## Architecture

### App Router (Next.js 14+)
- **Server Components** par défaut
- **Client Components** avec "use client"
- Routing file-system
- Layouts imbriqués

### State Management
- **React Query** - Gestion état serveur
- **Zustand** - État client léger
- **Server Actions** - Mutations

### Styling
- **Tailwind CSS** - Utility-first
- **Shadcn/ui** - Composants réutilisables
- **CSS Variables** - Theming

### Forms
- **React Hook Form** - Gestion formulaires
- **Zod** - Validation schémas

### Charts
- **Recharts** - Graphiques basiques
- **Tremor** - Dashboard components

## Pages principales

### Public
- `/` - Landing page
- `/feedback/[code]` - Formulaire avis
- `/survey/[id]` - Enquête
- `/track/[ticket]` - Suivi réclamation

### Authenticated
- `/dashboard` - Tableau de bord
- `/complaints` - Liste réclamations
- `/complaints/[id]` - Détail réclamation
- `/analytics` - Analytics
- `/surveys` - Gestion enquêtes
- `/settings` - Paramètres

### Admin
- `/admin/users` - Gestion utilisateurs
- `/admin/organizations` - Gestion organisations
- `/admin/sites` - Gestion sites
- `/admin/settings` - Configuration système

## Tests

```bash
# Tests unitaires
pnpm run test

# Tests E2E (Playwright)
pnpm run test:e2e
```

## Déploiement

Recommandé: Vercel (optimisé pour Next.js)

```bash
vercel deploy
```

Alternative: Docker

```bash
docker build -t satisclient-frontend .
docker run -p 3000:3000 satisclient-frontend
```
