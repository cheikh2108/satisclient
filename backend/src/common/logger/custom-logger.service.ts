import { Injectable, LoggerService, Scope } from '@nestjs/common';

/**
 * CustomLogger - Structured JSON Logging
 *
 * Produit des logs JSON parsables pour Datadog/ELK/Loki.
 *
 * Format:
 * {
 *   "level": "info|error|warn|debug|verbose",
 *   "timestamp": "2026-09-18T14:30:00.000Z",
 *   "event": "feedback.created",
 *   "feedbackId": "uuid...",
 *   "organizationId": "uuid...",
 *   ...
 * }
 *
 * Usage:
 * this.logger.log('feedback.created', {
 *   feedbackId: feedback.id,
 *   organizationId: feedback.organizationId,
 *   sentiment: feedback.sentiment,
 * });
 */
@Injectable({ scope: Scope.TRANSIENT })
export class CustomLogger implements LoggerService {
  private context?: string;

  setContext(context: string) {
    this.context = context;
  }

  /**
   * Log niveau INFO
   * @param event - Nom de l'événement (ex: "feedback.created")
   * @param context - Contexte additionnel (objet ou string)
   */
  log(event: string, context?: any) {
    this.writeLog('info', event, context);
  }

  /**
   * Log niveau ERROR
   * @param event - Nom de l'événement
   * @param trace - Stack trace (optionnel)
   * @param context - Contexte additionnel
   */
  error(event: string, trace?: string, context?: any) {
    // Si trace est un objet, c'est le context
    if (typeof trace === 'object' && trace !== null) {
      this.writeLog('error', event, trace);
    } else {
      this.writeLog('error', event, { ...context, trace });
    }
  }

  /**
   * Log niveau WARN
   */
  warn(event: string, context?: any) {
    this.writeLog('warn', event, context);
  }

  /**
   * Log niveau DEBUG
   */
  debug(event: string, context?: any) {
    this.writeLog('debug', event, context);
  }

  /**
   * Log niveau VERBOSE
   */
  verbose(event: string, context?: any) {
    this.writeLog('verbose', event, context);
  }

  /**
   * Écriture du log JSON structuré
   */
  private writeLog(level: string, event: string, context?: any) {
    const logObject: any = {
      level,
      timestamp: new Date().toISOString(),
      event,
    };

    // Ajouter le contexte si c'est un string (nom du service)
    if (this.context) {
      logObject.context = this.context;
    }

    // Ajouter les données contextuelles
    if (context) {
      if (typeof context === 'string') {
        logObject.message = context;
      } else if (typeof context === 'object') {
        Object.assign(logObject, context);
      }
    }

    // Output selon le niveau
    const output = JSON.stringify(logObject);

    switch (level) {
      case 'error':
        console.error(output);
        break;
      case 'warn':
        console.warn(output);
        break;
      case 'debug':
        console.debug(output);
        break;
      case 'verbose':
        console.log(output);
        break;
      default:
        console.log(output);
    }
  }
}
