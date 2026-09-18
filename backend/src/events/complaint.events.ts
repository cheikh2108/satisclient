import { ComplaintPriority, ComplaintStatus } from '@prisma/client';

/**
 * Événement: Nouvelle réclamation créée
 */
export class ComplaintCreatedEvent {
  constructor(
    public readonly complaintId: string,
    public readonly ticketNumber: string,
    public readonly organizationId: string,
    public readonly siteId: string,
    public readonly title: string,
    public readonly priority: ComplaintPriority,
    public readonly slaDueDate: Date,
    public readonly complainantEmail?: string,
    public readonly complainantName?: string,
  ) {}
}

/**
 * Événement: Réclamation assignée à un agent
 */
export class ComplaintAssignedEvent {
  constructor(
    public readonly complaintId: string,
    public readonly ticketNumber: string,
    public readonly assignedToId: string,
    public readonly assignedToEmail: string,
    public readonly assignedToName: string,
    public readonly complainantEmail?: string,
  ) {}
}

/**
 * Événement: Statut de la réclamation changé
 */
export class ComplaintStatusChangedEvent {
  constructor(
    public readonly complaintId: string,
    public readonly ticketNumber: string,
    public readonly oldStatus: ComplaintStatus,
    public readonly newStatus: ComplaintStatus,
    public readonly comment?: string,
  ) {}
}

/**
 * Événement: Réclamation résolue
 */
export class ComplaintResolvedEvent {
  constructor(
    public readonly complaintId: string,
    public readonly ticketNumber: string,
    public readonly resolutionSummary: string,
    public readonly resolutionCategory: string,
    public readonly complainantEmail?: string,
    public readonly complainantName?: string,
  ) {}
}

/**
 * Événement: Réclamation escaladée
 */
export class ComplaintEscalatedEvent {
  constructor(
    public readonly complaintId: string,
    public readonly ticketNumber: string,
    public readonly escalatedToId: string,
    public readonly escalatedToEmail: string,
    public readonly reason: string,
    public readonly priority: ComplaintPriority,
  ) {}
}

/**
 * Événement: Commentaire ajouté
 */
export class ComplaintCommentAddedEvent {
  constructor(
    public readonly complaintId: string,
    public readonly ticketNumber: string,
    public readonly comment: string,
    public readonly isInternal: boolean,
    public readonly complainantEmail?: string,
  ) {}
}

/**
 * Événement: SLA dépassé
 */
export class ComplaintOverdueEvent {
  constructor(
    public readonly complaintId: string,
    public readonly ticketNumber: string,
    public readonly slaDueDate: Date,
    public readonly priority: ComplaintPriority,
    public readonly assignedToId?: string,
    public readonly assignedToEmail?: string,
  ) {}
}
