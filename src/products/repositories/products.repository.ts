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
    let {
      page = 1,
      limit = 12,
      search,
      categoryId,
      category,
      brandId,
      minPrice,
      maxPrice,
      colors,
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

    if (sort) {
      if (sort === 'recommended' || sort === 'newest') {
        sortBy = 'createdAt';
        sortOrder = 'desc';
      } else if (sort === 'price-low' || sort === 'price_asc') {
        sortBy = 'price';
        sortOrder = 'asc';
      } else if (sort === 'price-high' || sort === 'price_desc') {
        sortBy = 'price';
        sortOrder = 'desc';
      } else if (sort === 'rating') {
        sortBy = 'averageRating';
        sortOrder = 'desc';
      }
    }

    const effectiveCatId = categoryId || (category && Types.ObjectId.isValid(category) ? category : undefined);
    const categorySlug = category && !Types.ObjectId.isValid(category) ? category.toLowerCase().trim() : undefined;

    const skip = (page - 1) * limit;

    // ── Stage 1: base match ──────────────────────────────────────────────────
    const baseMatch: Record<string, any> = { isDeleted: false };
    if (status !== undefined) baseMatch.status = status;
    if (effectiveCatId && Types.ObjectId.isValid(effectiveCatId)) baseMatch.categoryId = new Types.ObjectId(effectiveCatId);
    if (brandId && Types.ObjectId.isValid(brandId)) baseMatch.brandId = new Types.ObjectId(brandId);
    if (material) baseMatch.material = { $regex: material, $options: 'i' };
    if (pattern) baseMatch.pattern = { $regex: pattern, $options: 'i' };
    if (season) baseMatch.season = { $regex: season, $options: 'i' };
    if (collection) baseMatch.productCollection = { $regex: collection, $options: 'i' };
    if (isFeatured !== undefined) baseMatch.isFeatured = isFeatured;
    if (isTrending !== undefined) baseMatch.isTrending = isTrending;
    if (isBestSeller !== undefined) baseMatch.isBestSeller = isBestSeller;
    if (search) baseMatch.$text = { $search: search };

    // ── Stage 2: variant-level filter ────────────────────────────────────────
    const variantMatch: Record<string, any> = { 'variants.isActive': true };
    if (minPrice !== undefined) variantMatch['variants.offerPrice'] = { ...(variantMatch['variants.offerPrice'] || {}), $gte: minPrice };
    if (maxPrice !== undefined) variantMatch['variants.offerPrice'] = { ...(variantMatch['variants.offerPrice'] || {}), $lte: maxPrice };
    if (colors) {
      const colorArr = colors.split(',').map((c) => c.trim());
      variantMatch['variants.color'] = { $in: colorArr };
    }
    if (sizes) {
      const sizeArr = sizes.split(',').map((s) => s.trim());
      variantMatch['variants.size'] = { $in: sizeArr };
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
    const sortField = sortMap[sortBy] ?? 'createdAt';
    const sortDir = sortOrder === 'asc' ? 1 : -1;

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
}
