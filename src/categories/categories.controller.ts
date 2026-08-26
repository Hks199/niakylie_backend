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
  UploadedFiles,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';

import { CategoriesService } from './categories.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { QueryCategoryDto } from './dto/query-category.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Roles, RolesGuard, Role } from '../shared/index.js';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'banner', maxCount: 1 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new category (Admin only)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        parentId: { type: 'string', nullable: true },
        description: { type: 'string' },
        seoTitle: { type: 'string' },
        seoDescription: { type: 'string' },
        seoKeywords: { type: 'array', items: { type: 'string' } },
        image: { type: 'string', format: 'binary' },
        banner: { type: 'string', format: 'binary' },
      },
      required: ['name'],
    },
  })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
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

    const validateFile = (file: Express.Multer.File) => {
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

    if (imageFile) validateFile(imageFile);
    if (bannerFile) validateFile(bannerFile);

    const imagePath = imageFile ? `/uploads/categories/${imageFile.filename}` : undefined;
    const bannerPath = bannerFile ? `/uploads/categories/${bannerFile.filename}` : undefined;

    return this.categoriesService.create(createDto, imagePath, bannerPath);
  }

  @Get()
  @ApiOperation({ summary: 'List categories with pagination, search and sorting' })
  @ApiResponse({ status: 200, description: 'Paginated category details returned' })
  async findAll(@Query() queryDto: QueryCategoryDto) {
    return this.categoriesService.findAll(queryDto);
  }

  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Get category details by ID or Slug' })
  @ApiResponse({ status: 200, description: 'Category details returned' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.categoriesService.findByIdOrSlug(idOrSlug);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'banner', maxCount: 1 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update category details (Admin only)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        parentId: { type: 'string', nullable: true },
        description: { type: 'string' },
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

    const validateFile = (file: Express.Multer.File) => {
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

    if (imageFile) validateFile(imageFile);
    if (bannerFile) validateFile(bannerFile);

    const imagePath = imageFile ? `/uploads/categories/${imageFile.filename}` : undefined;
    const bannerPath = bannerFile ? `/uploads/categories/${bannerFile.filename}` : undefined;

    return this.categoriesService.update(id, updateDto, imagePath, bannerPath);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete category and descendants (Admin only)' })
  @ApiResponse({ status: 204, description: 'Category soft-deleted successfully' })
  async remove(@Param('id') id: string) {
    await this.categoriesService.delete(id);
  }
}
