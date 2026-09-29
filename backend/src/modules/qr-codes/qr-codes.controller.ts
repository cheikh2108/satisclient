import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
  ParseBoolPipe,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { QrCodesService } from './qr-codes.service';
import { CreateQrCodeDto } from './dto/create-qr-code.dto';
import { UpdateQrCodeDto } from './dto/update-qr-code.dto';
import { QrCodeResponseDto } from './dto/qr-code-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { OrganizationGuard } from '../auth/guards/organization.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('QR Codes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, OrganizationGuard)
@Controller('qr-codes')
export class QrCodesController {
  constructor(private readonly qrCodesService: QrCodesService) {}

  @Post()
  @Roles(UserRole.super_admin, UserRole.org_admin, UserRole.quality_manager, UserRole.service_manager)
  @ApiOperation({
    summary: 'Créer un QR code',
    description: 'Génère un QR code pour un site spécifique',
  })
  @ApiResponse({
    status: 201,
    description: 'QR code créé avec succès',
    type: QrCodeResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 404, description: 'Site non trouvé' })
  async create(
    @Body() createDto: CreateQrCodeDto,
    @Request() req,
  ): Promise<QrCodeResponseDto> {
    return this.qrCodesService.create(createDto, req.user.id);
  }

  @Get()
  @Roles(
    UserRole.super_admin,
    UserRole.org_admin,
    UserRole.quality_manager,
    UserRole.service_manager,
    UserRole.agent,
  )
  @ApiOperation({
    summary: 'Liste QR codes',
    description: 'Récupère la liste des QR codes avec filtres',
  })
  @ApiQuery({
    name: 'organizationId',
    required: false,
    description: 'Filtrer par organisation',
  })
  @ApiQuery({
    name: 'siteId',
    required: false,
    description: 'Filtrer par site',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filtrer par statut actif',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Filtrer par type (kiosk, poster, ticket, etc.)',
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    description: 'Nombre de résultats à sauter',
  })
  @ApiQuery({
    name: 'take',
    required: false,
    type: Number,
    description: 'Nombre de résultats à retourner',
  })
  @ApiQuery({
    name: 'includeRelations',
    required: false,
    type: Boolean,
    description: 'Inclure site/organization/creator',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des QR codes',
    type: [QrCodeResponseDto],
  })
  async findAll(
    @Request() req,
    @Query('organizationId') organizationId?: string,
    @Query('siteId') siteId?: string,
    @Query('isActive') isActive?: string,
    @Query('type') type?: string,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
    @Query('take', new DefaultValuePipe(50), ParseIntPipe) take?: number,
    @Query('includeRelations', new DefaultValuePipe(false), ParseBoolPipe)
    includeRelations?: boolean,
  ): Promise<QrCodeResponseDto[]> {
    const orgId = organizationId || req.user?.organizationId;
    return this.qrCodesService.findAll({
      organizationId: orgId,
      siteId,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      type,
      skip,
      take,
      includeRelations,
    });
  }

  @Get('stats')
  @Roles(
    UserRole.super_admin,
    UserRole.org_admin,
    UserRole.quality_manager,
    UserRole.service_manager,
    UserRole.agent,
  )
  @ApiOperation({
    summary: 'Statistiques QR codes',
    description: 'Récupère les statistiques globales des QR codes',
  })
  @ApiQuery({
    name: 'organizationId',
    required: false,
    description: 'Filtrer par organisation',
  })
  @ApiQuery({
    name: 'siteId',
    required: false,
    description: 'Filtrer par site',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistiques',
    schema: {
      type: 'object',
      properties: {
        totalQrCodes: { type: 'number', example: 45 },
        activeQrCodes: { type: 'number', example: 42 },
        totalScans: { type: 'number', example: 1250 },
        totalFeedbacks: { type: 'number', example: 523 },
        conversionRate: { type: 'number', example: 41.84 },
        byType: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string', example: 'kiosk' },
              count: { type: 'number', example: 12 },
            },
          },
        },
      },
    },
  })
  async getStats(
    @Request() req,
    @Query('organizationId') organizationId?: string,
    @Query('siteId') siteId?: string,
  ) {
    const orgId = organizationId || req.user?.organizationId;
    return this.qrCodesService.getStats({ organizationId: orgId, siteId });
  }

  @Get('code/:code')
  @Roles(
    UserRole.super_admin,
    UserRole.org_admin,
    UserRole.quality_manager,
    UserRole.service_manager,
    UserRole.agent,
  )
  @ApiOperation({
    summary: 'Récupérer par code',
    description: 'Récupère un QR code par son code unique',
  })
  @ApiParam({ name: 'code', description: 'Code unique (ex: QR-AGE-001)' })
  @ApiResponse({
    status: 200,
    description: 'QR code trouvé',
    type: QrCodeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'QR code non trouvé' })
  async findByCode(@Param('code') code: string): Promise<QrCodeResponseDto> {
    return this.qrCodesService.findByCode(code);
  }

  @Get(':id')
  @Roles(
    UserRole.super_admin,
    UserRole.org_admin,
    UserRole.quality_manager,
    UserRole.service_manager,
    UserRole.agent,
  )
  @ApiOperation({
    summary: 'Récupérer par ID',
    description: 'Récupère un QR code par son ID',
  })
  @ApiParam({ name: 'id', description: 'ID du QR code' })
  @ApiResponse({
    status: 200,
    description: 'QR code trouvé',
    type: QrCodeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'QR code non trouvé' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<QrCodeResponseDto> {
    return this.qrCodesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.super_admin, UserRole.org_admin, UserRole.quality_manager, UserRole.service_manager)
  @ApiOperation({
    summary: 'Mettre à jour',
    description: 'Met à jour un QR code',
  })
  @ApiParam({ name: 'id', description: 'ID du QR code' })
  @ApiResponse({
    status: 200,
    description: 'QR code mis à jour',
    type: QrCodeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'QR code non trouvé' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateQrCodeDto,
  ): Promise<QrCodeResponseDto> {
    return this.qrCodesService.update(id, updateDto);
  }

  @Post(':id/regenerate')
  @Roles(UserRole.super_admin, UserRole.org_admin, UserRole.quality_manager, UserRole.service_manager)
  @ApiOperation({
    summary: 'Régénérer QR code',
    description:
      'Génère un nouveau code et une nouvelle image (utile si compromis). Reset les compteurs.',
  })
  @ApiParam({ name: 'id', description: 'ID du QR code' })
  @ApiResponse({
    status: 200,
    description: 'QR code régénéré',
    type: QrCodeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'QR code non trouvé' })
  async regenerate(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<QrCodeResponseDto> {
    return this.qrCodesService.regenerate(id);
  }

  @Post(':code/scan')
  @ApiOperation({
    summary: 'Incrémenter scan',
    description:
      'Route publique pour incrémenter le compteur de scans (appelée par frontend)',
  })
  @ApiParam({ name: 'code', description: 'Code du QR' })
  @ApiResponse({ status: 200, description: 'Scan enregistré' })
  async incrementScan(@Param('code') code: string) {
    await this.qrCodesService.incrementScan(code);
    return { message: 'Scan enregistré' };
  }

  @Delete(':id')
  @Roles(UserRole.super_admin, UserRole.org_admin)
  @ApiOperation({
    summary: 'Supprimer QR code',
    description: 'Supprime un QR code (admin/super_admin uniquement)',
  })
  @ApiParam({ name: 'id', description: 'ID du QR code' })
  @ApiResponse({ status: 200, description: 'QR code supprimé' })
  @ApiResponse({ status: 404, description: 'QR code non trouvé' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.qrCodesService.remove(id);
  }
}
