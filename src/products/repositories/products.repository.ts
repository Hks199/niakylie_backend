import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, UpdateQuery, PipelineStage } from 'mongoose';
import { Product, ProductDocument } from '../schemas/product.schema.js';
import { ProductVariant } from '../schemas/product-variant.schema.js';
import { QueryProductDto } from '../dto/query-product.dto.js';

@Injectable()
export class ProductsRepository {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
  ) {}

  async create(data: Partial<Product>): Promise<ProductDocument> {
    const product = new this.productModel(data);
    return product.save();
  }

  async findById(id: string): Promise<ProductDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.productModel
      .findOne({ _id: new Types.ObjectId(id), isDeleted: false })
      .populate('categoryId', 'name slug')
      .populate('brandId', 'name slug logo')
      .exec();
  }

  async findBySlug(slug: string): Promise<ProductDocument | null> {
    return this.productModel
      .findOne({ slug, isDeleted: false })
      .populate('categoryId', 'name slug')
      .populate('brandId', 'name slug logo')
      .exec();
  }

  async findAll(queryDto: QueryProductDto): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    const {
      page = 1,
      limit = 12,
      search,
      categoryId,
      category,
      brandId,
      brand,
      minPrice,
      maxPrice,
      color,
      colors,
      discount,
      rating,
      sizes,
      material,
      pattern,
      season,
      productCollection: collection,
      isFeatured,
      isTrending,
      isBestSeller,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      sort,
    } = queryDto;

    let resolvedSortBy = sortBy;
    let resolvedSortOrder = sortOrder;

    if (sort) {
      if (sort === 'recommended' || sort === 'newest') {
        resolvedSortBy = 'createdAt';
        resolvedSortOrder = 'desc';
      } else if (sort === 'price-low' || sort === 'price_asc') {
        resolvedSortBy = 'price';
        resolvedSortOrder = 'asc';
      } else if (sort === 'price-high' || sort === 'price_desc') {
        resolvedSortBy = 'price';
        resolvedSortOrder = 'desc';
      } else if (sort === 'rating') {
        resolvedSortBy = 'averageRating';
        resolvedSortOrder = 'desc';
      }
    }

    const skip = (page - 1) * limit;

    // ── Resolve Category Slug/ID ──────────────────────────────────────────────
    let resolvedCategoryId: Types.ObjectId | undefined = undefined;
    if (categoryId && Types.ObjectId.isValid(categoryId)) {
      resolvedCategoryId = new Types.ObjectId(categoryId);
    } else if (category) {
      if (Types.ObjectId.isValid(category)) {
        resolvedCategoryId = new Types.ObjectId(category);
      } else {
        const foundCat = await this.productModel.db.collection('categories').findOne({
          $or: [
            { slug: category.toLowerCase().trim() },
            { name: new RegExp(`^${category.trim()}$`, 'i') },
          ],
          isDeleted: { $ne: true },
        });
        if (foundCat) {
          resolvedCategoryId = foundCat._id as any;
        }
      }
    }

    // ── Resolve Brand Name/ID ────────────────────────────────────────────────
    let resolvedBrandId: Types.ObjectId | undefined = undefined;
    if (brandId && Types.ObjectId.isValid(brandId)) {
      resolvedBrandId = new Types.ObjectId(brandId);
    } else if (brand) {
      if (Types.ObjectId.isValid(brand)) {
        resolvedBrandId = new Types.ObjectId(brand);
      } else {
        const foundBrand = await this.productModel.db.collection('brands').findOne({
          $or: [
            { slug: brand.toLowerCase().trim() },
            { name: new RegExp(`^${brand.trim()}$`, 'i') },
          ],
        });
        if (foundBrand) {
          resolvedBrandId = foundBrand._id as any;
        }
      }
    }

    // ── Stage 1: Base match ──────────────────────────────────────────────────
    const baseMatch: Record<string, any> = { isDeleted: false };
    if (status !== undefined) baseMatch.status = status;
    if (resolvedCategoryId) baseMatch.categoryId = resolvedCategoryId;
    if (resolvedBrandId) baseMatch.brandId = resolvedBrandId;
    if (material) baseMatch.material = { $regex: material, $options: 'i' };
    if (pattern) baseMatch.pattern = { $regex: pattern, $options: 'i' };
    if (season) baseMatch.season = { $regex: season, $options: 'i' };
    if (collection) baseMatch.productCollection = { $regex: collection, $options: 'i' };
    if (isFeatured !== undefined) baseMatch.isFeatured = isFeatured;
    if (isTrending !== undefined) baseMatch.isTrending = isTrending;
    if (isBestSeller !== undefined) baseMatch.isBestSeller = isBestSeller;
    if (rating !== undefined) baseMatch.averageRating = { $gte: rating };

    if (search) {
      baseMatch.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
        { material: { $regex: search, $options: 'i' } },
      ];
    }

    // ── Stage 2: Variant-level filter ────────────────────────────────────────
    const variantMatch: Record<string, any> = { 'variants.isActive': true };
    if (minPrice !== undefined) variantMatch['variants.offerPrice'] = { ...(variantMatch['variants.offerPrice'] || {}), $gte: minPrice };
    if (maxPrice !== undefined) variantMatch['variants.offerPrice'] = { ...(variantMatch['variants.offerPrice'] || {}), $lte: maxPrice };

    const colorInput = colors || color;
    if (colorInput) {
      const colorArr = colorInput.split(',').map((c) => c.trim()).filter(Boolean);
      if (colorArr.length > 0) {
        variantMatch['variants.color'] = { $in: colorArr.map((c) => new RegExp(c, 'i')) };
      }
    }

    if (sizes) {
      const sizeArr = sizes.split(',').map((s) => s.trim()).filter(Boolean);
      if (sizeArr.length > 0) {
        variantMatch['variants.size'] = { $in: sizeArr };
      }
    }

    const hasVariantFilter = Object.keys(variantMatch).length > 1 || minPrice !== undefined || maxPrice !== undefined;

    // ── Sort map ─────────────────────────────────────────────────────────────
    const sortMap: Record<string, string> = {
      price: 'minOfferPrice',
      name: 'name',
      averageRating: 'averageRating',
      reviewsCount: 'reviewsCount',
      createdAt: 'createdAt',
    };
    const sortField = sortMap[resolvedSortBy] ?? 'createdAt';
    const sortDir = resolvedSortOrder === 'asc' ? 1 : -1;

    // ── Aggregation pipeline ─────────────────────────────────────────────────
    const pipeline: PipelineStage[] = [
      { $match: baseMatch },
      ...(hasVariantFilter
        ? [
            { $unwind: '$variants' } as PipelineStage,
            { $match: variantMatch } as PipelineStage,
            {
              $group: {
                _id: '$_id',
                root: { $first: '$$ROOT' },
                variants: { $push: '$variants' },
                minOfferPrice: { $min: '$variants.offerPrice' },
              },
            } as PipelineStage,
            {
              $replaceRoot: {
                newRoot: {
                  $mergeObjects: ['$root', { variants: '$variants', minOfferPrice: '$minOfferPrice' }],
                },
              },
            } as PipelineStage,
          ]
        : [
            {
              $addFields: {
                minOfferPrice: { $min: '$variants.offerPrice' },
              },
            } as PipelineStage,
          ]),
      {
        $facet: {
          data: [
            { $sort: { [sortField]: sortDir } },
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: 'categories',
                localField: 'categoryId',
                foreignField: '_id',
                pipeline: [{ $project: { name: 1, slug: 1 } }],
                as: 'category',
              },
            },
            { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                from: 'brands',
                localField: 'brandId',
                foreignField: '_id',
                pipeline: [{ $project: { name: 1, slug: 1, logo: 1 } }],
                as: 'brand',
              },
            },
            { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true } },
          ],
          total: [{ $count: 'count' }],
        },
      } as PipelineStage,
    ];

    const [result] = await this.productModel.aggregate(pipeline).exec();
    const data = result?.data ?? [];
    const total = result?.total?.[0]?.count ?? 0;

    return { data, total, page, limit };
  }

  async update(id: string, updateData: UpdateQuery<ProductDocument>): Promise<ProductDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.productModel
      .findOneAndUpdate({ _id: new Types.ObjectId(id), isDeleted: false }, updateData, { new: true })
      .exec();
  }

  async softDelete(id: string): Promise<ProductDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.productModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(id), isDeleted: false },
        { $set: { isDeleted: true, deletedAt: new Date() } },
        { new: true },
      )
      .exec();
  }

  async addImages(id: string, urls: string[]): Promise<ProductDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.productModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(id), isDeleted: false },
        { $push: { images: { $each: urls } } },
        { new: true },
      )
      .exec();
  }

  async addVariant(id: string, variant: Partial<ProductVariant>): Promise<ProductDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.productModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(id), isDeleted: false },
        { $push: { variants: variant } },
        { new: true },
      )
      .exec();
  }

  async updateVariant(
    productId: string,
    variantId: string,
    updateData: Partial<ProductVariant>,
  ): Promise<ProductDocument | null> {
    if (!Types.ObjectId.isValid(productId) || !Types.ObjectId.isValid(variantId)) return null;
    const setFields: Record<string, any> = {};
    Object.entries(updateData).forEach(([k, v]) => {
      setFields[`variants.$.${k}`] = v;
    });
    return this.productModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(productId),
          isDeleted: false,
          'variants._id': new Types.ObjectId(variantId),
        },
        { $set: setFields },
        { new: true },
      )
      .exec();
  }

  async deleteVariant(productId: string, variantId: string): Promise<ProductDocument | null> {
    if (!Types.ObjectId.isValid(productId) || !Types.ObjectId.isValid(variantId)) return null;
    return this.productModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(productId), isDeleted: false },
        { $pull: { variants: { _id: new Types.ObjectId(variantId) } } },
        { new: true },
      )
      .exec();
  }

  async decrementVariantStock(
    productIdStr?: string,
    variantIdStr?: string,
    skuStr?: string,
    quantity: number = 1,
  ): Promise<void> {
    const qty = Math.max(1, quantity);

    let product = productIdStr && Types.ObjectId.isValid(productIdStr)
      ? await this.productModel.findOne({ _id: new Types.ObjectId(productIdStr), isDeleted: false })
      : null;

    if (!product && skuStr) {
      product = await this.productModel.findOne({ 'variants.sku': skuStr, isDeleted: false });
    }

    if (!product) return;

    let variant = product.variants.find(
      (v) => (variantIdStr && v._id?.toString() === variantIdStr) || (skuStr && v.sku === skuStr),
    );

    if (!variant && product.variants.length > 0) {
      variant = product.variants[0];
    }

    if (variant) {
      const currentStock = variant.stock || 0;
      const newStock = Math.max(0, currentStock - qty);
      await this.updateVariant(product._id.toString(), variant._id.toString(), { stock: newStock });
    }
  }

  async incrementVariantStock(
    productIdStr?: string,
    variantIdStr?: string,
    skuStr?: string,
    quantity: number = 1,
  ): Promise<void> {
    const qty = Math.max(1, quantity);

    let product = productIdStr && Types.ObjectId.isValid(productIdStr)
      ? await this.productModel.findOne({ _id: new Types.ObjectId(productIdStr), isDeleted: false })
      : null;

    if (!product && skuStr) {
      product = await this.productModel.findOne({ 'variants.sku': skuStr, isDeleted: false });
    }

    if (!product) return;

    let variant = product.variants.find(
      (v) => (variantIdStr && v._id?.toString() === variantIdStr) || (skuStr && v.sku === skuStr),
    );

    if (!variant && product.variants.length > 0) {
      variant = product.variants[0];
    }

    if (variant) {
      const currentStock = variant.stock || 0;
      const newStock = currentStock + qty;
      await this.updateVariant(product._id.toString(), variant._id.toString(), { stock: newStock });
    }
  }
}
