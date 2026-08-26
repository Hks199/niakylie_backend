import { ConfigService } from '@nestjs/config';
export declare class S3Service {
    private readonly configService;
    private readonly client;
    private readonly bucket;
    private readonly region;
    constructor(configService: ConfigService);
    uploadBuffer(buffer: Buffer, folder: string, originalName: string, mimeType: string): Promise<string>;
    uploadManyBuffers(files: Array<{
        buffer: Buffer;
        originalname: string;
        mimetype: string;
    }>, folder: string): Promise<string[]>;
    deleteByUrl(url: string): Promise<void>;
}
