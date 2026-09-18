import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ComplaintCreatedEvent,
  ComplaintAssignedEvent,
  ComplaintResolvedEvent,
  ComplaintEscalatedEvent,
  ComplaintCommentAddedEvent,
  ComplaintOverdueEvent,
} from '../../../events/complaint.events';

/**
 * Listener pour les événements Complaints
 *
 * Gère l'envoi de notifications (Email, SMS, In-App) suite aux événements
 * du cycle de vie des réclamations.
 *
 * TODO Phase 2.1: Implémenter EmailService pour l'envoi réel
 */
@Injectable()
export class ComplaintListener {
  private readonly logger = new Logger(ComplaintListener.name);

  /**
   * Réclamation créée → Email au client
   */
  @OnEvent('complaint.created', { async: true })
  async handleComplaintCreated(event: ComplaintCreatedEvent) {
    this.logger.log({
      event: 'notification.complaint.created',
      complaintId: event.complaintId,
      ticketNumber: event.ticketNumber,
      to: event.complainantEmail,
    });

    // TODO: Implémenter envoi email
    // await this.emailService.send({
    //   to: event.complainantEmail,
    //   subject: `Réclamation ${event.ticketNumber} créée`,
    //   template: 'complaint-created',
    //   data: {
    //     ticketNumber: event.ticketNumber,
    //     title: event.title,
    //     priority: event.priority,
    //     slaDueDate: event.slaDueDate,
    //     complainantName: event.complainantName,
    //   },
    // });

    console.log(`📧 [SIMULATION] Email envoyé à ${event.complainantEmail}`);
    console.log(`   Sujet: Réclamation ${event.ticketNumber} créée`);
    console.log(`   Priorité: ${event.priority}`);
    console.log(`   SLA: ${event.slaDueDate.toLocaleString()}`);
  }

  /**
   * Réclamation assignée → Email à l'agent
   */
  @OnEvent('complaint.assigned', { async: true })
  async handleComplaintAssigned(event: ComplaintAssignedEvent) {
    this.logger.log({
      event: 'notification.complaint.assigned',
      complaintId: event.complaintId,
      ticketNumber: event.ticketNumber,
      assignedTo: event.assignedToId,
    });

    // TODO: Implémenter envoi email
    console.log(`📧 [SIMULATION] Email envoyé à ${event.assignedToEmail}`);
    console.log(`   Sujet: Réclamation ${event.ticketNumber} vous a été assignée`);
    console.log(`   Agent: ${event.assignedToName}`);
  }

  /**
   * Réclamation résolue → Email au client
   */
  @OnEvent('complaint.resolved', { async: true })
  async handleComplaintResolved(event: ComplaintResolvedEvent) {
    this.logger.log({
      event: 'notification.complaint.resolved',
      complaintId: event.complaintId,
      ticketNumber: event.ticketNumber,
      category: event.resolutionCategory,
    });

    // TODO: Implémenter envoi email
    console.log(`📧 [SIMULATION] Email envoyé à ${event.complainantEmail}`);
    console.log(`   Sujet: Réclamation ${event.ticketNumber} résolue`);
    console.log(`   Catégorie: ${event.resolutionCategory}`);
    console.log(`   Résumé: ${event.resolutionSummary.substring(0, 100)}...`);
  }

  /**
   * Réclamation escaladée → Email au superviseur
   */
  @OnEvent('complaint.escalated', { async: true })
  async handleComplaintEscalated(event: ComplaintEscalatedEvent) {
    this.logger.warn({
      event: 'notification.complaint.escalated',
      complaintId: event.complaintId,
      ticketNumber: event.ticketNumber,
      escalatedTo: event.escalatedToId,
      priority: event.priority,
    });

    // TODO: Implémenter envoi email + SMS si critique
    console.log(`🚨 [SIMULATION] Email URGENT envoyé à ${event.escalatedToEmail}`);
    console.log(`   Sujet: ESCALADE - Réclamation ${event.ticketNumber}`);
    console.log(`   Raison: ${event.reason}`);
    console.log(`   Priorité: ${event.priority}`);
  }

  /**
   * Commentaire ajouté → Email au client (si public)
   */
  @OnEvent('complaint.comment.added', { async: true })
  async handleComplaintCommentAdded(event: ComplaintCommentAddedEvent) {
    // Ne notifier que les commentaires publics
    if (event.isInternal) {
      this.logger.debug({
        event: 'notification.complaint.comment.internal',
        complaintId: event.complaintId,
      });
      return;
    }

    this.logger.log({
      event: 'notification.complaint.comment.added',
      complaintId: event.complaintId,
      ticketNumber: event.ticketNumber,
    });

    // TODO: Implémenter envoi email
    console.log(`📧 [SIMULATION] Email envoyé à ${event.complainantEmail}`);
    console.log(`   Sujet: Nouveau commentaire sur ${event.ticketNumber}`);
    console.log(`   Commentaire: ${event.comment.substring(0, 100)}...`);
  }

  /**
   * SLA dépassé → Email + SMS à l'agent + superviseur
   */
  @OnEvent('complaint.overdue', { async: true })
  async handleComplaintOverdue(event: ComplaintOverdueEvent) {
    this.logger.error({
      event: 'notification.complaint.overdue',
      complaintId: event.complaintId,
      ticketNumber: event.ticketNumber,
      priority: event.priority,
      slaDueDate: event.slaDueDate,
    });

    // TODO: Implémenter envoi email + SMS
    console.log(`⚠️ [SIMULATION] ALERTE SLA - ${event.ticketNumber}`);
    console.log(`   SLA dépassé depuis: ${event.slaDueDate.toLocaleString()}`);
    console.log(`   Priorité: ${event.priority}`);
    if (event.assignedToEmail) {
      console.log(`   Email envoyé à: ${event.assignedToEmail}`);
    }
  }
}
