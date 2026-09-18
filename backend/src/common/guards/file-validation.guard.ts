import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common';

@Injectable()
export class FileValidationGuard implements CanActivate {
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
  private readonly ALLOWED_MIME_TYPES = [
    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    // Text
    'text/plain',
    'text/csv',
  ];

  // Magic numbers pour validation
  private readonly FILE_SIGNATURES: Record<string, number[][]> = {
    'image/jpeg': [[0xff, 0xd8, 0xff]],
    'image/png': [[0x89, 0x50, 0x4e, 0x47]],
    'image/gif': [[0x47, 0x49, 0x46, 0x38]],
    'application/pdf': [[0x25, 0x50, 0x44, 0x46]],
    'application/zip': [[0x50, 0x4b, 0x03, 0x04]],
  };

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const file = request.file;
    const files = request.files;

    if (!file && !files) {
      return true; // Pas de fichier, skip validation
    }

    // Valider un seul fichier
    if (file) {
      this.validateFile(file);
    }

    // Valider plusieurs fichiers
    if (files) {
      if (Array.isArray(files)) {
        files.forEach((f) => this.validateFile(f));
      } else {
        // files est un objet { fieldname: [files] }
        Object.values(files).forEach((fileArray: any) => {
          if (Array.isArray(fileArray)) {
            fileArray.forEach((f) => this.validateFile(f));
          }
        });
      }
    }

    return true;
  }

  private validateFile(file: any): void {
    // 1. Vérifier la taille
    if (file.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException(
        `Fichier trop volumineux: ${file.originalname}. Maximum: ${this.MAX_FILE_SIZE / 1024 / 1024}MB`,
      );
    }

    // 2. Vérifier le type MIME
    if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Type de fichier non autorisé: ${file.mimetype}. Types acceptés: ${this.ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }

    // 3. Vérifier le nom du fichier (caractères dangereux)
    if (this.containsDangerousCharacters(file.originalname)) {
      throw new BadRequestException(`Nom de fichier invalide: ${file.originalname}`);
    }

    // 4. Vérifier la signature du fichier (magic numbers)
    if (file.buffer) {
      const isValid = this.validateFileSignature(file.buffer, file.mimetype);
      if (!isValid) {
        throw new BadRequestException(
          `Fichier corrompu ou type falsifié: ${file.originalname}`,
        );
      }
    }
  }

  private validateFileSignature(buffer: Buffer, mimetype: string): boolean {
    const signatures = this.FILE_SIGNATURES[mimetype];
    if (!signatures) {
      // Pas de validation de signature pour ce type
      return true;
    }

    // Vérifier si au moins une signature correspond
    return signatures.some((signature) => {
      return signature.every((byte, index) => buffer[index] === byte);
    });
  }

  private containsDangerousCharacters(filename: string): boolean {
    // Caractères dangereux dans les noms de fichiers
    const dangerousPattern = /[<>:"|?*\x00-\x1f]/;
    // Path traversal
    const pathTraversalPattern = /\.\./;
    // Null bytes
    const nullBytePattern = /\0/;

    return (
      dangerousPattern.test(filename) ||
      pathTraversalPattern.test(filename) ||
      nullBytePattern.test(filename)
    );
  }
}
