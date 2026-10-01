import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { Multer } from 'multer';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  private readonly uploadDir: string;
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
  ];

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.uploadDir = path.join(process.cwd(), '../uploads');
    this.ensureUploadDir();
  }

  private ensureUploadDir(): void {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(
    file: Multer.File,
    userId: string,
    organizationId: string,
    metadata?: { name?: string; category?: string },
  ): Promise<any> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException('File too large (max 10MB)');
    }

    this.logger.log(
      `Upload reçu: mimetype=${file.mimetype}, size=${file.size}, name=${file.originalname}`,
    );
    // Validation par extension (plus fiable que le mimetype sur tous les navigateurs)
    const ext = (file.originalname?.split('.').pop() || '').toLowerCase();
    const allowedExts = [
      'pdf',
      'doc',
      'docx',
      'xls',
      'xlsx',
      'jpg',
      'jpeg',
      'png',
      'gif',
      'webp',
      'txt',
      'csv',
    ];
    const mimeOk = this.allowedMimeTypes.includes(file.mimetype);
    const extOk = allowedExts.includes(ext);
    if (!mimeOk && !extOk) {
      throw new BadRequestException(`Type de fichier non autorisé: ${file.mimetype} (.${ext})`);
    }

    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const uploadPath = path.join(this.uploadDir, String(year), month);

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    const fileExt = path.extname(file.originalname);
    const filename = `${uuidv4()}${fileExt}`;
    const filepath = path.join(uploadPath, filename);

    fs.writeFileSync(filepath, file.buffer);

    const relativePath = `/${year}/${month}/${filename}`;
    const url = `${this.configService.get('BACKEND_URL') || 'http://localhost:3001'}/uploads${relativePath}`;

    let storedFile;
    try {
      storedFile = await this.prisma.storedFile.create({
        data: {
          organizationId,
          uploadedBy: userId,
          filename,
          originalName: file.originalname,
          displayName: metadata?.name?.trim() || null,
          category: metadata?.category || null,
          mimetype: file.mimetype,
          size: file.size,
          path: relativePath,
          url,
        },
      });
    } catch (error) {
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
      throw error;
    }

    this.logger.log({
      event: 'file.uploaded',
      filename,
      size: file.size,
      mimetype: file.mimetype,
      userId,
    });

    return {
      id: storedFile.id,
      filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: relativePath,
      url,
      uploadedBy: userId,
      createdAt: storedFile.createdAt,
      category: storedFile.category,
      displayName: storedFile.displayName,
    };
  }

  async findAll(organizationId: string): Promise<any[]> {
    return this.prisma.storedFile.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteFile(id: string, organizationId: string): Promise<void> {
    const storedFile = await this.prisma.storedFile.findFirst({
      where: { id, organizationId },
    });
    if (!storedFile) return;

    const fullPath = path.resolve(this.uploadDir, storedFile.path.replace(/^[/\\]+/, ''));
    const relative = path.relative(path.resolve(this.uploadDir), fullPath);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      throw new Error('Chemin invalide');
    }
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
    await this.prisma.storedFile.delete({ where: { id: storedFile.id } });
    this.logger.log({ event: 'file.deleted', fileId: id });
  }
}
