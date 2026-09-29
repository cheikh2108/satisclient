import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Response, Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RateLimit } from '../../common/decorators/rate-limit.decorator';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

// Durées des cookies
const ACCESS_MAX_AGE = 15 * 60 * 1000;           // 15 minutes
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 jours

/** Écrit access_token et refresh_token dans des cookies httpOnly sécurisés */
function setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: ACCESS_MAX_AGE,
    path: '/',
  });

  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: REFRESH_MAX_AGE,
    path: '/api/auth',
  });
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Connexion utilisateur' })
  @ApiResponse({ status: 200, description: 'Connexion réussie — tokens écrits dans des cookies httpOnly' })
  @ApiResponse({ status: 401, description: 'Identifiants invalides' })
  async login(@Body() loginDto: LoginDto, @Request() req, @Res() res: Response) {
    const result = await this.authService.login(req.user);
    setAuthCookies(res, result.accessToken, result.refreshToken);
    // Ne PAS retourner les tokens dans le body (protection XSS)
    return res.json({ user: result.user });
  }

  @Post('register')
  @RateLimit({ ttl: 3600, limit: 3 }) // 3 inscriptions par heure par IP
  @ApiOperation({ summary: 'Inscription nouvel utilisateur' })
  @ApiResponse({ status: 201, description: 'Compte créé avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides ou email déjà utilisé' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renouveler le token d\'accès via cookie refresh_token' })
  @ApiResponse({ status: 200, description: 'Nouveaux tokens écrits dans les cookies' })
  @ApiResponse({ status: 401, description: 'Refresh token manquant, invalide ou expiré' })
  async refresh(@Req() req: any, @Res() res: Response) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Refresh token manquant' });
    }
    const result = await this.authService.refreshAccessToken(refreshToken);
    setAuthCookies(res, result.accessToken, result.refreshToken);
    return res.json({ ok: true });
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Déconnexion et révocation du refresh token' })
  async logout(@Req() req: any, @Res() res: Response) {
    const refreshToken = req.cookies?.refresh_token;
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/api/auth' });
    return res.json({ message: 'Déconnecté' });
  }

  @Post('create-account')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer un compte organisation + admin (public)' })
  async createAccount(@Body() body: { orgName: string; firstName: string; lastName: string; email: string; password: string }) {
    return this.authService.createAccount(body);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @RateLimit({ ttl: 3600, limit: 5 }) // Anti-abus : 5 demandes par heure par IP
  @ApiOperation({ summary: 'Demande de réinitialisation du mot de passe' })
  @ApiResponse({ status: 200, description: 'Email envoyé si le compte existe (anti-énumération)' })
  async forgotPassword(@Body() body: { email: string }) {
    await this.authService.forgotPassword(body.email);
    return { message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Réinitialiser le mot de passe avec un token valide' })
  @ApiResponse({ status: 200, description: 'Mot de passe mis à jour avec succès' })
  @ApiResponse({ status: 400, description: 'Token invalide/expiré ou mot de passe trop faible' })
  async resetPassword(@Body() body: { token: string; password: string }) {
    await this.authService.resetPassword(body.token, body.password);
    return { message: 'Mot de passe mis à jour avec succès.' };
  }
}
