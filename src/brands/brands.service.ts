import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { BrandsRepository } from './repositories/brands.repository.js';
import { CreateBrandDto } from './dto/create-brand.dto.js';
import { UpdateBrandDto } from './dto/update-brand.dto.js';
import { QueryBrandDto } from './dto/query-brand.dto.js';
import { BrandDocument } from './schemas/brand.schema.js';

// Auto-slugify helper function
const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

@Injectable()
export class BrandsService {
  constructor(private readonly brandsRepository: BrandsRepository) {}

  async create(createDto: CreateBrandDto, logoPath?: string): Promise<BrandDocument> {
    const { name, description, seoTitle, seoDescription, seoKeywords } = createDto;
    const slug = generateSlug(name);

    // Verify duplicate slug or name
    const existing = await this.brandsRepository.findBySlug(slug);
    if (existing) {
      throw new BadRequestException(`Brand with name '${name}' or slug '${slug}' already exists`);
    }

    return this.brandsRepository.create({
      name,
      slug,
      logo: logoPath,
      description,
      seoTitle,
      seoDescription,
      seoKeywords: seoKeywords || [],
      status: true,
      isDeleted: false,
    });
  }

  async findAll(queryDto: QueryBrandDto) {
    const page = queryDto.page || 1;
    const limit = queryDto.limit || 10;
    const { data, total } = await this.brandsRepository.findAll(queryDto);
    const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findByIdOrSlug(idOrSlug: string): Promise<BrandDocument> {
    const brand = await this.brandsRepository.findByIdOrSlug(idOrSlug);
    if (!brand) {
      throw new NotFoundException('Brand not found');
    }
    return brand;
  }

  async findById(id: string): Promise<BrandDocument> {
    const brand = await this.brandsRepository.findById(id);
    if (!brand) {
      throw new NotFoundException('Brand not found');
    }
    return brand;
  }

  async findBySlug(slug: string): Promise<BrandDocument> {
    const brand = await this.brandsRepository.findBySlug(slug);
    if (!brand) {
      throw new NotFoundException('Brand not found');
    }
    return brand;
  }

  async update(id: string, updateDto: UpdateBrandDto, logoPath?: string): Promise<BrandDocument> {
    const brand = await this.brandsRepository.findById(id);
    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    const { name, description, seoTitle, seoDescription, seoKeywords, status } = updateDto;
    const updateData: Record<string, any> = {};

    if (description !== undefined) updateData.description = description;
    if (seoTitle !== undefined) updateData.seoTitle = seoTitle;
    if (seoDescription !== undefined) updateData.seoDescription = seoDescription;
    if (seoKeywords !== undefined) updateData.seoKeywords = seoKeywords;
    if (status !== undefined) updateData.status = status;
    if (logoPath) updateData.logo = logoPath;

    if (name && name !== brand.name) {
      const newSlug = generateSlug(name);
      const existing = await this.brandsRepository.findBySlug(newSlug);
      if (existing && existing._id.toString() !== id) {
        throw new BadRequestException(`Brand with name '${name}' or slug '${newSlug}' already exists`);
      }
      updateData.name = name;
      updateData.slug = newSlug;
    }

    const updatedBrand = await this.brandsRepository.update(id, { $set: updateData });
    if (!updatedBrand) {
      throw new NotFoundException('Brand not found');
    }
    return updatedBrand;
  }

  async delete(id: string): Promise<void> {
    const brand = await this.brandsRepository.findById(id);
    if (!brand) {
      throw new NotFoundException('Brand not found');
    }
    await this.brandsRepository.softDelete(id);
  }
}

