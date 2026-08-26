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
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';

import { ProductsService } from './products.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { CreateVariantDto } from './dto/create-variant.dto.js';
import { QueryProductDto } from './dto/query-product.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Roles, RolesGuard, Role } from '../shared/index.js';

// Shared file validator helper
const validateImageFiles = (files: Express.Multer.File[]): void => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  for (const file of files) {
    if (!allowed.includes(file.mimetype)) {
      throw new BadRequestException(`Invalid file type: ${file.originalname}. Only JPG, PNG, WEBP allowed.`);
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException(`File too large: ${file.originalname}. Max 5MB per image.`);
    }
  }
};

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // ─── Product CRUD ────────────────────────────────────────────────────────────

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new product (Admin only)' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  async create(@Body() createDto: CreateProductDto) {
    return this.productsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'List products with aggregation filtering, sorting, and pagination' })
  @ApiResponse({ status: 200, description: 'Paginated product list returned' })
  async findAll(@Query() queryDto: QueryProductDto) {
    return this.productsService.findAll(queryDto);
  }

  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Get product by ID or slug' })
  @ApiResponse({ status: 200, description: 'Product details returned' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.productsService.findByIdOrSlug(idOrSlug);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update product metadata (Admin only)' })
  @ApiResponse({ status: 200, description: 'Product updated' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateProductDto) {
    return this.productsService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete product (Admin only)' })
  @ApiResponse({ status: 204, description: 'Product soft-deleted' })
  async remove(@Param('id') id: string) {
    await this.productsService.delete(id);
  }

  // ─── Product Images ──────────────────────────────────────────────────────────

  @Post(':id/images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FilesInterceptor('images', 10, { storage: memoryStorage() }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: { type: 'array', items: { type: 'string', format: 'binary' } },
      },
    },
  })
  @ApiOperation({ summary: 'Upload product images to S3 (Admin only)' })
  @ApiResponse({ status: 201, description: 'Images uploaded and attached to product' })
  async uploadImages(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files?.length) throw new BadRequestException('No image files provided');
    validateImageFiles(files);
    return this.productsService.uploadImages(id, files, 'products');
  }

  // ─── Variant CRUD ────────────────────────────────────────────────────────────

  @Post(':id/variants')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add a variant to a product (Admin only)' })
  @ApiResponse({ status: 201, description: 'Variant added' })
  async addVariant(@Param('id') id: string, @Body() variantDto: CreateVariantDto) {
    return this.productsService.addVariant(id, variantDto);
  }

  @Put(':id/variants/:variantId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a specific variant (Admin only)' })
  @ApiResponse({ status: 200, description: 'Variant updated' })
  async updateVariant(
    @Param('id') id: string,
    @Param('variantId') variantId: string,
    @Body() variantDto: Partial<CreateVariantDto>,
  ) {
    return this.productsService.updateVariant(id, variantId, variantDto);
  }

  @Delete(':id/variants/:variantId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a variant from a product (Admin only)' })
  @ApiResponse({ status: 200, description: 'Variant removed' })
  async deleteVariant(@Param('id') id: string, @Param('variantId') variantId: string) {
    return this.productsService.deleteVariant(id, variantId);
  }

  // ─── Variant Images ──────────────────────────────────────────────────────────

  @Post(':id/variants/:variantId/images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FilesInterceptor('images', 5, { storage: memoryStorage() }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: { type: 'array', items: { type: 'string', format: 'binary' } },
      },
    },
  })
  @ApiOperation({ summary: 'Upload images for a specific variant to S3 (Admin only)' })
  @ApiResponse({ status: 201, description: 'Variant images uploaded' })
  async uploadVariantImages(
    @Param('id') id: string,
    @Param('variantId') variantId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files?.length) throw new BadRequestException('No image files provided');
    validateImageFiles(files);
    return this.productsService.uploadVariantImages(id, variantId, files);
  }
}
