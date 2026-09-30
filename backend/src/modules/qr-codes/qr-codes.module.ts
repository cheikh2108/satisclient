import { Module } from '@nestjs/common';
import { QrCodesService } from './qr-codes.service';
import { QrCodesController } from './qr-codes.controller';
import { PublicQrCodesController } from './public-qr-codes.controller';
import { QrCodeListener } from './listeners/qr-code.listener';
import { PrismaModule } from '../../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [QrCodesController, PublicQrCodesController],
  providers: [QrCodesService, QrCodeListener],
  exports: [QrCodesService],
})
export class QrCodesModule {}
