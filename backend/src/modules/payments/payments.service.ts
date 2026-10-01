import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentStatus, SubscriptionPlan } from '@prisma/client';
import { createHmac, timingSafeEqual } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CAMPAIGN_PACKAGE_CODES,
  CreateCampaignCheckoutDto,
} from './dto/create-campaign-checkout.dto';

const PLAN_PRICES: Record<string, number> = {
  essentialiel: 25000,
  pro: 60000,
  business: 125000,
};

const CAMPAIGN_PACKAGES: Record<
  string,
  { amount: number; count: number; days: number; label: string }
> = {
  single: { amount: 75000, count: 1, days: 30, label: 'Campagne ponctuelle' },
  frequency2: { amount: 130000, count: 2, days: 365, label: 'Fréquence 2' },
  frequency3: { amount: 180000, count: 3, days: 365, label: 'Fréquence 3' },
  frequency4: { amount: 220000, count: 4, days: 365, label: 'Fréquence 4' },
};

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async createCheckout(organizationId: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });
    if (!organization || organization.isPlatform) {
      throw new BadRequestException('Organisation non éligible au paiement');
    }

    const amount = PLAN_PRICES[organization.subscriptionPlan];
    if (!amount) {
      throw new BadRequestException('Le plan Institution nécessite une facturation personnalisée');
    }

    const apiKey = this.config.get<string>('DEXPAY_API_KEY');
    if (!apiKey) throw new BadRequestException('DEXPAY_API_KEY non configurée');

    const reference = `SAT-${organization.id.slice(0, 8)}-${Date.now()}`;
    const backendUrl = this.config.get<string>('BACKEND_URL', 'http://localhost:3001');
    const frontendUrl = this.config.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const response = await fetch(`${this.baseUrl()}/checkout-sessions`, {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reference,
        item_name: `Abonnement SatisClient ${organization.subscriptionPlan}`,
        amount,
        currency: 'XOF',
        countryISO: 'SN',
        webhook_url: `${backendUrl}/api/billing/dexpay/webhook`,
        success_url: `${frontendUrl}/dashboard/settings?payment=success`,
        failure_url: `${frontendUrl}/dashboard/settings?payment=failure`,
        metadata: { organizationId, plan: organization.subscriptionPlan },
      }),
    });

    const result = await response.json();
    if (!response.ok || !result?.data?.payment_url) {
      this.logger.error(`DexPay checkout error: ${JSON.stringify(result)}`);
      throw new BadRequestException('Impossible de créer la session de paiement');
    }

    const payment = await this.prisma.payment.create({
      data: {
        organizationId,
        provider: 'dexpay',
        reference,
        status: PaymentStatus.pending,
        amount,
        currency: 'XOF',
        plan: organization.subscriptionPlan,
        checkoutUrl: result.data.payment_url,
        metadata: result.data,
      },
    });

    return {
      paymentId: payment.id,
      reference,
      paymentUrl: payment.checkoutUrl,
      amount,
      currency: 'XOF',
    };
  }

  async createCampaignCheckout(organizationId: string, dto: CreateCampaignCheckoutDto) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });
    if (!organization || organization.isPlatform) {
      throw new BadRequestException('Organisation non éligible au paiement');
    }

    const campaignPackage = CAMPAIGN_PACKAGES[dto.packageCode];
    if (!campaignPackage || !CAMPAIGN_PACKAGE_CODES.includes(dto.packageCode)) {
      throw new BadRequestException('Pack campagne invalide');
    }

    const apiKey = this.config.get<string>('DEXPAY_API_KEY');
    if (!apiKey) throw new BadRequestException('DEXPAY_API_KEY non configurée');

    const reference = `SAT-CAMP-${organization.id.slice(0, 8)}-${Date.now()}`;
    const backendUrl = this.config.get<string>('BACKEND_URL', 'http://localhost:3001');
    const frontendUrl = this.config.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const response = await fetch(`${this.baseUrl()}/checkout-sessions`, {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reference,
        item_name: `SatisClient ${campaignPackage.label}`,
        amount: campaignPackage.amount,
        currency: 'XOF',
        countryISO: 'SN',
        webhook_url: `${backendUrl}/api/billing/dexpay/webhook`,
        success_url: `${frontendUrl}/dashboard/settings?payment=success&product=campaign`,
        failure_url: `${frontendUrl}/dashboard/settings?payment=failure&product=campaign`,
        metadata: { organizationId, productType: 'campaign', packageCode: dto.packageCode },
      }),
    });

    const result = await response.json();
    if (!response.ok || !result?.data?.payment_url) {
      this.logger.error(`DexPay campaign checkout error: ${JSON.stringify(result)}`);
      throw new BadRequestException('Impossible de créer la session de paiement campagne');
    }

    const payment = await this.prisma.payment.create({
      data: {
        organizationId,
        provider: 'dexpay',
        reference,
        status: PaymentStatus.pending,
        amount: campaignPackage.amount,
        currency: 'XOF',
        plan: organization.subscriptionPlan,
        productType: 'campaign',
        campaignPackage: dto.packageCode,
        campaignCount: campaignPackage.count,
        checkoutUrl: result.data.payment_url,
        metadata: result.data,
      },
    });

    return {
      paymentId: payment.id,
      reference,
      paymentUrl: payment.checkoutUrl,
      amount: campaignPackage.amount,
      currency: 'XOF',
      campaigns: campaignPackage.count,
    };
  }

  verifyWebhook(rawBody: string, signature: string | undefined): boolean {
    const secret = this.config.get<string>('DEXPAY_API_SECRET');
    if (!secret || !signature) return false;
    const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
    const received = Buffer.from(signature, 'utf8');
    const expectedBuffer = Buffer.from(expected, 'utf8');
    return received.length === expectedBuffer.length && timingSafeEqual(received, expectedBuffer);
  }

  async processWebhook(rawBody: string, signature: string | undefined) {
    if (!this.verifyWebhook(rawBody, signature)) {
      throw new UnauthorizedException('Signature DexPay invalide');
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.event || 'unknown';
    const data = payload.data || payload;
    const reference = data.reference;
    const eventKey = `${eventType}:${reference || data.transaction_id || data.checkout_session_id || rawBody}`;

    try {
      await this.prisma.paymentWebhookEvent.create({
        data: { provider: 'dexpay', eventKey, eventType, payload },
      });
    } catch (error: any) {
      if (error?.code === 'P2002') return { received: true, duplicate: true };
      throw error;
    }

    const payment = reference
      ? await this.prisma.payment.findUnique({ where: { reference } })
      : null;

    if (payment && eventType === 'checkout.completed') {
      const endsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const operations: any[] = [
        this.prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.succeeded,
            providerTransactionId: data.transaction_id || null,
            paidAt: new Date(),
          },
        }),
      ];

      if (payment.productType === 'campaign') {
        const packageConfig = payment.campaignPackage
          ? CAMPAIGN_PACKAGES[payment.campaignPackage]
          : null;
        if (!packageConfig) throw new BadRequestException('Pack campagne introuvable');
        const campaignExpiresAt = new Date(Date.now() + packageConfig.days * 24 * 60 * 60 * 1000);
        operations.push(
          this.prisma.campaignPack.create({
            data: {
              organizationId: payment.organizationId,
              paymentId: payment.id,
              packageCode: payment.campaignPackage!,
              totalCampaigns: packageConfig.count,
              remaining: packageConfig.count,
              expiresAt: campaignExpiresAt,
            },
          }),
        );
      } else {
        operations.push(
          this.prisma.organization.update({
            where: { id: payment.organizationId },
            data: {
              subscriptionStatus: 'active',
              subscriptionStartsAt: new Date(),
              subscriptionEndsAt: endsAt,
            },
          }),
        );
      }

      operations.push(
        this.prisma.paymentWebhookEvent.update({
          where: { eventKey },
          data: { processedAt: new Date() },
        }),
      );
      await this.prisma.$transaction(operations);
    } else if (payment && ['checkout.failed', 'checkout.cancelled'].includes(eventType)) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: eventType === 'checkout.failed' ? PaymentStatus.failed : PaymentStatus.cancelled,
        },
      });
      await this.prisma.paymentWebhookEvent.update({
        where: { eventKey },
        data: { processedAt: new Date() },
      });
    } else {
      await this.prisma.paymentWebhookEvent.update({
        where: { eventKey },
        data: { processedAt: new Date() },
      });
    }

    return { received: true };
  }

  private baseUrl(): string {
    return this.config.get<string>('DEXPAY_SANDBOX', 'true') === 'true'
      ? 'https://api-sandbox.dexpay.africa/api/v1'
      : 'https://api.dexpay.africa/api/v1';
  }
}
