import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

interface PasswordValidationResult {
  valid: boolean;
  score: number;
  feedback: string[];
}

@Injectable()
export class PasswordService {
  private readonly SALT_ROUNDS = 12;
  private readonly MIN_LENGTH = 12;

  /**
   * Hash un mot de passe avec bcrypt
   */
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Vérifie un mot de passe contre son hash
   */
  async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Valide la force d'un mot de passe
   */
  validateStrength(password: string): PasswordValidationResult {
    const feedback: string[] = [];
    let score = 0;

    // Longueur minimum
    if (password.length < this.MIN_LENGTH) {
      feedback.push(`Le mot de passe doit contenir au moins ${this.MIN_LENGTH} caractères`);
      return { valid: false, score: 0, feedback };
    }
    score += 1;

    // Contient une minuscule
    if (!/[a-z]/.test(password)) {
      feedback.push('Le mot de passe doit contenir au moins une minuscule');
    } else {
      score += 1;
    }

    // Contient une majuscule
    if (!/[A-Z]/.test(password)) {
      feedback.push('Le mot de passe doit contenir au moins une majuscule');
    } else {
      score += 1;
    }

    // Contient un chiffre
    if (!/\d/.test(password)) {
      feedback.push('Le mot de passe doit contenir au moins un chiffre');
    } else {
      score += 1;
    }

    // Contient un caractère spécial
    if (!/[@$!%*?&#^()_+\-=\[\]{}|;:,.<>~]/.test(password)) {
      feedback.push('Le mot de passe doit contenir au moins un caractère spécial');
    } else {
      score += 1;
    }

    // Vérifier mots de passe communs
    if (this.isCommonPassword(password)) {
      feedback.push('Ce mot de passe est trop commun');
      return { valid: false, score: Math.max(0, score - 2), feedback };
    }

    const valid = feedback.length === 0 && score >= 4;

    return { valid, score, feedback };
  }

  /**
   * Vérifie si le mot de passe est dans la liste des mots de passe communs
   */
  private isCommonPassword(password: string): boolean {
    const commonPasswords = [
      'password', 'password123', '123456', '12345678', 'qwerty',
      'abc123', 'monkey', '1234567', 'letmein', 'trustno1',
      'dragon', 'baseball', 'iloveyou', 'master', 'sunshine',
      'ashley', 'bailey', 'passw0rd', 'shadow', '123123',
      '654321', 'superman', 'qazwsx', 'michael', 'football',
    ];

    return commonPasswords.includes(password.toLowerCase());
  }

  /**
   * Génère un mot de passe aléatoire sécurisé
   */
  generateSecure(length: number = 16): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const special = '@$!%*?&#^()_+-=[]{}|;:,.<>~';
    const all = lowercase + uppercase + numbers + special;

    let password = '';

    // Garantir au moins un de chaque type
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];

    // Remplir le reste
    for (let i = password.length; i < length; i++) {
      password += all[Math.floor(Math.random() * all.length)];
    }

    // Mélanger
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
}
