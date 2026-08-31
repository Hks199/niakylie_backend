import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from '../../products/schemas/product.schema.js';
import { SearchQueryDto } from '../dto/search-query.dto.js';
import {
  ISearchProvider,
  SearchResultResponse,
  AutocompleteResponse,
  FacetsResponse,
} from './search-provider.interface.js';

@Injectable()
export class MongoSearchProvider implements ISearchProvider {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
  ) {}

  async search(dto: SearchQueryDto): Promise<SearchResultResponse> {
    const {
      q,
      categoryId,
      brandId,
      colors,
      sizes,
      minPrice,
      maxPrice,
      minDiscount,
      minRating,
      sortBy = 'relevance',
      page = 1,
      limit = 12,
    } = dto;

    const matchStage: Record<string, any> = { isDeleted: false, status: true };

    if (categoryId && Types.ObjectId.isValid(categoryId)) {
      matchStage.categoryId = new Types.ObjectId(categoryId);
    }

    if (brandId && Types.ObjectId.isValid(brandId)) {
      matchStage.brandId = new Types.ObjectId(brandId);
    }

    if (minRating !== undefined) {
      matchStage.averageRating = { $gte: minRating };
    }

    if (q) {
      matchStage.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
        { material: { $regex: q, $options: 'i' } },
      ];
    }

    const pipeline: any[] = [{ $match: matchStage }];

    // Populate category & brand names for rich metadata
    pipeline.push(
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'categoryInfo',
        },
      },
      {
        $lookup: {
          from: 'brands',
          localField: 'brandId',
          foreignField: '_id',
          as: 'brandInfo',
        },
      },
    );

    // Filter embedded variants if variant-specific filters are provided
    const variantMatch: Record<string, any> = {};

    if (colors) {
      const colorList = colors.split(',').map((c) => c.trim()).filter(Boolean);
      if (colorList.length) {
        variantMatch['variants.color'] = { $in: colorList.map((c) => new RegExp(c, 'i')) };
      }
    }

    if (sizes) {
      const sizeList = sizes.split(',').map((s) => s.trim()).filter(Boolean);
      if (sizeList.length) {
        variantMatch['variants.size'] = { $in: sizeList };
      }
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceFilter: Record<string, any> = {};
      if (minPrice !== undefined) priceFilter.$gte = minPrice;
      if (maxPrice !== undefined) priceFilter.$lte = maxPrice;
      variantMatch['variants.offerPrice'] = priceFilter;
    }

    if (minDiscount !== undefined) {
      variantMatch['variants.discount'] = { $gte: minDiscount };
    }

    if (Object.keys(variantMatch).length > 0) {
      pipeline.push({ $match: variantMatch });
    }

    // Determine sorting order
    const sortStage: Record<string, any> = {};
    if (sortBy === 'price_asc') {
      sortStage['variants.0.offerPrice'] = 1;
    } else if (sortBy === 'price_desc') {
      sortStage['variants.0.offerPrice'] = -1;
    } else if (sortBy === 'rating') {
      sortStage.averageRating = -1;
    } else if (sortBy === 'newest') {
      sortStage.createdAt = -1;
    } else {
      sortStage.createdAt = -1;
    }

    const skip = (page - 1) * limit;

    const facetStage = {
      $facet: {
        data: [{ $sort: sortStage }, { $skip: skip }, { $limit: limit }],
        total: [{ $count: 'count' }],
        availableColors: [
          { $unwind: '$variants' },
          { $group: { _id: '$variants.color' } },
          { $match: { _id: { $ne: null } } },
        ],
        availableSizes: [
          { $unwind: '$variants' },
          { $group: { _id: '$variants.size' } },
          { $match: { _id: { $ne: null } } },
        ],
      },
    };

    pipeline.push(facetStage);

    const [results] = await this.productModel.aggregate(pipeline).exec();

    const data = results?.data || [];
    const total = results?.total?.[0]?.count || 0;
    const totalPages = Math.ceil(total / limit) || 1;

    const colorsFacet = (results?.availableColors || []).map((c: any) => ({
      label: c._id,
      value: c._id,
      count: 0,
    }));
    const sizesFacet = (results?.availableSizes || []).map((s: any) => ({
      label: s._id,
      value: s._id,
      count: 0,
    }));

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      facets: {
        brands: [],
        categories: [],
        colors: colorsFacet,
        sizes: sizesFacet,
        priceRanges: [
          { min: 0, max: 1000, count: 0 },
          { min: 1000, max: 2500, count: 0 },
          { min: 2500, max: 5000, count: 0 },
          { min: 5000, max: 100000, count: 0 },
        ],
      },
    };
  }

  async autocomplete(query: string, limit: number = 5): Promise<AutocompleteResponse> {
    const cleanQuery = query.trim();
    if (!cleanQuery) return { query, suggestions: [] };

    const regex = new RegExp(cleanQuery, 'i');

    const products = await this.productModel
      .find({
        isDeleted: false,
        status: true,
        $or: [
          { name: regex },
          { tags: regex },
          { material: regex },
          { description: regex },
        ],
      })
      .select('_id name slug variants images thumbnail categoryId')
      .populate('categoryId', 'name')
      .limit(limit)
      .exec();

    const suggestions = products.map((p: any) => {
      const firstVariant = p.variants?.[0];
      const offerPrice = firstVariant?.offerPrice ?? (p as any).price ?? 1999;
      const mrpPrice = firstVariant?.mrp ?? (p as any).originalPrice ?? offerPrice * 1.5;
      const rawImg = p.images?.[0] || p.thumbnail;
      const imageVal = rawImg
        ? rawImg.startsWith('http')
          ? rawImg
          : `http://localhost:3000${rawImg}`
        : undefined;

      return {
        text: p.name,
        type: 'product' as const,
        id: p._id.toString(),
        category: p.categoryId?.name || 'Ethnic Couture',
        productId: p._id.toString(),
        slug: p.slug || p._id.toString(),
        price: offerPrice,
        originalPrice: mrpPrice > offerPrice ? mrpPrice : undefined,
        image: imageVal,
      };
    });

    return {
      query,
      suggestions: suggestions as any,
    };
  }

  async getFacets(dto: SearchQueryDto): Promise<FacetsResponse> {
    const searchRes = await this.search(dto);
    return searchRes.facets || {
      brands: [],
      categories: [],
      colors: [],
      sizes: [],
      priceRanges: [],
    };
  }
}
