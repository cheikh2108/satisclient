import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { UsersModule } from '../users/users.module';
import { PasswordService } from '../../common/services/password.service';
import { RolesGuard } from './guards/roles.guard';
import { OrganizationGuard } from './guards/organization.guard';
import { PrismaModule } from '../../prisma/prisma.module';
import { ResendEmailService } from '../../common/services/resend-email.service';
// PrismaModule est importé pour que PrismaService soit injectable dans OrganizationGuard

@Module({
  imports: [
    UsersModule,
    PrismaModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '15m',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    PasswordService,
    RolesGuard,
    OrganizationGuard,
    ResendEmailService,
  ],
  exports: [AuthService, PasswordService, RolesGuard, OrganizationGuard],
})
export class AuthModule {}
