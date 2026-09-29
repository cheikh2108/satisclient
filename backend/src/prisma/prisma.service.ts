import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
            ? process.env.DATABASE_URL.includes('?')
              ? `${process.env.DATABASE_URL}&connect_timeout=5`
              : `${process.env.DATABASE_URL}?connect_timeout=5`
            : undefined,
        },
      },
      log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'stdout' },
        { level: 'warn', emit: 'stdout' },
      ],
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('✅ Database connected');

    // Set statement timeout (10s max per query)
    try {
      await this.$executeRaw`SET statement_timeout = 10000`;
      this.logger.log('⏱️  Query timeout set: 10s');
    } catch (error) {
      this.logger.warn('Could not set statement_timeout');
    }

    // Log slow queries (>3s)
    (this.$on as any)('query', (e: Prisma.QueryEvent) => {
      if (e.duration > 3000) {
        this.logger.warn(
          `⚠️  Slow query (${e.duration}ms): ${e.query.slice(0, 100)}...`,
        );
      }
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Database disconnected');
  }

  async cleanDatabase() {
    // Utilisé uniquement pour les tests
    if (!['test', 'development'].includes(process.env.NODE_ENV ?? '')) {
      throw new Error('cleanDatabase is only allowed in test/development environments');
    }

    const models = Reflect.ownKeys(this).filter((key) => key[0] !== '_');

    return Promise.all(
      models.map((modelKey) => {
        // @ts-ignore
        return this[modelKey].deleteMany();
      }),
    );
  }
}
