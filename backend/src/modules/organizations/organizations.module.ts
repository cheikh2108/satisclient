import { Module } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { ResendEmailService } from '../../common/services/resend-email.service';
import { PasswordService } from '../../common/services/password.service';

@Module({
  imports: [PrismaModule],
  controllers: [OrganizationsController],
  providers: [OrganizationsService, ResendEmailService, PasswordService],
  exports: [OrganizationsService], // Exporter pour utilisation dans d'autres modules
})
export class OrganizationsModule {}
