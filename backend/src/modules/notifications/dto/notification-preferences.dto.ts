import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsObject, IsOptional } from 'class-validator';

export class NotificationPreferencesDto {
  @ApiProperty({ example: true, description: 'Activer notifications email' })
  @IsBoolean()
  emailEnabled: boolean;

  @ApiProperty({ example: false, description: 'Activer notifications SMS' })
  @IsBoolean()
  smsEnabled: boolean;

  @ApiProperty({ example: true, description: 'Activer notifications in-app' })
  @IsBoolean()
  inAppEnabled: boolean;

  @ApiProperty({
    example: {
      complaints: true,
      feedback: true,
      surveys: false,
      suggestions: true,
    },
    description: 'Préférences par type d\'événement',
  })
  @IsOptional()
  @IsObject()
  eventPreferences?: Record<string, boolean>;

  @ApiProperty({
    example: { start: '09:00', end: '18:00' },
    description: 'Plage horaire notifications (quiet hours)',
  })
  @IsOptional()
  @IsObject()
  quietHours?: {
    start: string;
    end: string;
  };
}
