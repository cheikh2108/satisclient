import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateQrCodeDto } from './dto/create-qr-code.dto';
import { UpdateQrCodeDto } from './dto/update-qr-code.dto';
import { QrCodeResponseDto } from './dto/qr-code-response.dto';
import { plainToInstance } from 'class-transformer';
import * as QRCode from 'qrcode';

@Injectable()
export class QrCodesService {
  private readonly logger = new Logger(QrCodesService.name);
  private readonly frontendUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.frontendUrl =
      this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
  }

  /**
   * Créer un nouveau QR code
   */
  async create(
    createDto: CreateQrCodeDto,
    userId?: string,
  ): Promise<QrCodeResponseDto> {
    const site = await this.prisma.site.findUnique({
      where: { id: createDto.siteId },
      include: { organization: true },
    });

    if (!site) {
      throw new NotFoundException(`Site non trouvé (id: ${createDto.siteId})`);
    }

    if (site.organizationId !== createDto.organizationId) {
      throw new BadRequestException('organizationId ne correspond pas au site');
    }

    const code = await this.generateUniqueCode(
      createDto.organizationId,
      createDto.siteId,
    );

    const url = createDto.customUrl || this.generateFeedbackUrl(site.code, code);

    const qrCodeImage = await this.generateQrCodeImage(url);

    const qrCode = await this.prisma.qrCode.create({
      data: {
        organizationId: createDto.organizationId,
        siteId: createDto.siteId,
        code,
        name: createDto.name || `QR Code ${site.name}`,
        type: createDto.type || 'generic',
        description: createDto.description,
        url,
        qrCodeImage,
        isActive: true,
        createdBy: userId,
      },
      include: {
        site: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    this.logger.log({
      event: 'qr_code.created',
      qrCodeId: qrCode.id,
      code: qrCode.code,
      siteId: createDto.siteId,
    });

    return plainToInstance(QrCodeResponseDto, qrCode);
  }

  /**
   * Liste QR codes
   */
  async findAll(params?: {
    organizationId?: string;
    siteId?: string;
    isActive?: boolean;
    type?: string;
    skip?: number;
    take?: number;
    includeRelations?: boolean;
  }): Promise<QrCodeResponseDto[]> {
    const {
      organizationId,
      siteId,
      isActive,
      type,
      skip = 0,
      take = 50,
      includeRelations = false,
    } = params || {};

    const where: any = {};

    if (organizationId) where.organizationId = organizationId;
    if (siteId) where.siteId = siteId;
    if (isActive !== undefined) where.isActive = isActive;
    if (type) where.type = type;

    const qrCodes = await this.prisma.qrCode.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: includeRelations
        ? {
            site: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            organization: {
              select: {
                id: true,
                name: true,
              },
            },
            creator: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          }
        : undefined,
    });

    return qrCodes.map((qr) => plainToInstance(QrCodeResponseDto, qr));
  }

  /**
   * Récupérer par ID
   */
  async findOne(id: string): Promise<QrCodeResponseDto> {
    const qrCode = await this.prisma.qrCode.findUnique({
      where: { id },
      include: {
        site: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!qrCode) {
      throw new NotFoundException(`QR Code non trouvé (id: ${id})`);
    }

    return plainToInstance(QrCodeResponseDto, qrCode);
  }

  /**
   * Récupérer par code
   */
  async findByCode(code: string): Promise<QrCodeResponseDto> {
    const qrCode = await this.prisma.qrCode.findFirst({
      where: { code },
      include: {
        site: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!qrCode) {
      throw new NotFoundException(`QR Code non trouvé (code: ${code})`);
    }

    return plainToInstance(QrCodeResponseDto, qrCode);
  }

  /**
   * Mettre à jour
   */
  async update(id: string, updateDto: UpdateQrCodeDto): Promise<QrCodeResponseDto> {
    await this.findOne(id);

    const updated = await this.prisma.qrCode.update({
      where: { id },
      data: {
        ...updateDto,
        updatedAt: new Date(),
      },
      include: {
        site: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    this.logger.log({
      event: 'qr_code.updated',
      qrCodeId: id,
    });

    return plainToInstance(QrCodeResponseDto, updated);
  }

  /**
   * Régénérer QR code (nouveau code + image)
   */
  async regenerate(id: string): Promise<QrCodeResponseDto> {
    const qrCode = await this.findOne(id);

    const newCode = await this.generateUniqueCode(
      qrCode.organization.id,
      qrCode.site.id,
    );

    if (!qrCode.site || !qrCode.site.code) {
      throw new BadRequestException('Site invalide');
    }

    const newUrl = this.generateFeedbackUrl(qrCode.site.code, newCode);

    const newQrCodeImage = await this.generateQrCodeImage(newUrl);

    const updated = await this.prisma.qrCode.update({
      where: { id },
      data: {
        code: newCode,
        destinationUrl: newUrl,
        qrImageUrl: newQrCodeImage,
        scanCount: 0,
        lastScannedAt: null,
      },
      include: {
        site: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    this.logger.warn({
      event: 'qr_code.regenerated',
      qrCodeId: id,
      oldCode: qrCode.code,
      newCode: newCode,
    });

    return plainToInstance(QrCodeResponseDto, updated);
  }

  /**
   * Incrémenter compteur de scans
   */
  async incrementScan(code: string): Promise<void> {
    await this.prisma.qrCode.update({
      where: { code },
      data: {
        scanCount: { increment: 1 },
        lastScannedAt: new Date(),
      },
    });
  }

  /**
   * Incrémenter compteur de feedbacks
   */
  async incrementFeedback(code: string): Promise<void> {
    // TODO: Implement feedback tracking logic
    this.logger.log({ event: 'qr_code.feedback_incremented', code });
  }

  /**
   * Supprimer
   */
  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);

    await this.prisma.qrCode.delete({
      where: { id },
    });

    this.logger.warn({
      event: 'qr_code.deleted',
      qrCodeId: id,
    });

    return { message: 'QR Code supprimé avec succès' };
  }

  /**
   * Statistiques
   */
  async getStats(params: {
    organizationId?: string;
    siteId?: string;
  }): Promise<{
    totalQrCodes: number;
    activeQrCodes: number;
    totalScans: number;
    totalFeedbacks: number;
    conversionRate: number;
    byType: { type: string; count: number }[];
  }> {
    const where: any = {};
    if (params.organizationId) where.organizationId = params.organizationId;
    if (params.siteId) where.siteId = params.siteId;

    const [totalQrCodes, activeQrCodes, aggregates, byType] = await Promise.all([
      this.prisma.qrCode.count({ where }),
      this.prisma.qrCode.count({ where: { ...where, isActive: true } }),
      this.prisma.qrCode.aggregate({
        where,
        _sum: {
          scanCount: true,
        },
      }),
      this.prisma.qrCode.groupBy({
        by: ['targetType'],
        where,
        _count: true,
      }),
    ]);

    const totalScans = aggregates._sum.scanCount || 0;

    return {
      totalQrCodes,
      activeQrCodes,
      totalScans,
      totalFeedbacks: 0,
      conversionRate: 0,
      byType: byType.map((t) => ({ type: t.targetType, count: t._count })),
    };
  }

  /**
   * Générer code unique (format: QR-SITE-XXX)
   */
  private async generateUniqueCode(
    organizationId: string,
    siteId: string,
  ): Promise<string> {
    const site = await this.prisma.site.findUnique({
      where: { id: siteId },
      select: { code: true },
    });

    if (!site || !site.code) {
      throw new BadRequestException('Site ou code site invalide');
    }

    const sitePrefix = site.code.substring(0, 3).toUpperCase();

    let code = '';
    let exists = true;
    let attempts = 0;

    while (exists && attempts < 10) {
      const randomSuffix = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, '0');
      code = `QR-${sitePrefix}-${randomSuffix}`;

      const existing = await this.prisma.qrCode.findFirst({
        where: { code, organizationId },
      });

      exists = !!existing;
      attempts++;
    }

    if (exists) {
      const timestamp = Date.now().toString().slice(-6);
      code = `QR-${sitePrefix}-${timestamp}`;
    }

    return code;
  }

  /**
   * Générer URL feedback
   */
  private generateFeedbackUrl(siteCode: string, qrCode: string): string {
    return `${this.frontendUrl}/public/feedback?site=${siteCode}&qr=${qrCode}`;
  }

  /**
   * Générer image QR code (base64 PNG)
   */
  private async generateQrCodeImage(url: string): Promise<string> {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(url, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 512,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      return qrCodeDataUrl;
    } catch (error) {
      this.logger.error({
        event: 'qr_code.generation_error',
        error: error.message,
      });
      throw new BadRequestException('Erreur lors de la génération du QR code');
    }
  }
}
