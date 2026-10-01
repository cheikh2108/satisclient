import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

const SYSTEM_ROLES = [
  {
    id: 'org_admin',
    name: 'Admin Organisation',
    description: 'Gestion complète de l’organisation',
    permissions: ['all'],
    isSystem: true,
  },
  {
    id: 'quality_manager',
    name: 'Responsable Qualité',
    description: 'Analyse des feedbacks et rapports qualité',
    permissions: [
      'feedbacks.read',
      'feedbacks.write',
      'complaints.read',
      'reports.read',
      'analytics.read',
    ],
    isSystem: true,
  },
  {
    id: 'service_manager',
    name: 'Responsable Service',
    description: 'Gestion des réclamations et équipes',
    permissions: [
      'feedbacks.read',
      'complaints.read',
      'complaints.write',
      'sites.read',
      'users.read',
    ],
    isSystem: true,
  },
  {
    id: 'agent',
    name: 'Agent',
    description: 'Traitement des réclamations et feedbacks',
    permissions: ['feedbacks.read', 'feedbacks.write', 'complaints.read', 'complaints.write'],
    isSystem: true,
  },
  {
    id: 'client',
    name: 'Client',
    description: 'Soumission et consultation des feedbacks',
    permissions: ['feedbacks.read'],
    isSystem: true,
  },
];

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(organizationId: string) {
    const customRoles = await this.prisma.customRole.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'asc' },
    });
    return [
      ...SYSTEM_ROLES.map((role) => ({
        ...role,
        usersCount: 0,
        createdAt: new Date('2024-01-01'),
      })),
      ...customRoles.map((role) => ({
        ...role,
        permissions: role.permissions as string[],
        isSystem: false,
        usersCount: 0,
      })),
    ];
  }

  async create(organizationId: string, dto: CreateRoleDto) {
    if (SYSTEM_ROLES.some((role) => role.name.toLowerCase() === dto.name.toLowerCase())) {
      throw new ConflictException('Ce nom est réservé à un rôle système');
    }
    return this.prisma.customRole.create({ data: { ...dto, organizationId } });
  }

  async update(id: string, organizationId: string, dto: UpdateRoleDto) {
    await this.findCustom(id, organizationId);
    return this.prisma.customRole.update({ where: { id }, data: dto });
  }

  async remove(id: string, organizationId: string) {
    await this.findCustom(id, organizationId);
    await this.prisma.customRole.delete({ where: { id } });
    return { message: 'Rôle supprimé avec succès' };
  }

  private async findCustom(id: string, organizationId: string) {
    const role = await this.prisma.customRole.findFirst({ where: { id, organizationId } });
    if (!role) throw new NotFoundException('Rôle personnalisé non trouvé');
    return role;
  }
}
