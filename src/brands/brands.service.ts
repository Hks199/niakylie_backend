import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { BrandsRepository } from './repositories/brands.repository.js';
import { CreateBrandDto } from './dto/create-brand.dto.js';
import { UpdateBrandDto } from './dto/update-brand.dto.js';
import { QueryBrandDto } from './dto/query-brand.dto.js';
import { BrandDocument } from './schemas/brand.schema.js';

// Standalone slug helper to avoid extra module imports
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

    // Verify duplicate slug
    const existing = await this.brandsRepository.findBySlug(slug);
    if (existing) {
      throw new BadRequestException(`Brand with slug '${slug}' already exists`);
    }

    return this.brandsRepository.create({
      name,
      slug,
      logo: logoPath,
      description,
      seoTitle,
      seoDescription,
      seoKeywords: seoKeywords || [],
    });
  }

  async update(id: string, updateDto: UpdateBrandDto, logoPath?: string): Promise<BrandDocument> {
    const brand = await this.brandsRepository.findById(id);
    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
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
        throw new BadRequestException(`Brand with slug '${newSlug}' already exists`);
      }
      updateData.name = name;
      updateData.slug = newSlug;
    }

    const updatedBrand = await this.brandsRepository.update(id, { $set: updateData });
    if (!updatedBrand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }
    return updatedBrand;
  }

  async delete(id: string): Promise<void> {
    const brand = await this.brandsRepository.findById(id);
    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }
    await this.brandsRepository.softDelete(id);
  }

  async findById(id: string): Promise<BrandDocument> {
    const brand = await this.brandsRepository.findById(id);
    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }
    return brand;
  }

  async findBySlug(slug: string): Promise<BrandDocument> {
    const brand = await this.brandsRepository.findBySlug(slug);
    if (!brand) {
      throw new NotFoundException(`Brand with slug '${slug}' not found`);
    }
    return brand;
  }

  async findByIdOrSlug(idOrSlug: string): Promise<BrandDocument> {
    let brand: BrandDocument | null = null;
    if (Types.ObjectId.isValid(idOrSlug)) {
      brand = await this.brandsRepository.findById(idOrSlug);
    }
    if (!brand) {
      brand = await this.brandsRepository.findBySlug(idOrSlug);
    }
    if (!brand) {
      throw new NotFoundException(`Brand with identifier '${idOrSlug}' not found`);
    }
    return brand;
  }

  async findAll(queryDto: QueryBrandDto) {
    return this.brandsRepository.findAll(queryDto);
  }
}
