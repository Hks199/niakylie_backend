import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { Brand, BrandSchema } from './schemas/brand.schema.js';
import { BrandsRepository } from './repositories/brands.repository.js';
import { BrandsService } from './brands.service.js';
import { BrandsController } from './brands.controller.js';
import { S3Module } from '../s3/s3.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Brand.name, schema: BrandSchema }]),
    MulterModule.register({
      storage: memoryStorage(),
    }),
    S3Module,
  ],
  controllers: [BrandsController],
  providers: [BrandsService, BrandsRepository],
  exports: [BrandsService, BrandsRepository],
})
export class BrandsModule {}
