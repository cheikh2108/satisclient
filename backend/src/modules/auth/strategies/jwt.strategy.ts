import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: (req: any) => {
        // Lire depuis cookie httpOnly en priorité
        const cookieToken = req?.cookies?.access_token;
        if (cookieToken) return cookieToken;
        // Fallback sur Authorization header (pour Swagger et tests curl)
        return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
      },
      passReqToCallback: false,
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    return {
      id: payload.sub,
      email: payload.email,
      organizationId: payload.organizationId,
      role: payload.role,
    };
  }
}
