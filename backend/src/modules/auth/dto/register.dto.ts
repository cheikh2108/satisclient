import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Adresse email valide',
  })
  @IsEmail({}, { message: 'Adresse email invalide' })
  @IsNotEmpty({ message: 'L\'email est requis' })
  @MaxLength(255)
  email: string;

  @ApiProperty({
    example: 'MyStr0ng!Pass2024',
    description: 'Mot de passe (min 12 caractères, majuscule, minuscule, chiffre, caractère spécial)',
    minLength: 12,
  })
  @IsString()
  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  @MinLength(12, { message: 'Le mot de passe doit contenir au moins 12 caractères' })
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=\[\]{}|;:,.<>~])[A-Za-z\d@$!%*?&#^()_+\-=\[\]{}|;:,.<>~]/, {
    message:
      'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial',
  })
  password: string;

  @ApiProperty({
    example: 'John',
    description: 'Prénom',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le prénom est requis' })
  @MinLength(2, { message: 'Le prénom doit contenir au moins 2 caractères' })
  @MaxLength(100)
  @Matches(/^[a-zA-ZÀ-ÿ\s'-]+$/, { message: 'Le prénom contient des caractères invalides' })
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Nom',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le nom est requis' })
  @MinLength(2, { message: 'Le nom doit contenir au moins 2 caractères' })
  @MaxLength(100)
  @Matches(/^[a-zA-ZÀ-ÿ\s'-]+$/, { message: 'Le nom contient des caractères invalides' })
  lastName: string;

  @ApiProperty({
    example: '+221771234567',
    description: 'Numéro de téléphone au format international E.164',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: 'Numéro de téléphone invalide. Format attendu: +221XXXXXXXXX',
  })
  phone?: string;

  @ApiProperty({
    example: 'uuid-de-lorganisation',
    description: 'ID de l\'organisation',
  })
  @IsUUID('4', { message: 'ID d\'organisation invalide' })
  @IsNotEmpty({ message: 'L\'ID de l\'organisation est requis' })
  organizationId: string;
}
