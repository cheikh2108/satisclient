import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { SanitizePipe } from './common/pipes/sanitize.pipe';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
    logger: ['error', 'warn', 'log'],
  });

  const configService = app.get(ConfigService);
  const nodeEnv = configService.get('NODE_ENV') || 'development';
  const isDevelopment = nodeEnv === 'development';

  // Global prefix
  app.setGlobalPrefix('api');

  // ============================================
  // SECURITY CONFIGURATION
  // ============================================

  // 1. Helmet - Security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", isDevelopment ? "'unsafe-inline'" : "'none'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", configService.get('NEXT_PUBLIC_API_URL') || ''],
          frameSrc: ["'none'"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: isDevelopment ? [] : [],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      noSniff: true,
      xssFilter: true,
      hidePoweredBy: true,
    }),
  );

  // 2. Compression
  app.use(compression());

  // 3. Cookie parser (pour les cookies httpOnly d'authentification)
  app.use(cookieParser());

  // 4. CORS Configuration
  const allowedOrigins = configService.get('CORS_ORIGIN')?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin) || isDevelopment) {
        callback(null, true);
      } else {
        logger.warn(`[SECURITY] Blocked CORS request from origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Per-Page'],
    maxAge: 3600,
  });

  // ============================================
  // GLOBAL PIPES
  // ============================================

  // 1. Sanitization (XSS Protection)
  app.useGlobalPipes(new SanitizePipe());

  // 2. Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip non-whitelisted properties
      forbidNonWhitelisted: true, // Throw error on non-whitelisted
      transform: true, // Transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true,
      },
      disableErrorMessages: !isDevelopment, // Hide validation errors in production
    }),
  );

  // ============================================
  // SWAGGER DOCUMENTATION
  // ============================================

  if (isDevelopment || configService.get('ENABLE_SWAGGER') === 'true') {
    const config = new DocumentBuilder()
      .setTitle('SatisClient API')
      .setDescription(
        `
        API REST de la plateforme SatisClient

        ## Sécurité
        - Authentification JWT (Bearer Token)
        - Refresh Token avec rotation
        - Rate Limiting par route
        - Protection brute force (max 5 tentatives)
        - Validation stricte des entrées
        - Sanitization XSS automatique

        ## Environnement
        - ${nodeEnv.toUpperCase()}
        - Version: 1.0.0
      `,
      )
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token',
        },
        'JWT',
      )
      .addTag('Auth', 'Authentification, inscription, reset password')
      .addTag('Users', 'Gestion des utilisateurs')
      .addTag('Organizations', 'Gestion des organisations (multi-tenant)')
      .addTag('Sites', 'Hiérarchie des sites et emplacements')
      .addTag('Feedback', 'Avis, notations et commentaires')
      .addTag('Complaints', 'Réclamations avec workflow SLA')
      .addTag('Suggestions', "Suggestions d'amélioration")
      .addTag('Surveys', 'Enquêtes de satisfaction')
      .addTag('Analytics', 'Analytics, KPIs et tendances')
      .addTag('Notifications', 'Email, SMS, WhatsApp, In-App')
      .addTag('QR Codes', 'Génération et gestion QR codes')
      .addTag('Files', 'Upload et gestion de fichiers')
      .addTag('Reports', 'Génération de rapports PDF/Excel')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });

    logger.log(
      '📚 Swagger Documentation: http://localhost:' +
        (configService.get('BACKEND_PORT') || 3001) +
        '/api/docs',
    );
  }

  // ============================================
  // START SERVER
  // ============================================

  const port = configService.get('BACKEND_PORT') || 3001;
  await app.listen(port);

  const encryptionKey = configService.get('ENCRYPTION_KEY');
  const jwtSecret = configService.get('JWT_SECRET');

  console.log(`
    ╔════════════════════════════════════════════════════════════╗
    ║                                                            ║
    ║   🎯 SatisClient API                                      ║
    ║   🔒 Secured with JWT + Refresh Tokens                    ║
    ║                                                            ║
    ║   🚀 Server: http://localhost:${port.toString().padEnd(30)} ║
    ║   📚 Docs:   http://localhost:${port}/api/docs${' '.repeat(18)} ║
    ║   🌍 Env:    ${nodeEnv.toUpperCase().padEnd(43)} ║
    ║                                                            ║
    ║   Security Status:                                         ║
    ║   ${encryptionKey ? '✅' : '⚠️ '}  Encryption Key ${encryptionKey ? 'SET' : 'NOT SET (using dev key)'.padEnd(28)} ║
    ║   ${jwtSecret ? '✅' : '⚠️ '}  JWT Secret     ${jwtSecret ? 'SET' : 'NOT SET'.padEnd(28)} ║
    ║   ✅  Password Hashing (bcrypt 12 rounds)                 ║
    ║   ✅  Brute Force Protection (5 attempts)                 ║
    ║   ✅  Rate Limiting (per route)                           ║
    ║   ✅  XSS Sanitization                                    ║
    ║   ✅  CORS Configured                                     ║
    ║   ✅  CSP Headers                                         ║
    ║                                                            ║
    ╚════════════════════════════════════════════════════════════╝
  `);

  if (!encryptionKey) {
    logger.warn(
      "⚠️  Generate ENCRYPTION_KEY with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
    );
  }

  if (isDevelopment) {
    logger.log('🔧 Running in DEVELOPMENT mode - Some security features are relaxed');
  } else {
    logger.log('🔒 Running in PRODUCTION mode - All security features active');
  }
}

bootstrap().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
