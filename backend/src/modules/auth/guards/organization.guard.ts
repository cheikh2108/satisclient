import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';

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

  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) return true;

    // Super admin bypasse tout
    if (user.role === UserRole.super_admin) return true;

    // ── Vérification du statut de l'organisation ──────────────────────────────
    const org = await this.prisma.organization.findUnique({
      where: { id: user.organizationId },
      select: { subscriptionStatus: true, trialEndsAt: true },
    });

    if (org) {
      if (org.subscriptionStatus === 'suspended') {
        throw new ForbiddenException(
          'Votre organisation est suspendue. Contactez support@satisclient.sn.',
        );
      }

      if (org.subscriptionStatus === 'expired') {
        const surveyId = request.params?.id;
        const campaignPackId = request.body?.campaignPackId;
        if (request.path.includes('/surveys') && (surveyId || campaignPackId)) {
          const campaignAccess = await this.prisma.campaignPack.findFirst({
            where: {
              organizationId: user.organizationId,
              remaining: { gt: 0 },
              expiresAt: { gt: new Date() },
              ...(campaignPackId
                ? { id: campaignPackId }
                : { surveys: { some: { id: surveyId } } }),
            },
          });
          if (campaignAccess) return true;
        }
        throw new ForbiddenException(
          'Votre abonnement a expiré. Renouvelez votre abonnement sur satisclient.sn.',
        );
      }

      if (
        org.subscriptionStatus === 'trial' &&
        org.trialEndsAt &&
        new Date(org.trialEndsAt) < new Date()
      ) {
        const campaignPackId = request.body?.campaignPackId;
        if (request.path.includes('/surveys') && campaignPackId) {
          const campaignAccess = await this.prisma.campaignPack.findFirst({
            where: {
              id: campaignPackId,
              organizationId: user.organizationId,
              remaining: { gt: 0 },
              expiresAt: { gt: new Date() },
            },
          });
          if (campaignAccess) return true;
        }
        // Marquer automatiquement comme expiré
        await this.prisma.organization
          .update({
            where: { id: user.organizationId },
            data: { subscriptionStatus: 'expired' },
          })
          .catch(() => {});

        throw new ForbiddenException(
          'Votre essai gratuit de 7 jours est terminé. Choisissez un plan sur satisclient.sn pour continuer.',
        );
      }
    }

    // ── Isolation multi-tenant ─────────────────────────────────────────────────
    const resourceOrgId =
      request.params?.organizationId ||
      request.body?.organizationId ||
      request.query?.organizationId;

    if (!resourceOrgId) return true;

    if (user.organizationId !== resourceOrgId) {
      this.logger.warn(
        `Accès inter-organisation refusé: User ${user.id} (org: ${user.organizationId}) -> (org: ${resourceOrgId})`,
      );
      throw new ForbiddenException('Accès refusé: ressource appartenant à une autre organisation.');
    }

    return true;
  }
}
