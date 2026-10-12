import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PasswordService } from '../../common/services/password.service';
import { ResendEmailService } from '../../common/services/resend-email.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PasswordService, ResendEmailService],
  exports: [UsersService],
})
export class UsersModule {}
