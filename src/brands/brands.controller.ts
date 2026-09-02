import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

import { BrandsService } from './brands.service.js';
import { S3Service } from '../s3/s3.service.js';
import { CreateBrandDto } from './dto/create-brand.dto.js';
import { UpdateBrandDto } from './dto/update-brand.dto.js';
import { QueryBrandDto } from './dto/query-brand.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Roles, RolesGuard, Role } from '../shared/index.js';

const validateLogoFile = (file?: Express.Multer.File) => {
  if (!file) return;
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new BadRequestException(
      'Invalid file format for logo. Only JPG, JPEG, PNG, and WEBP allowed.',
    );
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new BadRequestException('Logo file size exceeds limit. Max 5MB allowed.');
  }
};

@ApiTags('Brands')
@Controller('brands')
export class BrandsController {
  constructor(
    private readonly brandsService: BrandsService,
    private readonly s3Service: S3Service,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FileInterceptor('logo', { storage: memoryStorage() }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new brand (Admin only)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Nike' },
        description: { type: 'string', example: 'Athletic apparel and footwear brand' },
        seoTitle: { type: 'string', example: 'Shop Nike Shoes & Apparel' },
        seoDescription: { type: 'string', example: 'Buy authentic Nike products.' },
        seoKeywords: { type: 'array', items: { type: 'string' }, example: ['nike', 'shoes'] },
        logo: { type: 'string', format: 'binary' },
      },
      required: ['name'],
    },
  })
  @ApiResponse({ status: 201, description: 'Brand created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request - Validation error or duplicate brand' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async create(
    @Body() createDto: CreateBrandDto,
    @UploadedFile() logoFile?: Express.Multer.File,
  ) {
    validateLogoFile(logoFile);
    const logoPath = logoFile
      ? await this.s3Service.uploadBuffer(logoFile.buffer, 'brands', logoFile.originalname, logoFile.mimetype)
      : undefined;
    return this.brandsService.create(createDto, logoPath);
  }

  @Get()
  @ApiOperation({ summary: 'List active brands with pagination, regex search (name & slug) and sorting' })
  @ApiResponse({ status: 200, description: 'Paginated list of active brands returned' })
  async findAll(@Query() queryDto: QueryBrandDto) {
    return this.brandsService.findAll(queryDto);
  }

  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Get active brand details by Mongo ObjectId or Slug' })
  @ApiParam({ name: 'idOrSlug', description: '24-character Mongo ObjectId or string slug' })
  @ApiResponse({ status: 200, description: 'Brand details returned' })
  @ApiResponse({ status: 404, description: 'Brand not found' })
  async findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.brandsService.findByIdOrSlug(idOrSlug);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FileInterceptor('logo', { storage: memoryStorage() }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update brand details (Admin only)' })
  @ApiParam({ name: 'id', description: 'Brand Mongo ObjectId' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        seoTitle: { type: 'string' },
        seoDescription: { type: 'string' },
        seoKeywords: { type: 'array', items: { type: 'string' } },
        status: { type: 'boolean' },
        logo: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Brand updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Brand not found' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateBrandDto,
    @UploadedFile() logoFile?: Express.Multer.File,
  ) {
    validateLogoFile(logoFile);
    const logoPath = logoFile
      ? await this.s3Service.uploadBuffer(logoFile.buffer, 'brands', logoFile.originalname, logoFile.mimetype)
      : undefined;
    return this.brandsService.update(id, updateDto, logoPath);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete brand by setting isDeleted: true and status: false (Admin only)' })
  @ApiParam({ name: 'id', description: 'Brand Mongo ObjectId' })
  @ApiResponse({ status: 204, description: 'Brand soft-deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Brand not found' })
  async remove(@Param('id') id: string) {
    await this.brandsService.delete(id);
  }
}

