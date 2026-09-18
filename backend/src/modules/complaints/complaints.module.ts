import { Module } from '@nestjs/common';
import { ComplaintsService } from './complaints.service';
import { ComplaintsController } from './complaints.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { CheckOverdueJob } from './jobs/check-overdue.job';
import { SlaWarningsJob } from './jobs/sla-warnings.job';
import { StatsCacheJob } from './jobs/stats-cache.job';

@Module({
  imports: [PrismaModule],
  controllers: [ComplaintsController],
  providers: [
    ComplaintsService,
    CheckOverdueJob,
    SlaWarningsJob,
    StatsCacheJob,
  ],
  exports: [ComplaintsService],
})
export class ComplaintsModule {}
