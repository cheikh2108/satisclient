import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

/**
 * Pipe pour sanitiser les inputs et prévenir les attaques XSS
 */
@Injectable()
export class SanitizePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (value === null || value === undefined) {
      return value;
    }

    if (typeof value === 'string') {
      return this.sanitizeString(value);
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.transform(item, metadata));
    }

    if (typeof value === 'object') {
      // Ne pas sanitizer les objets Multer File (Buffer, fichiers uploadés)
      if (Buffer.isBuffer(value) || value?.buffer instanceof Buffer || value?.fieldname !== undefined) {
        return value;
      }
      return this.sanitizeObject(value);
    }

    return value;
  }

  private sanitizeString(str: string): string {
    // Uniquement les balises HTML qui peuvent injecter du markup
    // Les apostrophes et slashes ne sont PAS des vecteurs XSS dans du JSON
    // React échappe déjà les valeurs à l'affichage
    return str
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .trim();
  }

  private sanitizeObject(obj: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];

        if (typeof value === 'string') {
          sanitized[key] = this.sanitizeString(value);
        } else if (Array.isArray(value)) {
          sanitized[key] = value.map((item) =>
            typeof item === 'string' ? this.sanitizeString(item) : item,
          );
        } else if (typeof value === 'object' && value !== null) {
          sanitized[key] = this.sanitizeObject(value);
        } else {
          sanitized[key] = value;
        }
      }
    }

    return sanitized;
  }
}
