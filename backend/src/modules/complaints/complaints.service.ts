import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ComplaintCreatedEvent,
  ComplaintAssignedEvent,
  ComplaintResolvedEvent,
  ComplaintEscalatedEvent,
  ComplaintCommentAddedEvent,
} from '../../events/complaint.events';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';
import { AddCommentDto } from './dto/add-comment.dto';
import { ComplaintResponseDto } from './dto/complaint-response.dto';
import { plainToInstance } from 'class-transformer';
import { ComplaintStatus, ComplaintPriority } from '@prisma/client';

@Injectable()
export class ComplaintsService {
  private readonly logger = new Logger(ComplaintsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Créer une nouvelle réclamation
   */
  async create(createDto: CreateComplaintDto): Promise<ComplaintResponseDto> {
    const site = await this.prisma.site.findUnique({
      where: { id: createDto.siteId },
      include: { organization: true },
    });

    if (!site) {
      throw new NotFoundException(`Site non trouvé (id: ${createDto.siteId})`);
    }

    if (!site.isActive) {
      throw new BadRequestException('Le site est désactivé');
    }

    if (site.organizationId !== createDto.organizationId) {
      throw new BadRequestException('organizationId ne correspond pas au site');
    }

    const slaDueDate = this.calculateSLA(createDto.priority);
    const maxAttempts = 5;

    try {
      // ticket_number est unique globalement : régénérer en cas de collision (multi-org / concurrence)
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const ticketNumber = await this.generateTicketNumber();

        try {
          const complaint = await this.prisma.complaint.create({
            data: {
              organizationId: createDto.organizationId,
              siteId: createDto.siteId,
              ticketNumber,
              title: createDto.title,
              description: createDto.description,
              category: createDto.category,
              subcategory: createDto.subcategory,
              priority: createDto.priority,
              status: ComplaintStatus.received,
              incidentDate: createDto.incidentDate ? new Date(createDto.incidentDate) : null,
              slaDueDate,
              complainantUserId: createDto.complainantUserId,
              isAnonymous: createDto.isAnonymous ?? false,
              complainantName: createDto.complainantName,
              complainantEmail: createDto.complainantEmail,
              complainantPhone: createDto.complainantPhone,
              attachments: createDto.attachments || [],
              relatedFeedbackId: createDto.relatedFeedbackId,
              source: createDto.source || 'web',
              ipAddress: createDto.ipAddress,
            },
            include: {
              site: { select: { id: true, name: true, code: true } },
              organization: { select: { id: true, name: true } },
            },
          });

          await this.createHistory({
            complaintId: complaint.id,
            organizationId: complaint.organizationId,
            action: 'created',
            newStatus: ComplaintStatus.received,
            comment: 'Réclamation créée',
            userId: createDto.complainantUserId,
          });

          this.logger.log({
            event: 'complaint.created',
            complaintId: complaint.id,
            ticketNumber: complaint.ticketNumber,
            organizationId: complaint.organizationId,
            priority: complaint.priority,
          });

          this.eventEmitter.emit(
            'complaint.created',
            new ComplaintCreatedEvent(
              complaint.id,
              complaint.ticketNumber,
              complaint.organizationId,
              complaint.siteId,
              complaint.title,
              complaint.priority,
              complaint.slaDueDate!,
              complaint.complainantEmail || undefined,
              complaint.complainantName || undefined,
            ),
          );

          return plainToInstance(ComplaintResponseDto, complaint);
        } catch (error: any) {
          const isUniqueTicketConflict =
            error?.code === 'P2002' &&
            (Array.isArray(error?.meta?.target)
              ? error.meta.target.includes('ticket_number')
              : String(error?.meta?.target || '').includes('ticket_number'));

          if (isUniqueTicketConflict && attempt < maxAttempts) {
            this.logger.warn({
              event: 'complaint.create.ticket_collision',
              ticketNumber,
              attempt,
            });
            continue;
          }

          throw error;
        }
      }

      throw new BadRequestException(
        'Impossible de générer un numéro de ticket unique. Réessayez.',
      );
    } catch (error: any) {
      this.logger.error({ event: 'complaint.create.error', error: error.message });
      throw error;
    }
  }

  async findAll(params?: any): Promise<ComplaintResponseDto[]> {
    const {
      organizationId, siteId, status, priority, assignedTo, isOverdue, isCritical,
      startDate, endDate, skip = 0, take = 50, includeRelations = false,
    } = params || {};

    const where: any = {};
    if (organizationId) where.organizationId = organizationId;
    if (siteId) where.siteId = siteId;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedTo) where.assignedTo = assignedTo;
    if (isOverdue !== undefined) where.isOverdue = isOverdue;
    if (isCritical !== undefined) where.isCritical = isCritical;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const complaints = await this.prisma.complaint.findMany({
      where,
      skip,
      take,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      include: includeRelations ? {
        site: { select: { id: true, name: true, code: true } },
        organization: { select: { id: true, name: true } },
        creator: { select: { id: true, firstName: true, lastName: true } },
        assignee: { select: { id: true, firstName: true, lastName: true } },
      } : undefined,
    });

    return complaints.map(c => plainToInstance(ComplaintResponseDto, c));
  }

  async findOne(id: string): Promise<ComplaintResponseDto> {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id },
      include: {
        site: { select: { id: true, name: true, code: true } },
        organization: { select: { id: true, name: true } },
        creator: { select: { id: true, firstName: true, lastName: true } },
        assignee: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    if (!complaint) {
      throw new NotFoundException(`Réclamation non trouvée (id: ${id})`);
    }

    return plainToInstance(ComplaintResponseDto, complaint);
  }

  async findByTicketNumber(ticketNumber: string): Promise<ComplaintResponseDto> {
    const complaint = await this.prisma.complaint.findUnique({
      where: { ticketNumber },
      include: {
        site: { select: { id: true, name: true, code: true } },
        organization: { select: { id: true, name: true } },
        creator: { select: { id: true, firstName: true, lastName: true } },
        assignee: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    if (!complaint) {
      throw new NotFoundException(`Réclamation non trouvée (ticket: ${ticketNumber})`);
    }

    return plainToInstance(ComplaintResponseDto, complaint);
  }

  async assign(id: string, userId: string, assignedBy?: string): Promise<ComplaintResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`Utilisateur non trouvé (id: ${userId})`);
    }

    const complaint = await this.findOne(id);

    const updated = await this.prisma.complaint.update({
      where: { id },
      data: {
        assignedTo: userId,
        assignedAt: new Date(),
        assignedBy: assignedBy,
        status: ComplaintStatus.assigned,
        updatedAt: new Date(),
      },
      include: {
        site: { select: { id: true, name: true, code: true } },
        organization: { select: { id: true, name: true } },
        assignee: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    await this.createHistory({
      complaintId: id,
      organizationId: updated.organizationId,
      action: 'assigned',
      oldStatus: complaint.status as ComplaintStatus,
      newStatus: ComplaintStatus.assigned,
      newAssignedTo: userId,
      comment: `Assigné à ${user.firstName} ${user.lastName}`,
      userId: assignedBy,
    });

    this.logger.log({ event: 'complaint.assigned', complaintId: id, assignedTo: userId });

    // Émettre événement
    this.eventEmitter.emit(
      'complaint.assigned',
      new ComplaintAssignedEvent(
        id,
        updated.ticketNumber,
        userId,
        user.email,
        `${user.firstName} ${user.lastName}`,
        updated.complainantEmail || undefined,
      ),
    );

    return plainToInstance(ComplaintResponseDto, updated);
  }

  async changeStatus(
    id: string, newStatus: ComplaintStatus, comment?: string, userId?: string,
  ): Promise<ComplaintResponseDto> {
    const complaint = await this.findOne(id);
    this.validateStatusTransition(complaint.status as ComplaintStatus, newStatus);

    const now = new Date();
    const data: any = { status: newStatus, updatedAt: now };

    if (newStatus === ComplaintStatus.resolved && !complaint.resolvedAt) {
      data.resolvedAt = now;
    }

    if (newStatus === ComplaintStatus.closed && !complaint.closedAt) {
      data.closedAt = now;
    }

    const updated = await this.prisma.complaint.update({
      where: { id },
      data,
      include: {
        site: { select: { id: true, name: true, code: true } },
        organization: { select: { id: true, name: true } },
        assignee: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    await this.createHistory({
      complaintId: id,
      organizationId: updated.organizationId,
      action: 'status_changed',
      oldStatus: complaint.status as ComplaintStatus,
      newStatus: newStatus,
      comment: comment || `Statut changé: ${complaint.status} → ${newStatus}`,
      userId,
    });

    this.logger.log({ event: 'complaint.status_changed', complaintId: id, newStatus });

    return plainToInstance(ComplaintResponseDto, updated);
  }

  async resolve(
    id: string, resolutionSummary: string, resolutionCategory?: string, userId?: string,
  ): Promise<ComplaintResponseDto> {
    const complaint = await this.findOne(id);

    const updated = await this.prisma.complaint.update({
      where: { id },
      data: {
        status: ComplaintStatus.resolved,
        resolutionSummary,
        resolutionCategory,
        resolvedAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        site: { select: { id: true, name: true, code: true } },
        organization: { select: { id: true, name: true } },
        assignee: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    await this.createHistory({
      complaintId: id,
      organizationId: updated.organizationId,
      action: 'resolved',
      oldStatus: complaint.status as ComplaintStatus,
      newStatus: ComplaintStatus.resolved,
      comment: resolutionSummary,
      userId,
    });

    this.logger.log({ event: 'complaint.resolved', complaintId: id, resolutionCategory });

    // Émettre événement
    this.eventEmitter.emit(
      'complaint.resolved',
      new ComplaintResolvedEvent(
        id,
        updated.ticketNumber,
        resolutionSummary,
        resolutionCategory || 'other',
        updated.complainantEmail || undefined,
        updated.complainantName || undefined,
      ),
    );

    return plainToInstance(ComplaintResponseDto, updated);
  }

  async escalate(
    id: string, escalatedTo: string, reason?: string, userId?: string,
  ): Promise<ComplaintResponseDto> {
    await this.findOne(id);

    const updated = await this.prisma.complaint.update({
      where: { id },
      data: {
        isEscalated: true,
        escalatedAt: new Date(),
        escalatedTo,
        updatedAt: new Date(),
      },
      include: {
        site: { select: { id: true, name: true, code: true } },
        organization: { select: { id: true, name: true } },
        assignee: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    await this.createHistory({
      complaintId: id,
      organizationId: updated.organizationId,
      action: 'escalated',
      comment: reason || 'Réclamation escaladée',
      userId,
    });

    this.logger.warn({ event: 'complaint.escalated', complaintId: id, escalatedTo, reason });

    // Récupérer l'email du superviseur
    const supervisor = await this.prisma.user.findUnique({
      where: { id: escalatedTo },
      select: { email: true },
    });

    // Émettre événement
    this.eventEmitter.emit(
      'complaint.escalated',
      new ComplaintEscalatedEvent(
        id,
        updated.ticketNumber,
        escalatedTo,
        supervisor?.email || '',
        reason || 'Escalade',
        updated.priority,
      ),
    );

    return plainToInstance(ComplaintResponseDto, updated);
  }

  async addComment(id: string, commentDto: AddCommentDto, userId?: string) {
    const complaint = await this.findOne(id);

    await this.createHistory({
      complaintId: id,
      organizationId: complaint.organizationId,
      action: 'comment_added',
      comment: commentDto.comment,
      internalNote: commentDto.internalNote ?? false,
      userId,
    });

    if (!complaint.firstResponseAt) {
      await this.prisma.complaint.update({
        where: { id },
        data: { firstResponseAt: new Date() },
      });
    }

    this.logger.log({ event: 'complaint.comment_added', complaintId: id });

    // Émettre événement
    this.eventEmitter.emit(
      'complaint.comment.added',
      new ComplaintCommentAddedEvent(
        id,
        complaint.ticketNumber,
        commentDto.comment,
        commentDto.internalNote ?? false,
        complaint.complainantEmail,
      ),
    );

    return { message: 'Commentaire ajouté avec succès' };
  }

  async getHistory(id: string) {
    const history = await this.prisma.complaintHistory.findMany({
      where: { complaintId: id },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return history;
  }

  async getStats(params: { organizationId?: string; siteId?: string; period?: string }) {
    const { organizationId, siteId, period = '30d' } = params;
    const startDate = this.getStartDateFromPeriod(period);

    const where: any = { createdAt: { gte: startDate } };
    if (organizationId) where.organizationId = organizationId;
    if (siteId) where.siteId = siteId;

    const total = await this.prisma.complaint.count({ where });

    const byStatus = await this.prisma.complaint.groupBy({
      by: ['status'],
      where,
      _count: true,
    });

    const byPriority = await this.prisma.complaint.groupBy({
      by: ['priority'],
      where,
      _count: true,
    });

    const overdueCount = await this.prisma.complaint.count({
      where: { ...where, isOverdue: true },
    });

    const criticalCount = await this.prisma.complaint.count({
      where: { ...where, isCritical: true },
    });

    const resolved = await this.prisma.complaint.findMany({
      where: { ...where, status: ComplaintStatus.resolved, resolvedAt: { not: null } },
      select: { createdAt: true, resolvedAt: true },
    });

    const avgResolutionTime = resolved.length > 0
      ? resolved.reduce((sum, c) => {
          const diff = c.resolvedAt!.getTime() - c.createdAt.getTime();
          return sum + diff / (1000 * 60 * 60);
        }, 0) / resolved.length
      : 0;

    const slaCompliant = resolved.filter(
      c => c.resolvedAt!.getTime() < c.createdAt.getTime() + 48 * 60 * 60 * 1000,
    ).length;

    const slaComplianceRate = resolved.length > 0 ? slaCompliant / resolved.length : 0;

    return {
      period,
      total,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
      byPriority: byPriority.reduce((acc, item) => {
        acc[item.priority] = item._count;
        return acc;
      }, {} as Record<string, number>),
      overdueCount,
      criticalCount,
      averageResolutionTime: Math.round(avgResolutionTime * 10) / 10,
      slaComplianceRate: Math.round(slaComplianceRate * 100) / 100,
    };
  }

  async update(id: string, updateDto: UpdateComplaintDto): Promise<ComplaintResponseDto> {
    await this.findOne(id);

    const updated = await this.prisma.complaint.update({
      where: { id },
      data: { ...updateDto, updatedAt: new Date() },
      include: {
        site: { select: { id: true, name: true, code: true } },
        organization: { select: { id: true, name: true } },
        assignee: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return plainToInstance(ComplaintResponseDto, updated);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.complaint.update({ where: { id }, data: { deletedAt: new Date() } });
    this.logger.warn({ event: 'complaint.deleted', complaintId: id });
    return { message: 'Réclamation supprimée avec succès' };
  }

  // HELPERS
  /**
   * Génère un ticket unique globalement (contrainte @unique sur ticket_number).
   * Format: COMP-YYYY-NNNNNN
   */
  private async generateTicketNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `COMP-${year}-`;

    // Compteur global (pas par org) : ticket_number est unique sur toute la table
    const lastComplaint = await this.prisma.complaint.findFirst({
      where: { ticketNumber: { startsWith: prefix } },
      orderBy: { ticketNumber: 'desc' },
      select: { ticketNumber: true },
    });

    let nextNumber = 1;
    if (lastComplaint?.ticketNumber) {
      const suffix = lastComplaint.ticketNumber.slice(prefix.length);
      const lastNumber = parseInt(suffix, 10);
      if (!Number.isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }

    return `${prefix}${nextNumber.toString().padStart(6, '0')}`;
  }

  private calculateSLA(priority: ComplaintPriority): Date {
    const now = new Date();
    let hoursToAdd = 0;

    switch (priority) {
      case ComplaintPriority.urgent: hoursToAdd = 4; break;
      case ComplaintPriority.high: hoursToAdd = 24; break;
      case ComplaintPriority.normal: hoursToAdd = 72; break;
      case ComplaintPriority.low: hoursToAdd = 168; break;
    }

    return new Date(now.getTime() + hoursToAdd * 60 * 60 * 1000);
  }

  private validateStatusTransition(current: ComplaintStatus, next: ComplaintStatus): void {
    const validTransitions: Record<ComplaintStatus, ComplaintStatus[]> = {
      [ComplaintStatus.received]: [ComplaintStatus.qualified, ComplaintStatus.assigned, ComplaintStatus.rejected],
      [ComplaintStatus.qualified]: [ComplaintStatus.assigned, ComplaintStatus.rejected],
      [ComplaintStatus.assigned]: [ComplaintStatus.in_progress, ComplaintStatus.rejected],
      [ComplaintStatus.in_progress]: [ComplaintStatus.awaiting_info, ComplaintStatus.transferred, ComplaintStatus.on_hold, ComplaintStatus.resolved],
      [ComplaintStatus.awaiting_info]: [ComplaintStatus.in_progress, ComplaintStatus.resolved],
      [ComplaintStatus.transferred]: [ComplaintStatus.in_progress],
      [ComplaintStatus.on_hold]: [ComplaintStatus.in_progress],
      [ComplaintStatus.resolved]: [ComplaintStatus.closed, ComplaintStatus.reopened],
      [ComplaintStatus.closed]: [ComplaintStatus.reopened],
      [ComplaintStatus.rejected]: [],
      [ComplaintStatus.reopened]: [ComplaintStatus.in_progress],
    };

    if (!validTransitions[current]?.includes(next)) {
      throw new BadRequestException(`Transition invalide: ${current} → ${next}`);
    }
  }

  private async createHistory(data: {
    complaintId: string;
    organizationId: string;
    action: string;
    oldStatus?: ComplaintStatus;
    newStatus?: ComplaintStatus;
    oldAssignedTo?: string;
    newAssignedTo?: string;
    comment?: string;
    internalNote?: boolean;
    userId?: string;
  }) {
    await this.prisma.complaintHistory.create({
      data: {
        complaintId: data.complaintId,
        organizationId: data.organizationId,
        action: data.action,
        oldStatus: data.oldStatus,
        newStatus: data.newStatus,
        oldAssignedTo: data.oldAssignedTo,
        newAssignedTo: data.newAssignedTo,
        comment: data.comment,
        internalNote: data.internalNote ?? false,
        userId: data.userId,
      },
    });
  }

  private getStartDateFromPeriod(period: string): Date {
    const now = new Date();

    switch (period) {
      case '7d': return new Date(now.setDate(now.getDate() - 7));
      case '30d': return new Date(now.setDate(now.getDate() - 30));
      case '90d': return new Date(now.setDate(now.getDate() - 90));
      case '1y': return new Date(now.setFullYear(now.getFullYear() - 1));
      default: return new Date(now.setDate(now.getDate() - 30));
    }
  }
}
