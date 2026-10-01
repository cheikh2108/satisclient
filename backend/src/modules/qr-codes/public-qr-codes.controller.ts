import { Controller, Get, Post, Query, Body } from '@nestjs/common';
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
      'Le compteur est enregistré séparément par POST /public/scan.',
  })
  @ApiQuery({ name: 'site', required: true, description: "Code ou ID de l'établissement" })
  @ApiQuery({ name: 'qr', required: false, description: 'Code QR scanné' })
  @ApiResponse({ status: 200, description: 'Contexte prêt pour le formulaire' })
  @ApiResponse({ status: 400, description: 'QR/établissement invalide ou désactivé' })
  @ApiResponse({ status: 404, description: 'Établissement ou QR introuvable' })
  async getFeedbackContext(@Query('site') site: string, @Query('qr') qr?: string) {
    return this.qrCodesService.resolvePublicContext(site, qr);
  }

  @Post('scan')
  @ApiOperation({ summary: 'Enregistrer un scan QR public' })
  @ApiResponse({ status: 200, description: 'Scan enregistré' })
  async registerScan(@Body() body: { qr?: string }) {
    if (body?.qr) await this.qrCodesService.incrementScan(body.qr);
    return { message: 'Scan enregistré' };
  }
}
