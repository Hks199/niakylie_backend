import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UploadedFiles,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';

import { BannersService } from './banners.service.js';
import { CreateBannerDto } from './dto/create-banner.dto.js';
import { UpdateBannerDto } from './dto/update-banner.dto.js';
import { QueryBannerDto } from './dto/query-banner.dto.js';

@ApiTags('Banners')
@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  // ─── PUBLIC ───────────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Get active banners (respects scheduling window). Filter by type: HOMEPAGE, OFFER, FESTIVAL, POPUP' })
  @ApiResponse({ status: 200, description: 'Active banners returned' })
  async getActiveBanners(@Query() query: QueryBannerDto) {
    return this.bannersService.getActiveBanners(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get banner by ID' })
  @ApiParam({ name: 'id', example: '60d5ecb8b392d40015f8a001' })
  @ApiResponse({ status: 200, description: 'Banner details returned' })
  @ApiResponse({ status: 404, description: 'Banner not found' })
  async getBannerById(@Param('id') id: string) {
    return this.bannersService.getBannerById(id);
  }

  // ─── ADMIN ────────────────────────────────────────────────────────────────

  @Get('admin/all')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '[Admin] Get all banners including inactive ones' })
  @ApiResponse({ status: 200, description: 'All banners returned' })
  async getAllBanners(@Query() query: QueryBannerDto) {
    return this.bannersService.getAllBanners(query);
  }

  @Post('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: '[Admin] Create a new banner and upload image to S3' })
  @ApiBody({
    description: 'Multipart form: banner metadata + image file (required) + optional mobile image',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Diwali Festive Sale' },
        type: { type: 'string', enum: ['HOMEPAGE', 'OFFER', 'FESTIVAL', 'POPUP'] },
        position: { type: 'string', enum: ['TOP', 'MIDDLE', 'BOTTOM', 'SIDEBAR'] },
        linkUrl: { type: 'string' },
        linkLabel: { type: 'string' },
        displayOrder: { type: 'number' },
        isActive: { type: 'boolean' },
        startDate: { type: 'string', format: 'date-time' },
        endDate: { type: 'string', format: 'date-time' },
        image: { type: 'string', format: 'binary', description: 'Desktop banner image' },
        mobileImage: { type: 'string', format: 'binary', description: 'Optional mobile banner image' },
      },
      required: ['title', 'type', 'image'],
    },
  })
  @ApiResponse({ status: 201, description: 'Banner created and image uploaded to S3' })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'mobileImage', maxCount: 1 },
    ], { storage: memoryStorage() }),
  )
  async createBanner(
    @Body() dto: CreateBannerDto,
    @UploadedFiles() files: { image?: Express.Multer.File[]; mobileImage?: Express.Multer.File[] },
  ) {
    return this.bannersService.createBanner(dto, files);
  }

  @Put('admin/:id')
  @ApiBearerAuth('JWT-auth')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: '[Admin] Update banner metadata and/or replace image on S3' })
  @ApiParam({ name: 'id', example: '60d5ecb8b392d40015f8a001' })
  @ApiResponse({ status: 200, description: 'Banner updated' })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'mobileImage', maxCount: 1 },
    ], { storage: memoryStorage() }),
  )
  async updateBanner(
    @Param('id') id: string,
    @Body() dto: UpdateBannerDto,
    @UploadedFiles() files: { image?: Express.Multer.File[]; mobileImage?: Express.Multer.File[] },
  ) {
    return this.bannersService.updateBanner(id, dto, files);
  }

  @Patch('admin/:id/toggle-active')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Toggle banner active/inactive status' })
  @ApiParam({ name: 'id', example: '60d5ecb8b392d40015f8a001' })
  @ApiResponse({ status: 200, description: 'Banner status toggled' })
  async toggleActive(@Param('id') id: string) {
    return this.bannersService.toggleActive(id);
  }

  @Patch('admin/reorder')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Batch reorder banners by setting displayOrder values' })
  @ApiBody({
    description: 'Array of banner IDs with their new display order values',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '60d5ecb8b392d40015f8a001' },
          displayOrder: { type: 'number', example: 1 },
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Banners reordered' })
  async reorder(@Body() body: Array<{ id: string; displayOrder: number }>) {
    return this.bannersService.reorder(body);
  }

  @Delete('admin/:id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '[Admin] Delete banner and remove images from S3' })
  @ApiParam({ name: 'id', example: '60d5ecb8b392d40015f8a001' })
  @ApiResponse({ status: 200, description: 'Banner deleted' })
  async deleteBanner(@Param('id') id: string) {
    return this.bannersService.deleteBanner(id);
  }
}
