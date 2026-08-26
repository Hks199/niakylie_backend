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
        if (!this.bucket) {
            throw new common_1.BadRequestException('AWS S3 Bucket name is not configured in server environment variables (AWS_S3_BUCKET). Please set AWS_S3_BUCKET, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY in .env.');
        }
        const ext = (0, path_1.extname)(originalName) || '.jpg';
        const key = `${folder}/${Date.now()}-${(0, crypto_1.randomBytes)(8).toString('hex')}${ext}`;
        const upload = new lib_storage_1.Upload({
            client: this.client,
            params: {
                Bucket: this.bucket,
                Key: key,
                Body: stream_1.Readable.from(buffer),
                ContentType: mimeType,
                ACL: 'public-read',
            },
        });
        await upload.done();
        return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
    }
    async uploadManyBuffers(files, folder) {
        return Promise.all(files.map((f) => this.uploadBuffer(f.buffer, folder, f.originalname, f.mimetype)));
    }
    async deleteByUrl(url) {
        const urlObj = new URL(url);
        const key = urlObj.pathname.slice(1);
        await this.client.send(new client_s3_1.DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
    }
};
exports.S3Service = S3Service;
exports.S3Service = S3Service = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], S3Service);
//# sourceMappingURL=s3.service.js.map