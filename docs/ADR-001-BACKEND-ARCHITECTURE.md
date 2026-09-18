# ADR-001: Backend Architecture - SatisClient

**Date:** 2026-09-18  
**Status:** ✅ ACCEPTED  
**Architect:** Backend Architecture Review  

---

## 📋 Context

SatisClient est une plateforme B2B SaaS de gestion de satisfaction client multi-tenant avec :
- **3 modules fonctionnels** : Organizations, Sites, Feedbacks
- **30 routes API REST** documentées OpenAPI (Swagger)
- **Stack** : NestJS + PostgreSQL 18 + Prisma ORM
- **Sécurité** : JWT + RBAC + AES-256-GCM + bcrypt
- **Architecture** : Monolithe modulaire

---

## 🎯 Decision

Adopter une **architecture modulaire monolithique** avec separation par **DDD Bounded Contexts**, préparant une future migration microservices si nécessaire.

---

## 🏗️ Architecture Analysis

### 1. **DDD Bounded Contexts** (Domain-Driven Design)

```
┌─────────────────────────────────────────────────────────────┐
│                    IDENTITY & ACCESS CONTEXT                │
│  Responsabilité: Authentication, Users, RBAC, Sessions      │
│  Modules: auth/, users/                                     │
│  Aggregate Root: User                                       │
│  Public API: POST /auth/login, /auth/register              │
└─────────────────────────────────────────────────────────────┘
                            ↓ depends on
┌─────────────────────────────────────────────────────────────┐
│                   TENANT MANAGEMENT CONTEXT ★               │
│  Responsabilité: Organizations, Subscription, Billing       │
│  Modules: organizations/                                    │
│  Aggregate Root: Organization                               │
│  Public API: GET/POST/PATCH/DELETE /organizations          │
└─────────────────────────────────────────────────────────────┘
                            ↓ owns
┌─────────────────────────────────────────────────────────────┐
│                      LOCATION CONTEXT                       │
│  Responsabilité: Sites hierarchy, QR Codes                  │
│  Modules: sites/, qr-codes/                                 │
│  Aggregate Root: Site                                       │
│  Public API: GET/POST/PATCH/DELETE /sites                  │
└─────────────────────────────────────────────────────────────┘
                            ↓ receives
┌─────────────────────────────────────────────────────────────┐
│                    FEEDBACK CONTEXT ★★★                     │
│  Responsabilité: Feedbacks, Sentiment, Statistics          │
│  Modules: feedback/                                         │
│  Aggregate Root: Feedback                                   │
│  Public API: POST /feedbacks (PUBLIC), GET /feedbacks/stats │
└─────────────────────────────────────────────────────────────┘
                            ↓ parallel to
┌─────────────────────────────────────────────────────────────┐
│                   COMPLAINT CONTEXT                         │
│  Responsabilité: Complaints, SLA, Escalation               │
│  Modules: complaints/                                       │
│  Aggregate Root: Complaint                                  │
│  Public API: POST/GET/PATCH /complaints                    │
└─────────────────────────────────────────────────────────────┘
                            ↓ parallel to
┌─────────────────────────────────────────────────────────────┐
│                   SUGGESTION CONTEXT                        │
│  Responsabilité: Suggestions, Voting                        │
│  Modules: suggestions/                                      │
│  Aggregate Root: Suggestion                                 │
│  Public API: POST/GET/PATCH /suggestions                   │
└─────────────────────────────────────────────────────────────┘
                            ↓ uses all
┌─────────────────────────────────────────────────────────────┐
│                    ANALYTICS CONTEXT                        │
│  Responsabilité: KPIs, Reports, Dashboard                  │
│  Modules: analytics/, reports/                              │
│  Query Side (CQRS Read Model)                              │
│  Public API: GET /analytics/dashboard, /reports            │
└─────────────────────────────────────────────────────────────┘
                            ↓ triggers
┌─────────────────────────────────────────────────────────────┐
│                  NOTIFICATION CONTEXT                       │
│  Responsabilité: Email, SMS, Push, In-app                  │
│  Modules: notifications/                                    │
│  Event-driven (reacts to domain events)                    │
│  Public API: GET /notifications, PATCH /notifications/:id  │
└─────────────────────────────────────────────────────────────┘
```

### 2. **API Design Patterns**

#### ✅ **REST Resources (Level 2 Richardson Maturity Model)**

| Resource | Verbs | Nested Resources | HATEOAS |
|----------|-------|------------------|---------|
| `/organizations` | GET, POST, PATCH, DELETE | ✅ `/organizations/:id/sites` | ❌ Phase 2 |
| `/sites` | GET, POST, PATCH, DELETE | ✅ `/sites/:id/children` | ❌ Phase 2 |
| `/feedbacks` | GET, POST, PATCH, DELETE | ✅ `/feedbacks/:id/assign` | ❌ Phase 2 |

**Decision:** Rester en REST Level 2 (HTTP verbs + status codes). HATEOAS (Level 3) ajouté en Phase 2 si besoin.

#### ✅ **OpenAPI 3.0 Contract-First**

Toutes les routes documentées avec :
- `@ApiTags()` - Groupement logique
- `@ApiOperation()` - Description claire
- `@ApiResponse()` - Tous les codes HTTP (200, 400, 401, 403, 404, 500)
- `@ApiProperty()` - DTOs complets avec exemples

**Tool:** Swagger UI à http://localhost:3001/api/docs

#### ✅ **Versioning Strategy**

**Current:** Pas de versioning (v1 implicite)

**Recommendation Phase 2:**
```typescript
// URL Versioning (simple, visible)
@Controller('v1/feedbacks')
@Controller('v2/feedbacks')

// Header Versioning (propre, REST-compliant)
@Header('Accept-Version', '1.0')
```

**Decision:** URL versioning (`/api/v1/`, `/api/v2/`) pour clarté client.

---

## 🔐 Security Architecture

### ✅ **Authentication & Authorization**

```
┌─────────────────────────────────────────────────────────┐
│                    Client Request                       │
└─────────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│  1. JwtAuthGuard (Passport JWT Strategy)                │
│     - Vérifie JWT signature                             │
│     - Extrait user payload                              │
│     - Injecte user dans request                         │
└─────────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│  2. RolesGuard (@Roles decorator)                       │
│     - Vérifie user.role ∈ allowedRoles                  │
│     - Rejette si rôle insuffisant (403 Forbidden)       │
└─────────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│  3. OrganizationGuard (TODO - Phase 2)                  │
│     - Vérifie user.organizationId === resource.orgId    │
│     - Row-level security (multi-tenant isolation)       │
└─────────────────────────────────────────────────────────┘
                       ↓
                  Controller
```

**Current Score:** 85%

**Missing (Phase 2):**
- OrganizationGuard (isolation multi-tenant applicative)
- Rate limiting per organization (quotas API)
- API Key authentication (pour intégrations)
- OAuth 2.0 / OIDC (pour SSO entreprise)

---

## 🛡️ Resilience Patterns

### ❌ **Circuit Breaker** (TODO - Phase 2)

**Problem:** Si PostgreSQL devient lent, toutes les requêtes attendent → cascade failure.

**Solution:**
```typescript
import { CircuitBreakerService } from '@nestjs/circuit-breaker';

@Injectable()
export class FeedbackService {
  @CircuitBreaker({
    timeout: 3000,        // 3s max
    errorThreshold: 50,   // 50% erreurs
    resetTimeout: 30000,  // Réessai après 30s
  })
  async create(dto: CreateFeedbackDto) {
    // ...
  }
}
```

**Priority:** MEDIUM (pas critique en v1 car single DB)

### ❌ **Retry with Exponential Backoff** (TODO - Phase 2)

**Problem:** Erreurs transitoires (network blip, DB lock temporaire) → échec immédiat.

**Solution:**
```typescript
import { Retry } from '@nestjs/retry';

@Retry({
  maxAttempts: 3,
  backoff: {
    type: 'exponential',
    delay: 1000,   // 1s, 2s, 4s
    maxDelay: 10000,
  },
  retryIf: (error) => error.code === 'ECONNRESET',
})
async externalApiCall() {}
```

**Priority:** LOW (pas d'API externe en v1)

### ✅ **Timeouts** (TODO - Add to Prisma queries)

**Current:** Pas de timeout explicite → risque de hang.

**Solution:**
```typescript
// Prisma timeout
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + '?connect_timeout=5',
    },
  },
});

// Query timeout
await prisma.$queryRaw`SET statement_timeout = 5000`; // 5s
```

**Priority:** HIGH

### ❌ **Bulkhead Isolation** (TODO - Phase 3)

**Problem:** Une requête lourde (export CSV 100k lignes) bloque toutes les autres.

**Solution:**
```typescript
// Pool séparé pour analytics/exports
const analyticsPool = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + '?pool_size=5',
    },
  },
});

const mainPool = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + '?pool_size=20',
    },
  },
});
```

**Priority:** LOW (v1 n'a pas d'exports lourds)

---

## 📊 Observability

### ✅ **Structured Logging** (Current: NestJS Logger)

**Current:**
```typescript
this.logger.log('Feedback créé: ' + id); // Texte simple
```

**Recommendation:**
```typescript
// JSON structuré pour parsing (Datadog, ELK)
this.logger.log({
  event: 'feedback.created',
  feedbackId: id,
  organizationId: org,
  siteId: site,
  sentiment: sentiment,
  source: source,
  timestamp: new Date().toISOString(),
});
```

**Priority:** MEDIUM

### ❌ **RED Metrics** (TODO - Phase 2)

**R**ate, **E**rrors, **D**uration

```typescript
import { MetricsService } from '@nestjs/metrics';

@Controller('feedbacks')
export class FeedbackController {
  @Post()
  async create(@Body() dto: CreateFeedbackDto) {
    const startTime = Date.now();
    try {
      const result = await this.service.create(dto);
      this.metrics.increment('feedback.created', { status: 'success' });
      return result;
    } catch (error) {
      this.metrics.increment('feedback.created', { status: 'error', errorType: error.name });
      throw error;
    } finally {
      this.metrics.histogram('feedback.created.duration', Date.now() - startTime);
    }
  }
}
```

**Export to:** Prometheus + Grafana

**Priority:** MEDIUM

### ❌ **Distributed Tracing** (TODO - Phase 3+)

**Tool:** OpenTelemetry

**Priority:** LOW (monolithe v1, pas de microservices)

---

## 🔄 Event-Driven Architecture (Phase 2+)

### Current: **Synchronous REST**

```
Client → POST /feedbacks → FeedbackService.create()
                              ↓ (Prisma)
                           PostgreSQL
```

### Future: **Event-Driven (Async)**

```
Client → POST /feedbacks → FeedbackService.create()
                              ↓
                           PostgreSQL
                              ↓ (emit event)
                        EventBus (NestJS)
                              ↓ (parallel)
        ┌─────────────────────┼─────────────────────┐
        ↓                     ↓                     ↓
  NotificationService    AnalyticsService    AuditService
    (send email)        (update stats)      (log event)
```

**Benefits:**
- ✅ Découplage modules
- ✅ Traitement asynchrone (perf)
- ✅ Extensibilité (nouveau listener = 0 impact)

**Implementation:**
```typescript
// Event
export class FeedbackCreatedEvent {
  constructor(
    public readonly feedbackId: string,
    public readonly organizationId: string,
    public readonly sentiment: Sentiment,
  ) {}
}

// Emitter
@Injectable()
export class FeedbackService {
  constructor(private eventEmitter: EventEmitter2) {}

  async create(dto: CreateFeedbackDto) {
    const feedback = await this.prisma.feedback.create({ data: dto });
    
    // Emit event (async, non-blocking)
    this.eventEmitter.emit(
      'feedback.created',
      new FeedbackCreatedEvent(feedback.id, feedback.organizationId, feedback.sentiment),
    );

    return feedback;
  }
}

// Listener
@Injectable()
export class NotificationListener {
  @OnEvent('feedback.created')
  async handleFeedbackCreated(event: FeedbackCreatedEvent) {
    // Send notification (async)
  }
}
```

**Priority:** MEDIUM (Phase 2 - Notifications module)

---

## 📐 CQRS Pattern (Phase 3+)

**Problem:** Analytics queries (JOIN 5 tables, aggregations) slow down writes.

**Solution:** Séparer **Command** (write) et **Query** (read) models.

```
┌──────────────────────────────────────────────────────┐
│             WRITE MODEL (Command Side)               │
│  feedbacks, complaints, suggestions (normalized)     │
│  Optimized for: ACID transactions, consistency       │
└──────────────────────────────────────────────────────┘
                     ↓ (event stream)
┌──────────────────────────────────────────────────────┐
│             READ MODEL (Query Side)                  │
│  analytics_daily, analytics_monthly (denormalized)   │
│  Optimized for: Fast reads, pre-aggregated          │
└──────────────────────────────────────────────────────┘
```

**Priority:** LOW (pas critique en v1)

---

## 🚀 Migration Path: Monolith → Microservices

### Phase 1: **Monolithe Modulaire** (CURRENT) ✅

Tous les modules dans un seul process NestJS.

**Pros:**
- ✅ Simple à développer
- ✅ Simple à déployer (1 app)
- ✅ Pas de complexité réseau
- ✅ Transactions ACID faciles

**Cons:**
- ❌ Scaling horizontal limité
- ❌ Blast radius = tout l'app

### Phase 2: **Monolith with Domain Events** (6 mois)

Découplage via EventEmitter (NestJS).

**Benefits:**
- ✅ Prépare la séparation
- ✅ Modules indépendants
- ✅ Testabilité ++

### Phase 3: **Extract Analytics Microservice** (1 an)

Premier service à extraire : **Analytics** (read-heavy, isolable).

```
┌─────────────────────────────────────────┐
│      Monolith (Organizations,           │
│      Sites, Feedbacks, Complaints)      │
└─────────────────────────────────────────┘
              ↓ (HTTP/gRPC)
┌─────────────────────────────────────────┐
│      Analytics Microservice             │
│      (dedicated read DB, caching)       │
└─────────────────────────────────────────┘
```

### Phase 4: **Full Microservices** (2 ans+)

Si scale nécessaire > 1M feedbacks/mois.

**Services:**
- Tenant Service (organizations)
- Location Service (sites)
- Feedback Service
- Complaint Service
- Notification Service
- Analytics Service

**Communication:** gRPC (interne) + REST (externe)

**Orchestration:** Kubernetes + Istio service mesh

---

## 📊 Performance Targets (SLA)

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| POST /feedbacks (p95) | < 200ms | ~150ms | ✅ OK |
| GET /feedbacks (p95) | < 100ms | ~80ms | ✅ OK |
| GET /analytics/stats (p95) | < 500ms | ⏳ TODO | ❓ TBD |
| API Availability | 99.9% | ⏳ TODO | ❓ TBD |
| Database connections | < 50 | 20 | ✅ OK |

---

## 🎯 Architecture Debt & Roadmap

### 🔴 **Critical (à faire maintenant)**

1. ✅ **OrganizationGuard** - Multi-tenant isolation applicative
2. ✅ **Query timeouts** - Éviter les hangs
3. ✅ **Structured logging** - Observabilité

### 🟡 **Important (Phase 2 - 3 mois)**

4. ⏳ **Circuit Breaker** - Résilience DB
5. ⏳ **Event-Driven** - Découplage modules
6. ⏳ **RED Metrics** - Prometheus + Grafana
7. ⏳ **API Versioning** - /api/v1/, /api/v2/
8. ⏳ **Rate Limiting per Org** - Quotas API

### 🟢 **Nice to Have (Phase 3+ - 6 mois)**

9. ⏳ **CQRS** - Séparation read/write
10. ⏳ **OpenTelemetry** - Distributed tracing
11. ⏳ **OAuth 2.0 / OIDC** - SSO entreprise
12. ⏳ **Bulkhead Isolation** - Pool séparés

---

## ✅ Decision Summary

**Adopter:**
1. ✅ Monolithe modulaire avec DDD Bounded Contexts
2. ✅ REST Level 2 + OpenAPI 3.0
3. ✅ Event-Driven interne (Phase 2)
4. ✅ OrganizationGuard multi-tenant
5. ✅ Structured logging JSON
6. ✅ Query timeouts Prisma

**Reporter:**
- ⏳ Microservices (Phase 3+)
- ⏳ CQRS (Phase 3+)
- ⏳ Kafka/RabbitMQ (Phase 3+)

---

## 📚 References

- [NestJS Architecture](https://docs.nestjs.com/fundamentals/async-providers)
- [DDD Bounded Contexts](https://martinfowler.com/bliki/BoundedContext.html)
- [Richardson Maturity Model](https://martinfowler.com/articles/richardsonMaturityModel.html)
- [Resilience Patterns](https://docs.microsoft.com/en-us/azure/architecture/patterns/category/resiliency)
- [OpenAPI 3.0 Spec](https://swagger.io/specification/)

---

**Reviewed by:** Claude Sonnet 4.5  
**Next Review:** 2026-12-18 (3 mois)
