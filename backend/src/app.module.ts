import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { SitesModule } from './modules/sites/sites.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { ComplaintsModule } from './modules/complaints/complaints.module';
import { SuggestionsModule } from './modules/suggestions/suggestions.module';
import { SurveysModule } from './modules/surveys/surveys.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { QrCodesModule } from './modules/qr-codes/qr-codes.module';
import { FilesModule } from './modules/files/files.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AuditModule } from './modules/audit/audit.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests
      },
    ]),

    // Database
    PrismaModule,

    // Business modules
    AuthModule,
    UsersModule,
    OrganizationsModule,
    SitesModule,
    FeedbackModule,
    ComplaintsModule,
    SuggestionsModule,
    SurveysModule,
    AnalyticsModule,
    NotificationsModule,
    QrCodesModule,
    FilesModule,
    ReportsModule,
    AuditModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
