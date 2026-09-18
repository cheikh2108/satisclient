import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService implements OnModuleInit {
  private readonly algorithm = 'aes-256-gcm';
  private key: Buffer;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const secret = this.configService.get<string>('ENCRYPTION_KEY');

    if (!secret) {
      console.warn(
        '⚠️  ENCRYPTION_KEY not set! Generate one with: node -e "console.log(crypto.randomBytes(32).toString(\'hex\'))"',
      );
      // Use default key for development only
      this.key = crypto.scryptSync('dev-key-change-in-production', 'salt', 32);
    } else {
      if (secret.length !== 64) {
        throw new Error('ENCRYPTION_KEY must be 64 hex characters (32 bytes)');
      }
      this.key = Buffer.from(secret, 'hex');
    }
  }

  /**
   * Chiffre une chaîne de caractères
   * @returns Format: iv:authTag:encrypted
   */
  encrypt(text: string): string {
    if (!text) return text;

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Format: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  /**
   * Déchiffre une chaîne de caractères
   */
  decrypt(encryptedText: string): string {
    if (!encryptedText) return encryptedText;

    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted text format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Hash one-way (pour anonymisation, pas de déchiffrement)
   */
  hash(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex');
  }

  /**
   * Hash avec salt (pour passwords - utiliser PasswordService à la place)
   */
  hashWithSalt(text: string, salt?: string): { hash: string; salt: string } {
    const useSalt = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(text, useSalt, 100000, 64, 'sha512').toString('hex');
    return { hash, salt: useSalt };
  }

  /**
   * Génère un token sécurisé aléatoire
   */
  generateToken(bytes: number = 32): string {
    return crypto.randomBytes(bytes).toString('hex');
  }

  /**
   * Génère un code numérique (pour OTP, verification codes)
   */
  generateNumericCode(length: number = 6): string {
    const digits = '0123456789';
    let code = '';
    const randomBytes = crypto.randomBytes(length);

    for (let i = 0; i < length; i++) {
      code += digits[randomBytes[i] % digits.length];
    }

    return code;
  }
}
