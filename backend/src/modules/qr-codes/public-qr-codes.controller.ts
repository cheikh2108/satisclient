import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { QrCodesService } from './qr-codes.service';

/**
 * Routes publiques (sans JWT) pour le parcours scan QR → formulaire feedback.
 */
@ApiTags('Public')
@Controller('public')
export class PublicQrCodesController {
  constructor(private readonly qrCodesService: QrCodesService) {}

  @Get('feedback-context')
  @ApiOperation({
    summary: 'Contexte public du formulaire feedback',
    description:
      'Résout un établissement (et optionnellement un QR) pour afficher le formulaire public. ' +
      'Incrémente le compteur de scans si un code QR est fourni.',
  })
  @ApiQuery({ name: 'site', required: true, description: 'Code ou ID de l\'établissement' })
  @ApiQuery({ name: 'qr', required: false, description: 'Code QR scanné' })
  @ApiResponse({ status: 200, description: 'Contexte prêt pour le formulaire' })
  @ApiResponse({ status: 400, description: 'QR/établissement invalide ou désactivé' })
  @ApiResponse({ status: 404, description: 'Établissement ou QR introuvable' })
  async getFeedbackContext(
    @Query('site') site: string,
    @Query('qr') qr?: string,
  ) {
    return this.qrCodesService.resolvePublicContext(site, qr);
  }
}
