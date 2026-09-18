# 🗺️ Roadmap Architecture - SatisClient Backend

**Mis à jour:** 2026-09-18  
**Référence:** [ADR-001](./ADR-001-BACKEND-ARCHITECTURE.md)

---

## 🔴 Phase 1 - Fixes Critiques (1-2 semaines)

### 1.1 **OrganizationGuard** - Isolation Multi-tenant Applicative

**Problème:** Actuellement, un user de l'org A peut potentiellement accéder aux données de l'org B si l'API ne filtre pas explicitement.

**Solution:**
```typescript
// backend/src/modules/auth/guards/organization.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class OrganizationGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const resourceOrgId = request.body?.organizationId || request.params?.organizationId || request.query?.organizationId;

    // Super admin bypasse la vérification
    if (user.role === 'super_admin') {
      return true;
    }

    // Vérifier que l'utilisateur appartient à la même organisation
    if (!resourceOrgId) {
      throw new ForbiddenException('organizationId manquant dans la requête');
    }

    if (user.organizationId !== resourceOrgId) {
      throw new ForbiddenException('Accès refusé: organisation différente');
    }

    return true;
  }
}
```

**Utilisation:**
```typescript
@Controller('feedbacks')
@UseGuards(JwtAuthGuard, RolesGuard, OrganizationGuard) // ← Ajout
export class FeedbackController {}
```

**Impact:** 🛡️ Sécurité critique

---

### 1.2 **Query Timeouts Prisma**

**Problème:** Requêtes lentes peuvent bloquer l'app indéfiniment.

**Solution:**
```typescript
// backend/src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL + '?connect_timeout=5&statement_timeout=10000',
          // connect_timeout=5s (connexion)
          // statement_timeout=10s (query max)
        },
      },
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'error' },
        { emit: 'stdout', level: 'warn' },
      ],
    });
  }

  async onModuleInit() {
    await this.$connect();
    
    // Définir timeout au niveau session
    await this.$executeRaw`SET statement_timeout = 10000`; // 10s max par query
    
    // Log queries lentes (>3s)
    (this.$on as any)('query', (e: any) => {
      if (e.duration > 3000) {
        console.warn(`⚠️ Slow query (${e.duration}ms): ${e.query.slice(0, 100)}...`);
      }
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

**Impact:** 🚀 Performance + résilience

---

### 1.3 **Structured Logging JSON**

**Problème:** Logs actuels sont du texte simple, difficile à parser pour Datadog/ELK.

**Solution:**
```typescript
// backend/src/common/logger/custom-logger.service.ts
import { Injectable, LoggerService } from '@nestjs/common';

@Injectable()
export class CustomLogger implements LoggerService {
  log(event: string, context?: any) {
    console.log(JSON.stringify({
      level: 'info',
      timestamp: new Date().toISOString(),
      event,
      ...context,
    }));
  }

  error(event: string, trace?: string, context?: any) {
    console.error(JSON.stringify({
      level: 'error',
      timestamp: new Date().toISOString(),
      event,
      trace,
      ...context,
    }));
  }

  warn(event: string, context?: any) {
    console.warn(JSON.stringify({
      level: 'warn',
      timestamp: new Date().toISOString(),
      event,
      ...context,
    }));
  }

  debug(event: string, context?: any) {
    console.debug(JSON.stringify({
      level: 'debug',
      timestamp: new Date().toISOString(),
      event,
      ...context,
    }));
  }

  verbose(event: string, context?: any) {
    console.log(JSON.stringify({
      level: 'verbose',
      timestamp: new Date().toISOString(),
      event,
      ...context,
    }));
  }
}
```

**Utilisation:**
```typescript
// Dans FeedbackService
this.logger.log('feedback.created', {
  feedbackId: feedback.id,
  organizationId: feedback.organizationId,
  siteId: feedback.siteId,
  sentiment: feedback.sentiment,
  source: feedback.source,
});
```

**Impact:** 📊 Observabilité

---

## 🟡 Phase 2 - Résilience & Découplage (1-2 mois)

### 2.1 **Circuit Breaker Pattern**

**Library:** `@nestjs-modules/throttler` + custom decorator

```typescript
import { Injectable } from '@nestjs/common';
import { CircuitBreaker, CircuitBreakerState } from 'opossum';

@Injectable()
export class CircuitBreakerService {
  private breakers = new Map<string, CircuitBreaker>();

  getOrCreateBreaker(name: string, fn: Function) {
    if (!this.breakers.has(name)) {
      const breaker = new CircuitBreaker(fn, {
        timeout: 3000,          // 3s
        errorThresholdPercentage: 50,
        resetTimeout: 30000,    // 30s avant réessai
      });

      breaker.on('open', () => {
        console.error(`🔴 Circuit breaker OPEN: ${name}`);
      });

      this.breakers.set(name, breaker);
    }

    return this.breakers.get(name)!;
  }
}
```

**Utilisation:**
```typescript
@Post()
async create(@Body() dto: CreateFeedbackDto) {
  const breaker = this.circuitBreaker.getOrCreateBreaker(
    'feedback.create',
    () => this.service.create(dto),
  );
  
  return await breaker.fire();
}
```

---

### 2.2 **Event-Driven Architecture (NestJS EventEmitter)**

**Installation:**
```bash
npm install @nestjs/event-emitter
```

**Setup:**
```typescript
// app.module.ts
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
  ],
})
export class AppModule {}
```

**Events:**
```typescript
// events/feedback.events.ts
export class FeedbackCreatedEvent {
  constructor(
    public readonly feedbackId: string,
    public readonly organizationId: string,
    public readonly siteId: string,
    public readonly sentiment: Sentiment,
    public readonly rating?: number,
  ) {}
}
```

**Emitter:**
```typescript
// feedback.service.ts
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class FeedbackService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateFeedbackDto) {
    const feedback = await this.prisma.feedback.create({ data: dto });

    // Émettre l'événement (async, non-bloquant)
    this.eventEmitter.emit(
      'feedback.created',
      new FeedbackCreatedEvent(
        feedback.id,
        feedback.organizationId,
        feedback.siteId,
        feedback.sentiment,
        feedback.rating,
      ),
    );

    return feedback;
  }
}
```

**Listeners:**
```typescript
// notifications/listeners/feedback.listener.ts
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { FeedbackCreatedEvent } from '../../events/feedback.events';

@Injectable()
export class FeedbackNotificationListener {
  @OnEvent('feedback.created', { async: true })
  async handleFeedbackCreated(event: FeedbackCreatedEvent) {
    // Envoyer email/SMS au quality manager
    console.log(`📧 Notification: Nouveau feedback ${event.feedbackId}`);
    
    // TODO: Implémenter NotificationService
  }
}
```

**Avantages:**
- ✅ Découplage modules
- ✅ Extensibilité (nouveau listener = 0 impact)
- ✅ Traitement asynchrone

---

### 2.3 **API Versioning**

**URL Versioning:**
```typescript
// main.ts
app.enableVersioning({
  type: VersioningType.URI,
  prefix: 'api/v',
  defaultVersion: '1',
});
```

**Controllers:**
```typescript
@Controller({ path: 'feedbacks', version: '1' })
export class FeedbackControllerV1 {}

@Controller({ path: 'feedbacks', version: '2' })
export class FeedbackControllerV2 {}
```

**URLs:**
- `/api/v1/feedbacks`
- `/api/v2/feedbacks`

---

### 2.4 **Rate Limiting par Organization**

**Library:** `@nestjs/throttler`

```typescript
// app.module.ts
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,    // 1 minute
        limit: 100,    // 100 requêtes/min (global)
      },
    ]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
```

**Custom par org:**
```typescript
// guards/org-rate-limit.guard.ts
import { ThrottlerGuard } from '@nestjs/throttler';
import { Injectable } from '@nestjs/common';

@Injectable()
export class OrgRateLimitGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const user = req.user;
    return user?.organizationId || req.ip; // Tracker par org
  }

  protected async getLimit(context: ExecutionContext): Promise<number> {
    const user = context.switchToHttp().getRequest().user;
    
    // Limites selon plan
    const limits = {
      essentialiel: 500,    // 500 req/min
      pro: 1000,
      business: 5000,
      institution: 20000,
    };

    const org = await this.prisma.organization.findUnique({
      where: { id: user.organizationId },
      select: { subscriptionPlan: true },
    });

    return limits[org.subscriptionPlan] || 100;
  }
}
```

---

### 2.5 **Prometheus + Grafana Metrics**

**Library:** `@willsoto/nestjs-prometheus`

```bash
npm install @willsoto/nestjs-prometheus prom-client
```

**Setup:**
```typescript
// app.module.ts
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    PrometheusModule.register({
      defaultMetrics: {
        enabled: true,
      },
    }),
  ],
})
export class AppModule {}
```

**Custom Metrics:**
```typescript
// feedback.service.ts
import { Counter, Histogram } from 'prom-client';
import { InjectMetric } from '@willsoto/nestjs-prometheus';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectMetric('feedback_created_total') private feedbackCounter: Counter<string>,
    @InjectMetric('feedback_creation_duration') private feedbackHistogram: Histogram<string>,
  ) {}

  async create(dto: CreateFeedbackDto) {
    const startTime = Date.now();
    
    try {
      const feedback = await this.prisma.feedback.create({ data: dto });
      
      // Incrémenter compteur
      this.feedbackCounter.inc({ sentiment: feedback.sentiment, status: 'success' });
      
      return feedback;
    } catch (error) {
      this.feedbackCounter.inc({ sentiment: 'unknown', status: 'error' });
      throw error;
    } finally {
      // Mesurer durée
      this.feedbackHistogram.observe(Date.now() - startTime);
    }
  }
}
```

**Endpoint Prometheus:**
```
GET http://localhost:3001/metrics
```

**Grafana Dashboards:**
- Feedback rate (req/s)
- Error rate (%)
- P95 latency (ms)
- Active connections

---

## 🟢 Phase 3+ - Scalabilité Avancée (6+ mois)

### 3.1 **CQRS (Command Query Responsibility Segregation)**

Séparer write model (feedbacks) et read model (analytics).

**Use case:** Dashboard analytics requiert JOIN 5 tables → lent.

**Solution:** Vue matérialisée pré-agrégée.

```sql
-- Vue matérialisée refresh toutes les heures
CREATE MATERIALIZED VIEW analytics_daily AS
SELECT
  organization_id,
  site_id,
  DATE(created_at) as date,
  sentiment,
  COUNT(*) as total,
  AVG(rating) as avg_rating
FROM feedbacks
GROUP BY organization_id, site_id, date, sentiment;

CREATE INDEX idx_analytics_daily_org ON analytics_daily(organization_id, date);
```

**Refresh:**
```typescript
await prisma.$executeRaw`REFRESH MATERIALIZED VIEW analytics_daily`;
```

---

### 3.2 **Microservices Extraction**

**Phase 3.1:** Extract Analytics Service (read-heavy)

```
┌──────────────────────────────────┐
│   Monolith (Organizations,       │
│   Sites, Feedbacks, Complaints)  │
└──────────────────────────────────┘
         ↓ HTTP/gRPC
┌──────────────────────────────────┐
│   Analytics Microservice         │
│   - Dedicated PostgreSQL Replica │
│   - Redis Cache (7d TTL)         │
└──────────────────────────────────┘
```

**Phase 3.2:** Full microservices
- Tenant Service
- Location Service
- Feedback Service
- Notification Service (async)
- Analytics Service

**Communication:** gRPC (interne) + REST (externe)

---

### 3.3 **Distributed Tracing (OpenTelemetry)**

**Use case:** Tracer une requête à travers 5 microservices.

**Library:** `@opentelemetry/sdk-node`

```typescript
import { NodeSDK } from '@opentelemetry/sdk-node';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';

const sdk = new NodeSDK({
  traceExporter: new JaegerExporter({
    endpoint: 'http://localhost:14268/api/traces',
  }),
});

sdk.start();
```

**Jaeger UI:**
```
http://localhost:16686
```

**Visualisation:**
```
POST /feedbacks
├── FeedbackService.create (10ms)
│   ├── OrganizationService.canCreateFeedback (5ms)
│   ├── SiteService.findOne (3ms)
│   └── PrismaClient.feedback.create (15ms)
└── NotificationService.send (500ms)
    └── EmailService.sendEmail (480ms)
```

---

## 📊 KPIs de Migration

| Métrique | Phase 1 | Phase 2 | Phase 3 |
|----------|---------|---------|---------|
| **API P95 latency** | < 200ms | < 150ms | < 100ms |
| **Error rate** | < 1% | < 0.5% | < 0.1% |
| **Availability** | 99% | 99.5% | 99.9% |
| **Max throughput** | 100 req/s | 500 req/s | 5000 req/s |
| **MTTR (Mean Time To Recovery)** | 30 min | 10 min | 5 min |

---

## 🎯 Prochaines Actions (à prioriser)

### Cette semaine
- [ ] **Implémenter OrganizationGuard** (2h)
- [ ] **Ajouter query timeouts Prisma** (1h)
- [ ] **Migrer vers structured logging JSON** (3h)

### Ce mois
- [ ] **Event-Driven avec NestJS EventEmitter** (1 semaine)
- [ ] **Circuit Breaker sur requêtes DB** (2 jours)
- [ ] **API Versioning /api/v1/** (1 jour)
- [ ] **Rate limiting par organization** (2 jours)

### Trimestre
- [ ] **Prometheus + Grafana dashboard** (1 semaine)
- [ ] **CQRS pour analytics** (2 semaines)
- [ ] **OAuth 2.0 / OIDC SSO** (3 semaines)

---

**Maintenu par:** Équipe Backend SatisClient  
**Prochain Review:** 2026-10-18
