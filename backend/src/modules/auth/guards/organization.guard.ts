import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';

/**
 * OrganizationGuard - Isolation Multi-tenant
 *
 * Vérifie que l'utilisateur appartient à la même organisation que la ressource demandée.
 *
 * Règles:
 * - super_admin: bypasse la vérification (accès toutes orgs)
 * - Autres rôles: doivent appartenir à la même organisation que la ressource
 *
 * Usage:
 * @UseGuards(JwtAuthGuard, RolesGuard, OrganizationGuard)
 *
 * Le guard cherche organizationId dans (ordre de priorité):
 * 1. request.params.organizationId
 * 2. request.body.organizationId
 * 3. request.query.organizationId
 *
 * Si aucun organizationId trouvé, le guard laisse passer (certaines routes n'en ont pas besoin).
 */
@Injectable()
export class OrganizationGuard implements CanActivate {
  private readonly logger = new Logger(OrganizationGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Si pas d'utilisateur authentifié, laisser JwtAuthGuard gérer
    if (!user) {
      return true;
    }

    // Super admin bypasse la vérification (accès toutes organisations)
    if (user.role === UserRole.super_admin) {
      return true;
    }

    // Extraire organizationId de la requête (params > body > query)
    const resourceOrgId =
      request.params?.organizationId ||
      request.body?.organizationId ||
      request.query?.organizationId;

    // Si pas d'organizationId dans la requête, laisser passer
    // (certaines routes n'ont pas besoin de vérification)
    if (!resourceOrgId) {
      return true;
    }

    // Vérifier que l'utilisateur appartient à la même organisation
    if (user.organizationId !== resourceOrgId) {
      this.logger.warn(
        `Tentative d'accès inter-organisation refusée: ` +
          `User ${user.id} (org: ${user.organizationId}) ` +
          `-> Resource (org: ${resourceOrgId})`,
      );

      throw new ForbiddenException(
        'Accès refusé: vous ne pouvez pas accéder aux ressources d\'une autre organisation',
      );
    }

    return true;
  }
}
