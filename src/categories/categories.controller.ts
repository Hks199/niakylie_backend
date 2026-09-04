import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Header,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

import { memoryStorage } from 'multer';
import { CategoriesService } from './categories.service.js';
import { S3Service } from '../s3/s3.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { QueryCategoryDto } from './dto/query-category.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Roles, RolesGuard, Role } from '../shared/index.js';

const validateCategoryFile = (file?: Express.Multer.File) => {
  if (!file) return;
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new BadRequestException(
      `Invalid file format for ${file.fieldname}. Only JPG, JPEG, PNG, and WEBP allowed.`,
    );
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new BadRequestException(`File size exceeds limit for ${file.fieldname}. Max 5MB allowed.`);
  }
};

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly s3Service: S3Service,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, 'admin' as any)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'banner', maxCount: 1 },
      ],
      { storage: memoryStorage() },
    ),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new category with optional thumbnail & banner files (Admin only)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Ethnic Wear' },
        slug: { type: 'string', example: 'ethnic-wear' },
        parentId: { type: 'string', nullable: true, example: '60d5ecb8b392d40015f8a001' },
        description: { type: 'string', example: 'Traditional women wear collection' },
        displayOrder: { type: 'number', example: 0 },
        status: { type: 'boolean', example: true },
        seoTitle: { type: 'string', example: 'Buy Ethnic Wear Online' },
        seoDescription: { type: 'string', example: 'Shop sarees, kurtas and lehengas' },
        seoKeywords: { type: 'array', items: { type: 'string' }, example: ['ethnic', 'sarees'] },
        image: { type: 'string', format: 'binary' },
        banner: { type: 'string', format: 'binary' },
      },
      required: ['name'],
    },
  })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request - Validation error or duplicate category' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async create(
    @Body() createDto: CreateCategoryDto,
    @UploadedFiles()
    files: {
      image?: Express.Multer.File[];
      banner?: Express.Multer.File[];
    },
  ) {
    const imageFile = files?.image?.[0];
    const bannerFile = files?.banner?.[0];

    validateCategoryFile(imageFile);
    validateCategoryFile(bannerFile);

    const imagePath = imageFile
      ? await this.s3Service.uploadBuffer(imageFile.buffer, 'categories', imageFile.originalname, imageFile.mimetype)
      : undefined;
    const bannerPath = bannerFile
      ? await this.s3Service.uploadBuffer(bannerFile.buffer, 'categories/banners', bannerFile.originalname, bannerFile.mimetype)
      : undefined;

    return this.categoriesService.create(createDto, imagePath, bannerPath);
  }

  @Get()
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @Header('Pragma', 'no-cache')
  @Header('Expires', '0')
  @ApiOperation({ summary: 'List categories with pagination, parent filtering, regex search and sorting' })
  @ApiResponse({ status: 200, description: 'Paginated list of active categories returned with metadata' })
  async findAll(@Query() queryDto: QueryCategoryDto) {
    return this.categoriesService.findAll(queryDto);
  }

  @Get('tree')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @Header('Pragma', 'no-cache')
  @Header('Expires', '0')
  @ApiOperation({ summary: 'Fetch full 2-level category hierarchy tree array' })
  @ApiResponse({ status: 200, description: 'Category tree hierarchy returned' })
  async getCategoryTree() {
    return this.categoriesService.getCategoryTree();
  }

  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Get active category details by Mongo ObjectId or Slug' })
  @ApiParam({ name: 'idOrSlug', description: '24-character Mongo ObjectId or string slug' })
  @ApiResponse({ status: 200, description: 'Category details returned' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.categoriesService.findOne(idOrSlug);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, 'admin' as any)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'banner', maxCount: 1 },
      ],
      { storage: memoryStorage() },
    ),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update category details and re-calculate ancestor tree if parentId changes (Admin only)' })
  @ApiParam({ name: 'id', description: 'Category Mongo ObjectId' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        slug: { type: 'string' },
        parentId: { type: 'string', nullable: true },
        description: { type: 'string' },
        displayOrder: { type: 'number' },
        seoTitle: { type: 'string' },
        seoDescription: { type: 'string' },
        seoKeywords: { type: 'array', items: { type: 'string' } },
        status: { type: 'boolean' },
        image: { type: 'string', format: 'binary' },
        banner: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateCategoryDto,
    @UploadedFiles()
    files: {
      image?: Express.Multer.File[];
      banner?: Express.Multer.File[];
    },
  ) {
    const imageFile = files?.image?.[0];
    const bannerFile = files?.banner?.[0];

    validateCategoryFile(imageFile);
    validateCategoryFile(bannerFile);

    const imagePath = imageFile
      ? await this.s3Service.uploadBuffer(imageFile.buffer, 'categories', imageFile.originalname, imageFile.mimetype)
      : undefined;
    const bannerPath = bannerFile
      ? await this.s3Service.uploadBuffer(bannerFile.buffer, 'categories/banners', bannerFile.originalname, bannerFile.mimetype)
      : undefined;

    return this.categoriesService.update(id, updateDto, imagePath, bannerPath);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, 'admin' as any)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete category and recursively soft delete all child sub-categories (Admin only)' })
  @ApiParam({ name: 'id', description: 'Category Mongo ObjectId' })
  @ApiResponse({ status: 204, description: 'Category and all descendants soft-deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async remove(@Param('id') id: string) {
    await this.categoriesService.softDelete(id);
  }

  @Patch(':id/toggle-active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, 'admin' as any)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Toggle category active status flag (Admin only)' })
  @ApiParam({ name: 'id', description: 'Category Mongo ObjectId' })
  @ApiResponse({ status: 200, description: 'Category active status toggled' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async toggleActive(@Param('id') id: string) {
    return this.categoriesService.toggleActive(id);
  }
}
