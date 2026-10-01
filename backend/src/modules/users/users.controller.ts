import {
  Controller,
  Get,
  Patch,
  Delete,
  Post,
  Body,
  UseGuards,
  Query,
  Param,
  DefaultValuePipe,
  ParseIntPipe,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser() user: JwtUser) {
    return this.usersService.findById(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Mettre à jour le profil' })
  async updateProfile(
    @CurrentUser() user: JwtUser,
    @Body() body: { firstName?: string; lastName?: string; phone?: string; bio?: string },
  ) {
    return this.usersService.updateProfile(user.id, body);
  }

  @Post('me/password')
  async changePassword(
    @CurrentUser() user: JwtUser,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    return this.usersService.changePassword(user.id, body.currentPassword, body.newPassword);
  }

  @Patch('me/preferences')
  @ApiOperation({ summary: 'Mettre à jour les préférences utilisateur' })
  async updatePreferences(@CurrentUser() user: JwtUser, @Body() body: Record<string, unknown>) {
    return this.usersService.updatePreferences(user.id, body);
  }

  @Get('me/sessions')
  @ApiOperation({ summary: 'Sessions actives' })
  async getSessions(@CurrentUser() user: JwtUser) {
    return this.usersService.getSessions(user.id);
  }

  @Delete('me/sessions/:tokenId')
  @ApiOperation({ summary: 'Révoquer une session' })
  async revokeSession(@CurrentUser() user: JwtUser, @Param('tokenId') tokenId: string) {
    return this.usersService.revokeSession(user.id, tokenId);
  }

  @Get('platform-stats')
  @ApiOperation({ summary: 'Stats globales plateforme (super_admin uniquement)' })
  async getPlatformStats(@CurrentUser() user: JwtUser) {
    if (user.role !== 'super_admin') {
      throw new ForbiddenException('Accès refusé');
    }
    return this.usersService.getPlatformStats();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Statistiques utilisateurs' })
  async getStats(@CurrentUser() user: JwtUser) {
    if (user.role === 'super_admin') {
      return this.usersService.getPlatformAdminStats();
    }
    return this.usersService.getStats(user.organizationId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users in organization' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'role', required: false, type: String })
  async findAll(
    @CurrentUser() user: JwtUser,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
    @Query('take', new DefaultValuePipe(50), ParseIntPipe) take?: number,
    @Query('role') role?: string,
  ) {
    if (user.role === 'super_admin') {
      return this.usersService.findPlatformAdmins({ skip, take });
    }
    return this.usersService.findAll(user.organizationId, { skip, take, role });
  }
}
