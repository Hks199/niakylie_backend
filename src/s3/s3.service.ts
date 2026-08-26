import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  DeleteObjectCommand,
  ObjectCannedACL,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Readable } from 'stream';
import { extname } from 'path';
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
   * Upload a single file buffer to S3 and return the public URL.
   */
  async uploadBuffer(
    buffer: Buffer,
    folder: string,
    originalName: string,
    mimeType: string,
  ): Promise<string> {
    if (!this.bucket) {
      throw new BadRequestException(
        'AWS S3 Bucket name is not configured in server environment variables (AWS_S3_BUCKET). Please set AWS_S3_BUCKET, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY in .env.',
      );
    }


    const ext = extname(originalName) || '.jpg';
    const key = `${folder}/${Date.now()}-${randomBytes(8).toString('hex')}${ext}`;


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
   * Delete an object from S3 using its public URL.
   */
  async deleteByUrl(url: string): Promise<void> {
    // Extract key from URL: https://bucket.s3.region.amazonaws.com/key
    const urlObj = new URL(url);
    const key = urlObj.pathname.slice(1); // remove leading slash
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }
}
