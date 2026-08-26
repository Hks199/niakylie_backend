import { Module, Global } from '@nestjs/common';
import { S3Service } from './s3.service.js';

@Global()
@Module({
  providers: [S3Service],
  exports: [S3Service],
})
export class S3Module {}
