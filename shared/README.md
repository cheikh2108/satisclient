# SatisClient Shared

Types TypeScript et constantes partagés entre backend et frontend.

## Structure

```
shared/
├── types/
│   ├── user.types.ts           # Types utilisateurs
│   ├── organization.types.ts   # Types organisations
│   ├── site.types.ts           # Types sites
│   ├── feedback.types.ts       # Types feedbacks
│   ├── complaint.types.ts      # Types réclamations
│   ├── survey.types.ts         # Types enquêtes
│   ├── notification.types.ts   # Types notifications
│   └── common.types.ts         # Types communs
├── constants/
│   ├── roles.ts                # Rôles utilisateurs
│   ├── permissions.ts          # Permissions
│   ├── statuses.ts             # Statuts (réclamations, etc.)
│   └── plans.ts                # Plans d'abonnement
├── enums/
│   ├── user-role.enum.ts
│   ├── complaint-status.enum.ts
│   └── priority.enum.ts
└── package.json
```

## Installation

```bash
cd shared
pnpm install
```

## Utilisation

### Dans le backend

```typescript
import { UserRole, ComplaintStatus } from '@satisclient/shared/enums';
import { User, Complaint } from '@satisclient/shared/types';
```

### Dans le frontend

```typescript
import { UserRole } from '@satisclient/shared/enums';
import type { User, Complaint } from '@satisclient/shared/types';
```

## Exemple de types

### user.types.ts

```typescript
export interface User {
  id: string;
  organizationId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}
```

### complaint.types.ts

```typescript
export interface Complaint {
  id: string;
  ticketNumber: string;
  organizationId: string;
  siteId: string;
  title: string;
  description: string;
  status: ComplaintStatus;
  priority: Priority;
  createdBy: string;
  assignedTo?: string;
  slaDueDate: Date;
  createdAt: Date;
}
```

## Build

```bash
pnpm run build
```

Ce package sera référencé dans les `package.json` du backend et frontend via workspace.
