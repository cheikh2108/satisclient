import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ResendEmailService {
  private readonly logger = new Logger(ResendEmailService.name);

  constructor(private readonly config: ConfigService) {}

  async sendPasswordResetEmail(to: string, firstName: string, token: string): Promise<void> {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    const from = this.config.get<string>('RESEND_FROM_EMAIL');
    const frontendUrl = this.config.get<string>('FRONTEND_URL', 'http://localhost:3000');

    if (!apiKey || !from) {
      this.logger.warn('Resend non configure: email de reinitialisation non envoye');
      return;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: 'Réinitialisation de votre mot de passe SatisClient',
        html: `<p>Bonjour ${this.escapeHtml(firstName)},</p><p>Utilisez ce lien pour réinitialiser votre mot de passe :</p><p><a href="${frontendUrl}/reset-password?token=${encodeURIComponent(token)}">Réinitialiser mon mot de passe</a></p><p>Ce lien expire dans une heure.</p>`,
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      this.logger.error(`Resend email error (${response.status}): ${details}`);
      throw new ServiceUnavailableException('Le service email est temporairement indisponible');
    }
  }

  async sendOrganizationWelcomeEmail(
    to: string,
    organizationName: string,
    passwordSetupToken: string,
  ): Promise<void> {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    const from = this.config.get<string>('RESEND_FROM_EMAIL');
    const frontendUrl = this.config.get<string>('FRONTEND_URL', 'http://localhost:3000');

    if (!apiKey || !from) {
      this.logger.warn('Resend non configure: email de bienvenue non envoye');
      return;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `Activez votre accès SatisClient - ${organizationName}`,
        html: `<p>Bonjour,</p><p>L'organisation <strong>${this.escapeHtml(organizationName)}</strong> vient d'être créée sur SatisClient.</p><p>Votre compte administrateur utilise l'adresse <strong>${this.escapeHtml(to)}</strong>.</p><p><a href="${frontendUrl}/reset-password?token=${encodeURIComponent(passwordSetupToken)}">Définir mon mot de passe et activer mon accès</a></p><p>Ce lien expire dans une heure.</p>`,
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      this.logger.error(`Resend welcome email error (${response.status}): ${details}`);
      throw new ServiceUnavailableException('Le service email est temporairement indisponible');
    }
  }

  private escapeHtml(value: string): string {
    return value.replace(
      /[&<>"']/g,
      (character) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#039;',
        })[character] || character,
    );
  }
}
