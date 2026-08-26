"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoSearchProvider = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const product_schema_js_1 = require("../../products/schemas/product.schema.js");
let MongoSearchProvider = class MongoSearchProvider {
    productModel;
    constructor(productModel) {
        this.productModel = productModel;
    }
    async search(dto) {
        const { q, categoryId, brandId, colors, sizes, minPrice, maxPrice, minDiscount, minRating, sortBy = 'relevance', page = 1, limit = 12, } = dto;
        const matchStage = { isDeleted: false, status: true };
        if (categoryId && mongoose_2.Types.ObjectId.isValid(categoryId)) {
            matchStage.categoryId = new mongoose_2.Types.ObjectId(categoryId);
        }
        if (brandId && mongoose_2.Types.ObjectId.isValid(brandId)) {
            matchStage.brandId = new mongoose_2.Types.ObjectId(brandId);
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
        const pipeline = [{ $match: matchStage }];
        pipeline.push({
            $lookup: {
                from: 'categories',
                localField: 'categoryId',
                foreignField: '_id',
                as: 'categoryInfo',
            },
        }, {
            $lookup: {
                from: 'brands',
                localField: 'brandId',
                foreignField: '_id',
                as: 'brandInfo',
            },
        });
        const variantMatch = {};
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
            const priceFilter = {};
            if (minPrice !== undefined)
                priceFilter.$gte = minPrice;
            if (maxPrice !== undefined)
                priceFilter.$lte = maxPrice;
            variantMatch['variants.offerPrice'] = priceFilter;
        }
        if (minDiscount !== undefined) {
            variantMatch['variants.discount'] = { $gte: minDiscount };
        }
        if (Object.keys(variantMatch).length > 0) {
            pipeline.push({ $match: variantMatch });
        }
        const sortStage = {};
        if (sortBy === 'price_asc') {
            sortStage['variants.0.offerPrice'] = 1;
        }
        else if (sortBy === 'price_desc') {
            sortStage['variants.0.offerPrice'] = -1;
        }
        else if (sortBy === 'rating') {
            sortStage.averageRating = -1;
        }
        else if (sortBy === 'newest') {
            sortStage.createdAt = -1;
        }
        else {
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
        const colorsFacet = (results?.availableColors || []).map((c) => ({
            label: c._id,
            value: c._id,
            count: 0,
        }));
        const sizesFacet = (results?.availableSizes || []).map((s) => ({
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
    async autocomplete(query, limit = 5) {
        const regex = new RegExp(`^${query}`, 'i');
        const products = await this.productModel
            .find({ isDeleted: false, status: true, name: regex })
            .select('_id name tags')
            .limit(limit)
            .exec();
        const suggestions = products.map((p) => ({
            text: p.name,
            type: 'product',
            id: p._id.toString(),
        }));
        return {
            query,
            suggestions,
        };
    }
    async getFacets(dto) {
        const searchRes = await this.search(dto);
        return searchRes.facets || {
            brands: [],
            categories: [],
            colors: [],
            sizes: [],
            priceRanges: [],
        };
    }
};
exports.MongoSearchProvider = MongoSearchProvider;
exports.MongoSearchProvider = MongoSearchProvider = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(product_schema_js_1.Product.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], MongoSearchProvider);
//# sourceMappingURL=mongo-search.provider.js.map