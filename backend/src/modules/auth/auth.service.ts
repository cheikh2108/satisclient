import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PasswordService } from '../../common/services/password.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private passwordService: PasswordService,
    private prisma: PrismaService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      // Log tentative échouée
      await this.logLoginAttempt(email, null, false, 'user_not_found');
      return null;
    }

    const isPasswordValid = await this.passwordService.verify(password, user.passwordHash);

    if (!isPasswordValid) {
      // Log tentative échouée
      await this.logLoginAttempt(email, null, false, 'invalid_password');
      return null;
    }

    // Vérifier que le compte est actif
    if (user.status !== 'active') {
      await this.logLoginAttempt(email, null, false, `account_${user.status}`);
      throw new UnauthorizedException(`Compte ${user.status}`);
    }

    // Log réussite
    await this.logLoginAttempt(email, user.id, true, null);

    const { passwordHash, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      organizationId: user.organizationId,
      role: user.role,
    };

    // Mettre à jour lastLoginAt
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: user.ipAddress || null,
      },
    });

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organizationId: user.organizationId,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    // Vérifier que l'email n'existe pas
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new BadRequestException('Un compte avec cet email existe déjà');
    }

    // Valider la force du mot de passe
    const passwordValidation = this.passwordService.validateStrength(registerDto.password);
    if (!passwordValidation.valid) {
      throw new BadRequestException({
        message: 'Mot de passe trop faible',
        errors: passwordValidation.feedback,
      });
    }

    // Hasher le mot de passe
    const passwordHash = await this.passwordService.hash(registerDto.password);

    // Créer l'utilisateur
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        passwordHash,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        phone: registerDto.phone,
        organizationId: registerDto.organizationId,
        role: 'agent', // Rôle par défaut
        status: 'active',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        organizationId: true,
        createdAt: true,
      },
    });

    this.logger.log(`New user registered: ${user.email}`);

    return {
      message: 'Compte créé avec succès',
      user,
    };
  }

  private async logLoginAttempt(
    email: string,
    userId: string | null,
    success: boolean,
    reason: string | null,
  ): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          action: success ? 'login_success' : 'login_failed',
          entityType: 'auth',
          entityId: userId,
          userId,
          userEmail: email,
          success,
          errorMessage: reason,
        },
      });
    } catch (error) {
      this.logger.error('Failed to log login attempt:', error);
    }
  }
}
