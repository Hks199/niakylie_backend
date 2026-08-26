import { Injectable, NotFoundException, BadRequestException, Optional } from '@nestjs/common';
import { Types } from 'mongoose';
import { ProductsRepository } from './repositories/products.repository.js';
import { S3Service } from '../s3/s3.service.js';
import { RedisCacheService } from '../cache/cache.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { CreateVariantDto } from './dto/create-variant.dto.js';
import { QueryProductDto } from './dto/query-product.dto.js';
import { ProductDocument } from './schemas/product.schema.js';
import { randomBytes } from 'crypto';

const generateSlug = (text: string): string =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

const generateSku = (): string =>
  `NIA-${randomBytes(3).toString('hex').toUpperCase()}`;

const calcDiscount = (mrp: number, offerPrice: number): number =>
  mrp > 0 ? Math.round(((mrp - offerPrice) / mrp) * 100) : 0;

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly s3Service: S3Service,
    @Optional() private readonly cacheService?: RedisCacheService,
  ) {}

  async create(createDto: CreateProductDto): Promise<ProductDocument> {
    const slug = generateSlug(createDto.name);

    const existing = await this.productsRepository.findBySlug(slug);
    if (existing) {
      throw new BadRequestException(`Product with slug '${slug}' already exists`);
    }

    // Process variants: assign SKU and compute discount
    const variants = (createDto.variants ?? []).map((v) => {
      if (v.offerPrice > v.mrp) {
        throw new BadRequestException(
          `Offer price (${v.offerPrice}) cannot exceed MRP (${v.mrp}) for variant ${v.color}/${v.size}`,
        );
      }
      return {
        ...v,
        sku: v.sku || generateSku(),
        stock: v.stock ?? 0,
        isActive: v.isActive ?? true,
        discount: calcDiscount(v.mrp, v.offerPrice),
        images: [],
      };
    });

    return this.productsRepository.create({
      ...createDto,
      slug,
      variants,
      categoryId: new Types.ObjectId(createDto.categoryId),
      brandId: createDto.brandId ? new Types.ObjectId(createDto.brandId) : undefined,
      tags: createDto.tags ?? [],
      seoKeywords: createDto.seoKeywords ?? [],
      tax: createDto.tax ?? 0,
      isFeatured: createDto.isFeatured ?? false,
      isTrending: createDto.isTrending ?? false,
      isBestSeller: createDto.isBestSeller ?? false,
    } as any);
  }

  async uploadImages(
    productId: string,
    files: Express.Multer.File[],
    folder: 'products' | `products/${string}`,
  ): Promise<ProductDocument> {
    const product = await this.productsRepository.findById(productId);
    if (!product) throw new NotFoundException(`Product ${productId} not found`);

    const urls = await this.s3Service.uploadManyBuffers(
      files.map((f) => ({ buffer: f.buffer, originalname: f.originalname, mimetype: f.mimetype })),
      folder,
    );

    const updated = await this.productsRepository.addImages(productId, urls);
    return updated!;
  }

  async update(id: string, updateDto: UpdateProductDto): Promise<ProductDocument> {
    const product = await this.productsRepository.findById(id);
    if (!product) throw new NotFoundException(`Product ${id} not found`);

    const updateData: Record<string, any> = { ...updateDto };

    if (updateDto.name && updateDto.name !== product.name) {
      const newSlug = generateSlug(updateDto.name);
      const existing = await this.productsRepository.findBySlug(newSlug);
      if (existing && existing._id.toString() !== id) {
        throw new BadRequestException(`Product with slug '${newSlug}' already exists`);
      }
      updateData.slug = newSlug;
    }

    if (updateDto.categoryId) updateData.categoryId = new Types.ObjectId(updateDto.categoryId);
    if (updateDto.brandId) updateData.brandId = new Types.ObjectId(updateDto.brandId);

    const updated = await this.productsRepository.update(id, { $set: updateData });
    if (!updated) throw new NotFoundException(`Product ${id} not found`);
    return updated;
  }

  async delete(id: string): Promise<void> {
    const product = await this.productsRepository.findById(id);
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    await this.productsRepository.softDelete(id);
  }

  async findByIdOrSlug(idOrSlug: string): Promise<ProductDocument> {
    let product: ProductDocument | null = null;
    if (Types.ObjectId.isValid(idOrSlug)) {
      product = await this.productsRepository.findById(idOrSlug);
    }
    if (!product) {
      product = await this.productsRepository.findBySlug(idOrSlug);
    }
    if (!product) throw new NotFoundException(`Product '${idOrSlug}' not found`);
    return product;
  }

  async findAll(queryDto: QueryProductDto) {
    if (this.cacheService) {
      const cacheKey = `products:list:${JSON.stringify(queryDto)}`;
      const cached = await this.cacheService.get<any>(cacheKey);
      if (cached) return cached;

      const result = await this.productsRepository.findAll(queryDto);
      await this.cacheService.set(cacheKey, result, 300000); // 5 mins TTL
      return result;
    }
    return this.productsRepository.findAll(queryDto);
  }

  async addVariant(productId: string, variantDto: CreateVariantDto): Promise<ProductDocument> {
    const product = await this.productsRepository.findById(productId);
    if (!product) throw new NotFoundException(`Product ${productId} not found`);

    if (variantDto.offerPrice > variantDto.mrp) {
      throw new BadRequestException(
        `Offer price cannot exceed MRP for variant ${variantDto.color}/${variantDto.size}`,
      );
    }

    const variant = {
      ...variantDto,
      sku: variantDto.sku || generateSku(),
      stock: variantDto.stock ?? 0,
      isActive: variantDto.isActive ?? true,
      discount: calcDiscount(variantDto.mrp, variantDto.offerPrice),
      images: [],
    };

    const updated = await this.productsRepository.addVariant(productId, variant);
    return updated!;
  }

  async updateVariant(
    productId: string,
    variantId: string,
    variantDto: Partial<CreateVariantDto>,
  ): Promise<ProductDocument> {
    const product = await this.productsRepository.findById(productId);
    if (!product) throw new NotFoundException(`Product ${productId} not found`);

    const variant = product.variants.find((v) => v._id.toString() === variantId);
    if (!variant) throw new NotFoundException(`Variant ${variantId} not found`);

    const mrp = variantDto.mrp ?? variant.mrp;
    const offerPrice = variantDto.offerPrice ?? variant.offerPrice;
    if (offerPrice > mrp) {
      throw new BadRequestException('Offer price cannot exceed MRP');
    }

    const updateData = {
      ...variantDto,
      discount: calcDiscount(mrp, offerPrice),
    };

    const updated = await this.productsRepository.updateVariant(productId, variantId, updateData);
    if (!updated) throw new NotFoundException(`Variant ${variantId} not found`);
    return updated;
  }

  async deleteVariant(productId: string, variantId: string): Promise<ProductDocument> {
    const product = await this.productsRepository.findById(productId);
    if (!product) throw new NotFoundException(`Product ${productId} not found`);

    const updated = await this.productsRepository.deleteVariant(productId, variantId);
    if (!updated) throw new NotFoundException(`Variant ${variantId} not found`);
    return updated;
  }

  async uploadVariantImages(
    productId: string,
    variantId: string,
    files: Express.Multer.File[],
  ): Promise<ProductDocument> {
    const product = await this.productsRepository.findById(productId);
    if (!product) throw new NotFoundException(`Product ${productId} not found`);

    const variant = product.variants.find((v) => v._id.toString() === variantId);
    if (!variant) throw new NotFoundException(`Variant ${variantId} not found`);

    const urls = await this.s3Service.uploadManyBuffers(
      files.map((f) => ({ buffer: f.buffer, originalname: f.originalname, mimetype: f.mimetype })),
      `products/${productId}/variants`,
    );

    const existingImages = variant.images ?? [];
    const updated = await this.productsRepository.updateVariant(productId, variantId, {
      images: [...existingImages, ...urls],
    } as any);
    return updated!;
  }
}
