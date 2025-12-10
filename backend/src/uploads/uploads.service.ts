import { Injectable, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs/promises';

export interface FileValidationOptions {
  allowedMimeTypes: string[];
  maxSizeBytes: number;
}

@Injectable()
export class UploadsService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  private readonly ALLOWED_MIME_TYPES: Record<string, string[]> = {
    'application/pdf': ['.pdf'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
  };

  private readonly DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5 MB

  constructor() {
    this.ensureUploadDirectory();
  }

  private async ensureUploadDirectory(): Promise<void> {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  validateFile(
    file: Express.Multer.File,
    options?: Partial<FileValidationOptions>,
  ): void {
    const allowedMimeTypes =
      options?.allowedMimeTypes || Object.keys(this.ALLOWED_MIME_TYPES);
    const maxSize = options?.maxSizeBytes || this.DEFAULT_MAX_SIZE;

    if (file.size > maxSize) {
      throw new BadRequestException(
        `File too large. Maximum size is ${maxSize / 1024 / 1024}MB`,
      );
    }

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`,
      );
    }

    const fileExtension = path.extname(file.originalname).toLowerCase();
    const expectedExtensions: string[] | undefined =
      this.ALLOWED_MIME_TYPES[file.mimetype];

    if (!expectedExtensions || !expectedExtensions.includes(fileExtension)) {
      throw new BadRequestException(
        `File extension ${fileExtension} does not match MIME type ${file.mimetype}`,
      );
    }
  }

  generateUniqueFilename(originalFilename: string): string {
    const extension = path.extname(originalFilename);
    const uuid = uuidv4();
    return `${uuid}${extension}`;
  }

  async saveFile(file: Express.Multer.File): Promise<string> {
    this.validateFile(file);

    const uniqueFilename = this.generateUniqueFilename(file.originalname);
    const filePath = path.join(this.uploadDir, uniqueFilename);

    await fs.writeFile(filePath, file.buffer);

    return `/uploads/${uniqueFilename}`;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    if (!fileUrl || !fileUrl.startsWith('/uploads/')) {
      return;
    }

    const filename = fileUrl.replace('/uploads/', '');
    const filePath = path.join(this.uploadDir, filename);

    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.warn(`Failed to delete file ${filePath}:`, error);
    }
  }

  getPublicUrl(fileUrl: string): string | null {
    if (!fileUrl) return null;

    if (fileUrl.startsWith('http')) {
      return fileUrl;
    }

    const baseUrl = process.env.BACKEND_URL || 'http://localhost:3000';
    return `${baseUrl}${fileUrl}`;
  }
}
