"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Service = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const stream_1 = require("stream");
const path_1 = require("path");
const fs_1 = require("fs");
const crypto_1 = require("crypto");
let S3Service = class S3Service {
    configService;
    client;
    bucket;
    region;
    constructor(configService) {
        this.configService = configService;
        this.region = this.configService.get('s3.region') ?? 'us-east-1';
        this.bucket = this.configService.get('s3.bucket') ?? '';
        this.client = new client_s3_1.S3Client({
            region: this.region,
            credentials: {
                accessKeyId: this.configService.get('s3.accessKeyId') ?? '',
                secretAccessKey: this.configService.get('s3.secretAccessKey') ?? '',
            },
        });
    }
    async uploadBuffer(buffer, folder, originalName, mimeType) {
        const ext = (0, path_1.extname)(originalName) || '.jpg';
        const filename = `image-${Date.now()}-${(0, crypto_1.randomBytes)(4).toString('hex')}${ext}`;
        if (!this.bucket) {
            if (this.configService.get('app.nodeEnv') === 'production') {
                throw new common_1.InternalServerErrorException('S3 storage is not configured');
            }
            const uploadDir = (0, path_1.join)(process.cwd(), 'public', 'uploads', folder);
            (0, fs_1.mkdirSync)(uploadDir, { recursive: true });
            (0, fs_1.writeFileSync)((0, path_1.join)(uploadDir, filename), buffer);
            return `/uploads/${folder}/${filename}`;
        }
        const key = `${folder}/${filename}`;
        try {
            const upload = new lib_storage_1.Upload({
                client: this.client,
                params: {
                    Bucket: this.bucket,
                    Key: key,
                    Body: stream_1.Readable.from(buffer),
                    ContentType: mimeType,
                },
            });
            await upload.done();
            return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
        }
        catch (error) {
            if (this.configService.get('app.nodeEnv') === 'production') {
                console.error('S3 upload failed', {
                    bucket: this.bucket,
                    region: this.region,
                    key,
                    error: error instanceof Error ? error.message : String(error),
                });
                throw new common_1.BadRequestException('Image upload to S3 failed');
            }
            const uploadDir = (0, path_1.join)(process.cwd(), 'public', 'uploads', folder);
            (0, fs_1.mkdirSync)(uploadDir, { recursive: true });
            (0, fs_1.writeFileSync)((0, path_1.join)(uploadDir, filename), buffer);
            return `/uploads/${folder}/${filename}`;
        }
    }
    async uploadManyBuffers(files, folder) {
        return Promise.all(files.map((f) => this.uploadBuffer(f.buffer, folder, f.originalname, f.mimetype)));
    }
    async deleteByUrl(url) {
        if (!url)
            return;
        if (url.startsWith('/uploads/')) {
            const localPath = (0, path_1.join)(process.cwd(), 'public', url);
            if ((0, fs_1.existsSync)(localPath)) {
                try {
                    (0, fs_1.unlinkSync)(localPath);
                }
                catch { }
            }
            return;
        }
        if (!this.bucket)
            return;
        try {
            const urlObj = new URL(url);
            const key = urlObj.pathname.slice(1);
            await this.client.send(new client_s3_1.DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
        }
        catch { }
    }
};
exports.S3Service = S3Service;
exports.S3Service = S3Service = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], S3Service);
//# sourceMappingURL=s3.service.js.map