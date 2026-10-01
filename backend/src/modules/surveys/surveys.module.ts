import { Module } from '@nestjs/common';
import { SurveysService } from './surveys.service';
import { SurveysController } from './surveys.controller';
import { PublicSurveysController } from './public-surveys.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SurveysController, PublicSurveysController],
  providers: [SurveysService],
  exports: [SurveysService],
})
export class SurveysModule {}
