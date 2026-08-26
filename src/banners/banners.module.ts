import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Banner, BannerSchema } from './schemas/banner.schema.js';
import { BannersRepository } from './repositories/banners.repository.js';
import { BannersService } from './banners.service.js';
import { BannersController } from './banners.controller.js';
import { S3Module } from '../s3/s3.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Banner.name, schema: BannerSchema }]),
    S3Module,
  ],
  controllers: [BannersController],
  providers: [BannersService, BannersRepository],
  exports: [BannersService, BannersRepository],
})
export class BannersModule {}
