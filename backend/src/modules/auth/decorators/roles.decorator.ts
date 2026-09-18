import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Decorator pour restreindre l'accès aux routes selon les rôles
 *
 * @example
 * ```typescript
 * @Roles(UserRole.super_admin)
 * @Get('admin-only')
 * adminRoute() {}
 *
 * @Roles(UserRole.super_admin, UserRole.org_admin)
 * @Get('admins-only')
 * adminsRoute() {}
 * ```
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
