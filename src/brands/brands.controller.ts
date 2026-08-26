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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';

import { BrandsService } from './brands.service.js';
import { CreateBrandDto } from './dto/create-brand.dto.js';
import { UpdateBrandDto } from './dto/update-brand.dto.js';
import { QueryBrandDto } from './dto/query-brand.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Roles, RolesGuard, Role } from '../shared/index.js';

@ApiTags('Brands')
@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FileInterceptor('logo'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new brand (Admin only)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        seoTitle: { type: 'string' },
        seoDescription: { type: 'string' },
        seoKeywords: { type: 'array', items: { type: 'string' } },
        logo: { type: 'string', format: 'binary' },
      },
      required: ['name'],
    },
  })
  @ApiResponse({ status: 201, description: 'Brand created successfully' })
  async create(
    @Body() createDto: CreateBrandDto,
    @UploadedFile() logoFile?: Express.Multer.File,
  ) {
    if (logoFile) {
      const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedMimeTypes.includes(logoFile.mimetype)) {
        throw new BadRequestException('Invalid file format for logo. Only JPG, JPEG, PNG, and WEBP allowed.');
      }
      if (logoFile.size > 5 * 1024 * 1024) {
        throw new BadRequestException('Logo file size exceeds limit. Max 5MB allowed.');
      }
    }

    const logoPath = logoFile ? `/uploads/brands/${logoFile.filename}` : undefined;
    return this.brandsService.create(createDto, logoPath);
  }

  @Get()
  @ApiOperation({ summary: 'List brands with pagination, search and sorting' })
  @ApiResponse({ status: 200, description: 'Paginated brand details returned' })
  async findAll(@Query() queryDto: QueryBrandDto) {
    return this.brandsService.findAll(queryDto);
  }

  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Get brand details by ID or Slug' })
  @ApiResponse({ status: 200, description: 'Brand details returned' })
  @ApiResponse({ status: 404, description: 'Brand not found' })
  async findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.brandsService.findByIdOrSlug(idOrSlug);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FileInterceptor('logo'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update brand details (Admin only)' })
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
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateBrandDto,
    @UploadedFile() logoFile?: Express.Multer.File,
  ) {
    if (logoFile) {
      const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedMimeTypes.includes(logoFile.mimetype)) {
        throw new BadRequestException('Invalid file format for logo. Only JPG, JPEG, PNG, and WEBP allowed.');
      }
      if (logoFile.size > 5 * 1024 * 1024) {
        throw new BadRequestException('Logo file size exceeds limit. Max 5MB allowed.');
      }
    }

    const logoPath = logoFile ? `/uploads/brands/${logoFile.filename}` : undefined;
    return this.brandsService.update(id, updateDto, logoPath);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete brand (Admin only)' })
  @ApiResponse({ status: 204, description: 'Brand soft-deleted successfully' })
  async remove(@Param('id') id: string) {
    await this.brandsService.delete(id);
  }
}
