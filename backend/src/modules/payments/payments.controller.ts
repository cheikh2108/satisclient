import { Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { PaymentsService } from './payments.service';
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Billing')
@Controller('billing')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('checkout')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.org_admin)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Créer une session de paiement mensuel DexPay' })
  createCheckout(@CurrentUser() user: JwtUser) {
    return this.paymentsService.createCheckout(user.organizationId);
  }

  @Post('dexpay/webhook')
  @ApiOperation({ summary: 'Webhook DexPay signé HMAC-SHA256' })
  async webhook(@Req() req: Request & { rawBody?: Buffer }, @Res() res: Response) {
    const rawBody = req.rawBody?.toString('utf8');
    if (!rawBody) return res.status(400).json({ error: 'Body brut manquant' });

    try {
      const result = await this.paymentsService.processWebhook(
        rawBody,
        req.headers['x-webhook-signature'] as string | undefined,
      );
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(error?.status || 401).json({ error: error?.message || 'Webhook invalide' });
    }
  }
}
