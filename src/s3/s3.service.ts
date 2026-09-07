import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  DeleteObjectCommand,
  ObjectCannedACL,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Readable } from 'stream';
import { extname, join } from 'path';
import { writeFileSync, mkdirSync, existsSync, unlinkSync } from 'fs';
import { randomBytes } from 'crypto';

@Injectable()
export class S3Service {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly region: string;

  constructor(private readonly configService: ConfigService) {
    this.region = this.configService.get<string>('s3.region') ?? 'us-east-1';
    this.bucket = this.configService.get<string>('s3.bucket') ?? '';

    this.client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get<string>('s3.accessKeyId') ?? '',
        secretAccessKey: this.configService.get<string>('s3.secretAccessKey') ?? '',
      },
    });
  }

  /**
   * Upload a single file buffer to S3 or fall back to local disk storage if S3 is not configured.
   */
  async uploadBuffer(
    buffer: Buffer,
    folder: string,
    originalName: string,
    mimeType: string,
  ): Promise<string> {
    const ext = extname(originalName) || '.jpg';
    const filename = `image-${Date.now()}-${randomBytes(4).toString('hex')}${ext}`;

    if (!this.bucket) {
      const uploadDir = join(process.cwd(), 'public', 'uploads', folder);
      mkdirSync(uploadDir, { recursive: true });
      writeFileSync(join(uploadDir, filename), buffer);
      return `/uploads/${folder}/${filename}`;
    }

    const key = `${folder}/${filename}`;

    try {
      const upload = new Upload({
        client: this.client,
        params: {
          Bucket: this.bucket,
          Key: key,
          Body: Readable.from(buffer),
          ContentType: mimeType,
          ACL: 'public-read' as ObjectCannedACL,
        },
      });

      await upload.done();
      return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
    } catch (error) {
      // Keep local fallback for development, but surface production failures.
      if (this.configService.get<string>('app.nodeEnv') === 'production') {
        throw new BadRequestException('Image upload to S3 failed');
      }

      const uploadDir = join(process.cwd(), 'public', 'uploads', folder);
      mkdirSync(uploadDir, { recursive: true });
      writeFileSync(join(uploadDir, filename), buffer);
      return `/uploads/${folder}/${filename}`;
    }
  }

  /**
   * Upload multiple file buffers and return their public URLs.
   */
  async uploadManyBuffers(
    files: Array<{ buffer: Buffer; originalname: string; mimetype: string }>,
    folder: string,
  ): Promise<string[]> {
    return Promise.all(
      files.map((f) => this.uploadBuffer(f.buffer, folder, f.originalname, f.mimetype)),
    );
  }

  /**
   * Delete an object from S3 or local disk using its URL.
   */
  async deleteByUrl(url: string): Promise<void> {
    if (!url) return;
    if (url.startsWith('/uploads/')) {
      const localPath = join(process.cwd(), 'public', url);
      if (existsSync(localPath)) {
        try {
          unlinkSync(localPath);
        } catch {}
      }
      return;
    }
    if (!this.bucket) return;
    try {
      const urlObj = new URL(url);
      const key = urlObj.pathname.slice(1);
      await this.client.send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
      );
    } catch {}
  }
}
